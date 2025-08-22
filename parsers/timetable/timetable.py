from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from bs4 import BeautifulSoup
import requests
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
print(groups)
timetable = {}
for group in groups:
    print(group)
    group_select = Select(WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "selectvaluegroup"))
    ))
    group_select.select_by_visible_text(group)
    for check in ["Числитель", "Знаменатель"]:
        check_select = Select(WebDriverWait(driver, 30).until(
                EC.element_to_be_clickable((By.ID, "selectvalueweek"))
            ))
        check_select.select_by_visible_text(check)


        time.sleep(0.1)
        page_html = driver.page_source

        soup = BeautifulSoup(page_html, 'html.parser')
        table = soup.find_all("table", class_="table table-hover table-bordered table-sm")
        full_info = {}

        if group not in timetable:
            timetable[group] = {"Числитель": None, 
                 "Знаменатель": None}
        for info in table:
            weekday = info.find("div", class_="vertical").text.strip()
            stime = info.find_all("th", class_="align-middle")[1].text[:-2].strip('\n')
            subj = ','.join(info.find("td", class_="align-middle").text.strip().rsplit(',')[:-1])

            if weekday not in full_info:
                full_info[weekday] = {}
            
            full_info[weekday][stime] = subj

            if check == "Числитель":
                timetable[str(group)]["Числитель"] = full_info
            else:
                timetable[str(group)]["Знаменатель"] = full_info

driver.quit()


try:
    db_config = {
        'host': os.getenv("DB_HOST"),
        'port': os.getenv("DB_PORT"),
        'database': os.getenv("DB_NAME"),
        'user': os.getenv("DB_USER"),
        'password': os.getenv("DB_PASSWORD")
    }
    
    logger.info(f"Подключаемся к БД с параметрами: { {k:v for k,v in db_config.items() if k != 'password'} }")

    
    
    with psycopg2.connect(**db_config) as conn:
        with conn.cursor() as cursor:
            cursor.execute("ALTER TABLE timetable DISABLE TRIGGER timetable_notify_trigger")
            for group, info in timetable.items():
                json_data = json.dumps(info)
                logger.info(f"Размер JSON для сохранения: {len(json_data)} байт")
                

                cursor.execute("""
                    INSERT INTO timetable (group_name, timetable)
                    VALUES (%s, %s::jsonb)
                    RETURNING id
                """, (group, json_data))
                
                record_id = cursor.fetchone()[0]
                conn.commit()
                logger.info(f"Данные успешно сохранены, ID: {record_id}")
            cursor.execute("ALTER TABLE timetable ENABLE TRIGGER timetable_notify_trigger")
            conn.commit()

except psycopg2.Error as e:
    logger.error(f"Ошибка PostgreSQL: {e}")
    if 'conn' in locals():
        logger.error(f"Статус соединения: {'OPEN' if not conn.closed else 'CLOSED'}")
except Exception as e:
    logger.error(f"Общая ошибка: {e}")
