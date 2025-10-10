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

CREATE TABLE teacher_timetable (
    id SERIAL PRIMARY KEY,
    timetable TEXT NOT NULL
);

CREATE TABLE teacher_info (
    id SERIAL PRIMARY KEY,
    teacher_name VARCHAR(255) NOT NULL UNIQUE,
    timetable_id BIGINT REFERENCES teacher_timetable(id) ON DELETE SET NULL
);

CREATE TABLE student_info (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) UNIQUE,
    zach_number VARCHAR(255) NOT NULL UNIQUE,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE student_timetable (
    id SERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    timetable TEXT NOT NULL
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