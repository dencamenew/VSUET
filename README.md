# w1sent_team Хакатон MAX

Полный стек проекта с ботом на Node.js, API на FastAPI и фронтендом на Next.js, а также базой данных PostgreSQL.

---

## Структура проекта

```text
.
├── bot                  # Макс бот на Node.js
├── db                   # PostgreSQL и скрипты инициализации базы данных
├── docker-compose.yaml  # Оркестрация всех сервисов через Docker Compose
├── fastapi              # Backend API на FastAPI
├── nextapp              # Фронтенд на Next.js (TypeScript)
````

---

## Описание сервисов

* **bot/** – Макс бот на Node.js.
* **fastapi/** – Backend API на FastAPI.
* **nextapp/** – Фронтенд на Next.js (TypeScript).
* **db/** – Директория для PostgreSQL и вспомогательных скриптов.
* **docker-compose.yaml** – Главный файл для запуска всех сервисов через Docker Compose.

---

## Требования

* Docker >= 20.x
* Docker Compose >= 2.x

---

## 1️⃣ Клонирование проекта

1. Перейдите в директорию, где хотите разместить проект:

```bash
cd /path/to/projects
```

2. Клонируйте репозиторий:

```bash
git clone https://github.com/dencamenew/VSUET.git
```

3. Перейдите в папку проекта:

```bash
cd VSUET
```

---

## 2️⃣ Запуск проекта через Docker

Соберите и запустите все контейнеры в фоновом режиме:

```bash
docker compose up -d --build
```

* `--build` – пересобирает образы перед запуском.
* `-d` – запускает контейнеры в фоне.

---

## 3️⃣ Остановка проекта

Остановить все контейнеры и удалить тома и "зависшие" контейнеры:

```bash
docker compose down --volumes --remove-orphans
```

---

## 4️⃣ Инструкция для MAX miniApp

> Здесь можно описать, как использовать ваш MAX miniApp, подключение к API, запуск бота или фронтенда.

Пример:

* Открыть фронтенд: `http://localhost:3000`
* Доступ к API: `http://localhost:8000/docs`
* Запуск бота: через контейнер `bot` или локально командой `node bot/bot.js`

---

