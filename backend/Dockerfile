FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN set -eux; \
		for i in 1 2 3 4 5; do \
			mvn -B -DskipTests -Dmaven.wagon.http.retryHandler.count=5 -Dmaven.wagon.http.pool=false dependency:go-offline && break; \
			echo "Maven go-offline failed (attempt $i). Retrying..."; \
			if [ "$i" -eq 5 ]; then exit 1; fi; \
		done
COPY src ./src
RUN mvn -B -DskipTests -Dmaven.wagon.http.retryHandler.count=5 -Dmaven.wagon.http.pool=false clean package

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN useradd -ms /bin/bash appuser
COPY --from=build /app/target/*.jar app.jar
USER appuser
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
