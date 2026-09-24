FROM maven:3.9.11-eclipse-temurin-17 AS build

WORKDIR /app

COPY ed-lib-common ./ed-lib-common
COPY ed_ms_notas ./ed_ms_notas

RUN mvn -f ed-lib-common/pom.xml clean install -DskipTests

RUN mvn -f ed_ms_notas/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/ed_ms_notas/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]