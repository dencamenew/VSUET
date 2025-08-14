FROM python:3.9

WORKDIR /app

# Устанавливаем только необходимые зависимости для chromium
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
        wget \
        unzip \
        chromium \
        chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Python-зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY zach.py .

CMD ["python", "zach.py"]