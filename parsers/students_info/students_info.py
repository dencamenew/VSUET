import json
import logging
import psycopg2
import secrets
import string
from psycopg2.extras import RealDictCursor
from typing import Dict, List, Any, Set


logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

def generate_password(length=12):
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

DB_CONFIG = {
    'host': 'postgres',
    'database': 'db',
    'user': 'admin',
    'password': 'admin',
    'port': '5432'
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        logger.info("Успешное подключение к БД")
        return conn
    except Exception as e:
        logger.error(f"Ошибка подключения к БД: {e}")
        return None

def extract_unique_zach_numbers() -> Set[str]:
    conn = get_db_connection()
    if not conn:
        return set()
    
    zach_numbers = set()
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = """
            SELECT DISTINCT zach_number
            FROM full_timetable 
            WHERE zach_number IS NOT NULL 
            AND zach_number != ''
            ORDER BY zach_number
            """
            
            cur.execute(query)
            rows = cur.fetchall()
            
            for row in rows:
                zach_numbers.add(row['zach_number'])
                    
    except Exception as e:
        logger.error(f"Ошибка при извлечении данных: {e}")
    finally:
        conn.close()
    
    return zach_numbers

def insert_students_data(zach_numbers: Set[str]):
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        with conn.cursor() as cur:
            for zach_number in zach_numbers:
                password = generate_password()
                
                insert_query = """
                INSERT INTO students_info (zach_number, password)
                VALUES (%s, %s)
                ON CONFLICT (zach_number) 
                DO UPDATE SET 
                    password = EXCLUDED.password
                """
                
                cur.execute(insert_query, (zach_number, password))
                
                logger.info(f"Обработан студент: {zach_number}")
            
            conn.commit()
            logger.info("Данные студентов успешно обновлены!")
            
    except Exception as e:
        conn.rollback()
        logger.error(f"Ошибка при вставке данных студентов: {e}")
    finally:
        conn.close()

def main():
    logger.info("Начало обработки данных студентов...")
    
    logger.info("Извлечение уникальных зачётных номеров из full_timetable...")
    zach_numbers = extract_unique_zach_numbers()
    
    if not zach_numbers:
        logger.warning("Не удалось извлечь зачётные номера или данные отсутствуют")
        return
    
    logger.info(f"Найдено {len(zach_numbers)} уникальных зачётных номеров")
    
    logger.info("Заполнение таблицы students_info...")
    insert_students_data(zach_numbers)
    
    logger.info("Обработка завершена!")

if __name__ == "__main__":
    main()