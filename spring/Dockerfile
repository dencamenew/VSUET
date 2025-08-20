FROM maven:3.8.6 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app


RUN find /app -name "*.jar" -type f


COPY --from=build /app/miniApp-api/target/*.jar .


RUN mv miniApp-api-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]