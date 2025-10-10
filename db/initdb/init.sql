-- ========================
-- SCHEMA INIT (PostgreSQL)
-- ========================

DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS attendance_table CASCADE;
DROP TABLE IF EXISTS teacher_timetable CASCADE;
DROP TABLE IF EXISTS teacher_info CASCADE;
DROP TABLE IF EXISTS student_info CASCADE;
DROP TABLE IF EXISTS group_timetable CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS dean_info CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;

-- ------------------------
-- TABLE: faculty
-- ------------------------
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- ------------------------
-- TABLE: dean_info
-- ------------------------
CREATE TABLE dean_info (
    id SERIAL PRIMARY KEY,
    dean_name VARCHAR(255) NOT NULL UNIQUE,
    faculty_id BIGINT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE
);

-- ------------------------
-- TABLE: group_timetable
-- ------------------------
CREATE TABLE group_timetable (
    id SERIAL PRIMARY KEY,
    timetable_json JSONB NOT NULL
);

-- ------------------------
-- TABLE: groups
-- ------------------------
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL UNIQUE,
    faculty_id BIGINT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    timetable_id BIGINT REFERENCES group_timetable(id) ON DELETE SET NULL
);

-- ------------------------
-- TABLE: student_info
-- ------------------------
CREATE TABLE student_info (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL UNIQUE,
    zach_number VARCHAR(255) NOT NULL UNIQUE,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE
);

-- ------------------------
-- TABLE: teacher_timetable
-- ------------------------
CREATE TABLE teacher_timetable (
    id SERIAL PRIMARY KEY,
    timetable_json JSONB NOT NULL
);

-- ------------------------
-- TABLE: teacher_info
-- ------------------------
CREATE TABLE teacher_info (
    id SERIAL PRIMARY KEY,
    teacher_name VARCHAR(255) NOT NULL UNIQUE,
    timetable_id BIGINT REFERENCES teacher_timetable(id) ON DELETE SET NULL
);

-- ------------------------
-- TABLE: users
-- ------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    passwd VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,

    dean_info_id BIGINT REFERENCES dean_info(id) ON DELETE SET NULL,
    student_info_id BIGINT REFERENCES student_info(id) ON DELETE SET NULL,
    teacher_info_id BIGINT REFERENCES teacher_info(id) ON DELETE SET NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------
-- TABLE: attendance_table
-- ------------------------
CREATE TABLE attendance_table (
    id SERIAL PRIMARY KEY,
    teacher_name VARCHAR(255),
    period VARCHAR(255),
    subject_type VARCHAR(255),
    subject_name VARCHAR(255),
    group_name VARCHAR(255),
    report_json JSONB
);


--- ============================================
-- INITIAL DATA (id генерируются автоматически)
-- ============================================

-- Факультеты
INSERT INTO faculty (name)
VALUES ('Факультет информационных технологий');

-- Деканы
INSERT INTO dean_info (dean_name, faculty_id)
VALUES ('Иванов Иван Иванович', 1);

-- Админ и декан
INSERT INTO users (username, passwd, role, dean_info_id, created_at)
VALUES ('dean', '{bcrypt}$2a$10$V2UE5Cw7SrVslQtbP8ePf.h6nPfEZo.ghp7sHNYmsfIYcWq8Y7pW2', 'DEAN', 1, NOW());

INSERT INTO users (username, passwd, role, created_at)
VALUES ('admin', '{bcrypt}$2a$10$Q6JrZL4t9I3E0UjOD3luje2B4xQ.Yp1e4ObV69z6jaVb2WQzP3k4a', 'ADMIN', NOW());

-- Расписания групп
INSERT INTO group_timetable (timetable_json)
VALUES ('{
  "timetable": {
    "numerator": {
      "monday": {
        "schedule": {
          "08:00": {"type": "lecture", "name": "Математика", "teacherName": "Алексеев Павел", "classroom": "101", "group": "ИС-21"},
          "09:50": {"type": "practice", "name": "Физика", "teacherName": "Громова Елена", "classroom": "102", "group": "ИС-21"}
        }
      },
      "tuesday": {
        "schedule": {
          "08:00": {"type": "lecture", "name": "Программирование", "teacherName": "Поляков Игорь", "classroom": "203", "group": "ИС-21"}
        }
      }
    },
    "denominator": {
      "monday": {
        "schedule": {
          "08:00": {"type": "lecture", "name": "Информатика", "teacherName": "Юрьева Мария", "classroom": "104", "group": "ИС-21"}
        }
      }
    }
  }
}');

-- Группы
INSERT INTO groups (group_name, faculty_id, timetable_id)
VALUES ('ИС-21', 1, 1);

-- Студенты
INSERT INTO student_info (student_name, zach_number, group_id)
VALUES 
('Петров Сергей', 'Z001', 1),
('Сидорова Анна', 'Z002', 1),
('Ильин Артем', 'Z003', 1),
('Соколова Елена', 'Z004', 1),
('Кузнецов Дмитрий', 'Z005', 1),
('Новикова Дарья', 'Z006', 1),
('Орлов Михаил', 'Z007', 1),
('Попова Алина', 'Z008', 1),
('Федоров Никита', 'Z009', 1),
('Смирнова Ольга', 'Z010', 1);

-- Расписания преподавателей
INSERT INTO teacher_timetable (timetable_json)
VALUES
('{"timetable":{"numerator":{"monday":{"schedule":{"08:00":{"type":"lecture","name":"Математика","classroom":"101","group":"ИС-21"}}}}}}'),
('{"timetable":{"numerator":{"monday":{"schedule":{"09:50":{"type":"practice","name":"Физика","classroom":"102","group":"ИС-21"}}}}}}'),
('{"timetable":{"numerator":{"tuesday":{"schedule":{"08:00":{"type":"lab","name":"ОС","classroom":"301","group":"ИС-21"}}}}}}'),
('{"timetable":{"numerator":{"wednesday":{"schedule":{"08:00":{"type":"lecture","name":"Экономика","classroom":"110","group":"ИС-21"}}}}}}'),
('{"timetable":{"numerator":{"thursday":{"schedule":{"10:40":{"type":"practice","name":"История","classroom":"111","group":"ИС-21"}}}}}}'),
('{"timetable":{"numerator":{"friday":{"schedule":{"08:00":{"type":"lecture","name":"Программирование","classroom":"203","group":"ИС-21"}}}}}}'),
('{"timetable":{"denominator":{"monday":{"schedule":{"11:30":{"type":"lecture","name":"Философия","classroom":"106","group":"ИС-21"}}}}}}'),
('{"timetable":{"denominator":{"friday":{"schedule":{"08:00":{"type":"lecture","name":"Информатика","classroom":"104","group":"ИС-21"}}}}}}');

-- Преподаватели
INSERT INTO teacher_info (teacher_name, timetable_id)
VALUES
('Алексеев Павел', 1),
('Громова Елена', 2),
('Дьячков Николай', 3),
('Карасёва Инна', 4),
('Михайлова Оксана', 5),
('Поляков Игорь', 6),
('Савельев Кирилл', 7),
('Юрьева Мария', 8);

-- Пользователи-преподаватели
INSERT INTO users (username, passwd, role, teacher_info_id, created_at)
VALUES
('teacher1', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 1, NOW()),
('teacher2', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 2, NOW()),
('teacher3', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 3, NOW()),
('teacher4', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 4, NOW()),
('teacher5', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 5, NOW()),
('teacher6', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 6, NOW()),
('teacher7', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 7, NOW()),
('teacher8', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 8, NOW());


INSERT INTO users (username, passwd, role, student_info_id, created_at)
VALUES
('student1', '{bcrypt}$2a$10$LJvK7xwB8Pn7P9eRfS0OiOd3Oiz8xPQdRS0Q8Q3EjHo7rMQtDdS6K', 'STUDENT', 1, NOW()),
('student2', '{bcrypt}$2a$10$LJvK7xwB8Pn7P9eRfS0OiOd3Oiz8xPQdRS0Q8Q3EjHo7rMQtDdS6K', 'STUDENT', 2, NOW()),
('student3', '{bcrypt}$2a$10$LJvK7xwB8Pn7P9eRfS0OiOd3Oiz8xPQdRS0Q8Q3EjHo7rMQtDdS6K', 'STUDENT', 3, NOW()),
('student4', '{bcrypt}$2a$10$LJvK7xwB8Pn7P9eRfS0OiOd3Oiz8xPQdRS0Q8Q3EjHo7rMQtDdS6K', 'STUDENT', 4, NOW()),
('student5', '{bcrypt}$2a$10$LJvK7xwB8Pn7P9eRfS0OiOd3Oiz8xPQdRS0Q8Q3EjHo7rMQtDdS6K', 'STUDENT', 5, NOW()),
('student6', '{bcrypt}$2a$10$LJvK7xwB8Pn7P9eRfS0OiOd3Oiz8xPQdRS0Q8Q3EjHo7rMQtDdS6K', 'STUDENT', 6, NOW()),
('student7', '{bcrypt}$2a$10$LJvK7xwB8Pn7P9eRfS0OiOd3Oiz8xPQdRS0Q8Q3EjHo7rMQtDdS6K', 'STUDENT', 7, NOW()),
('student8', '{bcrypt}$2a$10$LJvK7xwB8Pn7P9eRfS0OiOd3Oiz8xPQdRS0Q8Q3EjHo7rMQtDdS6K', 'STUDENT', 8, NOW()),
('student9', '{bcrypt}$2a$10$LJvK7xwB8Pn7P9eRfS0OiOd3Oiz8xPQdRS0Q8Q3EjHo7rMQtDdS6K', 'STUDENT', 9, NOW()),
('student10', '{bcrypt}$2a$10$LJvK7xwB8Pn7P9eRfS0OiOd3Oiz8xPQdRS0Q8Q3EjHo7rMQtDdS6K', 'STUDENT', 10, NOW());
