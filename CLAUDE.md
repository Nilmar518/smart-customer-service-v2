# Smart Customer Service v2

Monorepo con pnpm workspaces: backend NestJS + frontend React/Vite.

## Comandos principales

```bash
pnpm install              # Instalar dependencias
pnpm dev                  # Arrancar todo en modo dev
pnpm api:tests:ut         # Tests unitarios backend (100% coverage)
pnpm api:tests:e2e        # Tests e2e backend (100% coverage)
```

## Estructura del proyecto

```
packages/
  backend/       # NestJS, puerto 8080, prefijo /api
    src/
      auth/        # Signup, Login, JWT guard
      database/    # PostgreSQL (TypeORM DataSource)
      firestore/   # Firebase Admin + Firestore (guardar usuarios)
      weather/     # API del clima (OpenWeatherMap)
      hello/       # Endpoint de ejemplo
    test/
      unit/        # Tests unitarios (mockean dependencias)
      e2e/         # Tests e2e (supertest + mocks in-memory)
      helpers/     # Test app factory, mocks compartidos
  frontend/      # React + Vite + Zustand
    src/
      components/  # AuthPage, AuthForm, DashboardPage, HelloPanel, WeatherPanel
      stores/      # auth.store (JWT), weather.store (clima)
```

## Convenciones de codigo

- TypeScript estricto, 2 espacios, single quotes
- `type` en vez de `interface`, sin `enum` (usar `as const`)
- Named exports (no `export default` en backend)
- Retornos explicitos en funciones
- Archivos: `*.types.ts` para DTOs, `*.entity.ts` para entidades
- Tests: `*.spec.ts` unitarios, `*.e2e.spec.ts` para e2e

## Convenciones de tests

- Unit: mockear DataSource, JwtService, FirestoreService, WeatherService
- E2E: usar `test/helpers/test-app.ts` con mocks in-memory
- Coverage: 100% excluyendo main.ts y archivos *.module.ts

## Ramas y CI/CD

- Rama principal: `main`
- Feature branches: `feature/<nombre-descriptivo>` (ej: `feature/add-firebase-users`)
- Al crear PR hacia `main`, GitHub Actions ejecuta: UT primero, luego E2E
- No hacer push directo a `main`

## Variables de entorno (backend)

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=smart_customer_service
JWT_SECRET=your-secret

# Firebase Admin (Firestore) - Proyecto GCP: pure-highlander-487218-g2
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
FIREBASE_PROJECT_ID=pure-highlander-487218-g2

# Weather API (OpenWeatherMap)
WEATHER_API_KEY=your-openweathermap-key
WEATHER_DEFAULT_CITY=La Paz
```

## Flujo de integración: Login → Clima → Dashboard

### Backend (ya implementado)
1. **POST /api/auth/login** → Retorna `{ accessToken: "jwt-token" }`
2. **GET /api/weather?city=** (protegido con JWT) → Retorna datos del clima de OpenWeatherMap

### Frontend (implementación actual - Fase 6)
1. **Login exitoso**: `AuthForm.tsx` recibe token del backend
2. **Guardar token**: `useAuthStore.setToken(accessToken)` (persiste en localStorage)
3. **Cargar clima**: `useWeatherStore.fetchWeather(accessToken)` llama a GET /api/weather
4. **Mostrar dashboard**: `DashboardPage.tsx` renderiza `WeatherPanel` y `HelloPanel`

### Flujo técnico detallado
```
Usuario → Login Form → POST /api/auth/login
                      ↓
                  { accessToken } ← Backend (NestJS + JWT)
                      ↓
         setToken(accessToken) ← Zustand (auth.store)
                      ↓
      fetchWeather(accessToken) ← Zustand (weather.store)
                      ↓
        GET /api/weather + Bearer token
                      ↓
          { city, temperature, ... } ← Backend (OpenWeatherMap)
                      ↓
              WeatherPanel ← Mostrar en Dashboard
```

### Decisiones técnicas
- **Separación de responsabilidades**: Backend llama a OpenWeatherMap, frontend solo consume /api/weather
- **Protección JWT**: Endpoint /api/weather requiere autenticación
- **Ciudad por defecto**: La Paz, Bolivia (configurable vía query param `?city=`)
- **Zustand stores**: `auth.store` (token + localStorage), `weather.store` (datos del clima)
- **Carga del clima**: Inmediatamente después del login exitoso, no en useEffect del Dashboard

## Plan de trabajo activo

Ver [.planning/plan.md](.planning/plan.md) para el plan detallado de implementacion.

### Estado de las fases:
1. **Fase 0**: ✅ Renombrar `master` -> `main`
2. **Fase 1**: ✅ Firebase Admin + Firestore (guardar/leer usuarios)
3. **Fase 2**: ✅ API del clima (backend listo)
4. **Fase 3**: ✅ Unit tests para Firestore y Weather (55 tests, 100% coverage)
5. **Fase 4**: ✅ Mocks de Firestore y Weather para E2E (21 tests, 100% coverage)
6. **Fase 5**: ✅ GitHub Actions (UT -> E2E en cada PR)
7. **Fase 6**: 🔄 Integración Frontend - Consumo de API del clima en Dashboard
