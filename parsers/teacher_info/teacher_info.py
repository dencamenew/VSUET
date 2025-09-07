from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json
import logging
import psycopg2
import secrets
import string
import re

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Функция для генерации уникального пароля
def generate_password(length=12):
    """Генерирует случайный пароль заданной длины"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def get_teacher_name_variants(full_name):
    """
    Генерирует различные варианты написания имени преподавателя
    """
    parts = full_name.split()
    variants = []
    
    if len(parts) >= 2:
        # Полное имя: "Агафонов Г.В."
        variants.append(full_name)
        # Без инициалов: "Агафонов"
        variants.append(parts[0])
        # С инициалами без точек: "Агафонов ГВ"
        variants.append(f"{parts[0]} {parts[1].replace('.', '')}")
        # Только фамилия с инициалами: "Агафонов Г.В."
        if len(parts) > 2:
            variants.append(f"{parts[0]} {parts[1]}.{parts[2]}.")
    
    return variants

def parse_subject_and_group(text, teacher_name):
    """
    Парсит полное название предмета (с типом занятия) и группу из текста
    """
    text = ' '.join(text.split())
    
    # Удаляем информацию об аудитории
    text = re.sub(r'\(а\.\d+[а-я]?\)', '', text)
    
    # Извлекаем группу
    group_match = re.search(r'гр\.([^,.\s]+)', text)
    group = group_match.group(1).strip() if group_match else None
    
    # Удаляем информацию о группе
    if group_match:
        text = re.sub(r'гр\.[^,.\s]+', '', text)
    
    # Очищаем название предмета (сохраняем тип занятия)
    subject = text.strip()
    subject = re.sub(r'[,\s]+$', '', subject)
    subject = re.sub(r'^[,\s]+', '', subject)
    
    # Удаляем имя преподавателя из названия предмета
    if teacher_name:
        name_variants = get_teacher_name_variants(teacher_name)
        for variant in name_variants:
            # Удаляем в конце строки
            pattern = r'\s*' + re.escape(variant) + r'\s*$'
            subject = re.sub(pattern, '', subject)
            
            # Удаляем в начале строки
            pattern = r'^\s*' + re.escape(variant) + r'\s*'
            subject = re.sub(pattern, '', subject)
    
    # Финальная очистка
    subject = subject.strip()
    subject = re.sub(r'[,\s.-]+$', '', subject)
    subject = re.sub(r'^[,\s.-]+', '', subject)
    
    return subject, group

# Основной код
try:
    chrome_options = Options()
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.page_load_strategy = 'eager'
    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://timetable.vsuet.ru/")

    WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.ID, "selectvalueprepod"))
    )

    teacher_select = Select(WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.ID, "selectvalueprepod"))
    ))
    
    # Получаем список преподавателей
    teachers = [opt.text for opt in teacher_select.options if opt.text and opt.text.strip()]
    
    logger.info(f"Найдено преподавателей: {len(teachers)}")
    
    # Создаем словарь для хранения данных всех преподавателей
    teacher_data = {}
    
    for teacher in teachers:
        logger.info(f"Обрабатываем преподавателя: {teacher}")
        
        # Выбираем преподавателя
        teacher_select = Select(WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.ID, "selectvalueprepod"))
        ))
        teacher_select.select_by_visible_text(teacher)   
        
        # Структура: {"group_name": ["предмет1", "предмет2", ...]}
        group_subjects = {}
        
        # Обрабатываем оба типа недель (числитель и знаменатель)
        for check in ["Числитель", "Знаменатель"]:
            try:
                check_select = Select(WebDriverWait(driver, 15).until(
                    EC.element_to_be_clickable((By.ID, "selectvalueweek"))
                ))
                check_select.select_by_visible_text(check)

                page_html = driver.page_source
                soup = BeautifulSoup(page_html, 'html.parser')
                table = soup.find_all("table", class_="table table-hover table-bordered table-sm")
                
                for info in table:
                    # Получаем полный текст из ячейки
                    cell_text = info.find("td", class_="align-middle").text.strip()
                    
                    # Парсим предмет и группу (сохраняем полное название с типом занятия)
                    subject, group = parse_subject_and_group(cell_text, teacher)
                    
                    # Пропускаем если нет группы или предмета
                    if not group or not subject:
                        continue
                    
                    # Добавляем информацию в структуру
                    if group not in group_subjects:
                        group_subjects[group] = set()
                    
                    group_subjects[group].add(subject)
                    
            except Exception as e:
                logger.warning(f"Ошибка при обработке {check} для {teacher}: {e}")
                continue
        
        # Преобразуем sets в lists для JSON
        for group in group_subjects:
            group_subjects[group] = list(group_subjects[group])
        
        # Сохраняем данные преподавателя
        teacher_data[teacher] = {
            'password': generate_password(),
            'groups_subjects': group_subjects
        }
        
        logger.info(f"Преподаватель {teacher}: обработано {len(group_subjects)} групп")
    
    driver.quit()

    # Подключение к базе данных и сохранение данных
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="db",
        user="admin",
        password="admin"
    )
    
    with conn.cursor() as cursor:
        for teacher_name, data in teacher_data.items():
            password = data['password']
            groups_subjects_json = json.dumps(data['groups_subjects'], ensure_ascii=False)
            
            # Вставляем данные в базу с правильными названиями колонок
            insert_query = """
            INSERT INTO teachers_info (name, password, groups_subjects) 
            VALUES (%s, %s, %s::jsonb)
            ON CONFLICT (name) DO UPDATE SET 
                password = EXCLUDED.password,
                groups_subjects = EXCLUDED.groups_subjects
            """
            
            cursor.execute(insert_query, (teacher_name, password, groups_subjects_json))
            logger.info(f"Добавлен преподаватель: {teacher_name}")
        
        # Сохраняем изменения
        conn.commit()
        logger.info("Все данные успешно сохранены в базу данных")

except psycopg2.Error as e:
    logger.error(f"Ошибка PostgreSQL: {e}")
    if 'conn' in locals():
        conn.rollback()
        logger.error(f"Статус соединения: {'OPEN' if not conn.closed else 'CLOSED'}")
except Exception as e:
    logger.error(f"Общая ошибка: {e}")
    if 'conn' in locals():
        conn.rollback()
finally:
    # Закрываем соединение с базой данных
    if 'conn' in locals() and not conn.closed:
        conn.close()
        logger.info("Соединение с базой данных закрыто")
    if 'driver' in locals():
        driver.quit()