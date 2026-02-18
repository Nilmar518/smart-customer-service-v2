# Contributing to Smart Customer Service v2

Este documento establece las convenciones y flujo de trabajo para contribuir al proyecto.

## Tabla de Contenidos

- [Conventional Commits](#conventional-commits)
- [Branching Strategy](#branching-strategy)
- [Pull Request Workflow](#pull-request-workflow)
- [Branch Protection Rules](#branch-protection-rules)
- [Ejemplos Prácticos](#ejemplos-prácticos)

---

## Conventional Commits

Seguimos el estándar [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).

### Formato del Mensaje

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Tipos Permitidos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **feat** | Nueva funcionalidad | `feat(auth): add JWT refresh token` |
| **fix** | Corrección de bug | `fix(api): resolve CORS issue` |
| **docs** | Cambios en documentación | `docs(readme): update installation steps` |
| **style** | Cambios de formato (no afectan lógica) | `style(auth): format with prettier` |
| **refactor** | Refactorización (no agrega features ni arregla bugs) | `refactor(database): extract query builder` |
| **test** | Agregar o modificar tests | `test(auth): add unit tests for signup` |
| **chore** | Tareas de mantenimiento | `chore(deps): update nestjs to v10.4` |
| **ci** | Cambios en CI/CD | `ci(github): add e2e tests to pipeline` |
| **build** | Cambios en build system | `build(docker): optimize image size` |
| **perf** | Mejoras de rendimiento | `perf(api): add caching layer` |
| **revert** | Revertir un commit anterior | `revert: feat(auth): add JWT refresh token` |

### Breaking Changes

Para cambios que rompen compatibilidad:

```
feat(api)!: remove deprecated /v1/users endpoint

BREAKING CHANGE: The /v1/users endpoint has been removed. Use /v2/users instead.
```

O agregando `!` después del tipo:

```
refactor(auth)!: change password hashing algorithm
```

### Scopes Recomendados

- `auth` - Autenticación y autorización
- `api` - Endpoints y controllers
- `database` - Configuración de base de datos
- `firestore` - Firebase/Firestore
- `weather` - API del clima
- `frontend` - Componentes React
- `store` - Zustand stores
- `ci` - GitHub Actions
- `docker` - Configuración Docker
- `deps` - Dependencias

### Reglas de Escritura

1. **Usar imperativo presente**: "add" no "added" ni "adds"
2. **Primera letra minúscula**: `feat: add feature` no `feat: Add feature`
3. **Sin punto final**: `fix: resolve bug` no `fix: resolve bug.`
4. **Máximo 72 caracteres** en el título
5. **Body opcional**: Explicar el "por qué" no el "qué"

### Ejemplos Correctos

✅ **CORRECTO**

```
feat(auth): add login endpoint

Implements JWT-based authentication with refresh tokens.
Closes #123
```

```
fix(api): prevent duplicate user registration

The signup endpoint was not checking for existing emails
before creating a new user.
```

```
chore(deps): upgrade firebase-admin to v13.6.1
```

❌ **INCORRECTO**

```
Added new feature  ❌ (no sigue formato)
feat: Added login  ❌ (pasado, no imperativo)
Feat: add login    ❌ (mayúscula)
feat: add login.   ❌ (punto final)
```

---

## Branching Strategy

Seguimos un flujo basado en **Git Flow simplificado**.

### Ramas Principales

#### `main`
- **Propósito**: Código en producción
- **Protegida**: ✅ Sí
- **Deploy**: Automático a Cloud Run
- **Merge**: Solo mediante Pull Request aprobado
- **Tests**: CI/CD debe pasar (UT + e2e)

#### `develop` (Opcional)
- **Propósito**: Integración de features antes de release
- **Protegida**: ✅ Sí
- **Merge**: Solo mediante Pull Request

### Ramas de Trabajo

#### `feature/*`
**Propósito**: Nuevas funcionalidades

**Nombrar**:
```bash
feature/<descripcion-corta>
feature/add-user-profile
feature/implement-chat
feature/frontend-weather-panel
```

**Flujo**:
```bash
git checkout main
git pull origin main
git checkout -b feature/add-user-profile

# Hacer cambios y commits
git add .
git commit -m "feat(profile): add user profile endpoint"

# Push
git push -u origin feature/add-user-profile

# Crear PR hacia main
gh pr create --base main --title "feat(profile): add user profile endpoint"
```

#### `fix/*`
**Propósito**: Corrección de bugs

**Nombrar**:
```bash
fix/<descripcion-bug>
fix/login-validation-error
fix/weather-api-timeout
fix/cors-headers
```

**Flujo**:
```bash
git checkout main
git pull origin main
git checkout -b fix/login-validation-error

git commit -m "fix(auth): validate email format before query"
git push -u origin fix/login-validation-error

gh pr create --base main --title "fix(auth): validate email format"
```

#### `hotfix/*`
**Propósito**: Correcciones urgentes en producción

**Nombrar**:
```bash
hotfix/<descripcion-urgente>
hotfix/security-patch
hotfix/database-connection
```

**Flujo**:
```bash
git checkout main
git pull origin main
git checkout -b hotfix/security-patch

git commit -m "fix(auth)!: patch JWT vulnerability"
git push -u origin hotfix/security-patch

# Crear PR de emergencia
gh pr create --base main --title "HOTFIX: patch JWT vulnerability" --label "urgent"
```

#### `test/*`
**Propósito**: Agregar o mejorar tests sin modificar código

**Nombrar**:
```bash
test/<descripcion-tests>
test/add-auth-e2e-tests
test/improve-unit-coverage
```

**Flujo**:
```bash
git checkout main
git checkout -b test/add-auth-e2e-tests

git commit -m "test(auth): add e2e tests for signup flow"
git push -u origin test/add-auth-e2e-tests
```

#### `docs/*`
**Propósito**: Cambios solo en documentación

**Nombrar**:
```bash
docs/<descripcion-doc>
docs/update-readme
docs/add-api-reference
```

#### `refactor/*`
**Propósito**: Refactorización sin cambiar funcionalidad

**Nombrar**:
```bash
refactor/<descripcion>
refactor/extract-auth-service
refactor/optimize-database-queries
```

---

## Pull Request Workflow

### 1. Crear Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/my-new-feature
```

### 2. Desarrollar con Commits Convencionales

```bash
git add src/auth/auth.service.ts
git commit -m "feat(auth): add password reset endpoint"

git add test/unit/auth.service.spec.ts
git commit -m "test(auth): add unit tests for password reset"

git add docs/API.md
git commit -m "docs(api): document password reset endpoint"
```

### 3. Push y Crear PR

```bash
git push -u origin feature/my-new-feature

# Usando GitHub CLI
gh pr create \
  --base main \
  --title "feat(auth): add password reset endpoint" \
  --body "Implements password reset via email token"
```

### 4. Validación Automática (CI)

Al crear el PR, GitHub Actions ejecuta:

✅ **CI Pipeline** (`.github/workflows/ci.yml`)
- ✅ Unit Tests (en paralelo)
- ✅ E2E Tests (en paralelo)

**Ambos deben pasar para aprobar el PR.**

### 5. Code Review

- **Al menos 1 aprobación** requerida
- **Resolver todos los comentarios** antes de merge
- **No se permite merge manual** si CI falla

### 6. Merge a Main

```bash
# Opción 1: Squash and Merge (RECOMENDADO)
# Combina todos los commits en uno solo con mensaje limpio
gh pr merge --squash --auto

# Opción 2: Merge commit
gh pr merge --merge --auto

# Opción 3: Rebase (mantiene commits individuales)
gh pr merge --rebase --auto
```

**Recomendación**: Usar **Squash and Merge** para mantener historial limpio.

### 7. Deploy Automático (CD)

Al hacer merge a `main`, se ejecuta:

✅ **CD Pipeline** (`.github/workflows/cd.yml`)
1. ✅ Generate semantic version
2. ✅ Build backend Docker image
3. ✅ Build frontend Docker image
4. ✅ Push to Google Artifact Registry
5. ✅ Deploy backend to Cloud Run
6. ✅ Deploy frontend to Cloud Run
7. ✅ Create GitHub Release

---

## Branch Protection Rules

### Configurar en GitHub

**Settings → Branches → Branch protection rules → Add rule**

#### Para `main`:

```yaml
Branch name pattern: main

✅ Require a pull request before merging
  ✅ Require approvals: 1
  ✅ Dismiss stale pull request approvals when new commits are pushed
  ✅ Require review from Code Owners (opcional)

✅ Require status checks to pass before merging
  ✅ Require branches to be up to date before merging
  Status checks required:
    - Unit Tests
    - E2E Tests
    - Commit Lint (opcional)

✅ Require conversation resolution before merging

✅ Require linear history (opcional, fuerza rebase)

✅ Do not allow bypassing the above settings

❌ Allow force pushes (NUNCA en main)
❌ Allow deletions (NUNCA en main)
```

#### Para `develop` (si se usa):

```yaml
Branch name pattern: develop

✅ Require a pull request before merging
  ✅ Require approvals: 1

✅ Require status checks to pass before merging
  Status checks required:
    - Unit Tests
    - E2E Tests

❌ Allow force pushes
❌ Allow deletions
```

---

## Ejemplos Prácticos

### Ejemplo 1: Agregar Nueva Feature

**Tarea**: Implementar panel de clima en frontend

```bash
# 1. Crear rama
git checkout main
git pull origin main
git checkout -b feature/frontend-weather-panel

# 2. Crear store
git add packages/frontend/src/stores/weather.store.ts
git commit -m "feat(frontend): add weather store with Zustand"

# 3. Crear componente
git add packages/frontend/src/components/WeatherPanel.tsx
git commit -m "feat(frontend): add WeatherPanel component"

# 4. Modificar AuthForm
git add packages/frontend/src/components/AuthForm.tsx
git commit -m "feat(frontend): fetch weather after login"

# 5. Modificar Dashboard
git add packages/frontend/src/components/DashboardPage.tsx
git commit -m "feat(frontend): display WeatherPanel in dashboard"

# 6. Push y PR
git push -u origin feature/frontend-weather-panel
gh pr create --base main --title "feat(frontend): add weather panel to dashboard"
```

### Ejemplo 2: Corregir Bug

**Tarea**: Corregir validación de email en signup

```bash
# 1. Crear rama
git checkout main
git pull origin main
git checkout -b fix/email-validation

# 2. Corregir código
git add packages/backend/src/auth/auth.service.ts
git commit -m "fix(auth): validate email format before database query"

# 3. Agregar test
git add test/unit/auth.service.spec.ts
git commit -m "test(auth): add email validation test case"

# 4. Push y PR
git push -u origin fix/email-validation
gh pr create --base main --title "fix(auth): validate email format before query"
```

### Ejemplo 3: Actualizar Dependencias

```bash
git checkout main
git checkout -b chore/update-dependencies

# Actualizar package.json
pnpm update firebase-admin@latest

git add package.json pnpm-lock.yaml
git commit -m "chore(deps): upgrade firebase-admin to v13.7.0"

git push -u origin chore/update-dependencies
gh pr create --base main --title "chore(deps): upgrade firebase-admin"
```

### Ejemplo 4: Mejorar Performance

```bash
git checkout main
git checkout -b perf/optimize-weather-api

git add packages/backend/src/weather/weather.service.ts
git commit -m "perf(weather): add Redis caching for API responses"

git add test/unit/weather.service.spec.ts
git commit -m "test(weather): add cache hit/miss tests"

git push -u origin perf/optimize-weather-api
gh pr create --base main --title "perf(weather): add Redis caching layer"
```

### Ejemplo 5: Hotfix de Producción

```bash
# Bug crítico en producción: JWT expira inmediatamente
git checkout main
git pull origin main
git checkout -b hotfix/jwt-expiration

git add packages/backend/src/auth/auth.service.ts
git commit -m "fix(auth)!: correct JWT expiration time from 15s to 15m"

git push -u origin hotfix/jwt-expiration

# PR urgente
gh pr create \
  --base main \
  --title "HOTFIX: correct JWT expiration time" \
  --label "urgent" \
  --body "Critical bug: JWT was expiring after 15 seconds instead of 15 minutes"

# Después del merge, se despliega automáticamente
```

---

## Semantic Versioning Automático

El pipeline CD genera versiones automáticamente basándose en los commits:

| Tipo de Commit | Bump de Versión | Ejemplo |
|----------------|-----------------|---------|
| `fix:` | PATCH (1.0.0 → 1.0.1) | Bug fixes |
| `feat:` | MINOR (1.0.0 → 1.1.0) | Nueva feature |
| `BREAKING CHANGE:` o `!` | MAJOR (1.0.0 → 2.0.0) | Breaking changes |

**Ejemplo de versiones generadas**:

```
v1.0.0  (inicial)
v1.0.1  fix(auth): resolve login issue
v1.1.0  feat(api): add weather endpoint
v1.1.1  fix(api): handle timeout errors
v1.2.0  feat(frontend): add dashboard
v2.0.0  refactor(auth)!: change to OAuth2
```

---

## Comandos Útiles

### Verificar formato de commits

```bash
# Ver últimos commits
git log --oneline -10

# Verificar si un mensaje es válido
echo "feat(auth): add login" | npx commitlint
```

### Limpiar ramas locales

```bash
# Ver ramas merged
git branch --merged main

# Eliminar ramas merged
git branch --merged main | grep -v "^\*\|main\|develop" | xargs -n 1 git branch -d
```

### Actualizar rama con main

```bash
# Opción 1: Rebase (RECOMENDADO, mantiene historial lineal)
git checkout feature/my-feature
git fetch origin
git rebase origin/main

# Opción 2: Merge (crea merge commit)
git checkout feature/my-feature
git merge main
```

---

## Checklist Pre-Merge

Antes de crear un Pull Request, verificar:

- [ ] Todos los commits siguen Conventional Commits
- [ ] Los tests pasan localmente (`pnpm api:tests:ut && pnpm api:tests:e2e`)
- [ ] El código sigue las convenciones del proyecto (ver [CLAUDE.md](../CLAUDE.md))
- [ ] Se agregaron tests para nueva funcionalidad
- [ ] La documentación está actualizada
- [ ] No hay archivos sensibles (.env, service-account.json)
- [ ] La rama está actualizada con `main`

---

## Recursos

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Semantic Versioning](https://semver.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [CLAUDE.md](../CLAUDE.md) - Convenciones del proyecto
- [.planning/plan.md](../.planning/plan.md) - Plan de implementación

---

## Soporte

Si tienes dudas sobre el flujo de trabajo:

1. Lee este documento completo
2. Consulta [CLAUDE.md](../CLAUDE.md)
3. Revisa ejemplos de PRs anteriores
4. Pregunta en el canal de desarrollo
