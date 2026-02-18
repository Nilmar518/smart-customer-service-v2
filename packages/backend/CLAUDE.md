# Smart Customer Service v2 - Backend

Backend NestJS con autenticacion JWT, PostgreSQL y Firebase Firestore.

## Comandos frecuentes

```bash
pnpm install              # Instalar dependencias
pnpm dev                  # Arrancar todo en modo dev
pnpm api:tests:ut         # Tests unitarios del backend
pnpm api:tests:e2e        # Tests e2e del backend
```

## Estructura del backend

```
packages/backend/src/
  ├── auth/        # Autenticacion (signup, login, JWT guard)
  ├── database/    # Conexion y esquema PostgreSQL
  ├── firestore/   # (PENDIENTE) Firebase Admin SDK - guardar/leer usuarios en Firestore
  ├── weather/     # (PENDIENTE) API del clima (OpenWeatherMap)
  └── hello/       # Endpoint de ejemplo (protegido y publico)
```

```
packages/backend/test/
  ├── unit/        # Tests unitarios (mockean DataSource, JwtService, FirestoreService, WeatherService)
  ├── e2e/         # Tests e2e (levantan app con mocks in-memory)
  └── helpers/     # Utilidades para tests (test app factory, mocks compartidos)
      ├── test-app.ts          # Factory de la app de test
      ├── mock-firestore.ts    # (PENDIENTE) Mock de FirestoreService
      └── mock-weather.ts      # (PENDIENTE) Mock de WeatherService
```

## Modulos del backend

### auth/
- `auth.controller.ts` - Endpoints POST /api/auth/signup y POST /api/auth/login
- `auth.service.ts` - Logica de negocio (hash passwords con scrypt, JWT tokens)
- `auth.guard.ts` - Guard para proteger endpoints con Bearer JWT
- `auth.types.ts` - DTOs: SignUpDto, LoginDto

### database/
- `database.module.ts` - Configuracion TypeORM con PostgreSQL
- `database-init.service.ts` - Inicializacion del esquema (CREATE TABLE users)

### firestore/ (PENDIENTE)
- `firestore.module.ts` - Inicializacion de Firebase Admin SDK
- `firestore.service.ts` - CRUD de usuarios en Firestore (saveUser, getUserByEmail, getUserById)
- `firestore.types.ts` - Tipos para documentos de Firestore

### weather/ (PENDIENTE)
- `weather.module.ts` - Modulo del servicio de clima
- `weather.service.ts` - Llama a OpenWeatherMap API
- `weather.controller.ts` - GET /api/weather?city=<ciudad> (protegido con JWT)
- `weather.types.ts` - Tipos para la respuesta del clima

## Como escribir tests

- **Unitarios**: mockear DataSource, JwtService, FirestoreService y WeatherService. Probar logica interna.
- **E2E**: usar el helper de test-app.ts que reemplaza todas las dependencias externas con mocks in-memory. Atacar endpoints HTTP con supertest.
- **Mocks de Firestore**: Usar un Map en memoria que simule la coleccion `users` de Firestore.
- **Mocks de Weather**: Devolver datos fijos de clima (temperatura, descripcion, ciudad).

## Coverage

Se espera 100% de cobertura para el codigo del backend (excluyendo main.ts y archivos *.module.ts).

## Endpoints API

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| POST | /api/auth/signup | No | Registrar usuario (PostgreSQL + Firestore) |
| POST | /api/auth/login | No | Iniciar sesion, devuelve JWT |
| GET | /api/weather | JWT | Obtener clima actual de una ciudad |
| GET | /api/hello | JWT | Endpoint protegido de ejemplo |
| POST | /api/hello | No | Endpoint publico de ejemplo |
