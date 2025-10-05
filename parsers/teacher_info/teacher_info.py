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

def extract_teachers_data() -> Dict[str, Dict[str, Any]]:
    """
    Извлекает данные из teacher_timetable и преобразует в структуру для teachers_info
    Возвращает словарь: {teacher_name: {'groups_subjects': {...}, 'id_timetable': id}}
    """
    conn = get_db_connection()
    if not conn:
        return {}
    
    teachers_data = {}
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = """
            SELECT 
                id_timetable,
                name,
                timetable
            FROM teacher_timetable 
            WHERE name IS NOT NULL 
                AND timetable IS NOT NULL
            """
            
            cur.execute(query)
            rows = cur.fetchall()
            
            for row in rows:
                teacher_name = row['name']
                id_timetable = row['id_timetable']
                timetable = row['timetable']
                groups_subjects = extract_groups_subjects_from_timetable(timetable)
                
                teachers_data[teacher_name] = {
                    'groups_subjects': groups_subjects,
                    'id_timetable': id_timetable
                }
                    
    except Exception as e:
        logger.error(f"Ошибка при извлечении данных: {e}")
    finally:
        conn.close()
    
    return teachers_data

def extract_groups_subjects_from_timetable(timetable: Dict) -> Dict[str, List[str]]:
    """
    Извлекает группы и предметы из JSON расписания
    Возвращает словарь: {группа: [список уникальных предметов]}
    """
    groups_subjects = {}
    
    try:
        for week_type in ['Числитель', 'Знаменатель']:
            if week_type in timetable:
                week_data = timetable[week_type]
                
                for day_name, day_schedule in week_data.items():
                    if not isinstance(day_schedule, dict):
                        continue
                    
                    for time_slot, lesson_info in day_schedule.items():
                        process_lesson_info(lesson_info, groups_subjects)
        
        for group in groups_subjects:
            groups_subjects[group].sort()
            
    except Exception as e:
        logger.error(f"Ошибка при обработке расписания: {e}")
    
    return groups_subjects

def process_lesson_info(lesson_info: Any, groups_subjects: Dict[str, List[str]]):
    """
    Обрабатывает информацию о занятии, которая может быть как объектом, так и списком объектов
    """
    try:
        if isinstance(lesson_info, list):
            for lesson in lesson_info:
                if isinstance(lesson, dict):
                    add_group_subject(lesson, groups_subjects)
        elif isinstance(lesson_info, dict):
            add_group_subject(lesson_info, groups_subjects)
    except Exception as e:
        logger.warning(f"Ошибка при обработке информации о занятии: {e}")

def add_group_subject(lesson: Dict, groups_subjects: Dict[str, List[str]]):
    """
    Добавляет группу и предмет в словарь groups_subjects
    """
    try:
        group = lesson.get('группа', '')
        subject = lesson.get('название', '')
        
       
        group = group.strip()
        subject = subject.strip()
        
 
        if not group or not subject:
            return
        
        
        subject = clean_subject_name(subject)
        

        if group not in groups_subjects:
            groups_subjects[group] = []
        

        if subject not in groups_subjects[group]:
            groups_subjects[group].append(subject)
            
    except Exception as e:
        logger.warning(f"Ошибка при добавлении группы и предмета: {e}")

def clean_subject_name(subject: str) -> str:
    """
    Очищает название предмета от лишних символов
    """

    subject = subject.replace('\"\"', '"')
    subject = subject.strip('"')
    
    if subject.endswith('.'):
        subject = subject[:-1]
    
    return subject.strip()

def insert_teachers_data(teachers_data: Dict[str, Dict[str, Any]]):
    """
    Вставляет или обновляет данные в таблице teachers_info
    """
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        with conn.cursor() as cur:
            for teacher_name, teacher_info in teachers_data.items():
                groups_subjects = teacher_info['groups_subjects']
                id_timetable = teacher_info['id_timetable']

                if not groups_subjects:
                    logger.warning(f"Пропуск преподавателя {teacher_name}: нет данных о группах и предметах")
                    continue
                
                groups_json = json.dumps(groups_subjects, ensure_ascii=False, indent=2)
                temp_password = generate_password()

                check_query = "SELECT id FROM teachers_info WHERE name = %s"
                cur.execute(check_query, (teacher_name,))
                existing_teacher = cur.fetchone()
                
                if existing_teacher:
                    update_query = """
                    UPDATE teachers_info 
                    SET groups_subjects = %s::jsonb, id_timetable = %s
                    WHERE name = %s
                    """
                    cur.execute(update_query, (groups_json, id_timetable, teacher_name))
                    logger.info(f"Обновлен преподаватель: {teacher_name}")
                else:
                    insert_query = """
                    INSERT INTO teachers_info (name, password, groups_subjects, id_timetable)
                    VALUES (%s, %s, %s::jsonb, %s)
                    """
                    cur.execute(insert_query, (teacher_name, temp_password, groups_json, id_timetable))
                    logger.info(f"Добавлен новый преподаватель: {teacher_name}")
            
            conn.commit()
            logger.info("Данные успешно обновлены в таблице teachers_info!")
            
    except Exception as e:
        conn.rollback()
        logger.error(f"Ошибка при вставке данных: {e}")
    finally:
        conn.close()

def cleanup_orphaned_teachers(active_teacher_names: List[str]):
    """
    Удаляет преподавателей, которых больше нет в teacher_timetable
    """
    conn = get_db_connection()
    if not conn:
        return
    
    try:
        with conn.cursor() as cur:
            if active_teacher_names:
                placeholders = ','.join(['%s'] * len(active_teacher_names))
                
                delete_query = f"""
                DELETE FROM teachers_info 
                WHERE name NOT IN ({placeholders})
                """
                cur.execute(delete_query, active_teacher_names)
                
                deleted_count = cur.rowcount
                if deleted_count > 0:
                    logger.info(f"Удалено {deleted_count} устаревших записей преподавателей")
                else:
                    logger.info("Устаревшие записи не найдены")
            else:
                delete_query = "DELETE FROM teachers_info"
                cur.execute(delete_query)
                logger.warning("Удалены все записи преподавателей (нет активных данных)")
            
            conn.commit()
            
    except Exception as e:
        conn.rollback()
        logger.error(f"Ошибка при очистке устаревших записей: {e}")
    finally:
        conn.close()

def main():
    logger.info("Начало обработки данных...")
    
    logger.info("Извлечение данных из teacher_timetable...")
    teachers_data = extract_teachers_data()
    
    if not teachers_data:
        logger.warning("Не удалось извлечь данные или данные отсутствуют")
        return
    
    logger.info(f"Найдено {len(teachers_data)} преподавателей в teacher_timetable")
    

    if teachers_data:
        sample_teacher_name = next(iter(teachers_data))
        sample_data = teachers_data[sample_teacher_name]
        logger.info(f"Пример данных для преподавателя '{sample_teacher_name}':")
        logger.info(f"  ID расписания: {sample_data['id_timetable']}")
        logger.info(f"  Количество групп: {len(sample_data['groups_subjects'])}")
        

        sample_groups = list(sample_data['groups_subjects'].keys())[:3]
        for group in sample_groups:
            subjects = sample_data['groups_subjects'][group]
            logger.info(f"  Группа {group}: {len(subjects)} предметов")
    
    logger.info("Заполнение таблицы teachers_info...")
    insert_teachers_data(teachers_data)
    

    active_teacher_names = list(teachers_data.keys())
    cleanup_orphaned_teachers(active_teacher_names)
    
    logger.info("Обработка завершена!")

if __name__ == "__main__":
    main()