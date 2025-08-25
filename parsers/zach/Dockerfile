FROM python:3.9-alpine

WORKDIR /app

# Устанавливаем Python-зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY zach.py .

CMD ["python", "zach.py"]