import json
import logging
import psycopg2
import secrets
import string
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

def extract_teachers_data() -> Dict[str, Dict[str, List[str]]]:
    """
    Извлекает данные о преподавателях и их группах с предметами.
    Возвращает словарь: {преподаватель: {группа: [предмет1, предмет2, ...]}}
    """
    conn = get_db_connection()
    if not conn:
        return {}
    
    teachers_data = {}
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = """
            SELECT 
                teacher as name,
                group_name,
                subject
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
                subject = row['subject']
                
                if teacher_name not in teachers_data:
                    teachers_data[teacher_name] = {}
                
                if group_name not in teachers_data[teacher_name]:
                    teachers_data[teacher_name][group_name] = []
                
                # Добавляем предмет в список, если его еще нет
                if subject not in teachers_data[teacher_name][group_name]:
                    teachers_data[teacher_name][group_name].append(subject)
                    
    except Exception as e:
        logger.error(f"Ошибка при извлечении данных: {e}")
    finally:
        conn.close()
    
    return teachers_data

def insert_teachers_data(teachers_data: Dict[str, Dict[str, List[str]]]):
    """
    Вставляет или обновляет данные в таблице teachers_info.
    Теперь groups_subjects будет иметь формат: {группа: [предмет1, предмет2, ...]}
    """
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        with conn.cursor() as cur:
            for teacher_name, groups_data in teachers_data.items():
                groups_json = json.dumps(groups_data, ensure_ascii=False)
                temp_password = generate_password()
                
                # Проверяем, существует ли уже преподаватель
                check_query = "SELECT id FROM teachers_info WHERE name = %s"
                cur.execute(check_query, (teacher_name,))
                existing_teacher = cur.fetchone()
                
                if existing_teacher:
                    # Обновляем только groups_subjects для существующего преподавателя
                    update_query = """
                    UPDATE teachers_info 
                    SET groups_subjects = %s::jsonb
                    WHERE name = %s
                    """
                    cur.execute(update_query, (groups_json, teacher_name))
                    logger.info(f"Обновлен преподаватель: {teacher_name}")
                else:
                    # Вставляем нового преподавателя
                    insert_query = """
                    INSERT INTO teachers_info (name, password, groups_subjects)
                    VALUES (%s, %s, %s::jsonb)
                    """
                    cur.execute(insert_query, (teacher_name, temp_password, groups_json))
                    logger.info(f"Добавлен новый преподаватель: {teacher_name}")
            
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
    
    # Логируем пример данных для проверки
    sample_teacher = next(iter(teachers_data.items()))
    logger.info(f"Пример данных: {sample_teacher[0]} - {sample_teacher[1]}")
    
    logger.info("Заполнение таблицы teachers_info...")
    insert_teachers_data(teachers_data)
    
    logger.info("Обработка завершена!")

if __name__ == "__main__":
    main()