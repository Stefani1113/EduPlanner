FROM maven:3.9.11-eclipse-temurin-17 AS build

WORKDIR /app

COPY ed-lib-common ./ed-lib-common
COPY ed-gateway ./ed-gateway

RUN mvn -f ed-lib-common/pom.xml clean install -DskipTests

RUN mvn -f ed-gateway/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=build /app/ed-gateway/target/ed-gateway-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]