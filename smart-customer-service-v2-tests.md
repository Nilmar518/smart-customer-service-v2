# Prompt para generar tests, `.cursor/rules` y `CLAUDE.md` en smart-customer-service-v2

> Usa este documento como prompt en el repositorio `smart-customer-service-v2` para que se generen los tests unitarios y e2e del backend **sin modificar el código fuente existente en `src/`**.

---

## Contexto general

Este es un monorepo con pnpm workspaces que tiene un backend NestJS en `packages/backend/` y un frontend React/Vite en `packages/frontend/`. **Solo vas a trabajar sobre el backend.**

El backend es un sistema de autenticación simple con:

- **Framework**: NestJS 10 con TypeScript
- **Base de datos**: PostgreSQL con TypeORM (solo `DataSource` para queries SQL crudos, NO usa entidades TypeORM ni repositorios TypeORM)
- **Autenticación**: JWT (signup, login, guard con Bearer token)
- **Gestor de paquetes**: pnpm
- **Puerto**: 8080
- **Prefijo global**: `/api`

**Regla fundamental: NO modifiques ningún archivo dentro de `packages/backend/src/`. Solo crea archivos nuevos (tests, configuraciones, documentación).**

---

## Arquitectura actual del backend

```
packages/backend/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── .env
└── src/
    ├── main.ts                        # Bootstrap: puerto 8080, prefix /api, CORS
    ├── app.module.ts                  # Importa: DatabaseModule, AuthModule, HelloModule
    ├── auth/
    │   ├── auth.module.ts             # Importa JwtModule, provee AuthService + AuthGuard, exporta AuthGuard + JwtModule
    │   ├── auth.controller.ts         # POST /api/auth/signup, POST /api/auth/login
    │   ├── auth.service.ts            # signUp(), login(), hashPassword(), verifyPassword(), signToken()
    │   ├── auth.guard.ts              # CanActivate: valida Bearer token con JwtService.verify()
    │   └── auth.types.ts              # SignUpDto, LoginDto (types, no clases con class-validator)
    ├── database/
    │   ├── database.module.ts         # TypeOrmModule.forRoot() con PostgreSQL
    │   └── database-init.service.ts   # OnApplicationBootstrap: crea tabla users con SQL crudo
    └── hello/
        ├── hello.module.ts            # Importa AuthModule (para usar AuthGuard)
        └── hello.controller.ts        # GET /api/hello (protegido), POST /api/hello (público)
```

### Endpoints

| Método | Ruta | Auth | Body | Respuesta |
|--------|------|------|------|-----------|
| POST | `/api/auth/signup` | No | `{ email, password, firstName?, lastName? }` | `{ user: {...}, accessToken }` |
| POST | `/api/auth/login` | No | `{ email, password }` | `{ user: {...}, accessToken }` |
| GET | `/api/hello` | Bearer token | — | `{ message: "Hello world" }` |

### Lógica de negocio del AuthService

- **signUp**: trim + lowercase del email, valida que email y password existan y password >= 8 chars, verifica que el email no exista en BD (query SQL), hashea password con scrypt + salt aleatorio, inserta en BD con SQL crudo, genera JWT y retorna user + token.
- **login**: trim + lowercase del email, valida que email y password existan, busca usuario por email en BD (query SQL), verifica password con scrypt + timingSafeEqual, genera JWT y retorna user + token.
- **hashPassword**: genera salt random de 16 bytes, hashea con scryptSync, retorna `salt.hash` en hex.
- **verifyPassword**: separa salt y hash del string almacenado, hashea el password de entrada con el mismo salt, compara con timingSafeEqual.
- **signToken**: usa JwtService.sign con payload `{ sub: userId, email }`.

### Lógica del AuthGuard

- Extrae header `Authorization`, valida que sea `Bearer <token>`, verifica el token con `JwtService.verify()`.
- Si no hay token: `UnauthorizedException('Missing token')`.
- Si el token es inválido: `UnauthorizedException('Invalid token')`.
- Si es válido: asigna `request.user = payload` y retorna `true`.

### Dependencias actuales del backend (package.json)

```json
{
  "dependencies": {
    "@nestjs/common": "^10.4.0",
    "@nestjs/core": "^10.4.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/platform-express": "^10.4.0",
    "@nestjs/typeorm": "^10.0.0",
    "dotenv": "^16.4.5",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.12.0",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "typeorm": "^0.3.28"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.11.30",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
```

### tsconfig.json actual

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "moduleResolution": "node",
    "rootDir": "src",
    "outDir": "dist",
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Lo que debes generar

### 1. Instalar dependencias de testing (como devDependencies)

Agrega al `packages/backend/package.json` las siguientes devDependencies (sin modificar las dependencies existentes):

- `jest`
- `ts-jest`
- `@types/jest`
- `@nestjs/testing`
- `supertest`
- `@types/supertest`

### 2. Crear configuración de Jest

Crea dos archivos de configuración de Jest en `packages/backend/`:

#### `jest.unit.config.ts`

- Preset: `ts-jest`
- Test match: `test/unit/**/*.spec.ts`
- Coverage sobre `src/` excluyendo `main.ts`
- Coverage threshold: 100% (statements, branches, functions, lines)

#### `jest.e2e.config.ts`

- Preset: `ts-jest`
- Test match: `test/e2e/**/*.spec.ts`
- Coverage sobre `src/` excluyendo `main.ts` y `database/` (los e2e no levantan PostgreSQL real)
- Coverage threshold: 100% para lo que cubran

### 3. Agregar scripts de test

En `packages/backend/package.json` agregar:

```json
"test:ut": "jest --config jest.unit.config.ts --coverage",
"test:e2e": "jest --config jest.e2e.config.ts --coverage"
```

En el `package.json` raíz del monorepo agregar:

```json
"api:tests:ut": "pnpm --filter @smart-customer-service/backend test:ut",
"api:tests:e2e": "pnpm --filter @smart-customer-service/backend test:e2e"
```

### 4. Crear tests unitarios en `packages/backend/test/unit/`

**Importante**: el backend usa `DataSource.query()` directamente (SQL crudo), NO usa repositorios TypeORM. Los mocks deben mockear `DataSource` y `JwtService`.

#### `auth.service.spec.ts`

Tests del AuthService mockeando `DataSource` y `JwtService`:

**signUp:**
- Debe crear usuario correctamente con todos los campos
- Debe crear usuario solo con email y password (firstName y lastName opcionales)
- Debe hacer trim y lowercase del email
- Debe lanzar `BadRequestException` si falta email
- Debe lanzar `BadRequestException` si falta password
- Debe lanzar `BadRequestException` si password tiene menos de 8 caracteres
- Debe lanzar `BadRequestException` si el email ya existe en BD
- Debe retornar `{ user, accessToken }`

**login:**
- Debe hacer login correctamente y retornar user + token
- Debe hacer trim y lowercase del email
- Debe lanzar `BadRequestException` si falta email
- Debe lanzar `BadRequestException` si falta password
- Debe lanzar `UnauthorizedException` si el email no existe
- Debe lanzar `UnauthorizedException` si el password es incorrecto

**hashPassword y verifyPassword (métodos privados, testar indirectamente):**
- Se pueden testar indirectamente a través de signUp + login: crear un usuario y luego verificar que el password funciona en login
- O si necesitas cubrir branches específicos de `verifyPassword` (como el caso donde `stored.split('.')` no tiene salt o hash, o donde los buffers tienen longitudes distintas), puedes acceder a los métodos privados via `(service as any).verifyPassword(...)` para cubrir esas ramas

#### `auth.guard.spec.ts`

Tests del AuthGuard mockeando `JwtService`:

- Debe lanzar `UnauthorizedException('Missing token')` si no hay header Authorization
- Debe lanzar `UnauthorizedException('Missing token')` si el header no empieza con `Bearer`
- Debe lanzar `UnauthorizedException('Invalid token')` si el token es inválido (jwtService.verify lanza error)
- Debe retornar `true` y asignar `request.user` si el token es válido
- Debe lanzar `UnauthorizedException('Missing token')` si el token está vacío después de `Bearer `

#### `hello.controller.spec.ts`

Tests del HelloController:

- `getHello()` debe retornar `{ message: 'Hello world' }`

#### `database-init.service.spec.ts`

Tests del DatabaseInitService mockeando `DataSource`:

- Debe ejecutar `SELECT 1` para verificar conexión
- Debe crear la tabla users si no existe
- Debe ejecutar ALTER TABLE para agregar columnas
- Si `CLEAN_DB_ON_START === 'true'`, debe ejecutar DROP SCHEMA + CREATE SCHEMA + GRANTs
- Si `CLEAN_DB_ON_START` no es `'true'`, no debe ejecutar cleanSchema

### 5. Crear tests e2e en `packages/backend/test/e2e/`

**Reto importante**: el backend depende de PostgreSQL real. Para los tests e2e hay dos estrategias:

**Estrategia recomendada**: Crear un `TestAppModule` que reemplace `DatabaseModule` por un mock de `DataSource` en memoria. Así no necesitas PostgreSQL corriendo para los tests.

#### `auth.e2e.spec.ts`

Levanta la app NestJS en modo test con el módulo mockeado:

**POST /api/auth/signup:**
- Debe crear un usuario y retornar 201 con `{ user, accessToken }`
- Debe retornar 400 si falta email
- Debe retornar 400 si falta password
- Debe retornar 400 si password es menor a 8 caracteres
- Debe retornar 400 si el email ya existe

**POST /api/auth/login:**
- Debe hacer login y retornar 200 con `{ user, accessToken }`
- Debe retornar 400 si falta email o password
- Debe retornar 401 si el email no existe
- Debe retornar 401 si el password es incorrecto

#### `hello.e2e.spec.ts`

**GET /api/hello:**
- Debe retornar 401 sin token
- Debe retornar 401 con token inválido
- Debe retornar 200 con `{ message: 'Hello world' }` con token válido (obtener token haciendo signup primero)

### 6. Crear helper para tests e2e

Crea un archivo `packages/backend/test/helpers/test-app.ts` que:

- Cree un módulo de testing que use `Test.createTestingModule`
- Reemplace el `DataSource` real por un mock que simule las queries SQL con un Map en memoria
- El mock de DataSource debe interpretar las queries SQL básicas que usa el AuthService:
  - `SELECT id FROM users WHERE email = $1` → buscar en el Map
  - `INSERT INTO users ... RETURNING ...` → insertar en el Map y retornar
  - `SELECT id, email, password, first_name, last_name FROM users WHERE email = $1` → buscar en el Map
  - Las queries de DatabaseInitService (`SELECT 1`, `CREATE TABLE`, `ALTER TABLE`, `DROP SCHEMA`, etc.) → retornar vacío/ok
- Configure el prefix global `/api`
- Exporte la función para crear la app de test y el Map de usuarios para poder limpiarlo entre tests

### 7. Crear `.cursor/rules/`

Crea la carpeta `.cursor/rules/` **en la raíz del monorepo** con estos archivos:

#### `coding-standards/types-and-models.mdc`

```md
---
description: Types & models
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: true
---
```

- Usar `type` en vez de `interface` (como ya hace el proyecto en `auth.types.ts`)
- No usar `enum`, usar objetos `as const` + union de valores
- Sufijos: `*.types.ts` para DTOs y tipos, `*.entity.ts` para entidades
- Nombres de tipos en PascalCase

#### `coding-standards/function-returns.mdc`

```md
---
description: Function returns & style
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: true
---
```

- Siempre indicar tipo de retorno explícito
- `async` siempre devuelve `Promise<T>`
- Funciones que no retornan nada: `: void`

#### `coding-standards/functional-patterns.mdc`

```md
---
description: Functional patterns
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: true
---
```

- Preferir funciones puras y no mutar datos
- Componer funciones pequeñas
- Lógica en servicios, no en controladores

#### `coding-standards/export-style.mdc`

```md
---
description: Export style
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: true
---
```

- Usar ESM (`import`/`export`)
- Usar named exports, no `export default`

#### `coding-standards/comments.mdc`

```md
---
description: Comments
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: true
---
```

- Comentar el "por qué", no lo obvio
- JSDoc en funciones públicas o complejas

#### `coding-standards/syntax-and-formatting.mdc`

```md
---
description: Syntax & formatting
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: true
---
```

- 2 espacios de indentación
- `camelCase` para variables/funciones, `PascalCase` para tipos/clases
- Comillas simples

#### `testing/testing-conventions.mdc`

```md
---
description: Testing conventions
globs: ["**/*.spec.ts"]
alwaysApply: true
---
```

- Tests unitarios en `packages/backend/test/unit/`
- Tests e2e en `packages/backend/test/e2e/`
- Nombrar archivos: `<nombre>.spec.ts` para unitarios, `<nombre>.e2e.spec.ts` para e2e
- Usar `describe` para agrupar por clase/método
- Usar `it('should ...')` para cada caso
- Mockear dependencias externas (BD, servicios externos) en tests unitarios
- En tests e2e, usar módulo de test que reemplace la BD real

### 8. Crear `CLAUDE.md`

Crea un `CLAUDE.md` en la raíz del monorepo con:

```md
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
```

### 9. Crear un `tsconfig.json` para tests (si es necesario)

Si Jest con ts-jest necesita compilar archivos de test que están fuera de `src/`, crea un `packages/backend/tsconfig.test.json` que extienda del `tsconfig.json` pero incluya también `test/**/*.ts`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": "."
  },
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

Y referéncialos en las configs de Jest con `tsconfig: 'tsconfig.test.json'` en el transform de ts-jest.

---

## Validación final

Antes de terminar:

1. **NO debe haber cambios en `packages/backend/src/`** — solo archivos nuevos fuera de `src/`.
2. Los únicos archivos existentes que puedes modificar son:
   - `packages/backend/package.json` (agregar devDependencies y scripts)
   - `package.json` raíz (agregar scripts de test)
3. Ejecuta:
   - `pnpm api:tests:ut`
   - `pnpm api:tests:e2e`
   y asegúrate de que:
   - Todos los tests pasen
   - La cobertura sea lo más alta posible (idealmente 100%) para `auth/`, `hello/` y `database/`
4. Si algún branch de los métodos privados (`verifyPassword` con stored malformado, buffers de diferente length) es difícil de cubrir indirectamente, accede vía `(service as any).methodName()` solo para esos edge cases.

---

## Entregables esperados

Tu entrega debe ser el repo modificado con:

- `.cursor/rules/` completos en la raíz
- `CLAUDE.md` en la raíz de packages\backend
- `packages/backend/test/unit/` con tests unitarios completos
- `packages/backend/test/e2e/` con tests e2e completos
- `packages/backend/test/helpers/` con el helper de test app
- Configs de Jest (`jest.unit.config.ts`, `jest.e2e.config.ts`)
- `tsconfig.test.json` si es necesario
- Scripts `pnpm api:tests:ut` y `pnpm api:tests:e2e` funcionando
- **Ningún archivo de `packages/backend/src/` modificado**
