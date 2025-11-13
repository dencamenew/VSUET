# w1sent_team Хакатон MAX

Полный стек проекта с ботом на Node.js, API на FastAPI и фронтендом на Next.js, а также базой данных PostgreSQL.


## Структура проекта

.
├── bot
├── db
├── docker-compose.yaml
├── fastapi
├── nextapp

## Описание сервисов

- **bot/** – Макс бот на Node.js.  
- **fastapi/** – backend API на FastAPI.  
- **nextapp/** – фронтенд на Next.js (TypeScript).  
- **db/** – директория для PostgreSQL и вспомогательных скриптов и инициализации базы данных.  
- **docker-compose.yaml** – оркестрация всех сервисов через Docker Compose.  

## Требования

- Docker >= 20.x  
- Docker Compose >= 2.x

## 1️⃣ Клонирование проекта

1. Перейдите в директорию, где хотите разместить проект:

cd /path/to/projects

2. Клонируйте репозиторий:

git clone https://github.com/dencamenew/VSUET.git

3. Перейдите в папку проекта:

cd your_project

## 2️⃣ Запуск проекта через Docker

Соберите и запустите все контейнеры в фоновом режиме:

docker compose up -d --build


## 3️⃣ Остановка проета 

docker compose down --volumes --remove-orphans


## Инструкция для MAX miniApp



