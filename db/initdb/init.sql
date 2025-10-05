CREATE TABLE IF NOT EXISTS students_info (
    id SERIAL PRIMARY KEY,
    zach_number VARCHAR(20) NOT NULL UNIQUE,
    group_name VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS teachers_info (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    groups_subjects JSONB NOT NULL,
    id_timetable INT,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS teacher_timetable (
    id_timetable SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    timetable JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS raiting (
    id SERIAL PRIMARY KEY,                  
    zach_number VARCHAR(20) NOT NULL,
    group_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    raiting JSONB NOT NULL,
    ved_type VARCHAR(255) NOT NULL,
    UNIQUE (zach_number, group_name, subject)
);

CREATE TABLE IF NOT EXISTS attendance_table (
    id SERIAL PRIMARY KEY,                  
    group_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    attendance JSONB NOT NULL,
    UNIQUE (group_name, subject)
);

CREATE TABLE IF NOT EXISTS student_timetable (
    id SERIAL PRIMARY KEY,                  
    group_name VARCHAR(255) NOT NULL UNIQUE,
    timetable JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS teachers_comments (
    id SERIAL PRIMARY KEY,                  
    group_name VARCHAR(255) NOT NULL UNIQUE,
    comment VARCHAR(255) NOT NULL,
    metadate TIMESTAMP NOT NULL
);

ALTER TABLE teachers_info 
ADD CONSTRAINT fk_teachers_timetable 
FOREIGN KEY (id_timetable) REFERENCES teacher_timetable(id_timetable);

ALTER TABLE raiting 
ADD CONSTRAINT fk_raiting_student 
FOREIGN KEY (zach_number) REFERENCES students_info(zach_number);

CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers_info(name);
CREATE INDEX IF NOT EXISTS idx_raiting_zach_number ON raiting(zach_number);
CREATE INDEX IF NOT EXISTS idx_raiting_group_subject ON raiting(group_name, subject);
CREATE INDEX IF NOT EXISTS idx_attendance_group_subject ON attendance_table(group_name, subject);
CREATE INDEX IF NOT EXISTS idx_students_group ON students_info(group_name);
CREATE INDEX IF NOT EXISTS idx_teachers_comments_group_name ON teachers_comments(group_name);
CREATE INDEX IF NOT EXISTS idx_teachers_comments_metadate ON teachers_comments(metadate);
CREATE INDEX IF NOT EXISTS idx_teachers_comments_group_metadate ON teachers_comments(group_name, metadate);

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
            'group_name', OLD.group_name,
            'subject', OLD.subject,
            'raiting', OLD.raiting,
            'changed_at', NOW()
        );
    ELSE
        notification = json_build_object(
            'eventType', TG_OP,
            'id', NEW.id,
            'zach_number', NEW.zach_number,
            'group_name', NEW.group_name,
            'subject', NEW.subject,
            'raiting', NEW.raiting,
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

CREATE OR REPLACE FUNCTION notify_attendance_table_change()
RETURNS TRIGGER AS $$
DECLARE
    notification JSON;
BEGIN
    IF TG_OP = 'DELETE' THEN
        notification = json_build_object(
            'eventType', TG_OP,
            'id', OLD.id,
            'group_name', OLD.group_name,
            'subject', OLD.subject,
            'attendance', OLD.attendance,
            'changed_at', NOW()
        );
    ELSE
        notification = json_build_object(
            'eventType', TG_OP,
            'id', NEW.id,
            'group_name', NEW.group_name,
            'subject', NEW.subject,
            'attendance', NEW.attendance,
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

CREATE OR REPLACE FUNCTION notify_teachers_comments_change()
RETURNS TRIGGER AS $$
DECLARE
    notification JSON;
BEGIN
    IF TG_OP = 'DELETE' THEN
        notification = json_build_object(
            'eventType', TG_OP,
            'id', OLD.id,
            'group_name', OLD.group_name,
            'comment', OLD.comment,
            'metadate', OLD.metadate,
            'changed_at', NOW()
        );
    ELSE
        notification = json_build_object(
            'eventType', TG_OP,
            'id', NEW.id,
            'group_name', NEW.group_name,
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

CREATE TRIGGER raiting_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON raiting
FOR EACH ROW EXECUTE FUNCTION notify_raiting_change();

CREATE TRIGGER attendance_table_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON attendance_table
FOR EACH ROW EXECUTE FUNCTION notify_attendance_table_change();

CREATE TRIGGER teachers_comments_notify_trigger
AFTER INSERT OR UPDATE OR DELETE ON teachers_comments
FOR EACH ROW EXECUTE FUNCTION notify_teachers_comments_change();