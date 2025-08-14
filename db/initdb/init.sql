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
    timetable JSONB NOT NULL
);