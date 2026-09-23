FROM maven:3.9.11-eclipse-temurin-17 AS build

WORKDIR /app

COPY ed-lib-common ./ed-lib-common
COPY ed-ms-administracion ./ed-ms-administracion

RUN mvn -f ed-lib-common/pom.xml clean install -DskipTests

RUN mvn -f ed-ms-administracion/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/ed-ms-administracion/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]