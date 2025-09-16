from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import logging
import time
import os
from bs4 import BeautifulSoup
import requests
import psycopg2
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Файл для сохранения данных
DATA_FILE = "group_links.txt"

def load_existing_data():
    """Загружает существующие данные из файла, если он существует"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                links = [line.strip() for line in f.readlines() if line.strip()]
                logger.info(f"Загружены существующие данные из файла: {len(links)} ссылок")
                return links
        except Exception as e:
            logger.error(f"Ошибка при загрузке данных из файла: {e}")
            return []
    else:
        logger.info("Файл с данными не существует, будет выполнен парсинг")
        return None

# Пытаемся загрузить данные из файла
existing_links = load_existing_data()

# Если файл существует, используем существующие ссылки для парсинга
if existing_links is not None:
    all_links = existing_links
    logger.info(f"Начинаем парсинг рейтинга из {len(all_links)} существующих ссылок")
else:
    # Если файла нет, выполняем парсинг ссылок
    logger.info("Начинаем парсинг данных...")
    all_links = []

    # Подключение драйвера
    try:
        chrome_options = Options()
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.page_load_strategy = 'eager'
        driver = webdriver.Chrome(options=chrome_options)
        logger.info("Успешное подключение драйвера.")
    except Exception as e:
        logger.error(f"Ошибка при подключении драйвера: {e}")
        exit(1)

    # Сам скрипт для парсинга ссылок
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

                for link in table.find_elements(By.TAG_NAME, "a"):
                    href = link.get_attribute('href')
                    if href and href not in all_links:  # Добавляем только уникальные ссылки
                        all_links.append(href)
                        logger.info(f"Добавлена ссылка: {href}")
                    
            except Exception as e:
                logger.warning(f"Не удалось найти таблицу ведомостей для группы {group}: {e}")
                continue

    def save_data_to_file(links):
        """Сохраняет данные в текстовый файл"""
        try:
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                for link in links:
                    f.write(link + '\n')
            
            logger.info(f"Данные успешно сохранены в файл: {DATA_FILE}")
            logger.info(f"Всего ссылок: {len(links)}")
            return True
        except Exception as e:
            logger.error(f"Ошибка при сохранении данных в файл: {e}")
            return False

    # Сохраняем данные в файл
    save_data_to_file(all_links)
    driver.quit()
    logger.info("Парсинг ссылок завершен, начинаем парсинг рейтинга")

# Подключение к БД
try:
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        database="db",
        user="admin",
        password="admin"
    )
    cursor = conn.cursor()
    logger.info(f"Успешное подключение к БД.")
    cursor.execute("ALTER TABLE raiting DISABLE TRIGGER raiting_notify_trigger")
    conn.commit()
except Exception as e:
    logger.error(f"Ошибка при подключении БД. {e}")
    exit(1)

# Функция для парсинга рейтинга
@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=30, max=180),
    retry=retry_if_exception_type(requests.exceptions.RequestException),
    reraise=True
)
def parse_rating(url, c):
    try:
        resp = requests.get(url)
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        try:
            sbj = soup.find('span', {'id': 'ucVedBox_lblDis'}).text.strip()
            group_name = soup.find('a', {'id': 'ucVedBox_lblGroup'}).text.strip()
            table_rows = soup.find_all('tr', class_=['VedRow1', 'VedRow2'])
            ved_type = soup.find_all('span', id="ucVedBox_lblTypeVed")[0].text.strip()
        except AttributeError as e:
            logger.warning(f"Не удалось найти элементы на странице {url}: {e}")
            return False

        if ved_type == "Зачет" or ved_type == "Экзамен":
            # тип ведомости по КТ
            if soup.find("input", id="ucVedBox_chkShowKT"): # проверка по наличию input для отображения по КТ
                for row in table_rows:
                    tds = row.find_all('td')
                    zach_number = tds[1].text.strip()
                    raiting = [
                        tds[7].text.strip() if len(tds) > 7 else "-",
                        tds[12].text.strip() if len(tds) > 12 else "-",
                        tds[17].text.strip() if len(tds) > 17 else "-",
                        tds[22].text.strip() if len(tds) > 22 else "-",
                        tds[27].text.strip() if len(tds) > 27 else "-",
                        tds[29].text.strip() if len(tds) > 29 else "-"
                    ]
                    cursor.execute("""
                        INSERT INTO raiting (group_name, zach_number, sbj, ved_type, raiting)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (group_name, zach_number, sbj) 
                        DO UPDATE SET 
                            ved_type = EXCLUDED.ved_type,
                            raiting = EXCLUDED.raiting
                        WHERE raiting.raiting IS DISTINCT FROM EXCLUDED.raiting
                        OR raiting.ved_type IS DISTINCT FROM EXCLUDED.ved_type
                    """, (group_name, zach_number, sbj, ved_type, raiting))
                conn.commit()
                logger.info(f"В БД добавлен рейтинг предмета {sbj} группы: {group_name}. Ссылка № {c}")
                return True
            else:
                for row in table_rows:
                    tds = row.find_all('td')
                    zach_number = tds[2].text.strip()
                    mark = tds[4].text.strip() if len(tds[4].text.strip()) > 0 else "-"
                    cursor.execute("""
                        INSERT INTO raiting (group_name, zach_number, sbj, ved_type, raiting)
                        VALUES (%s, %s, %s, %s, %s)
                        ON CONFLICT (group_name, zach_number, sbj) 
                        DO UPDATE SET 
                            ved_type = EXCLUDED.ved_type,
                            raiting = EXCLUDED.raiting
                        WHERE raiting.raiting IS DISTINCT FROM EXCLUDED.raiting
                        OR raiting.ved_type IS DISTINCT FROM EXCLUDED.ved_type
                    """, (group_name, zach_number, sbj, ved_type, [mark]))
                conn.commit()
                logger.info(f"В БД добавлен рейтинг предмета {sbj} группы: {group_name}. Ссылка № {c}")
                return True
        else:
            for row in table_rows:
                tds = row.find_all('td')
                zach_number = tds[2].text.strip()
                mark = ""
                if len(tds[7].text.strip()) > 0:
                    mark = tds[7].text.strip()
                elif len(tds[4].text.strip()) > 0:
                    mark = tds[4].text.strip()
                else:
                    mark = "-"
                cursor.execute("""
                    INSERT INTO raiting (group_name, zach_number, sbj, ved_type, raiting)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (group_name, zach_number, sbj) 
                    DO UPDATE SET 
                        ved_type = EXCLUDED.ved_type,
                        raiting = EXCLUDED.raiting
                    WHERE raiting.raiting IS DISTINCT FROM EXCLUDED.raiting
                    OR raiting.ved_type IS DISTINCT FROM EXCLUDED.ved_type
                """, (group_name, zach_number, sbj, ved_type, [mark]))
            conn.commit()
            logger.info(f"В БД добавлен рейтинг предмета {sbj} группы: {group_name}. Ссылка № {c}")
            return True
            
    except Exception as e:
        logger.error(f"Ошибка при парсинге ссылки {url}: {e}")
        return False

# Парсим рейтинг из всех ссылок
c = 1
for url in all_links:
    logger.info(f"Обрабатывается ссылка {c}/{len(all_links)}: {url}")
    parse_rating(url, c)
    c += 1

# Включаем триггер и закрываем соединение
try:
    cursor.execute("ALTER TABLE raiting ENABLE TRIGGER raiting_notify_trigger")
    conn.commit()
    cursor.close()
    conn.close()
    logger.info("Парсинг рейтинга завершен успешно")
except Exception as e:
    logger.error(f"Ошибка при завершении работы с БД: {e}")