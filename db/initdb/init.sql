CREATE TABLE IF NOT EXISTS sbj_urls (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL UNIQUE,
    urls TEXT[] NOT NULL
);

CREATE TABLE IF NOT EXISTS zach (
    id SERIAL PRIMARY KEY,                  
    zach_number VARCHAR(50) UNIQUE NOT NULL, 
    group_name VARCHAR(255) NOT NULL
);