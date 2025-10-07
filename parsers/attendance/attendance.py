import psycopg2
import json
from datetime import datetime, timedelta
from collections import defaultdict

def populate_attendance_table():
    # Подключение к базе данных
    conn = psycopg2.connect(
        host="postgres",
        port=5432,
        database="db",
        user="admin",
        password="admin"
    )
    cursor = conn.cursor()
    
    # Обновляем функцию уведомления, чтобы не отправлять большие payload через NOTIFY
    cursor.execute(
        """
        CREATE OR REPLACE FUNCTION notify_attendance_table_change()
        RETURNS TRIGGER AS $$
        DECLARE
            notification JSON;
        BEGIN
            IF TG_OP = 'DELETE' THEN
                notification = json_build_object(
                    'eventType', TG_OP,
                    'id', OLD.id,
                    'group_name', OLD.group_name,
                    'subject', OLD.subject,
                    'changed_at', NOW()
                );
            ELSE
                notification = json_build_object(
                    'eventType', TG_OP,
                    'id', NEW.id,
                    'group_name', NEW.group_name,
                    'subject', NEW.subject,
                    'changed_at', NOW()
                );
            END IF;

            PERFORM pg_notify('attendance_updates', notification::text);
            IF TG_OP = 'DELETE' THEN
                RETURN OLD;
            ELSE
                RETURN NEW;
            END IF;
        END;
        $$ LANGUAGE plpgsql;
        """
    )
    
    # Получаем все группы из student_timetable
    cursor.execute("SELECT group_name, timetable FROM student_timetable")
    groups_data = cursor.fetchall()
    
    # Генерируем даты с 1 сентября 2025 по 31 декабря 2025
    start_date = datetime(2025, 9, 1).date()
    end_date = datetime(2025, 12, 31).date()
    
    for group_name, timetable_data in groups_data:
        # Получаем зачетки студентов группы
        query = "SELECT zach_number FROM student_info WHERE group_name = %s"
        cursor.execute(query, (group_name,))
        results = cursor.fetchall()
        zach_numbers = [result[0] for result in results]
        
        if not zach_numbers:
            print(f"Нет студентов для группы {group_name}")
            continue
            
        # timetable_data уже является словарем, не нужно преобразовывать
        timetable = timetable_data
        
        # Создаем словарь для хранения посещаемости по предметам
        subject_attendance = {}
        
        # Генерируем даты с типами недель
        current_date = start_date
        week_type = "Числитель"  # Начинаем с числителя
        week_counter = 0
        
        while current_date <= end_date:
            # Получаем день недели на русском
            days_map = {
                0: "ПОНЕДЕЛЬНИК",
                1: "ВТОРНИК", 
                2: "СРЕДА",
                3: "ЧЕТВЕРГ",
                4: "ПЯТНИЦА",
                5: "СУББОТА",
                6: "ВОСКРЕСЕНЬЕ"
            }
            day_of_week = days_map[current_date.weekday()]
            
            # Получаем пары на этот день и тип недели
            if week_type in timetable and day_of_week in timetable[week_type]:
                day_schedule = timetable[week_type][day_of_week]
                
                for time_slot, lessons in day_schedule.items():
                    for lesson in lessons:
                        subject_name = lesson["название"]
                        lesson_type = lesson["тип"]
                        teacher = lesson["преподаватель"]
                        
                        # Пропускаем занятия с типом "-"
                        if lesson_type == "-":
                            continue
                            
                        # Создаем ключ предмета
                        subject_key = f"{subject_name}_{lesson_type}"
                        
                        # Инициализируем структуру предмета если нужно
                        if subject_key not in subject_attendance:
                            subject_attendance[subject_key] = {
                                "_id": f"67f89a1d4b3a2c1e5f8b9c{len(subject_attendance):04d}",
                                "course": {
                                    "name": subject_name,
                                    "type": lesson_type,
                                    "group": group_name,
                                    "teacher": teacher
                                },
                                "students": []
                            }
                            
                            # Инициализируем студентов для этого предмета
                            for zach_number in zach_numbers:
                                subject_attendance[subject_key]["students"].append({
                                    "student_id": zach_number,
                                    "attendance": {}
                                })
                        
                        # Добавляем дату посещения для всех студентов этого предмета
                        for student in subject_attendance[subject_key]["students"]:
                            # Устанавливаем посещение как True (присутствовал)
                            student["attendance"][current_date.isoformat()] = True
            
            # Переходим к следующему дню
            current_date += timedelta(days=1)
            
            # Меняем тип недели каждый понедельник
            if current_date.weekday() == 0:  # Понедельник
                week_counter += 1
                week_type = "Числитель" if week_counter % 2 == 0 else "Знаменатель"
        
        # Сохраняем данные в таблицу attendance_table
        for subject_key, attendance_data in subject_attendance.items():
            # Вставляем или обновляем запись
            insert_query = """
            INSERT INTO attendance_table (group_name, subject, attendance)
            VALUES (%s, %s, %s)
            ON CONFLICT (group_name, subject) 
            DO UPDATE SET attendance = EXCLUDED.attendance
            """
            
            try:
                cursor.execute(insert_query, (
                    group_name,
                    subject_key,
                    json.dumps(attendance_data, ensure_ascii=False)
                ))
                print(f"Добавлен предмет: {subject_key} для группы {group_name}")
            except Exception as e:
                print(f"Ошибка при добавлении предмета {subject_key}: {e}")
                conn.rollback()
    
    # Сохраняем изменения и закрываем соединение
    conn.commit()
    cursor.close()
    conn.close()
    print("Таблица attendance_table успешно заполнена!")

# Альтернативная версия если нет таблицы student_info
def populate_attendance_table_without_students():
    conn = psycopg2.connect(
        host="postgres",
        port=5432,
        database="db",
        user="admin",
        password="admin"
    )
    cursor = conn.cursor()
    
    # Получаем все группы из student_timetable
    cursor.execute("SELECT group_name, timetable FROM student_timetable")
    groups_data = cursor.fetchall()
    
    start_date = datetime(2025, 9, 1).date()
    end_date = datetime(2025, 12, 31).date()
    
    # Заготовленные зачетные номера (замените на реальные)
    sample_zach_numbers = ["001", "002", "003", "004", "005"]
    
    for group_name, timetable_data in groups_data:
        timetable = timetable_data
        subject_attendance = {}
        subject_counter = 0
        
        current_date = start_date
        week_type = "Числитель"
        week_counter = 0
        
        while current_date <= end_date:
            days_map = {
                0: "ПОНЕДЕЛЬНИК",
                1: "ВТОРНИК", 
                2: "СРЕДА",
                3: "ЧЕТВЕРГ",
                4: "ПЯТНИЦА",
                5: "СУББОТА",
                6: "ВОСКРЕСЕНЬЕ"
            }
            day_of_week = days_map[current_date.weekday()]
            
            if week_type in timetable and day_of_week in timetable[week_type]:
                day_schedule = timetable[week_type][day_of_week]
                
                for time_slot, lessons in day_schedule.items():
                    for lesson in lessons:
                        subject_name = lesson["название"]
                        lesson_type = lesson["тип"]
                        teacher = lesson["преподаватель"]
                        
                        if lesson_type == "-":
                            continue
                            
                        subject_key = f"{subject_name}_{lesson_type}"
                        
                        if subject_key not in subject_attendance:
                            subject_counter += 1
                            subject_attendance[subject_key] = {
                                "_id": f"67f89a1d4b3a2c1e5f8b9c{subject_counter:04d}",
                                "course": {
                                    "name": subject_name,
                                    "type": lesson_type,
                                    "group": group_name,
                                    "teacher": teacher
                                },
                                "students": []
                            }
                            
                            for zach_number in sample_zach_numbers:
                                subject_attendance[subject_key]["students"].append({
                                    "student_id": zach_number,
                                    "attendance": {}
                                })
                        
                        for student in subject_attendance[subject_key]["students"]:
                            student["attendance"][current_date.isoformat()] = True
            
            current_date += timedelta(days=1)
            
            if current_date.weekday() == 0:
                week_counter += 1
                week_type = "Числитель" if week_counter % 2 == 0 else "Знаменатель"
        
        for subject_key, attendance_data in subject_attendance.items():
            insert_query = """
            INSERT INTO attendance_table (group_name, subject, attendance)
            VALUES (%s, %s, %s)
            ON CONFLICT (group_name, subject) 
            DO UPDATE SET attendance = EXCLUDED.attendance
            """
            
            try:
                cursor.execute(insert_query, (
                    group_name,
                    subject_key,
                    json.dumps(attendance_data, ensure_ascii=False)
                ))
                print(f"Добавлен предмет: {subject_key} для группы {group_name}")
            except Exception as e:
                print(f"Ошибка при добавлении предмета {subject_key}: {e}")
    
    conn.commit()
    cursor.close()
    conn.close()
    print("Таблица attendance_table успешно заполнена!")

# Запускаем функцию
if __name__ == "__main__":
    # Используйте одну из функций в зависимости от наличия таблицы student_info
    populate_attendance_table()
    # или
    # populate_attendance_table_without_students()