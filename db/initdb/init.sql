CREATE TABLE IF NOT EXISTS raiting (
    id SERIAL PRIMARY KEY,                  
    group_name VARCHAR(255) NOT NULL,
    zach_number VARCHAR(255) NOT NULL, 
    sbj VARCHAR(255) NOT NULL,
    raiting TEXT[] NOT NULL,
    ved_type VARCHAR(255) NOT NULL,
    UNIQUE (group_name, zach_number, sbj)
);

CREATE TABLE IF NOT EXISTS full_timetable (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    group_name VARCHAR(100),
    zach_number VARCHAR(255) NOT NULL,
    time TIME NOT NULL,
    subject VARCHAR(255) NOT NULL,
    type_subject VARCHAR(20),
    teacher VARCHAR(255),
    audience VARCHAR(30),
    turnout BOOLEAN DEFAULT FALSE,
    comment VARCHAR(255),
    UNIQUE (date, zach_number, time)
);

CREATE TABLE IF NOT EXISTS teacher_timetable (
    id SERIAL PRIMARY KEY,
    teacher VARCHAR(255) NOT NULL UNIQUE,
    timetable JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS students_info (
    id SERIAL PRIMARY KEY,
    zach_number VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255)
);

-- Теперь создаем недостающую таблицу teachers_info
CREATE TABLE IF NOT EXISTS teachers_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    groups_subjects JSONB NOT NULL
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers_info(name);
CREATE INDEX IF NOT EXISTS idx_full_timetable_date ON full_timetable(date);
CREATE INDEX IF NOT EXISTS idx_full_timetable_zach ON full_timetable(zach_number);
CREATE INDEX IF NOT EXISTS idx_full_timetable_date_zach ON full_timetable(date, zach_number);

-- Функции и триггеры
CREATE OR REPLACE FUNCTION notify_raiting_change()
RETURNS TRIGGER AS $$
DECLARE
    notification JSON;
BEGIN
    notification = json_build_object(
        'eventType', TG_OP,
        'zach_number', NEW.zach_number,
        'group_name', NEW.group_name,
        'sbj', NEW.sbj,
        'raiting', NEW.raiting,
        'changed_at', NOW()
    );

    PERFORM pg_notify('raiting_updates', notification::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION notify_full_timetable_change()
RETURNS TRIGGER AS $$
DECLARE
    notification JSON;
BEGIN
    notification = json_build_object(
        'eventType', TG_OP,
        'date', NEW.date,
        'zach_number', NEW.zach_number,
        'time', NEW.time,
        'turnout', NEW.turnout,
        'comment', New.comment,
        'changed_at', NOW()
    );

    PERFORM pg_notify('full_timetable_updates', notification::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры только если они нужны
CREATE TRIGGER raiting_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON raiting
FOR EACH ROW EXECUTE FUNCTION notify_raiting_change();

CREATE TRIGGER full_timetable_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON full_timetable
FOR EACH ROW EXECUTE FUNCTION notify_full_timetable_change();