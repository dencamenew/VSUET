from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import psycopg2
import logging
from dotenv import load_dotenv
import os



# Загрузка переменных окружения
load_dotenv()


# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)


# Подключение к БД
try:
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )
    cursor = conn.cursor()
    logger.info(f"Успешное подключение к БД.")
except Exception as e:
    logger.error(f"Ошибка при подключении БД. {e}")


# Подключение драйвера
try:
    chrome_options = Options()
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.page_load_strategy = 'eager'
    driver = webdriver.Chrome(options=chrome_options)
    logger.info(f"Успешное подключение драйвера.")
except Exception as e:
    logger.error(f"Ошибка при подключении драйвера.")


# Сам скрипт
url = "https://rating.vsuet.ru/web/Ved/Default.aspx"
driver.get(url)

WebDriverWait(driver, 20).until(
    EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbFacultets"))
)

faculty_select = Select(WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbFacultets"))
))
faculties = [opt.text for opt in faculty_select.options if opt.text and opt.text.strip()]

for faculty in faculties:
    faculty_select = Select(WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "ctl00_ContentPage_cmbFacultets"))
    ))
    faculty_select.select_by_visible_text(faculty)
    
    WebDriverWait(driver, 10).until(
        lambda d: Select(d.find_element(By.ID, "ctl00_ContentPage_cmbGroups")).options[0].text != "Выберите группу"
    )
    
    group_select = Select(WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbGroups"))
    ))
    groups = [opt.text for opt in group_select.options if opt.text and opt.text.strip()]
    

    for group in groups:
        group_select = Select(WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "ctl00_ContentPage_cmbGroups"))
        ))
        group_select.select_by_visible_text(group)

        table = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "ctl00_ContentPage_ucListVedBox_Grid"))
        )

        links = [] 
        for link in table.find_elements(By.TAG_NAME, "a"):
            links.append(link.get_attribute('href'))
        
        if len(links) > 0:
            try:
                # Сначала проверим, существует ли уже запись с таким group_name
                cursor.execute("SELECT urls FROM sbj_urls WHERE group_name = %s", (group,))
                existing_record = cursor.fetchone()
                
                cursor.execute("""
                    INSERT INTO sbj_urls (group_name, urls) 
                    VALUES (%s, %s)
                    ON CONFLICT (group_name) 
                    DO UPDATE SET urls = EXCLUDED.urls
                    RETURNING xmax::text::int > 0 AS was_updated
                """, (group, links))
                
                result = cursor.fetchone()
                was_updated = result[0] if result else False
                
                conn.commit()
                
                if was_updated:
                    old_links = existing_record[0] if existing_record else None
                    logger.info(f"Обновлена запись в SBJ_URLS: GROUP_NAME={group}. Старые URLS: {old_links}. Новые URLS: {links}.")
                else:
                    logger.info(f"Добавлена новая запись в SBJ_URLS: GROUP_NAME={group}, URLS={links}.")
                    
            except Exception as e:
                logger.error(f"Ошибка при работе с таблицей SBJ_URLS: {str(e)}")
        else:
            logger.info(f"У группы {group} нет ссылок на предметы.")

conn.close()
driver.quit()