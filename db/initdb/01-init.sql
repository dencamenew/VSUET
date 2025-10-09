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

-- Расписание преподавателей (ИСПРАВЛЕНО: PK переименован в id_timetable)
CREATE TABLE IF NOT EXISTS teacher_timetable (
    id SERIAL PRIMARY KEY,
    teacher_name VARCHAR(255) NOT NULL UNIQUE,
    timetable JSONB NOT NULL
);

-- таблицы с информацией о преподавателях (id_timetable теперь ссылается на PK)
CREATE TABLE IF NOT EXISTS teacher_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    groups_subjects JSONB NOT NULL,
    id_timetable INTEGER REFERENCES teacher_timetable(id)
);

-- ----------------------------------------
-- 4. ВЕДОМОСТИ, КОММЕНТАРИИ, РЕЙТИНГ
-- ----------------------------------------

-- посещаемость (ИСПРАВЛЕНО: teacher_name -> teacher_info_id, group_name -> group_id)
CREATE TABLE IF NOT EXISTS attendance_table (
    id SERIAL PRIMARY KEY,
    teacher_info_id INTEGER NOT NULL REFERENCES teacher_info(id) ON DELETE RESTRICT, 
    period VARCHAR(50) NOT NULL,
    subject_type VARCHAR(255),
    subject_name VARCHAR(255),
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE RESTRICT, 
    report_json JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Оценки/Рейтинг (ИСПРАВЛЕНО: group_name -> group_id)
CREATE TABLE IF NOT EXISTS raiting (
    id SERIAL PRIMARY KEY,
    zach_number VARCHAR(20) NOT NULL REFERENCES student_info(zach_number) ON DELETE CASCADE, 
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
    subject_name VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    metadate JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Комментарии преподавателей (ИСПРАВЛЕНО: group_name -> group_id)
CREATE TABLE IF NOT EXISTS teachers_comments (
    id SERIAL PRIMARY KEY,
    teacher_info_id INTEGER NOT NULL REFERENCES teacher_info(id) ON DELETE RESTRICT,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE RESTRICT,
    comment TEXT NOT NULL,
    metadate JSONB,
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

-- Скрипт по заполнению users (перенесен в отдельный файл fill_users.sql для Docker Compose)
/*
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
*/

-- ----------------------------------------
-- 6. ИНДЕКСЫ (ИСПРАВЛЕНО: group_name -> group_id)
-- ----------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS idx_teachers_comments_group_teacher
ON teachers_comments (group_id, teacher_info_id); -- ИСПРАВЛЕНО

CREATE INDEX IF NOT EXISTS idx_raiting_group_subject
ON raiting (group_id, subject_name); -- ИСПРАВЛЕНО

CREATE INDEX IF NOT EXISTS idx_attendance_group_subject
ON attendance_table (group_id, subject_name); -- ИСПРАВЛЕНО

CREATE INDEX IF NOT EXISTS idx_students_group
ON student_info (group_id); -- ИСПРАВЛЕНО

-- ----------------------------------------
-- 7. ФУНКЦИИ И ТРИГГЕРЫ (ИСПРАВЛЕНО: group_name, attendance -> group_id, report_json)
-- ----------------------------------------

-- Функция-триггер для raiting
CREATE OR REPLACE FUNCTION notify_raiting_change()
RETURNS TRIGGER AS $$
DECLARE
    notification JSON;
BEGIN
    IF TG_OP = 'DELETE' THEN
        notification = json_build_object(
            'eventType', TG_OP,
            'id', OLD.id,
            'zach_number', OLD.zach_number,
            'group_id', OLD.group_id, -- ИСПРАВЛЕНО
            'score', OLD.score,
            'changed_at', NOW()
        );
    ELSE
        notification = json_build_object(
            'eventType', TG_OP,
            'id', NEW.id,
            'zach_number', NEW.zach_number,
            'group_id', NEW.group_id, -- ИСПРАВЛЕНО
            'score', NEW.score,
            'changed_at', NOW()
        );
    END IF;

    PERFORM pg_notify('raiting_updates', notification::text);
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;


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
            'teacher_info_id', OLD.teacher_info_id, -- ИСПРАВЛЕНО
            'group_id', OLD.group_id, -- ИСПРАВЛЕНО
            'report_json', OLD.report_json, -- ИСПРАВЛЕНО
            'changed_at', NOW()
        );
    ELSE
        notification = json_build_object(
            'eventType', TG_OP,
            'id', NEW.id,
            'teacher_info_id', NEW.teacher_info_id, -- ИСПРАВЛЕНО
            'group_id', NEW.group_id, -- ИСПРАВЛЕНО
            'report_json', NEW.report_json, -- ИСПРАВЛЕНО
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


-- Функция-триггер для teachers_comments
CREATE OR REPLACE FUNCTION notify_teachers_comments_change()
RETURNS TRIGGER AS $$
DECLARE
    notification JSON;
BEGIN
    IF TG_OP = 'DELETE' THEN
        notification = json_build_object(
            'eventType', TG_OP,
            'id', OLD.id,
            'group_id', OLD.group_id, -- ИСПРАВЛЕНО
            'comment', OLD.comment,
            'metadate', OLD.metadate,
            'changed_at', NOW()
        );
    ELSE
        notification = json_build_object(
            'eventType', TG_OP,
            'id', NEW.id,
            'group_id', NEW.group_id, -- ИСПРАВЛЕНО
            'comment', NEW.comment,
            'metadate', NEW.metadate,
            'changed_at', NOW()
        );
    END IF;

    PERFORM pg_notify('teachers_comments_updates', notification::text);
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;


-- Применение триггеров
CREATE TRIGGER raiting_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON raiting
FOR EACH ROW EXECUTE FUNCTION notify_raiting_change();

CREATE TRIGGER attendance_table_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON attendance_table
FOR EACH ROW EXECUTE FUNCTION notify_attendance_table_change();

CREATE TRIGGER teachers_comments_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON teachers_comments
FOR EACH ROW EXECUTE FUNCTION notify_teachers_comments_change();