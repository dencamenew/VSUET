import json
import logging
import psycopg2
import secrets
import string
import psycopg2
import json
from psycopg2.extras import RealDictCursor
from typing import Dict, List, Any

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
    'host': 'localhost',
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

def extract_teachers_data() -> Dict[str, Dict[str, List[Dict[str, str]]]]:
    conn = get_db_connection()
    if not conn:
        return {}
    
    teachers_data = {}
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = """
            SELECT DISTINCT 
                teacher as name,
                group_name,
                subject,
                type_subject,
                audience
            FROM full_timetable 
            WHERE teacher IS NOT NULL 
                AND teacher != 'Общая физическая'
                AND group_name IS NOT NULL
                AND subject IS NOT NULL
            ORDER BY teacher, group_name, subject
            """
            
            cur.execute(query)
            rows = cur.fetchall()
            
            for row in rows:
                teacher_name = row['name']
                group_name = row['group_name']
                
                subject_info = {
                    'subject': row['subject'],
                }
                
                if teacher_name not in teachers_data:
                    teachers_data[teacher_name] = {}
                
                if group_name not in teachers_data[teacher_name]:
                    teachers_data[teacher_name][group_name] = []
                
                if subject_info not in teachers_data[teacher_name][group_name]:
                    teachers_data[teacher_name][group_name].append(subject_info)
                    
    except Exception as e:
        logger.error(f"Ошибка при извлечении данных: {e}")
    finally:
        conn.close()
    
    return teachers_data

def insert_teachers_data(teachers_data: Dict[str, Dict[str, List[Dict[str, str]]]]):
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        with conn.cursor() as cur:
            for teacher_name, groups_data in teachers_data.items():
                groups_json = json.dumps(groups_data, ensure_ascii=False)
                
                temp_password = generate_password()
                
                insert_query = """
                INSERT INTO teachers_info (name, password, groups_subjects)
                VALUES (%s, %s, %s::jsonb)
                ON CONFLICT (name) 
                DO UPDATE SET 
                    groups_subjects = teachers_info.groups_subjects || EXCLUDED.groups_subjects::jsonb
                """
                
                cur.execute(insert_query, (teacher_name, temp_password, groups_json))
                
                logger.info(f"Обработан преподаватель: {teacher_name}")
            
            conn.commit()
            logger.info("Данные успешно обновлены!")
            
    except Exception as e:
        conn.rollback()
        logger.error(f"Ошибка при вставке данных: {e}")
    finally:
        conn.close()

def main():
    logger.info("Начало обработки данных...")
    
    logger.info("Извлечение данных из full_timetable...")
    teachers_data = extract_teachers_data()
    
    if not teachers_data:
        logger.warning("Не удалось извлечь данные или данные отсутствуют")
        return
    
    logger.info(f"Найдено {len(teachers_data)} преподавателей")
    
    logger.info("Заполнение таблицы teachers_info...")
    insert_teachers_data(teachers_data)
    
    logger.info("Обработка завершена!")

if __name__ == "__main__":
    main()