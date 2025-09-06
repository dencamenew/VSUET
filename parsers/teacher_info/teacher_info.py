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

def parse_lesson_type(text):
    """
    Парсит тип занятия из текста
    """
    text = ' '.join(text.split())
    
    lesson_types = {
        'лекция': ['лекция'],
        'лабораторные занятия': ['лабораторные занятия', 'лабораторные', 'лаб. занятия'],
        'практические занятия': ['практические занятия', 'практические', 'практ. занятия'],
        'семинар': ['семинар'],
        'консультация': ['консультация'],
        'зачет': ['зачет'],
        'экзамен': ['экзамен']
    }
    
    for lesson_type, variants in lesson_types.items():
        for variant in variants:
            if variant + ':' in text:
                return lesson_type
    
    return "не указано"

def parse_subject_and_group(text):
    """
    Парсит название предмета и группу из текста
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
    
    # Удаляем тип занятия (если есть)
    text = re.sub(r'^(лекция|лабораторные занятия|практические занятия|семинар|консультация|зачет|экзамен):', '', text)
    
    # Очищаем название предмета
    subject = text.strip()
    subject = re.sub(r'[,\s]+$', '', subject)
    subject = re.sub(r'^[,\s]+', '', subject)
    
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
        # Структура: {"group_name": {"subject1": ["тип1", "тип2"], "subject2": ["тип1"]}}
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
                    
                    # Парсим тип занятия
                    lesson_type = parse_lesson_type(cell_text)
                    
                    # Парсим предмет и группу
                    subject, group = parse_subject_and_group(cell_text)
                    
                    # Пропускаем если нет группы или предмета
                    if not group or not subject:
                        continue
                    
                    # Добавляем информацию в структуру
                    if group not in group_subjects:
                        group_subjects[group] = {}
                    
                    if subject not in group_subjects[group]:
                        group_subjects[group][subject] = set()
                    
                    if lesson_type != "не указано":
                        group_subjects[group][subject].add(lesson_type)          
            except Exception as e:
                logger.warning(f"Ошибка при обработке {check} для {teacher}: {e}")
                continue
        
        # Преобразуем sets в lists для JSON
        for group in group_subjects:
            for subject in group_subjects[group]:
                group_subjects[group][subject] = list(group_subjects[group][subject])
        
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