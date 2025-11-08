import psycopg2
import json
import random
from faker import Faker
from datetime import date, timedelta
import os

fake = Faker()

# ---------- Подключение к БД ----------
conn = psycopg2.connect(
    dbname=os.getenv("POSTGRES_DB", "db"),
    user=os.getenv("POSTGRES_USER", "admin"),
    password=os.getenv("POSTGRES_PASSWORD", "admin"),
    host=os.getenv("POSTGRES_HOST", "localhost"),
    port=os.getenv("POSTGRES_PORT", "5432")
)
cur = conn.cursor()

# ---------- 1. Создаем группу ----------
group_name = "УБ-41"
cur.execute("INSERT INTO groups (group_name) VALUES (%s) RETURNING id;", (group_name,))
group_id = cur.fetchone()[0]

# ---------- 2. Создаем студентов ----------
students_count = 15
student_ids = []
start_zach_number = 247160  # первый номер зачётки

for i in range(students_count):
    zach_number = str(start_zach_number + i)  # последовательные номера
    cur.execute(
        "INSERT INTO student_info (zach_number, group_id) VALUES (%s, %s) RETURNING id;",
        (zach_number, group_id)
    )
    student_ids.append(cur.fetchone()[0])
# ---------- 3. JSON расписания группы ----------
group_timetable_json = {
    "Числитель": {
      "ПОНЕДЕЛЬНИК": {
        "08.00-09.35": {},
        "09.45-11.20": {},
        "11.50-13.25": {},
        "13.35-15.10": {
          "name": "Основы информационной безопасности",
          "class_type": "практические занятия",
          "auditorium": "332а",
          "teacher": "Зиновьева В.В."
        },
        "15.20-16.55": {
          "name": "Технологии и методы программирования",
          "class_type": "практические занятия",
          "auditorium": "332",
          "teacher": "Маслов А.А."
        },
        "17.05-18.40": {
          "name": "Теория вероятности и математическая статистика",
          "class_type": "практические занятия",
          "auditorium": "207",
          "teacher": "Ковалева Е.Н."
        },
        "18.50-20.25": {}
      },
      "ВТОРНИК": {
        "08.00-09.35": {},
        "09.45-11.20": {},
        "11.50-13.25": {},
        "13.35-15.10": {
          "name": "Иностранный язык",
          "class_type": "практические занятия",
          "auditorium": "4и",
          "teacher": "Ларина Л.И."
        },
        "15.20-16.55": {
          "name": "Иностранный язык",
          "class_type": "практические занятия",
          "auditorium": "4и",
          "teacher": "Ларина Л.И."
        },
        "17.05-18.40": {
          "name": "Дискретная математика",
          "class_type": "лекция",
          "auditorium": "125",
          "teacher": "Половинкина М.В."
        },
        "18.50-20.25": {
          "name": "Архитектура информационных систем",
          "class_type": "практические занятия",
          "auditorium": "336а",
          "teacher": "Савченко И.И."
        }
      },
      "СРЕДА": {
        "08.00-09.35": {},
        "09.45-11.20": {},
        "11.50-13.25": {},
        "13.35-15.10": {
          "name": "Общественный проект \"Обучение служением\"",
          "class_type": "практические занятия",
          "auditorium": "30",
          "teacher": "Гриднева Е.С."
        },
        "15.20-16.55": {
          "name": "Философия",
          "class_type": "практические занятия",
          "auditorium": "8",
          "teacher": "Барышников С.В."
        },
        "17.05-18.40": {},
        "18.50-20.25": {}
      },
      "ЧЕТВЕРГ": {
        "08.00-09.35": {
          "name": "Общественный проект \"Обучение служением\"",
          "class_type": "лекция",
          "auditorium": "450",
          "teacher": "Агаева Н.Ю."
        },
        "09.45-11.20": {
          "name": "Технологии и методы программирования",
          "class_type": "лекция",
          "auditorium": "404",
          "teacher": "Маслов А.А."
        },
        "11.50-13.25": {
          "name": "Дискретная математика",
          "class_type": "практические занятия",
          "auditorium": "227",
          "teacher": "Половинкина М.В."
        },
        "13.35-15.10": {},
        "15.20-16.55": {},
        "17.05-18.40": {},
        "18.50-20.25": {}
      },
      "ПЯТНИЦА": {
        "08.00-09.35": {},
        "09.45-11.20": {
          "name": "Общая физическая",
          "class_type": "",
          "auditorium": "подготовка",
          "teacher": "Общая физическая"
        },
        "11.50-13.25": {
          "name": "Основы информационной безопасности",
          "class_type": "лекция",
          "auditorium": "401",
          "teacher": "Зиновьева В.В."
        },
        "13.35-15.10": {},
        "15.20-16.55": {},
        "17.05-18.40": {},
        "18.50-20.25": {}
      }
    },
    "Знаменатель": {
      "ПОНЕДЕЛЬНИК": {
        "08.00-09.35": {},
        "09.45-11.20": {},
        "11.50-13.25": {},
        "13.35-15.10": {
          "name": "Основы информационной безопасности",
          "class_type": "практические занятия",
          "auditorium": "332а",
          "teacher": "Зиновьева В.В."
        },
        "15.20-16.55": {
          "name": "Технологии и методы программирования",
          "class_type": "практические занятия",
          "auditorium": "332",
          "teacher": "Маслов А.А."
        },
        "17.05-18.40": {
          "name": "Теория вероятности и математическая статистика",
          "class_type": "практические занятия",
          "auditorium": "207",
          "teacher": "Ковалева Е.Н."
        },
        "18.50-20.25": {}
      },
      "ВТОРНИК": {
        "08.00-09.35": {},
        "09.45-11.20": {},
        "11.50-13.25": {},
        "13.35-15.10": {
          "name": "Иностранный язык",
          "class_type": "практические занятия",
          "auditorium": "4и",
          "teacher": "Ларина Л.И."
        },
        "15.20-16.55": {
          "name": "Иностранный язык",
          "class_type": "практические занятия",
          "auditorium": "4и",
          "teacher": "Ларина Л.И."
        },
        "17.05-18.40": {
          "name": "Архитектура информационных систем",
          "class_type": "лекция",
          "auditorium": "404",
          "teacher": "Денисенко В.В."
        },
        "18.50-20.25": {
          "name": "Архитектура информационных систем",
          "class_type": "практические занятия",
          "auditorium": "336а",
          "teacher": "Савченко И.И."
        }
      },
      "СРЕДА": {
        "08.00-09.35": {},
        "09.45-11.20": {},
        "11.50-13.25": {},
        "13.35-15.10": {
          "name": "Общественный проект \"Обучение служением\"",
          "class_type": "практические занятия",
          "auditorium": "30",
          "teacher": "Гриднева Е.С."
        },
        "15.20-16.55": {
          "name": "Философия",
          "class_type": "практические занятия",
          "auditorium": "8",
          "teacher": "Барышников С.В."
        },
        "17.05-18.40": {},
        "18.50-20.25": {}
      },
      "ЧЕТВЕРГ": {
        "08.00-09.35": {
          "name": "Общественный проект \"Обучение служением\"",
          "class_type": "лекция",
          "auditorium": "450",
          "teacher": "Агаева Н.Ю."
        },
        "09.45-11.20": {
          "name": "Теория вероятности и математическая статистика",
          "class_type": "лекция",
          "auditorium": "125",
          "teacher": "Ковалева Е.Н."
        },
        "11.50-13.25": {
          "name": "Дискретная математика",
          "class_type": "практические занятия",
          "auditorium": "227",
          "teacher": "Половинкина М.В."
        },
        "13.35-15.10": {},
        "15.20-16.55": {},
        "17.05-18.40": {},
        "18.50-20.25": {}
      },
      "ПЯТНИЦА": {
        "08.00-09.35": {
          "name": "Философия",
          "class_type": "лекция",
          "auditorium": "446",
          "teacher": "Барышников С.В."
        },
        "09.45-11.20": {
          "name": "Общая физическая",
          "class_type": "",
          "auditorium": "подготовка",
          "teacher": "Общая физическая"
        },
        "11.50-13.25": {
          "name": "Основы информационной безопасности",
          "class_type": "лекция",
          "auditorium": "401",
          "teacher": "Зиновьева В.В."
        },
        "13.35-15.10": {},
        "15.20-16.55": {},
        "17.05-18.40": {},
        "18.50-20.25": {}
      }
    }
  }

# ---------- 4. Вставляем group_timetable ----------
cur.execute(
    "INSERT INTO group_timetable (group_id, timetable) VALUES (%s, %s);",
    (group_id, json.dumps(group_timetable_json))
)

# ---------- 5. JSON преподавателей ----------
teachers_data = {
  "Маслов А.А.": {
  "Числитель": {
    "ПОНЕДЕЛЬНИК": {
      "08.00-09.35": {},
      "09.45-11.20": {},
      "11.50-13.25": {
        "name": "Операционные системы",
        "class_type": "лабораторная работа",
        "auditorium": "338",
        "group": "УБ-42"
      },
      "13.35-15.10": {
        "name": "Базы данных",
        "class_type": "лабораторная работа",
        "auditorium": "340",
        "group": "УБ-33"
      },
      "15.20-16.55": {
        "name": "Технологии и методы программирования",
        "class_type": "практические занятия",
        "auditorium": "332",
        "group": "УБ-41"
      },
      "17.05-18.40": {},
      "18.50-20.25": {}
    },
    "ВТОРНИК": {
      "08.00-09.35": {},
      "09.45-11.20": {
        "name": "Искусственный интеллект",
        "class_type": "лекция",
        "auditorium": "415",
        "group": "УБ-31"
      },
      "11.50-13.25": {
        "name": "Технологии и методы программирования",
        "class_type": "практические занятия",
        "auditorium": "333",
        "group": "УБ-43"
      },
      "13.35-15.10": {},
      "15.20-16.55": {},
      "17.05-18.40": {},
      "18.50-20.25": {}
    },
    "СРЕДА": {
      "08.00-09.35": {},
      "09.45-11.20": {
        "name": "Технологии и методы программирования",
        "class_type": "лабораторная работа",
        "auditorium": "332",
        "group": "УБ-42"
      },
      "11.50-13.25": {},
      "13.35-15.10": {
        "name": "Мобильная разработка",
        "class_type": "практические занятия",
        "auditorium": "325",
        "group": "УБ-31"
      },
      "15.20-16.55": {
        "name": "Искусственный интеллект",
        "class_type": "практические занятия",
        "auditorium": "415",
        "group": "УБ-43"
      },
      "17.05-18.40": {},
      "18.50-20.25": {}
    },
    "ЧЕТВЕРГ": {
      "08.00-09.35": {},
      "09.45-11.20": {
        "name": "Технологии и методы программирования",
        "class_type": "лекция",
        "auditorium": "404",
        "group": "УБ-41"
      },
      "11.50-13.25": {
        "name": "Проектный практикум",
        "class_type": "практические занятия",
        "auditorium": "428",
        "group": "УБ-32"
      },
      "13.35-15.10": {
        "name": "Веб-программирование",
        "class_type": "лекция",
        "auditorium": "401",
        "group": "УБ-33"
      },
      "15.20-16.55": {
        "name": "Базы данных",
        "class_type": "практические занятия",
        "auditorium": "340",
        "group": "УБ-31"
      },
      "17.05-18.40": {},
      "18.50-20.25": {}
    },
    "ПЯТНИЦА": {
      "08.00-09.35": {
        "name": "Мобильная разработка",
        "class_type": "лабораторная работа",
        "auditorium": "325",
        "group": "УБ-42"
      },
      "09.45-11.20": {
        "name": "Искусственный интеллект",
        "class_type": "лабораторная работа",
        "auditorium": "415",
        "group": "УБ-31"
      },
      "11.50-13.25": {},
      "13.35-15.10": {},
      "15.20-16.55": {},
      "17.05-18.40": {},
      "18.50-20.25": {}
    }
  },
  "Знаменатель": {
    "ПОНЕДЕЛЬНИК": {
      "08.00-09.35": {},
      "09.45-11.20": {},
      "11.50-13.25": {
        "name": "Веб-программирование",
        "class_type": "лекция",
        "auditorium": "401",
        "group": "УБ-32"
      },
      "13.35-15.10": {},
      "15.20-16.55": {
        "name": "Технологии и методы программирования",
        "class_type": "практические занятия",
        "auditorium": "332",
        "group": "УБ-41"
      },
      "17.05-18.40": {
        "name": "Базы данных",
        "class_type": "семинар",
        "auditorium": "340",
        "group": "УБ-33"
      },
      "18.50-20.25": {}
    },
    "ВТОРНИК": {
      "08.00-09.35": {},
      "09.45-11.20": {},
      "11.50-13.25": {},
      "13.35-15.10": {},
      "15.20-16.55": {},
      "17.05-18.40": {},
      "18.50-20.25": {}
    },
    "СРЕДА": {
      "08.00-09.35": {},
      "09.45-11.20": {
        "name": "Технологии и методы программирования",
        "class_type": "лабораторная работа",
        "auditorium": "332",
        "group": "УБ-42"
      },
      "11.50-13.25": {
        "name": "Базы данных",
        "class_type": "лекция",
        "auditorium": "401",
        "group": "УБ-33"
      },
      "13.35-15.10": {
        "name": "Веб-программирование",
        "class_type": "практические занятия",
        "auditorium": "335",
        "group": "УБ-31"
      },
      "15.20-16.55": {},
      "17.05-18.40": {},
      "18.50-20.25": {}
    },
    "ЧЕТВЕРГ": {
      "08.00-09.35": {
        "name": "Мобильная разработка",
        "class_type": "практические занятия",
        "auditorium": "325",
        "group": "УБ-31"
      },
      "09.45-11.20": {},
      "11.50-13.25": {
        "name": "Операционные системы",
        "class_type": "практические занятия",
        "auditorium": "338",
        "group": "УБ-33"
      },
      "13.35-15.10": {},
      "15.20-16.55": {},
      "17.05-18.40": {},
      "18.50-20.25": {}
    },
    "ПЯТНИЦА": {
      "08.00-09.35": {
        "name": "Веб-программирование",
        "class_type": "лабораторная работа",
        "auditorium": "335",
        "group": "УБ-43"
      },
      "09.45-11.20": {
        "name": "Технологии и методы программирования",
        "class_type": "практические занятия",
        "auditorium": "333",
        "group": "УБ-32"
      },
      "11.50-13.25": {},
      "13.35-15.10": {},
      "15.20-16.55": {},
      "17.05-18.40": {},
      "18.50-20.25": {}
    }
  }
}
}

# ---------- 6. Вставляем преподавателей ----------
teacher_info_ids = {}
teacher_timetable_ids = {}

for teacher_name, timetable in teachers_data.items():
    # Сначала создаем запись в teacher_timetable
    cur.execute(
        "INSERT INTO teacher_timetable (timetable) VALUES (%s) RETURNING id;",
        (json.dumps(timetable),)
    )
    timetable_id = cur.fetchone()[0]
    teacher_timetable_ids[teacher_name] = timetable_id

    # Затем создаем запись в teacher_info с ссылкой на timetable_id
    subjects_set = set()
    for sem in timetable.values():
        for day in sem.values():
            for ts, entry in day.items():
                if entry:  # если словарь не пуст
                    subj_name = entry.get("name")
                    if subj_name:
                        subjects_set.add(subj_name)
    
    # Формируем groups_subjects JSON
    groups_subjects = []
    for subj in subjects_set:
        groups_subjects.append({
            "subject": subj,
            "groups": [group_name]  # можно добавить другие группы, если есть
        })

    cur.execute(
        "INSERT INTO teacher_info (groups_subjects, timetable_id) VALUES (%s, %s) RETURNING id;",
        (json.dumps({
  "УБ-42": [
    {
      "lesson_name": "Мобильная разработка",
      "lesson_type": "лабораторная работа"
    },
    {
      "lesson_name": "Операционные системы", 
      "lesson_type": "лабораторная работа"
    },
    {
      "lesson_name": "Технологии и методы программирования",
      "lesson_type": "лабораторная работа"
    }
  ],
  "УБ-33": [
    {
      "lesson_name": "Базы данных",
      "lesson_type": "лабораторная работа"
    },
    {
      "lesson_name": "Веб-программирование",
      "lesson_type": "лекция"
    },
    {
      "lesson_name": "Операционные системы",
      "lesson_type": "практические занятия"
    }
  ],
  "УБ-41": [
    {
      "lesson_name": "Технологии и методы программирования",
      "lesson_type": "практические занятия"
    },{
      "lesson_name": "Учебная практика",
      "lesson_type": "практика"
    },
    {
      "lesson_name": "Сетевые технологии",
      "lesson_type": "курсовая работа"
    }
  ],
  "УБ-31": [
    {
      "lesson_name": "Базы данных",
      "lesson_type": "практические занятия"
    },
    {
      "lesson_name": "Искусственный интеллект",
      "lesson_type": "лекция"
    },
    {
      "lesson_name": "Мобильная разработка",
      "lesson_type": "практические занятия"
    },
    {
      "lesson_name": "Веб-программирование",
      "lesson_type": "практические занятия"
    }
  ],
  "УБ-43": [
    {
      "lesson_name": "Искусственный интеллект",
      "lesson_type": "практические занятия"
    },
    {
      "lesson_name": "Технологии и методы программирования",
      "lesson_type": "практические занятия"
    }
  ],
  "УБ-32": [
    {
      "lesson_name": "Веб-программирование",
      "lesson_type": "лекция"
    },
    {
      "lesson_name": "Проектный практикум",
      "lesson_type": "практические занятия"
    },
    {
      "lesson_name": "Технологии и методы программирования",
      "lesson_type": "практические занятия"
    }
  ]
}), timetable_id)
    )
    teacher_info_id = cur.fetchone()[0]
    teacher_info_ids[teacher_name] = teacher_info_id

    # Наконец создаем пользователя с ссылкой на teacher_info_id
    first_name, last_name = teacher_name.split()
    if teacher_name == "Маслов А.А.":
        cur.execute(
            "INSERT INTO users (first_name, last_name, role, teacher_info_id, MAX_id) VALUES (%s, %s, %s, %s, %s);",
            (first_name, last_name, "teacher", teacher_info_id, "1")
        )
    else:
        cur.execute(
            "INSERT INTO users (first_name, last_name, role, teacher_info_id) VALUES (%s, %s, %s, %s);",
            (first_name, last_name, "teacher", teacher_info_id)
        )

# ---------- 7. Создаем пользователей-студентов ----------
random_student_id = random.choice(student_ids)

for student_id in student_ids:
    first_name = fake.first_name()
    last_name = fake.last_name()
    if student_id == random_student_id:
        cur.execute(
            "INSERT INTO users (first_name, last_name, role, student_info_id, MAX_id) VALUES (%s, %s, %s, %s, %s);",
            (first_name, last_name, "student", student_id, "2")
        )
    else:
        cur.execute(
            "INSERT INTO users (first_name, last_name, role, student_info_id) VALUES (%s, %s, %s, %s);",
            (first_name, last_name, "student", student_id)
        )


# ---------- Attendance с учётом типа недели и типа занятия ----------
from datetime import date, timedelta

start_date = date(2025, 9, 1)
end_date   = date(2025, 12, 31)

# Все студенты группы
cur.execute("SELECT zach_number FROM student_info WHERE group_id = %s;", (group_id,))
students = [row[0] for row in cur.fetchall()]

weekdays_map = {
    "ПОНЕДЕЛЬНИК": 0,
    "ВТОРНИК": 1,
    "СРЕДА": 2,
    "ЧЕТВЕРГ": 3,
    "ПЯТНИЦА": 4,
    "СУББОТА": 5,
    "ВОСКРЕСЕНЬЕ": 6
}

def generate_all_dates(start_date, end_date):
    current = start_date
    while current <= end_date:
        yield current
        current += timedelta(days=1)

def get_week_type(d):
    week_num = ((d - start_date).days // 7) + 1
    return "Числитель" if week_num % 2 == 1 else "Знаменатель"

# ---------- 1) Составляем карту предметов по типам занятий ----------
# subjects_map: (subject_name, class_type) -> list of {"weekday": int, "week_type": str, "teacher": str}
subjects_map = {}

for sem_type, sem_data in group_timetable_json.items():
    for weekday_name, day_schedule in sem_data.items():
        if weekday_name not in weekdays_map:
            continue
        weekday_num = weekdays_map[weekday_name]
        for time_slot, entry in day_schedule.items():
            if not entry:
                continue
            subj = entry.get("name")
            teacher = entry.get("teacher")
            class_type = entry.get("class_type", "другое")
            if not subj or not class_type:
                continue

            key = (subj, class_type)
            subjects_map.setdefault(key, []).append({
                "weekday": weekday_num,
                "week_type": sem_type,
                "teacher": teacher
            })

# ---------- 2) Очистка старых записей для группы ----------
cur.execute("DELETE FROM attendance WHERE group_id = %s;", (group_id,))

# ---------- 3) Генерация attendance ----------
for (subj_name, class_type), lessons in subjects_map.items():
    class_dates_set = set()
    teacher_id = None
    sample_teacher = None

    # Сбор всех дат для данного предмета и типа занятия
    for lesson in lessons:
        sample_teacher = sample_teacher or lesson.get("teacher")
        for d in generate_all_dates(start_date, end_date):
            if d.weekday() == lesson["weekday"] and get_week_type(d) == lesson["week_type"]:
                class_dates_set.add(d)

    class_dates = sorted(class_dates_set)
    if not class_dates:
        continue

    # Определяем teacher_id по фамилии преподавателя (если есть)
    if sample_teacher:
        cur.execute("""
            SELECT ti.id
            FROM teacher_info ti
            JOIN teacher_timetable tt ON ti.timetable_id = tt.id
            WHERE tt.timetable::text LIKE %s
            LIMIT 1;
        """, (f'%{sample_teacher}%',))
        row = cur.fetchone()
        if row:
            teacher_id = row[0]

    # Формируем attendance_json
    attendance_json = []
    for zach in students:
        attendance_json.append({
            "student_id": str(zach),
            "attendance": {d.strftime("%Y-%m-%d"): False for d in class_dates}
        })

    # Вставляем строку для КАЖДОГО типа занятия отдельно
    cur.execute("""
        INSERT INTO attendance (subject_name, subject_type, semestr, teacher_id, group_id, attendance_json)
        VALUES (%s, %s, %s, %s, %s, %s);
    """, (
        subj_name,
        class_type,  # ← теперь классы разделены
        "1 семестр 2025/2026",
        teacher_id or 1,
        group_id,
        json.dumps(attendance_json)
    ))

conn.commit()
print("✅ Attendance создано: разные типы занятий и даты разделены корректно.")



import random

# ---------- 1) Получаем всех студентов группы ----------
cur.execute("SELECT zach_number FROM student_info WHERE group_id = %s;", (group_id,))
students = [row[0] for row in cur.fetchall()]

# ---------- 2) Определяем предметы с типом экзамена ----------
exam_subjects = ["Иностранный язык", "Основы информационной безопасности", "Философия"]

# ---------- 3) Берём уникальные предметы группы из таблицы attendance ----------
cur.execute("""
    SELECT DISTINCT subject_name, teacher_id
    FROM attendance
    WHERE group_id = %s;
""", (group_id,))
subjects = cur.fetchall()  # [(subject_name, teacher_id), ...]

# ---------- 4) Генерация rating_json и вставка ----------
for subject_name, teacher_id in subjects:
    # Определяем тип предмета
    subject_type = "экзамен" if subject_name in exam_subjects else "зачёт"

    # Генерируем рейтинг для каждого студента
    rating_json = []
    for zach in students:
        kt_ratings = {f"kt{i}": random.randint(0, 100) for i in range(1, 6)}
        rating_json.append({
            "student_id": str(zach),
            "rating": kt_ratings
        })

    # Вставка в таблицу rating
    cur.execute("""
        INSERT INTO rating (subject_name, subject_type, semestr, teacher_id, group_id, rating_json)
        VALUES (%s, %s, %s, %s, %s, %s);
    """, (
        subject_name,
        subject_type,
        "1 семестр 2025/2026",
        teacher_id,
        group_id,
        json.dumps(rating_json)
    ))

# ---------- 5) Добавляем "Учебная практика" и "Курсовая работа" в rating ----------
extra_subjects = [
    ("Учебная практика", "практика"),
    ("Сетевые технологии", "курсовая работа")
]

for subject_name, subject_type in extra_subjects:
    rating_json = []
    for zach in students:
        # случайным образом выбираем "Хорошо" или "Отлично"
        grade = random.choice(["Хорошо", "Отлично"])
        rating_json.append({
            "student_id": str(zach),
            "grade": grade
        })

    # teacher_id можно поставить первого преподавателя (например, 1)
    cur.execute("""
        INSERT INTO rating (subject_name, subject_type, semestr, teacher_id, group_id, rating_json)
        VALUES (%s, %s, %s, %s, %s, %s);
    """, (
        subject_name,
        subject_type,
        "1 семестр 2025/2026",
        1,
        group_id,
        json.dumps(rating_json)
    ))

conn.commit()
print("✅ Таблица rating заполнена корректно, дубликаты исключены.")
