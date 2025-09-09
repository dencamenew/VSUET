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

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

DB_CONFIG = {
    'host': 'localhost',
    'database': 'db',
    'user': 'admin',
    'password': 'admin',
    'port': '5432'
}

def parse_teacher_timetable():
    logger.info("Запуск парсинга расписания преподавателей...")
    
    chrome_options = Options()
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.page_load_strategy = 'eager'
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.get("https://timetable.vsuet.ru/")

    try:
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
        timetable = {}
        
        for teacher in teachers:
            logger.info(f"Парсинг расписания для: {teacher}")
            
            teacher_select = Select(WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "selectvalueprepod"))
            ))
            teacher_select.select_by_visible_text(teacher)
            
            for check in ["Числитель", "Знаменатель"]:
                check_select = Select(WebDriverWait(driver, 30).until(
                    EC.element_to_be_clickable((By.ID, "selectvalueweek"))
                ))
                check_select.select_by_visible_text(check)

                time.sleep(1)

                page_html = driver.page_source
                soup = BeautifulSoup(page_html, 'html.parser')
                table = soup.find_all("table", class_="table table-hover table-bordered table-sm")
                full_info = {}

                if teacher not in timetable:
                    timetable[teacher] = {"Числитель": {}, "Знаменатель": {}}
                
                for info in table:
                    weekday = info.find("div", class_="vertical").text.strip()
                    stime = info.find_all("th", class_="align-middle")[1].text[:-2].strip('\n')
                    subj = ','.join(info.find("td", class_="align-middle").text.strip().rsplit(',')[:-1])

                    if weekday not in full_info:
                        full_info[weekday] = {}
                    
                    full_info[weekday][stime] = subj

                timetable[teacher][check] = full_info

        driver.quit()
        
        with open("teacher_timetable.json", 'w', encoding='utf-8') as f:
            json.dump(timetable, f, ensure_ascii=False, indent=2)
            
        logger.info("Парсинг завершен, данные сохранены в teacher_timetable.json")
        return timetable
        
    except Exception as e:
        logger.error(f"Ошибка при парсинге: {e}")
        driver.quit()
        return {}

def load_teacher_timetable():
    if os.path.exists("teacher_timetable.json"):
        try:
            with open("teacher_timetable.json", 'r', encoding='utf-8') as f:
                data = json.load(f)
            logger.info("Данные загружены из teacher_timetable.json")
            return data
        except Exception as e:
            logger.error(f"Ошибка при загрузке файла: {e}")
            return parse_teacher_timetable()
    else:
        logger.info("Файл teacher_timetable.json не найден, начинаем парсинг")
        return parse_teacher_timetable()

def save_to_database(timetable):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        with conn.cursor() as cursor:
            for teacher, info in timetable.items():
                json_data = json.dumps(info)
                logger.info(f"Размер JSON для сохранения: {len(json_data)} байт")
                
                cursor.execute("""
                    INSERT INTO teacher_timetable (teacher, timetable)
                    VALUES (%s, %s::jsonb)
                    ON CONFLICT (teacher) 
                    DO UPDATE SET 
                        timetable = EXCLUDED.timetable
                    RETURNING id
                """, (teacher, json_data))
                
                record_id = cursor.fetchone()[0]
                logger.info(f"Данные успешно сохранены, ID: {record_id}")
            
            conn.commit()
            logger.info("Все данные сохранены в базу данных")

    except psycopg2.Error as e:
        logger.error(f"Ошибка PostgreSQL: {e}")
        if 'conn' in locals():
            logger.error(f"Статус соединения: {'OPEN' if not conn.closed else 'CLOSED'}")
    except Exception as e:
        logger.error(f"Общая ошибка: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

def main():
    logger.info("Начало обработки расписания преподавателей...")
    
    timetable_data = load_teacher_timetable()
    
    if not timetable_data:
        logger.error("Не удалось получить данные расписания")
        return
    
    logger.info(f"Загружено расписание для {len(timetable_data)} преподавателей")
    
    save_to_database(timetable_data)
    
    logger.info("Обработка завершена!")

if __name__ == "__main__":
    main()