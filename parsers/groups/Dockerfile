# Используем образ с предустановленным Chrome для Selenium
FROM selenium/standalone-chrome:latest

# Устанавливаем Python и pip, необходимые для запуска скрипта
USER root
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Создаем рабочую директорию
WORKDIR /app

# Копируем и устанавливаем зависимости
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Копируем скрипт парсера
COPY groups.py .

# Устанавливаем переменные окружения для работы с БД
ENV DB_HOST=postgres
ENV DB_USER=admin
ENV DB_PASSWORD=admin
ENV DB_NAME=db

# Команда для запуска парсера
CMD ["python3", "groups.py"]