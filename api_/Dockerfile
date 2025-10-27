# Stage 1: Build with Maven
FROM maven:3.8.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# 1. Копируем ВСЕ pom.xml файлы для кэширования зависимостей
COPY pom.xml .
COPY miniApp-api/pom.xml miniApp-api/
COPY miniApp-core/pom.xml miniApp-core/

# 2. Скачиваем все зависимости (кэшируется отдельным слоем)
RUN mvn dependency:go-offline

# 3. Копируем исходный код всех модулей
COPY miniApp-api/src ./miniApp-api/src
COPY miniApp-core/src ./miniApp-core/src

# 4. Чистая сборка (clean + package)
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM openjdk:17-jdk-slim
WORKDIR /app

# Устанавливаем curl и утилиты
RUN apt update && \
    apt install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Копируем JAR из модуля miniApp-api
COPY --from=build /app/miniApp-api/target/*.jar app.jar

# Проверяем что JAR скопировался
RUN ls -la /app/app.jar && \
    java -version

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]