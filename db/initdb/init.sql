-- ============================================
-- TABLES
-- ============================================

-- 1. Faculty-related
CREATE TABLE faculty (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE dean_info (
    id SERIAL PRIMARY KEY,
    dean_name VARCHAR(255) NOT NULL UNIQUE,
    faculty_id BIGINT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE
);

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL UNIQUE,
    faculty_id BIGINT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE
);

-- 2. Teacher info (сначала создаём, чтобы на неё могли ссылаться)
CREATE TABLE teacher_info (
    id SERIAL PRIMARY KEY,
    teacher_name VARCHAR(255) NOT NULL UNIQUE
);

-- 3. Teacher timetable (теперь можем ссылаться на teacher_info)
CREATE TABLE teacher_timetable (
    id SERIAL PRIMARY KEY,
    teacher_info_id BIGINT NOT NULL UNIQUE REFERENCES teacher_info(id) ON DELETE CASCADE,
    timetable_json JSONB NOT NULL
);

-- 4. Остальные таблицы
CREATE TABLE student_info (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) UNIQUE,
    zach_number VARCHAR(255) NOT NULL UNIQUE,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE group_timetable (
    id SERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    timetable_json JSONB NOT NULL
);

CREATE TABLE attendance_table (
    id SERIAL PRIMARY KEY,
    teacher_name VARCHAR(255),
    period VARCHAR(255),
    subject_type VARCHAR(255),
    subject_name VARCHAR(255),
    group_name VARCHAR(255),
    report_json JSONB
);

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
-- ============================================
-- INITIAL DATA
-- ============================================

INSERT INTO faculty (id, name)
VALUES (1, 'Факультет информационных технологий');

INSERT INTO dean_info (id, dean_name, faculty_id)
VALUES (1, 'Иванов Иван Иванович', 1);

INSERT INTO users (id, username, passwd, role, dean_info_id, created_at)
VALUES (1, 'dean', '{bcrypt}$2a$10$V2UE5Cw7SrVslQtbP8ePf.h6nPfEZo.ghp7sHNYmsfIYcWq8Y7pW2', 'DEAN', 1, NOW());

INSERT INTO users (id, username, passwd, role, created_at)
VALUES (2, 'admin', '{bcrypt}$2a$10$Q6JrZL4t9I3E0UjOD3luje2B4xQ.Yp1e4ObV69z6jaVb2WQzP3k4a', 'ADMIN', NOW());

INSERT INTO groups (id, group_name, faculty_id)
VALUES (1, 'ИС-21', 1);

INSERT INTO student_info (id, student_name, zach_number, group_id)
VALUES 
(1, 'Петров Сергей', 'Z001', 1),
(2, 'Сидорова Анна', 'Z002', 1),
(3, 'Ильин Артем', 'Z003', 1),
(4, 'Соколова Елена', 'Z004', 1),
(5, 'Кузнецов Дмитрий', 'Z005', 1),
(6, 'Новикова Дарья', 'Z006', 1),
(7, 'Орлов Михаил', 'Z007', 1),
(8, 'Попова Алина', 'Z008', 1),
(9, 'Федоров Никита', 'Z009', 1),
(10, 'Смирнова Ольга', 'Z010', 1);

INSERT INTO teacher_info (id, teacher_name)
VALUES
(1, 'Алексеев Павел'),
(2, 'Громова Елена'),
(3, 'Дьячков Николай'),
(4, 'Карасёва Инна'),
(5, 'Михайлова Оксана'),
(6, 'Поляков Игорь'),
(7, 'Савельев Кирилл'),
(8, 'Юрьева Мария');

INSERT INTO users (id, username, passwd, role, teacher_info_id, created_at)
VALUES
(3, 'teacher1', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 1, NOW()),
(4, 'teacher2', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 2, NOW()),
(5, 'teacher3', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 3, NOW()),
(6, 'teacher4', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 4, NOW()),
(7, 'teacher5', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 5, NOW()),
(8, 'teacher6', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 6, NOW()),
(9, 'teacher7', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 7, NOW()),
(10, 'teacher8', '{bcrypt}$2a$10$E/AfMcP9M0NYaN9G5nX72u2LZ.VcZ4HkMxkhSnSW5ciR24M8gYxK2', 'TEACHER', 8, NOW());

INSERT INTO group_timetable (id, group_id, timetable_json)
VALUES (1, 1, '{
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

INSERT INTO teacher_timetable (id, teacher_info_id, timetable_json)
VALUES
(1, 1, '{"timetable":{"numerator":{"monday":{"schedule":{"08:00":{"type":"lecture","name":"Математика","classroom":"101","group":"ИС-21"}}}}}}'),
(2, 2, '{"timetable":{"numerator":{"monday":{"schedule":{"09:50":{"type":"practice","name":"Физика","classroom":"102","group":"ИС-21"}}}}}}'),
(3, 3, '{"timetable":{"numerator":{"tuesday":{"schedule":{"08:00":{"type":"lab","name":"ОС","classroom":"301","group":"ИС-21"}}}}}}'),
(4, 4, '{"timetable":{"numerator":{"wednesday":{"schedule":{"08:00":{"type":"lecture","name":"Экономика","classroom":"110","group":"ИС-21"}}}}}}'),
(5, 5, '{"timetable":{"numerator":{"thursday":{"schedule":{"10:40":{"type":"practice","name":"История","classroom":"111","group":"ИС-21"}}}}}}'),
(6, 6, '{"timetable":{"numerator":{"friday":{"schedule":{"08:00":{"type":"lecture","name":"Программирование","classroom":"203","group":"ИС-21"}}}}}}'),
(7, 7, '{"timetable":{"denominator":{"monday":{"schedule":{"11:30":{"type":"lecture","name":"Философия","classroom":"106","group":"ИС-21"}}}}}}'),
(8, 8, '{"timetable":{"denominator":{"friday":{"schedule":{"08:00":{"type":"lecture","name":"Информатика","classroom":"104","group":"ИС-21"}}}}}}');