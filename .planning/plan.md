# Plan de Trabajo - Smart Customer Service v2

## Estado Actual

- **Backend**: NestJS + PostgreSQL + JWT (TypeORM DataSource directo, sin entities)
- **Frontend**: React + Vite + Zustand
- **Tests**: Unit y E2E con Jest + Supertest, 100% coverage
- **CI/CD**: No hay GitHub Actions configuradas
- **Firebase**: No existe configuracion alguna
- **Rama principal**: `master` (se debe renombrar a `main`)

## Decisiones Confirmadas

- **Firestore**: Usaremos el proyecto Google Cloud `pure-highlander-487218-g2`
- **Service Account**: `smart-service@pure-highlander-487218-g2.iam.gserviceaccount.com`
- **Credenciales**: `packages/backend/service-account.json` (en .gitignore)
- **Ciudad del clima**: La Paz, Bolivia
- **API del clima**: OpenWeatherMap (free tier, pendiente registro de API key)
- **Cuentas**: GCP: nilmar.lutino.cline@gmail.com | Firebase: nilmar@518.rent

---

## Fases de Implementacion

### FASE 0: Preparacion del repositorio

- [ ] Renombrar rama `master` a `main` en local y en GitHub
- [ ] Verificar que el remote apunte correctamente a `main`
- [x] Actualizar `.gitignore` (excluir .env, service-account.json, credentials)
- [x] Guardar service account JSON en `packages/backend/service-account.json`
- [x] Actualizar `.env` y `.env.example` con variables de Firebase y Weather

---

### FASE 1: Integrar Firebase Admin + Firestore (Backend)

**Objetivo**: Guardar y leer usuarios de Firestore usando `firebase-admin`. No tocar el frontend.

#### 1.1 Instalar dependencias
- [ ] `pnpm --filter @smart-customer-service/backend add firebase-admin`

#### 1.2 Crear modulo Firestore
- [ ] `src/firestore/firestore.module.ts` - Modulo NestJS que inicializa Firebase Admin
- [ ] `src/firestore/firestore.service.ts` - Servicio para operaciones CRUD en Firestore
- [ ] `src/firestore/firestore.types.ts` - Tipos para documentos de Firestore

**Inicializacion de Firebase Admin**:
```typescript
import * as admin from 'firebase-admin';
import serviceAccount from '../../service-account.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  projectId: 'pure-highlander-487218-g2',
});

const db = admin.firestore();
```

**Metodos del FirestoreService**:
- `saveUser(data: FirestoreUser): Promise<void>` - Guarda usuario en coleccion 'users'
- `getUserByEmail(email: string): Promise<FirestoreUser | null>` - Busca por email
- `getUserById(id: string): Promise<FirestoreUser | null>` - Busca por ID (document ID)

#### 1.3 Modificar AuthService
- [ ] Despues de crear un usuario en PostgreSQL, tambien guardarlo en Firestore
- [ ] Al hacer login, leer datos adicionales desde Firestore (opcional, para verificar sync)
- [ ] Inyectar `FirestoreService` en `AuthService`

#### 1.4 Variables de entorno (YA CONFIGURADAS)
- [x] `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json`
- [x] `FIREBASE_PROJECT_ID=pure-highlander-487218-g2`

**Archivos a crear**:
- `packages/backend/src/firestore/firestore.module.ts`
- `packages/backend/src/firestore/firestore.service.ts`
- `packages/backend/src/firestore/firestore.types.ts`

**Archivos a modificar**:
- `packages/backend/src/app.module.ts` (importar FirestoreModule)
- `packages/backend/src/auth/auth.service.ts` (inyectar FirestoreService)
- `packages/backend/package.json` (nueva dependencia firebase-admin)

---

### FASE 2: Integrar API del Clima (Backend)

**Objetivo**: Endpoint que devuelva el clima actual. Ciudad por defecto: La Paz, Bolivia.

#### 2.1 Dependencias
- [ ] Usar `fetch` nativo de Node 18+ (no requiere dependencias adicionales)

#### 2.2 Crear modulo Weather
- [ ] `src/weather/weather.module.ts`
- [ ] `src/weather/weather.service.ts` - Llama a OpenWeatherMap API
- [ ] `src/weather/weather.controller.ts` - `GET /api/weather?city=La Paz` (protegido con JWT)
- [ ] `src/weather/weather.types.ts` - Tipos para la respuesta

**API**: OpenWeatherMap free tier
- Endpoint: `https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric&lang=es`

#### 2.3 Integracion
- El frontend llama a `GET /api/weather` despues del login (separacion de responsabilidades)
- El endpoint esta protegido con AuthGuard (JWT)
- Si no se pasa `city`, usa `WEATHER_DEFAULT_CITY` (La Paz)

#### 2.4 Variables de entorno (YA CONFIGURADAS)
- [x] `WEATHER_API_KEY=pending` (requiere registro en OpenWeatherMap)
- [x] `WEATHER_DEFAULT_CITY=La Paz`

**Archivos a crear**:
- `packages/backend/src/weather/weather.module.ts`
- `packages/backend/src/weather/weather.service.ts`
- `packages/backend/src/weather/weather.controller.ts`
- `packages/backend/src/weather/weather.types.ts`

**Archivos a modificar**:
- `packages/backend/src/app.module.ts` (importar WeatherModule)

---

### FASE 3: Tests Unitarios (UT) para nuevos modulos

**Objetivo**: Tests unitarios para FirestoreService y WeatherService con mocks.

#### 3.1 Tests unitarios de FirestoreService
- [ ] `test/unit/firestore.service.spec.ts`
- Mockear `firebase-admin` (Firestore collections, docs, get, set)
- Probar: saveUser, getUserByEmail, getUserById
- Probar: manejo de errores (usuario no encontrado)

#### 3.2 Tests unitarios de WeatherService
- [ ] `test/unit/weather.service.spec.ts`
- Mockear `global.fetch` o el metodo HTTP usado
- Probar: respuesta exitosa, ciudad no encontrada, API key invalida

#### 3.3 Tests unitarios de WeatherController
- [ ] `test/unit/weather.controller.spec.ts`
- Mockear WeatherService
- Probar: respuesta correcta, parametro city opcional

#### 3.4 Actualizar tests existentes de AuthService
- [ ] `test/unit/auth.service.spec.ts` - Agregar mock de FirestoreService
- Probar que signUp tambien llama a FirestoreService.saveUser
- Probar que funciona incluso si Firestore falla (graceful degradation)

#### 3.5 Verificar cobertura al 100%
- [ ] Ejecutar `pnpm api:tests:ut` y verificar que pase con 100% coverage

---

### FASE 4: Mocks para E2E Tests

**Objetivo**: Los e2e deben funcionar sin Firestore real ni API del clima real.

#### 4.1 Mock de Firestore para E2E
- [ ] Crear `test/helpers/mock-firestore.ts`
- Mock del FirestoreService completo (no de firebase-admin)
- Usar Map en memoria para simular la coleccion 'users'
- Exportar: `createMockFirestoreService()`, `clearFirestoreStore()`

#### 4.2 Mock de Weather API para E2E
- [ ] Crear `test/helpers/mock-weather.ts`
- Mock del WeatherService que devuelve datos fijos de La Paz
- Exportar: `createMockWeatherService()`

#### 4.3 Actualizar test-app.ts
- [ ] Registrar mocks de FirestoreService y WeatherService en el TestingModule
- [ ] Agregar WeatherController al modulo de test

#### 4.4 Nuevos tests E2E
- [ ] `test/e2e/weather.e2e.spec.ts` - Probar GET /api/weather con y sin JWT
- [ ] Actualizar `test/e2e/auth.e2e.spec.ts` - Verificar que signup guarda en mock Firestore

#### 4.5 Verificar cobertura
- [ ] Ejecutar `pnpm api:tests:e2e` y verificar que pase

---

### FASE 5: GitHub Actions (CI/CD)

**Objetivo**: Al crear un PR hacia `main`, correr UT primero y luego E2E.

#### 5.1 Workflow CI (un solo archivo con dos jobs secuenciales)
- [ ] `.github/workflows/ci.yml`

```yaml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm api:tests:ut

  e2e-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm api:tests:e2e
```

**Nota**: `needs: unit-tests` garantiza que E2E solo corre si UT pasa primero.

---

### FASE 6: Flujo de ramas y PR

#### 6.1 Estructura de ramas
- `main` - Rama principal (protegida)
- `feature/add-firebase-users` - Fase 1
- `feature/add-weather-api` - Fase 2
- `feature/add-unit-tests` - Fase 3
- `feature/add-e2e-mocks` - Fase 4
- `feature/add-github-actions` - Fase 5

#### 6.2 Flujo de trabajo
1. Crear branch desde `main`: `git checkout -b feature/xxx`
2. Desarrollar y commitear
3. Push: `git push -u origin feature/xxx`
4. Crear PR en GitHub: `gh pr create --base main`
5. La GitHub Action corre UT -> E2E
6. Merge a `main` cuando pase todo

---

### FASE 6: Integración Frontend - API del Clima

**Objetivo**: Consumir el endpoint `/api/weather` desde el frontend después del login y mostrar la información del clima en el dashboard.

#### 6.1 Crear store de clima (Zustand)
- [ ] `packages/frontend/src/stores/weather.store.ts`
  - Estado: `weatherData`, `isLoading`, `error`
  - Acciones: `fetchWeather(token)`, `clearWeather()`
  - Tipo: `WeatherData` con campos: city, temperature, description, icon, humidity, windSpeed

#### 6.2 Crear componente WeatherPanel
- [ ] `packages/frontend/src/components/WeatherPanel.tsx`
  - Muestra la información del clima de forma visual
  - Usa el store `useWeatherStore`
  - Maneja estados de loading y error
  - Diseño simple: temperatura + descripción + ciudad

#### 6.3 Modificar AuthForm
- [ ] `packages/frontend/src/components/AuthForm.tsx`
  - Después del login exitoso (`setToken(data.accessToken)`), llamar a `fetchWeather(data.accessToken)`
  - Asegurar que el clima se carga inmediatamente después de la autenticación

#### 6.4 Modificar DashboardPage
- [ ] `packages/frontend/src/components/DashboardPage.tsx`
  - Importar y renderizar `<WeatherPanel />` junto a `<HelloPanel />`
  - Mantener la estructura de tabs existente

#### 6.5 Flujo completo
1. Usuario hace login → AuthForm POST /api/auth/login
2. Backend responde con `{ accessToken: "..." }`
3. Frontend guarda token en Zustand: `setToken(accessToken)`
4. Frontend llama a `fetchWeather(accessToken)` → GET /api/weather con header `Authorization: Bearer {token}`
5. Backend responde con datos del clima (La Paz por defecto)
6. Frontend guarda en `weatherStore` y muestra en `WeatherPanel`

**Archivos a crear**:
- `packages/frontend/src/stores/weather.store.ts`
- `packages/frontend/src/components/WeatherPanel.tsx`

**Archivos a modificar**:
- `packages/frontend/src/components/AuthForm.tsx`
- `packages/frontend/src/components/DashboardPage.tsx`

---

## Orden de Ejecucion

| # | Fase | Branch | Dependencia | Estado |
|---|------|--------|-------------|--------|
| 0 | Preparacion repo | (directo) | - | ✅ COMPLETADO |
| 1 | Firebase Admin + Firestore | `feature/add-firebase-users` | Fase 0 | ✅ COMPLETADO |
| 2 | API del Clima | `feature/add-weather-api` | Fase 0 | ✅ COMPLETADO |
| 3 | Unit Tests nuevos | `feature/add-unit-tests` | Fases 1, 2 | ✅ COMPLETADO |
| 4 | Mocks E2E | `feature/add-e2e-mocks` | Fases 1, 2 | ✅ COMPLETADO |
| 5 | GitHub Actions | `feature/add-github-actions` | Fase 0 | ✅ COMPLETADO |
| 6 | Integración Frontend Clima | `feature/frontend-weather` | Fases 2, 5 | 🔄 EN PROGRESO |

---

## Pendientes por el usuario

1. ~~**WEATHER_API_KEY**: Registrarse en OpenWeatherMap y obtener API key gratuita~~ HECHO (key puede tardar ~2h en activarse)
2. ~~**Habilitar Firestore**: Verificar que Firestore este habilitado~~ HECHO (Firestore Native, us-east1, free tier)
3. **Rotar private key**: Despues de terminar, rotar el service account key desde GCP Console
