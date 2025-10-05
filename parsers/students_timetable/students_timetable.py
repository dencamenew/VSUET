from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from bs4 import BeautifulSoup
import json
import logging
import psycopg2
import os 
import re

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def parse_subject_info(subject_text):
    """Парсинг информации о предмете в структурированный формат"""
    try:
        subjects = []
        
        # Разделяем по точкам с запятой для множественных предметов
        subject_parts = [part.strip() for part in subject_text.split(';') if part.strip()]
        
        for part in subject_parts:
            # Извлекаем аудиторию
            auditorium = ""
            auditorium_match = re.search(r'\(а\.(\d+[a-zA-Z]?)\)', part)
            if auditorium_match:
                auditorium = auditorium_match.group(1)
                part = part.replace(f"(а.{auditorium})", "").strip()
            
            # Извлекаем преподавателя (последние 2-3 слова в формате "Фамилия И.О.")
            teacher = ""
            # Паттерн для фамилии и инициалов (например: "Иванов А.С.", "Петров В.В.")
            teacher_pattern = r'([А-Я][а-я]+ [А-Я]\.[А-Я]\.?)$'
            teacher_match = re.search(teacher_pattern, part)
            if teacher_match:
                teacher = teacher_match.group(1)
                part = part.replace(teacher, "").strip()
            
            # Определяем тип занятия (первые слова до двоеточия)
            lesson_type = ""
            if ':' in part:
                type_part, name_part = part.split(':', 1)
                lesson_type = type_part.strip()
                lesson_name = name_part.strip()
            else:
                lesson_name = part.strip()
            
            # Очищаем название от лишних пробелов
            lesson_name = re.sub(r'\s+', ' ', lesson_name).strip()


            if " язык " in lesson_name:
                subjects.append({
                    "тип": lesson_type,
                    "название": " ".join(name_part.split()[:-2][:-5]),
                    "преподаватель": " ".join(name_part.split()[:-2][-2:]) + "/" + " ".join(name_part.split()[:-2][2:-3]),
                    "аудитория": "".join(lesson_name.split()[-2:-1])[3:-2] + "/" + "".join(lesson_name.split()[-5:-4])
                })
            elif "Физическая культура" in lesson_name:
                subjects.append({
                    "тип": "-",
                    "название": "Физическая культура",
                    "преподаватель": "-",
                    "аудитория": auditorium
                })

            elif "Общая физическая" in lesson_name:
                subjects.append({
                    "тип": "-",
                    "название": "Общая физическая",
                    "преподаватель": "-",
                    "аудитория": "подготовка"
                })
            else:
                subjects.append({
                    "тип": lesson_type,
                    "название": " ".join(name_part.split()[:-2][:-2]),
                    "преподаватель": " ".join(name_part.split()[:-2][-2:]),
                    "аудитория": auditorium
                })
        
        return subjects
        
    except Exception as e:
        logger.warning(f"Ошибка при парсинге текста '{subject_text}': {e}")
        return [{
            "тип": "",
            "название": subject_text,
            "преподаватель": "",
            "аудитория": ""
        }]

def insert_group_timetable(conn, group_name, timetable_data):
    """Моментальная вставка расписания для группы в БД"""
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                INSERT INTO student_timetable (group_name, timetable)
                VALUES (%s, %s::jsonb)
                ON CONFLICT (group_name) 
                DO UPDATE SET timetable = EXCLUDED.timetable
            """, (group_name, json.dumps(timetable_data, ensure_ascii=False)))
            conn.commit()
            logger.info(f"✅ Расписание для группы {group_name} сохранено в БД")
    except Exception as e:
        logger.error(f"❌ Ошибка при сохранении расписания для группы {group_name}: {e}")
        conn.rollback()

try:
    conn = psycopg2.connect(
        host="postgres",
        port=5432,
        database="db",
        user="admin",
        password="admin"
    )
    logger.info("Успешное подключение к базе данных")
        
except psycopg2.Error as e:
    logger.error(f"Ошибка подключения к PostgreSQL: {e}")
    exit()

chrome_options = Options()
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
chrome_options.page_load_strategy = 'eager'
driver = webdriver.Chrome(options=chrome_options)
driver.get("https://timetable.vsuet.ru/")

WebDriverWait(driver, 20).until(
    EC.presence_of_element_located((By.ID, "selectvaluegroup"))
)

group_select = Select(WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, "selectvaluegroup"))
))

check_select = Select(WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, "selectvalueweek"))
))

groups = [opt.text for opt in group_select.options if opt.text and opt.text.strip()]
logger.info(f"📋 Найдено групп: {len(groups)}")

for group in groups:
    if group == "Выберите группу":
        continue
        
    logger.info(f"👥 Обработка группы: {group}")
    
    group_select = Select(WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "selectvaluegroup"))
    ))
    group_select.select_by_visible_text(group)
    
    group_timetable = {"Числитель": {}, "Знаменатель": {}}
    
    for check in ["Числитель", "Знаменатель"]:
        check_select = Select(WebDriverWait(driver, 30).until(
            EC.element_to_be_clickable((By.ID, "selectvalueweek"))
        ))
        check_select.select_by_visible_text(check)

        time.sleep(0.1)
        page_html = driver.page_source

        soup = BeautifulSoup(page_html, 'html.parser')
        tables = soup.find_all("table", class_="table table-hover table-bordered table-sm")
        full_info = {}

        for table in tables:
            try:
                weekday_elem = table.find("div", class_="vertical")
                if not weekday_elem:
                    continue
                    
                weekday = weekday_elem.text.strip()
                
                time_headers = table.find_all("th", class_="align-middle")
                if len(time_headers) < 2:
                    continue
                    
                stime = time_headers[1].text[:-2].strip('\n')
                
                subject_elem = table.find("td", class_="align-middle")
                if not subject_elem:
                    continue
                    
                subject_text = subject_elem.text.strip()

                # Парсим информацию о предмете
                subject_info = parse_subject_info(subject_text)

                if weekday not in full_info:
                    full_info[weekday] = {}
                
                # Сохраняем структурированные данные
                full_info[weekday][stime] = subject_info

            except Exception as e:
                logger.warning(f"Ошибка при парсинге таблицы для группы {group}: {e}")
                continue

        group_timetable[check] = full_info
    
    # МОМЕНТАЛЬНАЯ ВСТАВКА В БД после обработки группы
    insert_group_timetable(conn, group, group_timetable)
    logger.info(f"📊 Обработано расписание для группы {group}")

driver.quit()

try:
    conn.close()
    logger.info("Соединение с базой данных закрыто")
    
except psycopg2.Error as e:
    logger.error(f"Ошибка при закрытии соединения: {e}")