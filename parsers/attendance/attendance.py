import psycopg2
import json
from datetime import date, timedelta

# === Конфигурация подключения к PostgreSQL ===
DB_CONFIG = {
    "host": "postgres",
    "database": "db",
    "user": "admin",
    "password": "admin"
}

# === Учебный период ===
START_DATE = date(2025, 9, 1)
END_DATE = date(2025, 12, 31)


# === Подключение ===
def connect_db():
    return psycopg2.connect(**DB_CONFIG)


# === Получаем всех преподавателей из teacher_info ===
def get_all_teachers(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT name FROM teacher_info;")  # таблица из init.sql
        rows = cur.fetchall()
        return [r[0] for r in rows]


# === Получаем расписание преподавателя ===
def get_teacher_timetable(conn, teacher_name):
    with conn.cursor() as cur:
        cur.execute("SELECT timetable FROM teacher_timetable WHERE name = %s", (teacher_name,))
        row = cur.fetchone()
        if not row:
            print(f"⚠️ Расписание не найдено для преподавателя {teacher_name}")
            return None
        return row[0]


# === Получаем студентов группы ===
def get_students_by_group(conn, group_name):
    with conn.cursor() as cur:
        cur.execute("SELECT zach_number FROM student_info WHERE group_name = %s", (group_name,))
        return [r[0] for r in cur.fetchall()]


# === Генерация карты недель (числитель / знаменатель) ===
def generate_week_map():
    current = START_DATE
    week_num = 0
    mapping = {}
    while current <= END_DATE:
        week_type = "Числитель" if week_num % 2 == 0 else "Знаменатель"
        mapping[str(current)] = week_type
        if current.weekday() == 6:
            week_num += 1
        current += timedelta(days=1)
    return mapping


# === Загрузка данных посещаемости ===
def load_attendance_json(path="attendeseVed.json"):
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        result = {}
        for s in data["students"]:
            result[s["student_id"]] = s["attendance"]
        return result
    except FileNotFoundError:
        return {}


# === Генерация ведомостей по всем предметам преподавателя ===
def generate_teacher_reports(conn, teacher_name, attendance_data):
    timetable = get_teacher_timetable(conn, teacher_name)
    if not timetable:
        return []

    week_map = generate_week_map()

    weekdays = {
        0: "ПОНЕДЕЛЬНИК",
        1: "ВТОРНИК",
        2: "СРЕДА",
        3: "ЧЕТВЕРГ",
        4: "ПЯТНИЦА",
        5: "СУББОТА",
        6: "ВОСКРЕСЕНЬЕ"
    }

    reports = []

    for week_type, days in timetable.items():
        for day_name, times in days.items():
            for time_slot, lessons in times.items():
                lessons = [lessons] if isinstance(lessons, dict) else lessons
                for lesson in lessons:
                    subject_type = lesson["тип"]
                    subject_name = lesson["название"].strip('.')
                    group = lesson["группа"]

                    # Формируем даты всех занятий
                    class_dates = [
                        str(d)
                        for d, wt in week_map.items()
                        if wt == week_type and weekdays[date.fromisoformat(d).weekday()] == day_name
                    ]

                    students = get_students_by_group(conn, group)
                    students_data = []

                    for s in students:
                        attendance = {d: attendance_data.get(s, {}).get(d, None) for d in class_dates}
                        students_data.append({
                            "zach_number": s,
                            "attendance": attendance
                        })

                    reports.append({
                        "teacher": teacher_name,
                        "period": f"{START_DATE} — {END_DATE}",
                        "subject_type": subject_type,
                        "subject_name": subject_name,
                        "group": group,
                        "students": students_data
                    })
    return reports


# === Сохраняем ведомости в таблицу teacher_reports ===
def save_reports_to_db(conn, reports):
    with conn.cursor() as cur:
        for r in reports:
            cur.execute("""
                INSERT INTO attendance_table (teacher_name, period, subject_type, subject_name, group_name, report_json)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                r["teacher"],
                r["period"],
                r["subject_type"],
                r["subject_name"],
                r["group"],
                json.dumps(r, ensure_ascii=False)
            ))
    conn.commit()
    print(f"💾 В БД сохранено {len(reports)} ведомостей")


# === Основной запуск ===
if __name__ == "__main__":
    conn = connect_db()
    attendance_data = load_attendance_json()

    teachers = get_all_teachers(conn)
    print(f"👩‍🏫 Найдено преподавателей: {len(teachers)}")

    total_reports = 0
    for teacher_name in teachers:
        print(f"\n📘 Обработка преподавателя: {teacher_name}")
        reports = generate_teacher_reports(conn, teacher_name, attendance_data)
        if reports:
            save_reports_to_db(conn, reports)
            total_reports += len(reports)
        else:
            print(f"⚠️ Для преподавателя {teacher_name} нет расписания")

    print(f"\n✅ Всего ведомостей сохранено в БД: {total_reports}")
    conn.close()
