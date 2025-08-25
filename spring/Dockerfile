FROM maven:3.8.6-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY . .
RUN mvn clean package

FROM openjdk:17-jdk-slim
WORKDIR /app

CMD sudo apt install curl

RUN find /app -name "*.jar" -type f


COPY --from=build /app/miniApp-api/target/*.jar .


RUN mv miniApp-api-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]