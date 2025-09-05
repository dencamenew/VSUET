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
timetable = {}
for teacher in teachers:
    print(teacher)
    teacher_select = Select(WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "selectvalueprepod"))
    ))
    teacher_select.select_by_visible_text(teacher)
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

        if teacher not in timetable:
            timetable[teacher] = {"Числитель": None, 
                 "Знаменатель": None}
        for info in table:
            weekday = info.find("div", class_="vertical").text.strip()
            stime = info.find_all("th", class_="align-middle")[1].text[:-2].strip('\n')
            subj = ','.join(info.find("td", class_="align-middle").text.strip().rsplit(',')[:-1])

            if weekday not in full_info:
                full_info[weekday] = {}
            
            full_info[weekday][stime] = subj

            if check == "Числитель":
                timetable[str(teacher)]["Числитель"] = full_info
            else:
                timetable[str(teacher)]["Знаменатель"] = full_info

driver.quit()


try:
        conn = psycopg2.connect(
            host="postgres",
            port=5432,
            database="db",
            user="admin",
            password="admin"
        )
        with conn.cursor() as cursor:
            cursor.execute("ALTER TABLE timetable DISABLE TRIGGER timetable_notify_trigger")
            for teacher, info in timetable.items():
                json_data = json.dumps(info)
                logger.info(f"Размер JSON для сохранения: {len(json_data)} байт")
                

                cursor.execute("""
                    INSERT INTO teacher_timetable (teacher, timetable)
                    VALUES (%s, %s::jsonb)
                    RETURNING id
                """, (teacher, json_data))
                
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
