FROM openjdk:17-alpine

RUN adduser --system --group dipa
USER dipa:dipa

ARG JAR_FILE

COPY ${JAR_FILE} projektassistent.jar

ENTRYPOINT ["java","-jar","/projektassistent.jar"]