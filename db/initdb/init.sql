-- ----------------------------------------
-- 1. ЦЕНТРАЛЬНЫЙ СПРАВОЧНИК
-- ----------------------------------------

-- таблица с группами (ЕДИНЫЙ ИСТОЧНИК ИСТИНЫ)
CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(20) NOT NULL UNIQUE
);

-- ----------------------------------------
-- 2. СТУДЕНТЫ
-- ----------------------------------------

-- таблицы с информацией о студентах (Использует group_id)
CREATE TABLE IF NOT EXISTS student_info (
    id SERIAL PRIMARY KEY,
    zach_number VARCHAR(20) NOT NULL UNIQUE,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE RESTRICT
);

-- расписание студентов (Использует group_id)
CREATE TABLE IF NOT EXISTS student_timetable (
    id SERIAL PRIMARY KEY,                  
    group_id INTEGER NOT NULL UNIQUE REFERENCES groups(id) ON DELETE CASCADE,
    timetable JSONB NOT NULL
);

-- ----------------------------------------
-- 3. ПРЕПОДАВАТЕЛИ
-- ----------------------------------------

-- Расписание преподавателей 
CREATE TABLE IF NOT EXISTS teacher_timetable (
    id SERIAL PRIMARY KEY,
    teacher_name VARCHAR(255) NOT NULL UNIQUE,
    timetable JSONB NOT NULL
);

-- таблицы с информацией о преподавателях 
CREATE TABLE IF NOT EXISTS teacher_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    groups_subjects JSONB NOT NULL,
    id_timetable INTEGER REFERENCES teacher_timetable(id)
);

-- ----------------------------------------
-- 4. ВЕДОМОСТИ, КОММЕНТАРИИ, РЕЙТИНГ
-- ----------------------------------------

-- посещаемость 
CREATE TABLE IF NOT EXISTS attendance_table (
    id SERIAL PRIMARY KEY,
    teacher_info_id INTEGER NOT NULL REFERENCES teacher_info(id) ON DELETE RESTRICT, -- Ссылка на teacher_info
    period VARCHAR(50) NOT NULL,
    subject_type VARCHAR(255),
    subject_name VARCHAR(255),
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE RESTRICT, 
    report_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ----------------------------------------
-- 5. АУТЕНТИФИКАЦИЯ (USERS)
-- ----------------------------------------

--общая таблица со всеми пользователями API
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,   -- номер зачетки или ФИО
    role VARCHAR(50) NOT NULL CHECK (role IN ('TEACHER', 'STUDENT', 'ROLE_ADMIN')),
    passwd VARCHAR(255),
    teacher_info_id INTEGER REFERENCES teacher_info(id) ON DELETE SET NULL,
    student_info_id INTEGER REFERENCES student_info(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--скрипт по заполнению users существующими пользователями из teacher_ & student_
INSERT INTO users (username, passwd, role, teacher_info_id)
SELECT
    name AS username, 
    '$2a$10$YhP4D2/0JHxJ0Q4l6bn0yep4GVb5mB03/JxYzKh3O2wscGoIuf8bW' AS passwd,
    'TEACHER' AS role,
    id AS teacher_info_id
FROM teacher_info;


INSERT INTO users (username, passwd, role, student_info_id)
SELECT
    zach_number AS username,
    NULL AS passwd,
    'STUDENT' AS role,
    id AS student_info_id
FROM student_info;

-- ----------------------------------------
-- 6. ФУНКЦИИ И ТРИГГЕРЫ
-- ----------------------------------------

-- Функция-триггер для attendance_table
CREATE OR REPLACE FUNCTION notify_attendance_table_change()
RETURNS TRIGGER AS $$
DECLARE
    notification JSON;
BEGIN
    IF TG_OP = 'DELETE' THEN
        notification = json_build_object(
            'eventType', TG_OP,
            'id', OLD.id,
            'teacher_info_id', OLD.teacher_info_id, -- ИСПРАВЛЕНО (с teacher_name)
            'group_id', OLD.group_id, -- ИСПРАВЛЕНО
            'report_json', OLD.report_json, -- ИСПРАВЛЕНО (с attendance)
            'changed_at', NOW()
        );
    ELSE
        notification = json_build_object(
            'eventType', TG_OP,
            'id', NEW.id,
            'teacher_info_id', NEW.teacher_info_id, -- ИСПРАВЛЕНО (с teacher_name)
            'group_id', NEW.group_id, -- ИСПРАВЛЕНО
            'report_json', NEW.report_json, -- ИСПРАВЛЕНО (с attendance)
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


-- Применение триггеров
CREATE TRIGGER attendance_table_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON attendance_table
FOR EACH ROW EXECUTE FUNCTION notify_attendance_table_change();