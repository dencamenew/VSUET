FROM python:3.11-slim

WORKDIR /app

# Копирование зависимостей
COPY requirements.txt .

# Установка Python зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Установка maxapi через командную строку
RUN pip install --no-cache-dir maxapi

# Копирование исходного кода
COPY . .

# Запуск приложения
CMD ["python", "bot.py"]