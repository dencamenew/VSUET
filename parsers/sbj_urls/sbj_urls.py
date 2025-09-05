from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import psycopg2
import logging
from dotenv import load_dotenv
import os
import time

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
        host="postgres",
        port=5432,
        database="db",
        user="admin",
        password="admin"
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
    EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbYears"))
)

# Выбираем учебный год 2024-2025
try:
    year_select = Select(WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "ctl00_ContentPage_cmbYears"))
    ))
    
    # Пытаемся выбрать 2024-2025
    try:
        year_select.select_by_visible_text("2024-2025")
        logger.info("Выбран учебный год: 2024-2025")
    except:
        # Если нет опции 2024-2025, выбираем последний доступный год
        available_years = [opt.text for opt in year_select.options if opt.text and opt.text.strip()]
        if available_years:
            latest_year = available_years[-1]  # Берем последний доступный год
            year_select.select_by_visible_text(latest_year)
            logger.info(f"Год 2024-2025 не найден. Выбран последний доступный: {latest_year}")
        else:
            logger.warning("Не найдено доступных учебных годов")
    
    # Ждем обновления страницы после выбора года
    time.sleep(2)
    print(57687)
    
except Exception as e:
    logger.error(f"Ошибка при выборе учебного года: {e}")

# Ждем загрузки факультетов
WebDriverWait(driver, 20).until(
    EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbFacultets"))
)

faculty_select = Select(WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbFacultets"))
))
faculties = [opt.text for opt in faculty_select.options if opt.text and opt.text.strip()]
print(faculties)

for faculty in faculties:
    if faculty == "Выберите факультет":
        continue
        
    faculty_select = Select(WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "ctl00_ContentPage_cmbFacultets"))
    ))
    faculty_select.select_by_visible_text(faculty)
    
    logger.info(f"Обрабатывается факультет: {faculty}")
    
    # Ждем загрузки групп
    WebDriverWait(driver, 10).until(
        lambda d: Select(d.find_element(By.ID, "ctl00_ContentPage_cmbGroups")).options[0].text != "Выберите группу"
    )
    
    group_select = Select(WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ctl00_ContentPage_cmbGroups"))
    ))
    groups = [opt.text for opt in group_select.options if opt.text and opt.text.strip() and opt.text != "Выберите группу"]
    

    for group in groups:
        group_select = Select(WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.ID, "ctl00_ContentPage_cmbGroups"))
        ))
        group_select.select_by_visible_text(group)

        logger.info(f"Обрабатывается группа: {group}")
        
        # Ждем загрузки таблицы с ведомостями
        try:
            table = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "ctl00_ContentPage_ucListVedBox_Grid"))
            )

            links = [] 
            for link in table.find_elements(By.TAG_NAME, "a"):
                href = link.get_attribute('href')
                if href:
                    links.append(href)
            
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
                        logger.info(f"Обновлена запись в SBJ_URLS: GROUP_NAME={group}. Количество ссылок: {len(links)}")
                    else:
                        logger.info(f"Добавлена новая запись в SBJ_URLS: GROUP_NAME={group}, количество ссылок: {len(links)}")
                        
                except Exception as e:
                    logger.error(f"Ошибка при работе с таблицей SBJ_URLS для группы {group}: {str(e)}")
            else:
                logger.info(f"У группы {group} нет ссылок на предметы.")
                
        except Exception as e:
            logger.warning(f"Не удалось найти таблицу ведомостей для группы {group}: {e}")
            continue

conn.close()
driver.quit()
logger.info("Скрипт завершил работу")