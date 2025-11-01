-- ========================
-- SCHEMA INIT (PostgreSQL)
-- ========================

DROP TABLE IF EXISTS rating CASCADE;
DROP TABLE IF EXISTS attendance_table CASCADE;
DROP TABLE IF EXISTS teacher_timetable CASCADE;
DROP TABLE IF EXISTS teacher_info CASCADE;
DROP TABLE IF EXISTS student_info CASCADE;
DROP TABLE IF EXISTS group_timetable CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Таблица групп
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL UNIQUE
);

-- 2. Таблица расписаний преподавателей
CREATE TABLE teacher_timetable (
    id SERIAL PRIMARY KEY,
    timetable JSONB NOT NULL
);

-- 3. Таблица информации о преподавателях
CREATE TABLE teacher_info (
    id SERIAL PRIMARY KEY,
    groups_subjects JSONB,
    timetable_id INTEGER REFERENCES teacher_timetable(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100)
);

-- 4. Таблица студентов
CREATE TABLE student_info (
    id SERIAL PRIMARY KEY,
    zach_number VARCHAR(20) NOT NULL,
    group_id INTEGER REFERENCES groups(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100)
);

-- 5. Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    max_id VARCHAR(100) UNIQUE,
    student_info_id INTEGER REFERENCES student_info(id),
    teacher_info_id INTEGER REFERENCES teacher_info(id),
    role VARCHAR(50)
);

-- 6. Таблица расписаний групп
CREATE TABLE group_timetable (
    id SERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id),
    timetable JSONB NOT NULL
);

-- 7. Таблица посещаемости
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    subject_name VARCHAR(255) NOT NULL,
    subject_type VARCHAR(255) NOT NULL,
    semestr VARCHAR(50),
    teacher_id BIGINT REFERENCES teacher_info(id),
    group_id BIGINT REFERENCES groups(id),
    attendance_json JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 8. Таблица рейтинга
CREATE TABLE rating (
    id SERIAL PRIMARY KEY,
    subject_name VARCHAR(255) NOT NULL,
    subject_type VARCHAR(255),
    semestr VARCHAR(50),
    teacher_id BIGINT REFERENCES teacher_info(id),
    group_id BIGINT REFERENCES groups(id),
    rating_json JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



-- 1. Добавляем группу
INSERT INTO groups (group_name)
VALUES ('УБ-41');

-- 2. Добавляем студентов
INSERT INTO student_info (zach_number, group_id, first_name, last_name)
VALUES
('10001', 1, 'Иван', 'Петров'),
('10002', 1, 'Мария', 'Иванова'),
('10003', 1, 'Алексей', 'Сидоров'),
('10004', 1, 'Анна', 'Кузнецова'),
('10005', 1, 'Олег', 'Смирнов'),
('10006', 1, 'Екатерина', 'Федорова'),
('10007', 1, 'Дмитрий', 'Соколов'),
('10008', 1, 'Наталья', 'Попова'),
('10009', 1, 'Сергей', 'Васильев'),
('10010', 1, 'Юлия', 'Морозова'),
('10011', 1, 'Андрей', 'Новиков'),
('10012', 1, 'Татьяна', 'Кузьмина'),
('10013', 1, 'Виктор', 'Орлов'),
('10014', 1, 'Алина', 'Белоусова'),
('10015', 1, 'Глеб', 'Павлов');

-- 3. Добавляем расписание группы
INSERT INTO group_timetable (group_id, timetable)
VALUES (
  1,
  '{
    "Числитель": {
      "ПОНЕДЕЛЬНИК": {
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
        }
      }
    }
  }'::jsonb
);

-- 4. Добавляем преподавателя (пример)
INSERT INTO teacher_timetable (timetable)
VALUES (
  '{
    "Числитель": {
      "ПОНЕДЕЛЬНИК": {
        "15.20-16.55": {
          "name": "Технологии и методы программирования",
          "class_type": "практика",
          "auditorium": "332",
          "group": "УБ-41"
        }
      }
    }
  }'::jsonb
);

INSERT INTO teacher_info (groups_subjects, timetable_id, first_name, last_name)
VALUES (
  '{
    "УБ-41": [{"subject_name": "Технологии и методы программирования", "subject_type": "практика"}]
  }'::jsonb,
  1,
  'Александр',
  'Маслов'
);

-- 5. Добавляем пользователей (преподаватели и студенты)
-- преподаватель
INSERT INTO users (max_id, teacher_info_id, role)
VALUES ('tc_maslov', 1, 'teacher');

-- студенты
INSERT INTO users (max_id, student_info_id, role)
VALUES
('st_10001', 1, 'student'),
('st_10002', 2, 'student'),
('st_10003', 3, 'student'),
('st_10004', 4, 'student'),
('st_10005', 5, 'student'),
('st_10006', 6, 'student'),
('st_10007', 7, 'student'),
('st_10008', 8, 'student'),
('st_10009', 9, 'student'),
('st_10010', 10, 'student'),
('st_10011', 11, 'student'),
('st_10012', 12, 'student'),
('st_10013', 13, 'student'),
('st_10014', 14, 'student'),
('st_10015', 15, 'student');

-- 6. Пример таблицы посещаемости
INSERT INTO attendance (subject_name, subject_type, semestr, teacher_id, group_id, attendance_json)
VALUES (
  'Технологии и методы программирования',
  'практика',
  '1 семестр 2025/2026',
  1,
  1,
  '{
  "ved_info": {
    "name_of_subject": "Технологии и методы программирования",
    "subject_type": "практика",
    "group": "УБ-41",
    "teacher": {
                "first_name": "Александр",
                "last_name": "Маслов"
                },
    "semester": "1 семестр 2025/2026"
  },
  "student_attendance": [
    {
      "student": {"first_name": "Иван", "last_name": "Петров", "zach_number": "10001"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Мария", "last_name": "Иванова", "zach_number": "10002"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Алексей", "last_name": "Сидоров", "zach_number": "10003"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Анна", "last_name": "Кузнецова", "zach_number": "10004"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Олег", "last_name": "Смирнов", "zach_number": "10005"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Екатерина", "last_name": "Федорова", "zach_number": "10006"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Дмитрий", "last_name": "Соколов", "zach_number": "10007"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Наталья", "last_name": "Попова", "zach_number": "10008"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Сергей", "last_name": "Васильев", "zach_number": "10009"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Юлия", "last_name": "Морозова", "zach_number": "10010"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Андрей", "last_name": "Новиков", "zach_number": "10011"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Татьяна", "last_name": "Кузьмина", "zach_number": "10012"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Виктор", "last_name": "Орлов", "zach_number": "10013"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Алина", "last_name": "Белоусова", "zach_number": "10014"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    },
    {
      "student": {"first_name": "Глеб", "last_name": "Павлов", "zach_number": "10015"},
      "attendance": [
        {"date": "2025-09-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-09-29T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-06T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-13T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-20T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-27T15:20:00", "status": "class not yet held"},
        {"date": "2025-10-31T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-03T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-07T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-10T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-14T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-17T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-21T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-24T15:20:00", "status": "class not yet held"},
        {"date": "2025-11-28T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-01T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-05T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-08T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-12T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-15T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-19T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-22T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-26T15:20:00", "status": "class not yet held"},
        {"date": "2025-12-29T15:20:00", "status": "class not yet held"}
      ]
    }
  ]
}'::jsonb
);



-- -- 7. Пример таблицы рейтинга
-- INSERT INTO rating (subject_name, subject_type, semestr, teacher_id, group_id, rating_json)
-- VALUES (
--   'Технологии и методы программирования',
--   'практика',
--   '1 семестр 2025/2026',
--   1,
--   1,
--   '[
--     {"student_id": "10001", "rating": {"kt1": 85, "kt2": 90, "kt3": 78, "kt4": 88, "kt5": 92}},
--     {"student_id": "10002", "rating": {"kt1": 75, "kt2": 80, "kt3": 68, "kt4": 72, "kt5": 77}}
--   ]'::jsonb
-- );