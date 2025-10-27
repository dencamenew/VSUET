# VSUET FastAPI System

Это FastAPI версия системы VSUET, переписанная с Spring Boot на Python с использованием Pydantic для сериализации.

## Структура проекта

```
fastapi/
├── app/
│   ├── config/          # Конфигурация приложения
│   ├── controllers/     # API контроллеры (роуты)
│   ├── dto/            # DTO и исключения
│   ├── models/         # Pydantic модели и SQLAlchemy модели
│   ├── repositories/   # Репозитории для работы с БД
│   └── services/       # Бизнес-логика
├── main.py            # Главный файл приложения
├── run.py             # Скрипт для запуска
├── requirements.txt   # Зависимости Python
└── README.md         # Документация
```

## Установка и запуск

### 1. Установка зависимостей

```bash
pip install -r requirements.txt
```

### 2. Настройка базы данных

Убедитесь, что PostgreSQL запущен и доступен по адресу `localhost:5432` с базой данных `db` и пользователем `admin:admin`.

### 3. Запуск приложения

```bash
python run.py
```

Или:

```bash
python main.py
```

Приложение будет доступно по адресу: http://localhost:8080

## API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход в систему

### Администрирование
- `POST /api/admin/faculty` - Создание факультета
- `DELETE /api/admin/faculty/{id}` - Удаление факультета
- `POST /api/admin/users/dean` - Создание пользователя-декана
- `POST /api/admin/users/student` - Создание пользователя-студента
- `POST /api/admin/users/teacher` - Создание пользователя-преподавателя
- `POST /api/admin/users/admin` - Создание пользователя-администратора
- `DELETE /api/admin/users/dean/{id}` - Удаление декана
- `DELETE /api/admin/users/student/{id}` - Удаление студента
- `DELETE /api/admin/users/teacher/{id}` - Удаление преподавателя

### Расписания
- `POST /api/admin/timetable/teacher/{id}` - Создание расписания преподавателя
- `DELETE /api/admin/timetable/teacher/{id}` - Удаление расписания преподавателя
- `POST /api/admin/timetable/groups/{id}` - Создание расписания группы
- `DELETE /api/admin/timetable/groups/{id}` - Удаление расписания группы

### Посещаемость
- `POST /api/admin/attendance/generate` - Генерация ведомостей посещаемости
- `GET /api/admin/attendance/student/zach` - Получение посещаемости по номеру зачетки
- `GET /api/admin/attendance/student/name` - Получение посещаемости по имени
- `GET /api/admin/attendance/teacher/group` - Отчет по группе и предмету
- `GET /api/admin/attendance/teacher/lesson` - Отчет по конкретной паре

### Рейтинг
- `POST /api/admin/rating/generate` - Генерация ведомостей рейтинга
- `GET /api/admin/rating/group` - Получение рейтинга группы по предмету

### Поиск
- `GET /api/search/students` - Поиск студентов по имени
- `GET /api/search/teachers` - Поиск преподавателей по имени
- `GET /api/search/groups` - Поиск групп по имени

### Информация
- `GET /api/info/student/{id}` - Информация о студенте
- `GET /api/info/teacher/{id}` - Информация о преподавателе
- `GET /api/info/group/{id}` - Информация о группе
- `GET /api/info/faculty/{id}` - Информация о факультете
- `GET /api/info/faculties` - Список всех факультетов
- `GET /api/info/groups` - Список всех групп

### Деканат
- `GET /api/dean/{id}` - Информация о декане
- `GET /api/dean/faculty/{id}` - Деканы по факультету
- `GET /api/dean/` - Список всех деканов

## Модели данных

### Основные сущности
- **User** - Пользователи системы
- **Faculty** - Факультеты
- **Groups** - Группы студентов
- **StudentInfo** - Информация о студентах
- **TeacherInfo** - Информация о преподавателях
- **DeanInfo** - Информация о деканах
- **Attendance** - Посещаемость
- **Rating** - Рейтинг студентов
- **GroupTimetable** - Расписание групп
- **TeacherTimetable** - Расписание преподавателей

### Роли пользователей
- `ADMIN` - Администратор
- `DEAN` - Декан
- `TEACHER` - Преподаватель
- `STUDENT` - Студент

### Статусы посещаемости
- `PRESENT` - Присутствовал
- `ABSENT` - Отсутствовал без уважительной причины
- `SICK` - Болел
- `EXCUSED` - Отсутствовал по справке
- `SUSPICIOUS_ACTIVITY` - Подозрительная активность

## Технологии

- **FastAPI** - Web framework
- **SQLAlchemy** - ORM для работы с БД
- **Pydantic** - Валидация данных и сериализация
- **PostgreSQL** - База данных
- **Uvicorn** - ASGI сервер
- **Passlib** - Хеширование паролей

## Конфигурация

Настройки приложения находятся в `app/config/settings.py`. Можно переопределить их через переменные окружения или файл `.env`.

Основные настройки:
- `database_url` - URL подключения к БД
- `host` - Хост для запуска сервера
- `port` - Порт для запуска сервера
- `secret_key` - Секретный ключ для JWT
- `allowed_origins` - Разрешенные CORS origins
