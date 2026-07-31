# Agence de Location - Stack Docker

## Prerequis
- Docker + Docker Compose

## Demarrage rapide
1. Copier `.env.example` vers `.env`.
2. Lancer la stack:
   ```bash
   docker compose up --build
   ```

## Services
- Frontend React (MUI): http://localhost:8081
- Backend Spring Boot: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- Actuator health: http://localhost:8080/actuator/health
- MinIO: http://localhost:9001

## Notes
- Les migrations Flyway sont appliquees au demarrage.
- CORS est pilote via `CORS_ALLOWED_ORIGINS`.
- JWT est configure via variables d'environnement.
