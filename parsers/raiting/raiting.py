from bs4 import BeautifulSoup
import requests
import logging
import psycopg2
from dotenv import load_dotenv
import os
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type




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
@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=30, max=180),
    retry=retry_if_exception_type(requests.exceptions.RequestException),
    reraise=True
)
def check_rait(url: str, c: int):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    print(soup)


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
            logger.info(f"В БД добавлен рейтинг предмета {sbj} группы: {group_name}. Ссылка №  {c}")
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
            logger.info(f"В БД добавлен рейтинг предмета {sbj} группы: {group_name}. Ссылка №  {c}")
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
        logger.info(f"В БД добавлен рейтинг предмета {sbj} группы: {group_name}. Ссылка №  {c}")
        return True
            



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
    cursor.execute("ALTER TABLE timetable DISABLE TRIGGER timetable_notify_trigger")
    conn.commit()
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
    logger.info(f"URL успешно полученны из БД. Кол-во URL: {len(urls)}.")
except Exception as e:
    logger.error(f"Ошибка при получении данных из БД. {e}")

c = 1  
for url in urls:
    print(url)
    check_rait(url, c)  
    c += 1 
cursor.execute("ALTER TABLE timetable ENABLE TRIGGER timetable_notify_trigger")
conn.commit()