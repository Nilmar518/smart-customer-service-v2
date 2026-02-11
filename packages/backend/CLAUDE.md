# Smart Customer Service v2

Backend NestJS con autenticación JWT y PostgreSQL, frontend React/Vite.

## Comandos frecuentes

pnpm install              # Instalar dependencias
pnpm dev                  # Arrancar todo en modo dev
pnpm api:tests:ut         # Tests unitarios del backend
pnpm api:tests:e2e        # Tests e2e del backend

## Estructura del backend

packages/backend/src/
  ├── auth/        # Autenticación (signup, login, JWT guard)
  ├── database/    # Conexión y esquema PostgreSQL
  └── hello/       # Endpoint de ejemplo (protegido y público)

packages/backend/test/
  ├── unit/        # Tests unitarios (mockean DataSource y JwtService)
  ├── e2e/         # Tests e2e (levantan app con DataSource mockeado)
  └── helpers/     # Utilidades para tests (test app factory)

## Cómo escribir tests

- **Unitarios**: mockear DataSource (no hay PostgreSQL) y JwtService. Probar lógica interna.
- **E2E**: usar el helper de test-app.ts que reemplaza la BD. Atacar endpoints HTTP con supertest.

## Coverage

Se espera 100% de cobertura para el código del backend (excluyendo main.ts).
