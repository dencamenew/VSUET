CREATE TABLE IF NOT EXISTS sbj_urls (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL UNIQUE,
    urls TEXT[] NOT NULL
);

CREATE TABLE IF NOT EXISTS zach (
    id SERIAL PRIMARY KEY,                  
    zach_number VARCHAR(255) UNIQUE NOT NULL, 
    group_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS raiting (
    id SERIAL PRIMARY KEY,                  
    group_name VARCHAR(255) NOT NULL,
    zach_number VARCHAR(255) NOT NULL, 
    sbj VARCHAR(255) NOT NULL,
    raiting TEXT[] NOT NULL,
    ved_type VARCHAR(255) NOT NULL,
    UNIQUE (group_name, zach_number, sbj)
);

CREATE TABLE IF NOT EXISTS teacher_timetable (
    id SERIAL PRIMARY KEY,
    teacher VARCHAR(255) NOT NULL UNIQUE,
    timetable JSONB NOT NULL
);  -- ДОБАВЬТЕ ТОЧКУ С ЗАПЯТОЙ ЗДЕСЬ!

CREATE TABLE IF NOT EXISTS timetable (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL UNIQUE,
    timetable JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS timetable_with_zach (
    id SERIAL PRIMARY KEY,
    zach_number VARCHAR(255) NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    week_type VARCHAR(20) NOT NULL CHECK (week_type IN ('числитель', 'знаменатель', 'всегда')),
    week_day VARCHAR(20) NOT NULL CHECK (week_day IN ('понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье')),
    time TIME NOT NULL,
    subject VARCHAR(255) NOT NULL,
    audience VARCHAR(255),
    teacher VARCHAR(255),
    UNIQUE (zach_number, week_type, week_day, time)
);

CREATE TABLE IF NOT EXISTS full_timetable (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    zach_number VARCHAR(255) NOT NULL,
    time TIME NOT NULL,
    subject VARCHAR(255) NOT NULL,
    teacher VARCHAR(255),
    turnout BOOLEAN DEFAULT FALSE,
    comment VARCHAR(255),
    UNIQUE (date, zach_number, time)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_timetable_with_zach_zach ON timetable_with_zach(zach_number);
CREATE INDEX IF NOT EXISTS idx_timetable_with_zach_group ON timetable_with_zach(group_name);
CREATE INDEX IF NOT EXISTS idx_timetable_with_zach_week ON timetable_with_zach(week_type, week_day);
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

CREATE TRIGGER raiting_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON raiting
FOR EACH ROW EXECUTE FUNCTION notify_raiting_change();

CREATE OR REPLACE FUNCTION notify_timetable_change()
RETURNS TRIGGER AS $$
DECLARE
    notification JSON;
BEGIN
    notification = json_build_object(
        'eventType', TG_OP,
        'group_name', NEW.group_name,
        'timetable', NEW.timetable,
        'changed_at', NOW()
    );

    PERFORM pg_notify('timetable_updates', notification::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timetable_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON timetable
FOR EACH ROW EXECUTE FUNCTION notify_timetable_change();

CREATE OR REPLACE FUNCTION notify_timetable_with_zach_change()
RETURNS TRIGGER AS $$
DECLARE
    notification JSON;
BEGIN
    notification = json_build_object(
        'eventType', TG_OP,
        'zach_number', NEW.zach_number,
        'group_name', NEW.group_name,
        'week_type', NEW.week_type,
        'week_day', NEW.week_day,
        'time', NEW.time,
        'changed_at', NOW()
    );

    PERFORM pg_notify('timetable_with_zach_updates', notification::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timetable_with_zach_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON timetable_with_zach
FOR EACH ROW EXECUTE FUNCTION notify_timetable_with_zach_change();

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

CREATE TRIGGER full_timetable_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON full_timetable
FOR EACH ROW EXECUTE FUNCTION notify_full_timetable_change();


-- Создание таблицы для хранения данных преподавателей
CREATE TABLE IF NOT EXISTS teachers_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    groups_subjects JSONB NOT NULL
);

-- Создание индекса для быстрого поиска по имени преподавателя
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers_info(name);