import psycopg2
import json
import os
from datetime import date, timedelta

# === Конфигурация подключения к PostgreSQL ===
DB_CONFIG = {
    "host": "localhost",
    "database": "db",
    "user": "admin",
    "password": "admin"
}

START_DATE = date(2024, 9, 1)
END_DATE = date(2024, 12, 31)

# === Подключение ===
def connect_db():
    return psycopg2.connect(**DB_CONFIG)

# === Получаем расписание преподавателя ===
def get_teacher_timetable(conn, teacher_name):
    with conn.cursor() as cur:
        cur.execute("SELECT timetable FROM teacher_timetable WHERE name = %s", (teacher_name,))
        row = cur.fetchone()
        if not row:
            raise ValueError(f"Преподаватель {teacher_name} не найден")
        return row[0]

# === Получаем студентов группы ===
def get_students_by_group(conn, group_name):
    with conn.cursor() as cur:
        cur.execute("SELECT zach_number FROM students_info WHERE group_name = %s", (group_name,))
        return [r[0] for r in cur.fetchall()]

# === Карта недель Числитель / Знаменатель ===
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

# === Загрузка посещаемости ===
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

# === Создание ведомостей по всем предметам преподавателя ===
def generate_teacher_reports(conn, teacher_name, attendance_data):
    timetable = get_teacher_timetable(conn, teacher_name)
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

# === Сохранение каждого отчёта в отдельный файл ===
def save_reports_to_files(reports, teacher_name):
    os.makedirs("teacher_reports", exist_ok=True)
    for r in reports:
        safe_subject = r["subject_name"].replace('"', '').replace(' ', '_')
        file_name = f"{teacher_name.replace(' ', '_').replace('.', '')}_{safe_subject}_{r['group']}.json"
        path = os.path.join("teacher_reports", file_name)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(r, f, ensure_ascii=False, indent=2)
        print(f"💾 {path} сохранён")

# === Основной запуск ===
if __name__ == "__main__":
    conn = connect_db()
    teacher_name = "Денисенко В.В."

    attendance_data = load_attendance_json()
    reports = generate_teacher_reports(conn, teacher_name, attendance_data)

    save_reports_to_files(reports, teacher_name)

    print(f"✅ Всего ведомостей создано: {len(reports)}")
    conn.close()
