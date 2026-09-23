FROM maven:3.9.11-eclipse-temurin-17 AS build

WORKDIR /app

COPY ed-lib-common ./ed-lib-common
COPY ed-ms-autenticacion ./ed-ms-autenticacion

RUN mvn -f ed-lib-common/pom.xml clean install -DskipTests

RUN mvn -f ed-ms-autenticacion/pom.xml clean package -DskipTests


FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/ed-ms-autenticacion/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]