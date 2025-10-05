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
    try:
        subjects = []
        
        subject_parts = [part.strip() for part in subject_text.split(';') if part.strip()]
        
        for part in subject_parts:
            if ':' in part:
                type_part, rest = part.split(':', 1)
                type_part = type_part.strip()
            else:
                type_part = ""
                rest = part
            
            auditorium = ""
            auditorium_match = re.search(r'\((.*?)\)', rest)
            if auditorium_match:
                auditorium = auditorium_match.group(1)
                rest = rest.replace(f"({auditorium})", "").strip()
            
           
            group = ""
            if ',' in rest:
                parts = rest.split(',')
                group = parts[-1].strip()
                name_part = ','.join(parts[:-1]).strip()
            else:
                name_part = rest.strip()
    
            name_part = re.sub(r',\s*$', '', name_part)
            
            
            name_part = name_part.strip()
            
            subjects.append({
                "тип": type_part,
                "название": " ".join(name_part.split()[:-2]),
                "аудитория": auditorium.split(".")[-1],
                "группа": group.split(".")[-1]
            })
        
        return subjects
        
    except Exception as e:
        logger.warning(f"Ошибка при парсинге текста '{subject_text}': {e}")
        return [{
            "тип": "",
            "название": subject_text,
            "аудитория": "",
            "группа": ""
        }]


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
    EC.presence_of_element_located((By.ID, "selectvalueprepod"))
)

teacher_select = Select(WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, "selectvalueprepod"))
))

check_select = Select(WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, "selectvalueweek"))
))

teachers = [opt.text for opt in teacher_select.options if opt.text and opt.text.strip()]

for teacher in teachers:
    
    logger.info(f"Обработка преподавателя: {teacher}")
    
    teacher_select = Select(WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "selectvalueprepod"))
    ))
    teacher_select.select_by_visible_text(teacher)
    
    teacher_timetable = {"Числитель": {}, "Знаменатель": {}}
    
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

                subject_info = parse_subject_info(subject_text)

                if weekday not in full_info:
                    full_info[weekday] = {}
                if stime in full_info[weekday]:
                    if isinstance(full_info[weekday][stime], list):
                        full_info[weekday][stime].extend(subject_info)
                    else:
                        full_info[weekday][stime] = [full_info[weekday][stime]] + subject_info
                else:          
                    full_info[weekday][stime] = subject_info if len(subject_info) > 1 else subject_info[0]

            except Exception as e:
                logger.warning(f"Ошибка при парсинге таблицы: {e}")
                continue

        teacher_timetable[check] = full_info
    
   
    try:
        with conn.cursor() as cursor:
            json_data = json.dumps(teacher_timetable, ensure_ascii=False, indent=2)
            logger.info(f"Сохранение данных для {teacher}, размер JSON: {len(json_data)} байт")
            
            cursor.execute("""
                INSERT INTO teacher_timetable (name, timetable)
                VALUES (%s, %s::jsonb)
                RETURNING id_timetable
            """, (teacher, json_data))
            
            record_id = cursor.fetchone()[0]
            conn.commit()
            logger.info(f"Данные для {teacher} успешно сохранены, ID: {record_id}")
            
    except psycopg2.Error as e:
        logger.error(f"Ошибка при сохранении данных для {teacher}: {e}")
        conn.rollback()

driver.quit()

try:
    conn.close()
    logger.info("Соединение с базой данных закрыто")
    
except psycopg2.Error as e:
    logger.error(f"Ошибка при включении триггеров: {e}")