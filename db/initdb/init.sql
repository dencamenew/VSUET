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

-- ------------------------
-- TABLE: groups
-- ------------------------
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL UNIQUE
);

-- ------------------------
-- TABLE: group_timetable
-- ------------------------
CREATE TABLE group_timetable (
    id SERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES groups(id),
    timetable JSONB NOT NULL
);

-- ------------------------
-- TABLE: student_info
-- ------------------------
CREATE TABLE student_info (
    id SERIAL PRIMARY KEY,
    zach_number VARCHAR(255) NOT NULL UNIQUE,
    group_id BIGINT REFERENCES groups(id)
);

-- ------------------------
-- TABLE: teacher_timetable
-- ------------------------
CREATE TABLE teacher_timetable (
    id SERIAL PRIMARY KEY,
    timetable JSONB NOT NULL
);

-- ------------------------
-- TABLE: teacher_info
-- ------------------------
CREATE TABLE teacher_info (
    id SERIAL PRIMARY KEY,
    groups_subjects JSONB,
    timetable_id BIGINT REFERENCES teacher_timetable(id)
);

-- ------------------------
-- TABLE: users
-- ------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    MAX_id VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    teacher_info_id BIGINT REFERENCES teacher_info(id),
    student_info_id BIGINT REFERENCES student_info(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    passwd VARCHAR(255) NOT NULL
);

-- ------------------------
-- TABLE: attendance_table
-- ------------------------
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    subject_name VARCHAR(255) NOT NULL,
    subject_type VARCHAR(255),
    semestr VARCHAR(50),
    teacher_id BIGINT REFERENCES teacher_info(id),
    group_id BIGINT REFERENCES groups(id),
    attendance_json JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ------------------------
-- TABLE: rating
-- ------------------------
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