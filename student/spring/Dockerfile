# Stage 1: Build with Maven
FROM maven:3.8.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# 1. Копируем ВСЕ pom.xml файлы для кэширования зависимостей
COPY pom.xml .
COPY miniApp-api/pom.xml miniApp-api/
COPY miniApp-core/pom.xml miniApp-core/

# 2. Скачиваем все зависимости (кэшируется отдельным слоем)
RUN mvn dependency:go-offline -B

# 3. Копируем исходный код всех модулей
COPY miniApp-api/src ./miniApp-api/src
COPY miniApp-core/src ./miniApp-core/src

# 4. Чистая сборка (clean + package) с созданием thin JAR
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Устанавливаем curl для health checks
RUN apk update && \
    apk add --no-cache curl && \
    rm -rf /var/cache/apk/*

# Копируем JAR из модуля miniApp-api
COPY --from=build /app/miniApp-api/target/*.jar app.jar

# Создаем не-root пользователя для безопасности
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

# Проверяем что JAR скопировался
RUN ls -la /app/app.jar && \
    java -version

EXPOSE 8080

# Добавляем параметр для отключения проблемных метрик
ENTRYPOINT ["java", "-Dmanagement.metrics.binders.processor.enabled=false", "-jar", "app.jar"]