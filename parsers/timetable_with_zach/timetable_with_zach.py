import psycopg2
import json
import logging
import re
from typing import Dict, List, Optional, Any

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s'
)
logger = logging.getLogger(__name__)

def extract_audience(subject_text: str) -> Optional[str]:
    """Извлекает аудиторию из строки предмета"""
    if not subject_text:
        return None
    
    try:
        # Ищем аудиторию в различных форматах
        patterns = [
            r'\(а\.\s*(\d+[а-яА-Я\-]*)\)',  # (а.104), (а.6-33)
            r'\(ауд\.\s*(\d+[а-яА-Я\-]*)\)',
            r'\(аудитория\s*(\d+[а-яА-Я\-]*)\)',
            r'\((\d+[а-яА-Я\-]*)\)',  # (104), (6-33)
            r'\(а\.\s*([а-яА-Я]+)\)',  # (а.БАЗ)
            r'\(([а-яА-Я]+)\)'  # (БАЗ)
        ]
        
        for pattern in patterns:
            match = re.search(pattern, subject_text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return None
    except Exception as e:
        logger.warning(f"Ошибка при извлечении аудитории из '{subject_text}': {e}")
        return None

def extract_teacher(subject_text: str) -> Optional[str]:
    """Извлекает преподавателя из строки предмета"""
    if not subject_text:
        return None
    
    try:
        # Паттерны для поиска преподавателей (учитываем различные форматы)
        patterns = [
            r'([А-ЯЁ][а-яё]+\s[А-ЯЁ]\.[А-ЯЁ]\.)',  # Муравьев А.С.
            r'([А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+)',  # Муравьев Алексей Сергеевич
            r'([А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+)',  # Муравьев Алексей
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, subject_text)
            if matches:
                # Берем последнего преподавателя (часто их несколько)
                return matches[-1].strip()
        
        return None
    except Exception as e:
        logger.warning(f"Ошибка при извлечении преподавателя из '{subject_text}': {e}")
        return None

def extract_subject(subject_text: str) -> str:
    """Очищает название предмета от аудитории и преподавателя"""
    if not subject_text:
        return ""
    
    try:
        subject = subject_text
        # Удаляем аудиторию
        subject = re.sub(r'\s*\(а\.\s*\d+[а-яА-Я\-]*\)', '', subject, flags=re.IGNORECASE)
        subject = re.sub(r'\s*\(ауд\.\s*\d+[а-яА-Я\-]*\)', '', subject, flags=re.IGNORECASE)
        subject = re.sub(r'\s*\(аудитория\s*\d+[а-яА-Я\-]*\)', '', subject, flags=re.IGNORECASE)
        subject = re.sub(r'\s*\(\d+[а-яА-Я\-]*\)', '', subject)
        subject = re.sub(r'\s*\(а\.\s*[а-яА-Я]+\)', '', subject, flags=re.IGNORECASE)
        subject = re.sub(r'\s*\([а-яА-Я]+\)', '', subject)
        
        # Удаляем преподавателей
        subject = re.sub(r'[А-ЯЁ][а-яё]+\s[А-ЯЁ]\.[А-ЯЁ]\.', '', subject)
        subject = re.sub(r'[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+', '', subject)
        subject = re.sub(r'[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+', '', subject)
        
        # Очищаем от лишних пробелов и знаков препинания
        subject = re.sub(r'\s+', ' ', subject).strip()
        subject = re.sub(r'^[:\-\s]+', '', subject)
        subject = re.sub(r'[,\s\-]+$', '', subject)
        
        return subject if subject else subject_text
    except Exception as e:
        logger.warning(f"Ошибка при очистке предмета '{subject_text}': {e}")
        return subject_text

def convert_time_format(time_str: str) -> str:
    """Конвертирует время из формата '13.35-15.10' в '13:35:00'"""
    try:
        if '-' in time_str:
            start_time = time_str.split('-')[0]
        else:
            start_time = time_str
            
        if '.' in start_time:
            hours, minutes = start_time.split('.')
            return f"{int(hours):02d}:{int(minutes):02d}:00"
        else:
            return f"{int(start_time):02d}:00:00"
    except Exception as e:
        logger.warning(f"Ошибка конвертации времени '{time_str}': {e}")
        return "00:00:00"

def debug_sample_data(timetable_data: Any, group_name: str):
    """Отладочная функция для анализа структуры расписания"""
    logger.info(f"Структура расписания для группы {group_name}:")
    
    if not isinstance(timetable_data, dict):
        logger.info(f"Расписание не является словарем: {type(timetable_data)}")
        return
    
    for week_type, week_data in timetable_data.items():
        logger.info(f"Тип недели: {week_type}")
        
        if isinstance(week_data, dict):
            for day_name, day_data in week_data.items():
                logger.info(f"  День: {day_name}")
                
                if isinstance(day_data, dict):
                    for time_slot, subject in day_data.items():
                        logger.info(f"    Время: {time_slot}, Предмет: {subject}")
                        
                        # Тестируем функции извлечения
                        extracted_subject = extract_subject(subject)
                        extracted_audience = extract_audience(subject)
                        extracted_teacher = extract_teacher(subject)
                        
                        logger.info(f"      Извлечено - Предмет: {extracted_subject}")
                        logger.info(f"      Извлечено - Аудитория: {extracted_audience}")
                        logger.info(f"      Извлечено - Преподаватель: {extracted_teacher}")
                        logger.info("      " + "-" * 40)
                else:
                    logger.info(f"    Данные дня не являются словарем: {type(day_data)}")
        else:
            logger.info(f"  Данные недели не являются словарем: {type(week_data)}")

def populate_timetable_with_zach():
    """Заполняет таблицу timetable_with_zach из данных zach и timetable"""
    
    conn = None
    try:
        # Подключение к БД
        conn = psycopg2.connect(
            host="postgres",
            port=5432,
            database="db",
            user="admin",
            password="admin"
        )
        
        with conn.cursor() as cursor:
            logger.info("Подключение к БД установлено")
            
            # Получаем все зачетки и их группы
            cursor.execute("SELECT zach_number, group_name FROM zach")
            zach_records = cursor.fetchall()
            logger.info(f"Найдено {len(zach_records)} записей в таблице zach")
            
            if not zach_records:
                logger.error("Таблица zach пустая!")
                return
            
            # Получаем все расписания
            cursor.execute("SELECT group_name, timetable FROM timetable")
            timetable_records = cursor.fetchall()
            logger.info(f"Найдено {len(timetable_records)} записей в таблице timetable")
            
            if not timetable_records:
                logger.error("Таблица timetable пустая!")
                return
            
            # Создаем словарь для быстрого доступа к расписаниям по группе
            timetable_dict = {}
            for group_name, timetable_json in timetable_records:
                try:
                    if isinstance(timetable_json, str):
                        timetable_data = json.loads(timetable_json)
                    else:
                        timetable_data = timetable_json
                    
                    # Сохраняем данные
                    timetable_dict[group_name] = timetable_data
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Ошибка парсинга JSON для группы {group_name}: {e}")
                    continue
                except Exception as e:
                    logger.error(f"Ошибка обработки данных для группы {group_name}: {e}")
                    continue
            
            # Показываем отладочную информацию для первой группы
            if timetable_dict:
                first_group = list(timetable_dict.keys())[0]
                debug_sample_data(timetable_dict[first_group], first_group)
            
            insert_count = 0
            skip_count = 0
            
            # Обрабатываем каждую зачетку
            for i, (zach_number, group_name) in enumerate(zach_records, 1):
                if group_name in timetable_dict:
                    timetable_data = timetable_dict[group_name]
                    
                    if not isinstance(timetable_data, dict):
                        logger.warning(f"Расписание для группы {group_name} не является словарем")
                        skip_count += 1
                        continue
                    
                    # Обрабатываем каждую неделю
                    for week_type in ['Числитель', 'Знаменатель']:
                        week_type_lower = week_type.lower()
                        
                        if week_type in timetable_data:
                            week_data = timetable_data[week_type]
                            
                            if not isinstance(week_data, dict):
                                logger.warning(f"Данные недели {week_type} не являются словарем")
                                skip_count += 1
                                continue
                            
                            # Обрабатываем каждый день недели
                            for day_name, day_schedule in week_data.items():
                                day_name_lower = day_name.lower()
                                
                                if day_schedule and isinstance(day_schedule, dict):
                                    # Обрабатываем каждый временной слот
                                    for time_slot, subject_text in day_schedule.items():
                                        if subject_text and isinstance(subject_text, str):
                                            # Извлекаем информацию
                                            subject = extract_subject(subject_text)
                                            audience = extract_audience(subject_text)
                                            teacher = extract_teacher(subject_text)
                                            time_formatted = convert_time_format(time_slot)
                                            
                                            # Вставляем запись
                                            try:
                                                cursor.execute("""
                                                    INSERT INTO timetable_with_zach 
                                                    (zach_number, group_name, week_type, week_day, time, subject, audience, teacher)
                                                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                                                    ON CONFLICT (zach_number, week_type, week_day, time) 
                                                    DO UPDATE SET
                                                        subject = EXCLUDED.subject,
                                                        audience = EXCLUDED.audience,
                                                        teacher = EXCLUDED.teacher,
                                                        group_name = EXCLUDED.group_name
                                                """, (
                                                    zach_number, 
                                                    group_name, 
                                                    week_type_lower, 
                                                    day_name_lower, 
                                                    time_formatted, 
                                                    subject, 
                                                    audience, 
                                                    teacher
                                                ))
                                                
                                                insert_count += 1
                                                
                                                if insert_count % 50 == 0:
                                                    logger.info(f"Обработано {insert_count} записей...")
                                                    
                                            except Exception as e:
                                                logger.error(f"Ошибка при вставке: {e}")
                                                continue
                                        else:
                                            skip_count += 1
                                else:
                                    skip_count += 1
                        else:
                            skip_count += 1
                else:
                    logger.warning(f"Для группы {group_name} не найдено расписание")
                    skip_count += 1
                
                if i % 20 == 0:
                    logger.info(f"Обработано {i}/{len(zach_records)} зачеток")
            
            conn.commit()
            logger.info(f"Успешно добавлено/обновлено {insert_count} записей")
            logger.info(f"Пропущено {skip_count} записей")
            
            # Проверяем результаты
            cursor.execute("SELECT COUNT(*) FROM timetable_with_zach")
            total_count = cursor.fetchone()[0]
            logger.info(f"Всего записей в timetable_with_zach: {total_count}")
            
            if total_count > 0:
                cursor.execute("SELECT zach_number, week_type, week_day, time, subject FROM timetable_with_zach LIMIT 10")
                samples = cursor.fetchall()
                logger.info("Примеры записей:")
                for sample in samples:
                    logger.info(f"  {sample}")
            
    except Exception as e:
        logger.error(f"Ошибка: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    populate_timetable_with_zach()