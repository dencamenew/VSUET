import psycopg2
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Tuple

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

def populate_full_timetable():
    """Заполняет таблицу full_timetable на основе timetable_with_zach"""
    
    conn = None
    try:
        # Подключение к БД
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            database="db",
            user="admin",
            password="admin"
        )
        
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
            
            # Обрабатываем каждый день в диапазоне
            while current_date <= end_date:
                if current_date.weekday() < 5:  # Только рабочие дни (пн-пт)
                    week_type = get_week_type(current_date)
                    weekday_russian = get_weekday_russian(current_date)
                    
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
                                        teacher = EXCLUDED.teacher
                                """, (
                                    current_date.date(),
                                    zach_number,
                                    lesson_time,
                                    subject,
                                    teacher,
                                    False  # По умолчанию отсутствие
                                ))
                                
                                total_inserted += 1
                                
                                if total_inserted % 100 == 0:
                                    logger.info(f"Добавлено {total_inserted} записей...")
                                    
                            except Exception as e:
                                logger.error(f"Ошибка при вставке записи для {zach_number} на {current_date.date()}: {e}")
                                continue
                
                current_date += timedelta(days=1)
                
                # Логируем прогресс каждые 7 дней
                if (current_date - start_date).days % 7 == 0:
                    logger.info(f"Обработано {(current_date - start_date).days} дней")
            
            conn.commit()
            logger.info(f"Успешно добавлено/обновлено {total_inserted} записей в full_timetable")
            
            # Проверяем результаты
            cursor.execute("SELECT COUNT(*) FROM full_timetable")
            total_count = cursor.fetchone()[0]
            logger.info(f"Всего записей в full_timetable: {total_count}")
            
            if total_count > 0:
                cursor.execute("""
                    SELECT date, zach_number, time, subject 
                    FROM full_timetable 
                    ORDER BY date, zach_number, time 
                    LIMIT 10
                """)
                samples = cursor.fetchall()
                logger.info("Примеры записей:")
                for sample in samples:
                    logger.info(f"  {sample}")
            
    except Exception as e:
        logger.error(f"Ошибка при заполнении таблицы: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()
            logger.info("Подключение к БД закрыто")

def test_date_functions():
    """Тестирование функций работы с датами"""
    test_dates = [
        datetime(2025, 9, 1),   # Понедельник
        datetime(2025, 9, 2),   # Вторник
        datetime(2025, 9, 8),   # Следующий понедельник
        datetime(2025, 12, 31)  # Последний день
    ]
    
    logger.info("Тестирование функций дат:")
    for date in test_dates:
        week_type = get_week_type(date)
        weekday = get_weekday_russian(date)
        logger.info(f"  {date.date()} - {weekday} - {week_type}")

if __name__ == "__main__":
    # Можно раскомментировать для тестирования функций дат
    # test_date_functions()
    
    # Запуск основного процесса
    populate_full_timetable()