from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import requests
import logging
import psycopg2
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




"""Функция получает ссылку и по ней парсит html страницу. Из ведомости считываются строки таблицы и обрабатываются."""
def check_rait(url: str):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')


    sbj = soup.find('span', {'id': 'ucVedBox_lblDis'}).text.strip()
    group_name = soup.find('a', {'id': 'ucVedBox_lblGroup'}).text.strip()


    table_rows = soup.find_all('tr', class_=['VedRow1', 'VedRow2'])
    ved_type = soup.find_all('span', id="ucVedBox_lblTypeVed")[0].text.strip()


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
                    INSERT INTO raiting (group_name, zach_number, sbj, raiting)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (group_name, zach_number, sbj) 
                    DO UPDATE SET raiting = EXCLUDED.raiting
                """, (group_name, zach_number, sbj, raiting))
            conn.commit()
            return True
        else:
            # ведомость зачет или экзамен только с оценкой
            for row in table_rows:
                tds = row.find_all('td')
                zach_number = tds[2].text.strip()
                mark = ""
                if len(tds[4].text.strip()) > 0:
                    mark = tds[4].text.strip()
                else:
                    mark = "-"
                cursor.execute("""
                    INSERT INTO raiting (group_name, zach_number, sbj, raiting)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (group_name, zach_number, sbj) 
                    DO UPDATE SET raiting = EXCLUDED.raiting
                """, (group_name, zach_number, sbj, [mark])) 
            conn.commit()
            return True
    else:
        # ведомости с практиками, курсовыми работами и т.д.
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
                    INSERT INTO raiting (group_name, zach_number, sbj, raiting)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (group_name, zach_number, sbj) 
                    DO UPDATE SET raiting = EXCLUDED.raiting
                """, (group_name, zach_number, sbj, [mark])) 
        conn.commit()
        return True
            



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


# Получаем urls из БД
try:
    cursor.execute("""
        SELECT urls AS all_urls
        FROM sbj_urls
    """)
    result = cursor.fetchall()
    urls = [url for tuple_item in result for url in tuple_item[0]]
    logger.info(f"URL успешно полученны из БД.")
except Exception as e:
    logger.error(f"Ошибка при получении данных из БД. {e}")


for url in urls:
    check_rait(url)