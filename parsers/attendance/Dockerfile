FROM python:3.12-slim

WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
        libpq-dev \
        gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "attendance.py"]


