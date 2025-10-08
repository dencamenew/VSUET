-- Скрипт по заполнению users существующими пользователями из teacher_info и student_info

-- Вставляем преподавателей
INSERT INTO users (username, passwd, role, teacher_info_id)
SELECT
    name AS username, 
    '$2a$10$YhP4D2/0JHxJ0Q4l6bn0yep4GVb5mB03/JxYzKh3O2wscGoIuf8bW' AS passwd, -- Хэш для пароля по умолчанию
    'TEACHER' AS role,
    id AS teacher_info_id
FROM teacher_info
ON CONFLICT (username) DO NOTHING; -- Защита от повторной вставки

-- Вставляем студентов
INSERT INTO users (username, passwd, role, student_info_id)
SELECT
    zach_number AS username,
    NULL AS passwd,
    'STUDENT' AS role,
    id AS student_info_id
FROM student_info
ON CONFLICT (username) DO NOTHING; -- Защита от повторной вставки