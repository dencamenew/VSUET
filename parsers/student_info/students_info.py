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

# --- НОВАЯ ФУНКЦИЯ: Получение или создание ID группы ---
def get_or_create_group_id(conn, group_name):
    """Получение group_id по group_name. Если группы нет, она создается."""
    try:
        with conn.cursor() as cursor:
            # 1. Попытка найти существующий id группы
            cursor.execute("SELECT id FROM groups WHERE group_name = %s", (group_name,))
            group_id = cursor.fetchone()
            
            if group_id:
                return group_id[0]
            
            # 2. Если группа не найдена, вставить новую и получить ее id
            cursor.execute(
                "INSERT INTO groups (group_name) VALUES (%s) RETURNING id",
                (group_name,)
            )
            conn.commit()
            return cursor.fetchone()[0]
    except Exception as e:
        logger.error(f"Ошибка при получении/создании group_id для {group_name}: {e}")
        conn.rollback()
        return None

# --- ИЗМЕНЕННАЯ ФУНКЦИЯ: Теперь использует group_id ---
def insert_student_data(conn, zach_number, group_name):
    """Вставка данных студента в таблицу student_info, используя group_id"""
    
    # 1. Получаем group_id
    group_id = get_or_create_group_id(conn, group_name)
    
    if group_id is None:
        logger.error(f"Пропуск студента {zach_number}: не удалось получить group_id.")
        return

    try:
        with conn.cursor() as cursor:
            # 2. Вставляем zach_number и group_id в соответствующие колонки
            cursor.execute(
                "INSERT INTO student_info (zach_number, group_id) VALUES (%s, %s) ON CONFLICT (zach_number) DO NOTHING",
                (zach_number, group_id)
            )
            conn.commit()
            logger.debug(f"Добавлен студент: {zach_number} из группы {group_name} (ID: {group_id})")
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

                # Здесь извлекается строковое имя группы, которое затем передается
                group_name = soup.find('a', {'id': 'ucVedBox_lblGroup'}).text.strip() 
                table_rows = soup.find_all('tr', class_=['VedRow1', 'VedRow2'])
                
                
                for row in table_rows:
                    tds = row.find_all('td')
                    number_zach = tds[1].text.strip()
                    if number_zach: 
                        # Вызываем исправленную функцию
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
# ... (Остальной код подключения и парсинга остается без изменений)
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