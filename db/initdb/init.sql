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
    UNIQUE (group_name, zach_number, sbj)
);

CREATE TABLE IF NOT EXISTS timetable (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    timetable JSONB NOT NULL
);


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

-- Триггер для таблицы raiting
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

-- Триггер для таблицы timetable
CREATE TRIGGER timetable_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON timetable
FOR EACH ROW EXECUTE FUNCTION notify_timetable_change();