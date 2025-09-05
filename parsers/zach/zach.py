import psycopg2
import time
from bs4 import BeautifulSoup
import requests
import logging
import os

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def check_zach(url: str, conn):
    try:
        with conn.cursor() as cursor:  # Используем контекстный менеджер для курсора
            time.sleep(0.5)
            resp = requests.get(url)
            soup = BeautifulSoup(resp.text, 'html.parser')

            group_name = soup.find('a', {'id': 'ucVedBox_lblGroup'}).text.strip()
            table_rows = soup.find_all('tr', class_=['VedRow1', 'VedRow2'])
            
            inserted_count = 0
            duplicate_count = 0
            error_count = 0

            for row in table_rows:
                tds = row.find_all('td')
                number_zach = tds[1].text.strip()

                try:
                    # Вставка с обработкой конфликта
                    cursor.execute("""
                        INSERT INTO zach (zach_number, group_name) 
                        VALUES (%s, %s)
                        ON CONFLICT (zach_number) DO NOTHING
                    """, (number_zach, group_name))
                    
                    if cursor.rowcount > 0:
                        logger.info(f"Добавлено: {number_zach}, группа: {group_name}")
                        inserted_count += 1
                    else:
                        logger.debug(f"Дубликат: {number_zach}")
                        duplicate_count += 1

                except psycopg2.Error as e:
                    logger.error(f"Ошибка при вставке {number_zach}: {e}")
                    error_count += 1
                    conn.rollback()  # Откатываем текущую транзакцию
                    break  # Прерываем цикл при ошибке
            
            conn.commit()
            logger.info(
                f"Итоги для группы {group_name}: "
                f"добавлено {inserted_count}, "
                f"дубликатов {duplicate_count}, "
                f"ошибок {error_count}"
            )
            
    except Exception as e:
        logger.error(f"Ошибка в функции check_zach: {e}")
        conn.rollback()
        raise  # Пробрасываем исключение дальше


try:
 # Подключение к БД
    with psycopg2.connect(
        host="postgres",
        port=5432,
        database="db",
        user="admin",
        password="admin"
    ) as conn:  # Контекстный менеджер для соединения
        logger.info("Успешное подключение к БД")
        # Получаем данные из таблицы sbj_urls
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT id, group_name, urls[1] AS first_url
                FROM sbj_urls
            """)
            results = cursor.fetchall()

            # Обрабатываем каждый URL
            for row in results:
                try:
                    check_zach(row[2], conn)
                    logger.info(f"Обработано: URL={row[2]}")
                except Exception as e:
                    logger.error(f"Ошибка при обработке URL {row[2]}: {e}")
                    continue  # Продолжаем со следующего URL

except psycopg2.Error as e:
    logger.error(f"Ошибка подключения к БД: {e}")
except Exception as e:
    logger.error(f"Общая ошибка: {e}")