import psycopg2
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import json

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] - [%(levelname)s] --> %(message)s'
)
logger = logging.getLogger(__name__)

def get_week_type(date: datetime) -> str:
    """Определяет тип недели (числитель/знаменатель) для даты"""
    # Начало учебного года - 1 сентября 2025
    start_date = datetime(2025, 9, 1)
    
    # Вычисляем разницу в неделях от начала года
    delta_weeks = (date - start_date).days // 7
    
    # Четные недели - числитель, нечетные - знаменатель
    return 'числитель' if delta_weeks % 2 == 0 else 'знаменатель'

def get_weekday_russian(date: datetime) -> str:
    """Возвращает день недели на русском языке"""
    weekdays = {
        0: 'понедельник',
        1: 'вторник',
        2: 'среда',
        3: 'четверг',
        4: 'пятница',
        5: 'суббота',
        6: 'воскресенье'
    }
    return weekdays[date.weekday()]

def create_simple_notification_trigger(conn):
    """Создает простой триггер для уведомления Spring о изменениях"""
    try:
        with conn.cursor() as cursor:
            # Создаем простую функцию для отправки уведомления
            cursor.execute("""
                CREATE OR REPLACE FUNCTION notify_timetable_changed()
                RETURNS TRIGGER AS $$
                BEGIN
                    -- Простое уведомление без данных - Spring сам запросит что нужно
                    PERFORM pg_notify('timetable_changes', 'data_updated');
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            """)
            
            # Создаем триггер для таблицы full_timetable
            cursor.execute("""
                DROP TRIGGER IF EXISTS timetable_change_trigger ON full_timetable;
                CREATE TRIGGER timetable_change_trigger
                AFTER INSERT OR UPDATE OR DELETE ON full_timetable
                FOR EACH STATEMENT
                EXECUTE FUNCTION notify_timetable_changed();
            """)
            
            logger.info("Триггер для уведомления Spring создан")
            
    except Exception as e:
        logger.error(f"Ошибка при создании триггера: {e}")
        raise

def populate_full_timetable():
    """Заполняет таблицу full_timetable на основе timetable_with_zach"""
    
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
        
        # Создаем триггер для уведомлений
        create_simple_notification_trigger(conn)
        
        with conn.cursor() as cursor:
            logger.info("Подключение к БД установлено")
            
            # Проверяем существование таблиц
            cursor.execute("SELECT COUNT(*) FROM timetable_with_zach")
            timetable_count = cursor.fetchone()[0]
            logger.info(f"Записей в timetable_with_zach: {timetable_count}")
            
            if timetable_count == 0:
                logger.error("Таблица timetable_with_zach пустая!")
                return
            
            # Получаем все уникальные номера зачеток
            cursor.execute("SELECT DISTINCT zach_number FROM timetable_with_zach")
            zach_numbers = [row[0] for row in cursor.fetchall()]
            logger.info(f"Найдено {len(zach_numbers)} уникальных зачеток")
            
            # Диапазон дат: с 1 сентября 2025 по 31 декабря 2025
            start_date = datetime(2025, 9, 1)
            end_date = datetime(2025, 12, 31)
            current_date = start_date
            
            total_inserted = 0
            
            # Временно отключаем триггер чтобы избежать множественных уведомлений
            cursor.execute("ALTER TABLE full_timetable DISABLE TRIGGER timetable_change_trigger")
            
            # Обрабатываем каждый день в диапазоне
            while current_date <= end_date:
                if current_date.weekday() < 5:  # Только рабочие дни (пн-пт)
                    week_type = get_week_type(current_date)
                    weekday_russian = get_weekday_russian(current_date)
                    
                    if total_inserted % 50 == 0:  # Реже логируем для производительности
                        logger.info(f"Обрабатывается дата: {current_date.date()} ({weekday_russian}, {week_type})")
                    
                    # Для каждой зачетки находим занятия на этот день
                    for zach_number in zach_numbers:
                        cursor.execute("""
                            SELECT time, subject, teacher 
                            FROM timetable_with_zach 
                            WHERE zach_number = %s 
                            AND week_type IN (%s, 'всегда')
                            AND week_day = %s
                            ORDER BY time
                        """, (zach_number, week_type, weekday_russian))
                        
                        lessons = cursor.fetchall()
                        
                        for lesson_time, subject, teacher in lessons:
                            try:
                                cursor.execute("""
                                    INSERT INTO full_timetable 
                                    (date, zach_number, time, subject, teacher, turnout)
                                    VALUES (%s, %s, %s, %s, %s, %s)
                                    ON CONFLICT (date, zach_number, time) 
                                    DO UPDATE SET
                                        subject = EXCLUDED.subject,
                                        teacher = EXCLUDED.teacher,
                                        turnout = EXCLUDED.turnout
                                """, (
                                    current_date.date(),
                                    zach_number,
                                    lesson_time,
                                    subject,
                                    teacher,
                                    False  # По умолчанию отсутствие
                                ))
                                
                                total_inserted += 1
                                
                                if total_inserted % 1000 == 0:
                                    logger.info(f"Добавлено {total_inserted} записей...")
                                    
                            except Exception as e:
                                logger.error(f"Ошибка при вставке записи для {zach_number} на {current_date.date()}: {e}")
                                continue
                
                current_date += timedelta(days=1)
            
            # Включаем триггер обратно
            cursor.execute("ALTER TABLE full_timetable ENABLE TRIGGER timetable_change_trigger")
            
            # Отправляем одно уведомление о завершении массового обновления
            cursor.execute("SELECT pg_notify('timetable_changes', 'bulk_update_completed')")
            
            conn.commit()
            logger.info(f"Успешно добавлено/обновлено {total_inserted} записей в full_timetable")
            
            # Проверяем результаты
            cursor.execute("SELECT COUNT(*) FROM full_timetable")
            total_count = cursor.fetchone()[0]
            logger.info(f"Всего записей в full_timetable: {total_count}")
            
    except Exception as e:
        logger.error(f"Ошибка при заполнении таблицы: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()
            logger.info("Подключение к БД закрыто")

if __name__ == "__main__":
    populate_full_timetable()