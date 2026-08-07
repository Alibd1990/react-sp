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
RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl ca-certificates \
	&& rm -rf /var/lib/apt/lists/* \
	&& useradd --create-home --shell /usr/sbin/nologin appuser
COPY --from=build /app/target/*.jar app.jar
USER appuser
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 CMD curl -fsS http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
