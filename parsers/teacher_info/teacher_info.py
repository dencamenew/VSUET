import json
import logging
import psycopg2
import secrets
import string
import re

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Функция для генерации уникального пароля
def generate_password(length=12):
    """Генерирует случайный пароль заданной длины"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def clean_subject_name(subject):
    """
    Очищает название предмета: удаляет всё, что в скобках
    """
    if not subject:
        return subject
    
    # Удаляем всё, что находится в скобках (включая сами скобки)
    cleaned_subject = re.sub(r'\([^)]*\)', '', subject)
    
    # Удаляем лишние пробелы и знаки препинания
    cleaned_subject = cleaned_subject.strip()
    cleaned_subject = re.sub(r'[,\s.-]+$', '', cleaned_subject)
    cleaned_subject = re.sub(r'^[,\s.-]+', '', cleaned_subject)
    
    return cleaned_subject

def process_teacher_data(cursor):
    """
    Обрабатывает данные из timetable_with_zach и создает структуру преподаватель-группы-предметы
    """
    teacher_data = {}
    
    # Получаем всех уникальных преподавателей
    cursor.execute("SELECT DISTINCT teacher FROM timetable_with_zach WHERE teacher IS NOT NULL AND teacher != ''")
    teachers = [row[0] for row in cursor.fetchall()]
    
    logger.info(f"Найдено преподавателей: {len(teachers)}")
    
    for teacher in teachers:
        logger.info(f"Обрабатываем преподавателя: {teacher}")
        
        # Получаем все группы и предметы для данного преподавателя
        cursor.execute("""
            SELECT DISTINCT group_name, subject 
            FROM timetable_with_zach 
            WHERE teacher = %s 
            AND group_name IS NOT NULL 
            AND group_name != '' 
            AND subject IS NOT NULL 
            AND subject != ''
        """, (teacher,))
        
        group_subjects = {}
        for group_name, subject in cursor.fetchall():
            # Очищаем название предмета
            cleaned_subject = clean_subject_name(subject)
            
            if not cleaned_subject:
                continue
                
            if group_name not in group_subjects:
                group_subjects[group_name] = set()
            group_subjects[group_name].add(cleaned_subject)
        
        # Преобразуем sets в lists
        for group in group_subjects:
            group_subjects[group] = list(group_subjects[group])
        
        # Сохраняем данные преподавателя
        teacher_data[teacher] = {
            'password': generate_password(),
            'groups_subjects': group_subjects
        }
        
        logger.info(f"Преподаватель {teacher}: найдено {len(group_subjects)} групп")
        
        # Логируем результат для отладки
        for group, subjects in group_subjects.items():
            logger.info(f"  Группа {group}: {subjects}")

    return teacher_data

# Основной код
try:
    # Подключение к базе данных
    conn = psycopg2.connect(
        host="postgres",
        port=5432,
        database="db",
        user="admin",
        password="admin"
    )
    
    with conn.cursor() as cursor:
        # Обрабатываем данные преподавателей
        teacher_data = process_teacher_data(cursor)
        
        # Сохраняем данные в таблицу teachers_info
        for teacher_name, data in teacher_data.items():
            password = data['password']
            groups_subjects_json = json.dumps(data['groups_subjects'], ensure_ascii=False)
            
            # Вставляем данные в базу
            insert_query = """
            INSERT INTO teachers_info (name, password, groups_subjects) 
            VALUES (%s, %s, %s::jsonb)
            ON CONFLICT (name) DO UPDATE SET 
                password = EXCLUDED.password,
                groups_subjects = EXCLUDED.groups_subjects
            """
            
            cursor.execute(insert_query, (teacher_name, password, groups_subjects_json))
            logger.info(f"Добавлен преподаватель: {teacher_name}")
        
        # Сохраняем изменения
        conn.commit()
        logger.info(f"Все данные успешно сохранены в базу данных. Обработано {len(teacher_data)} преподавателей")

except psycopg2.Error as e:
    logger.error(f"Ошибка PostgreSQL: {e}")
    if 'conn' in locals():
        conn.rollback()
        logger.error(f"Статус соединения: {'OPEN' if not conn.closed else 'CLOSED'}")
except Exception as e:
    logger.error(f"Общая ошибка: {e}")
    if 'conn' in locals():
        conn.rollback()
finally:
    # Закрываем соединение с базой данных
    if 'conn' in locals() and not conn.closed:
        conn.close()
        logger.info("Соединение с базой данных закрыто")