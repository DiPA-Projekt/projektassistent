FROM openjdk:17-alpine

RUN addgroup -S dipa && adduser -S dipa -G dipa
USER dipa:dipa

ARG JAR_FILE

COPY ${JAR_FILE} projektassistent.jar

ENTRYPOINT ["java","-jar","/projektassistent.jar"]