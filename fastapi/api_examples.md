# API Examples

## Аутентификация

### Вход в систему
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }'
```

## Администрирование

### Создание факультета
```bash
curl -X POST "http://localhost:8080/api/admin/faculty?faculty_name=Факультет%20Информатики"
```

### Создание пользователя-студента
```bash
curl -X POST "http://localhost:8080/api/admin/users/student" \
  -d "username=student1&password=password123&student_name=Иван%20Иванов&group_id=1&zach_number=12345"
```

### Создание пользователя-преподавателя
```bash
curl -X POST "http://localhost:8080/api/admin/users/teacher" \
  -d "username=teacher1&password=password123&teacher_name=Петр%20Петров"
```

### Создание пользователя-декана
```bash
curl -X POST "http://localhost:8080/api/admin/users/dean" \
  -d "username=dean1&password=password123&dean_name=Сидор%20Сидоров&faculty_id=1"
```

## Расписания

### Создание расписания преподавателя
```bash
curl -X POST "http://localhost:8080/api/admin/timetable/teacher/1" \
  -H "Content-Type: application/json" \
  -d '{
    "denominator": {
      "Monday": {
        "09:00": {
          "type": "lecture",
          "name": "Математика",
          "teacher_name": "Петр Петров",
          "classroom": "101",
          "group": "ИВТ-21"
        }
      }
    },
    "numerator": {
      "Monday": {
        "09:00": {
          "type": "practice",
          "name": "Математика",
          "teacher_name": "Петр Петров",
          "classroom": "102",
          "group": "ИВТ-21"
        }
      }
    }
  }'
```

## Посещаемость

### Генерация ведомостей посещаемости
```bash
curl -X POST "http://localhost:8080/api/admin/attendance/generate?teacher_name=Петр%20Петров"
```

### Получение посещаемости студента по номеру зачетки
```bash
curl -X GET "http://localhost:8080/api/admin/attendance/student/zach?zach_number=12345"
```

### Получение посещаемости группы
```bash
curl -X GET "http://localhost:8080/api/admin/attendance/teacher/group?group_name=ИВТ-21&subject_name=Математика"
```

## Рейтинг

### Генерация ведомостей рейтинга
```bash
curl -X POST "http://localhost:8080/api/admin/rating/generate?teacher_name=Петр%20Петров"
```

### Получение рейтинга группы
```bash
curl -X GET "http://localhost:8080/api/admin/rating/group?group_name=ИВТ-21&subject_name=Математика"
```

## Поиск

### Поиск студентов
```bash
curl -X GET "http://localhost:8080/api/search/students?name=Иван"
```

### Поиск преподавателей
```bash
curl -X GET "http://localhost:8080/api/search/teachers?name=Петр"
```

### Поиск групп
```bash
curl -X GET "http://localhost:8080/api/search/groups?name=ИВТ-21"
```

## Информация

### Получение информации о студенте
```bash
curl -X GET "http://localhost:8080/api/info/student/1"
```

### Получение списка всех факультетов
```bash
curl -X GET "http://localhost:8080/api/info/faculties"
```

### Получение списка всех групп
```bash
curl -X GET "http://localhost:8080/api/info/groups"
```

## Деканат

### Получение информации о декане
```bash
curl -X GET "http://localhost:8080/api/dean/1"
```

### Получение деканов по факультету
```bash
curl -X GET "http://localhost:8080/api/dean/faculty/1"
```
