import psycopg2
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
import time
from bs4 import BeautifulSoup
import requests
import logging
import os
import string
import secrets

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def generate_password(length=12):
    """Генерация безопасного пароля"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def insert_student_data(conn, zach_number, group_name):
    """Вставка данных студента в таблицу student_info"""
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO student_info (zach_number, group_name) VALUES (%s, %s) ON CONFLICT (zach_number) DO NOTHING",
                (zach_number, group_name)
            )
            conn.commit()
            logger.debug(f"Добавлен студент: {zach_number} из группы {group_name}")
    except Exception as e:
        logger.error(f"Ошибка при вставке студента {zach_number}: {e}")
        conn.rollback()

def process_group_data(driver, group, conn):
    """Обработка данных группы и моментальная вставка в БД"""
    try:
        group_select = Select(WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "ctl00_ContentPage_cmbGroups"))
        ))
        group_select.select_by_visible_text(group)

        logger.info(f"Обрабатывается группа: {group}")
        
        try:
            table = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "ctl00_ContentPage_ucListVedBox_Grid"))
            )

            for link in table.find_elements(By.TAG_NAME, "a"):
                href = link.get_attribute('href')
                resp = requests.get(href)
                soup = BeautifulSoup(resp.text, 'html.parser')

                group_name = soup.find('a', {'id': 'ucVedBox_lblGroup'}).text.strip()
                table_rows = soup.find_all('tr', class_=['VedRow1', 'VedRow2'])
                
                
                for row in table_rows:
                    tds = row.find_all('td')
                    number_zach = tds[1].text.strip()
                    if number_zach: 
                        insert_student_data(conn, number_zach, group_name)
                
                logger.info(f"Студенты из группы {group_name} обработаны и добавлены в БД")
                break
                    
        except Exception as e:
            logger.warning(f"Не удалось найти таблицу ведомостей для группы {group}: {e}")
            return False
        return True
            
    except Exception as e:
        logger.error(f"Ошибка при обработке группы {group}: {e}")
        return False

logger.info("🚀 Начало парсинга зачёток")

# Подключение к БД
try:
    conn = psycopg2.connect(
        host="postgres",
        port=5432,
        database="db",
        user="admin",
        password="admin"
    )
    logger.info("Успешное подключение к БД")
    
    chrome_options = Options()
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.page_load_strategy = 'eager'
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.get("https://rating.vsuet.ru/web/Ved/Default.aspx")

    try:
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbYears"))
        )

        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbFacultets"))
        )

        faculty_select = Select(WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbFacultets"))
        ))
        faculties = [opt.text for opt in faculty_select.options if opt.text and opt.text.strip()]

        for faculty in faculties:
            if faculty == "Выберите факультет":
                continue
                
            faculty_select = Select(WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "ctl00_ContentPage_cmbFacultets"))
            ))
            faculty_select.select_by_visible_text(faculty)
            
            logger.info(f"Обрабатывается факультет: {faculty}")
            
            WebDriverWait(driver, 10).until(
                lambda d: Select(d.find_element(By.ID, "ctl00_ContentPage_cmbGroups")).options[0].text != "Выберите группу"
            )
            
            group_select = Select(WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbGroups"))
            ))
            groups = [opt.text for opt in group_select.options if opt.text and opt.text.strip() and opt.text != "Выберите группу"]
            

            for group in groups:
                process_group_data(driver, group, conn)

        logger.info("✅ Все зачётки студентов обработаны и добавлены в БД ✅")

    except Exception as e:
        logger.error(f"Ошибка при парсинге: {e}")
    finally:
        driver.quit()

except psycopg2.Error as e:
    logger.error(f"Ошибка подключения к БД: {e}")
except Exception as e:
    logger.error(f"Общая ошибка: {e}")
finally:
    if 'conn' in locals():
        conn.close()