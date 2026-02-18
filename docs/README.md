# Documentación - Smart Customer Service v2

Este directorio contiene toda la documentación del proyecto relacionada con procesos, workflows y mejores prácticas.

## Índice de Documentos

### 📋 [CONTRIBUTING.md](./CONTRIBUTING.md)
**Guía completa de contribución al proyecto**

Cubre:
- ✅ Conventional Commits (formato, tipos, ejemplos)
- ✅ Branching strategy (main, develop, feature/*, fix/*, hotfix/*)
- ✅ Pull Request workflow completo
- ✅ Semantic versioning automático
- ✅ Ejemplos prácticos de flujos comunes
- ✅ Checklist pre-merge

**Cuándo leer**: Antes de crear tu primera rama o PR.

---

### 🔒 [BRANCH_PROTECTION.md](./BRANCH_PROTECTION.md)
**Configuración de Branch Protection Rules en GitHub**

Cubre:
- ✅ Paso a paso para configurar protecciones en `main`
- ✅ Configuración opcional para `develop`
- ✅ CODEOWNERS (quién aprueba qué archivos)
- ✅ Status checks requeridos (UT, E2E, Commit Lint)
- ✅ Troubleshooting común
- ✅ Comandos útiles (GitHub CLI)

**Cuándo leer**: Al configurar el repositorio o al tener problemas con merge bloqueado.

---

## Otros Documentos del Proyecto

### [../CLAUDE.md](../CLAUDE.md)
**Convenciones técnicas y comandos del proyecto**

Cubre:
- Estructura del monorepo
- Comandos pnpm
- Variables de entorno
- Flujo técnico login → clima → dashboard
- Convenciones de código TypeScript
- Estado de las fases de implementación

### [../.planning/plan.md](../.planning/plan.md)
**Plan de trabajo detallado por fases**

Cubre:
- Estado actual del proyecto
- Fases completadas (0-5)
- Fase activa (6 - Frontend Weather)
- Decisiones técnicas confirmadas
- Tareas pendientes

### [../.cursor/rules/](../.cursor/rules/)
**Reglas específicas por tecnología**

- `testing/testing-conventions.mdc` - Convenciones de tests
- `firebase/firebase-conventions.mdc` - Uso de Firebase Admin
- `weather/weather-conventions.mdc` - API del clima
- `coding-standards/types-and-models.mdc` - TypeScript types vs interfaces

---

## Flujo Rápido: Nuevo Desarrollador

### 1️⃣ Configuración Inicial

```bash
# Clonar repo
git clone <repo-url>
cd smart-customer-service-v2

# Instalar dependencias
pnpm install

# Configurar git hooks (commitlint automático)
pnpm prepare
```

### 2️⃣ Leer Documentación Esencial

1. [../CLAUDE.md](../CLAUDE.md) - Estructura y comandos
2. [CONTRIBUTING.md](./CONTRIBUTING.md) - Workflow de desarrollo
3. [../.planning/plan.md](../.planning/plan.md) - Estado del proyecto

### 3️⃣ Crear Primera Feature

```bash
# Crear rama desde main
git checkout main
git pull origin main
git checkout -b feature/mi-feature

# Desarrollar con commits convencionales
git add .
git commit -m "feat(scope): descripción"

# Push y PR
git push -u origin feature/mi-feature
gh pr create --base main --title "feat(scope): descripción"
```

### 4️⃣ Verificar CI/CD

- ✅ Unit Tests pasan
- ✅ E2E Tests pasan
- ✅ Commit Lint valida mensajes
- ✅ 1 aprobación recibida
- ✅ Merge habilitado

---

## Preguntas Frecuentes

### ¿Qué formato de commit debo usar?

Ver [CONTRIBUTING.md - Conventional Commits](./CONTRIBUTING.md#conventional-commits)

**Formato**: `<type>[scope]: <description>`

**Ejemplos**:
```
feat(auth): add password reset endpoint
fix(api): resolve CORS issue
test(auth): add unit tests for signup
docs(readme): update installation steps
```

### ¿Cómo creo un Pull Request?

Ver [CONTRIBUTING.md - Pull Request Workflow](./CONTRIBUTING.md#pull-request-workflow)

**TL;DR**:
1. Crear feature branch desde `main`
2. Commits convencionales
3. Push: `git push -u origin feature/nombre`
4. PR: `gh pr create --base main`
5. CI debe pasar (UT + E2E)
6. 1 aprobación requerida
7. Merge (preferir Squash and Merge)

### ¿Por qué mi merge está bloqueado?

Ver [BRANCH_PROTECTION.md - Troubleshooting](./BRANCH_PROTECTION.md#troubleshooting)

**Causas comunes**:
- ❌ Tests fallando (UT o E2E)
- ❌ Commits no siguen Conventional Commits
- ❌ Falta aprobación
- ❌ Conversaciones sin resolver
- ❌ Rama no actualizada con `main`

### ¿Cómo hago un hotfix urgente?

Ver [CONTRIBUTING.md - Ejemplo 5: Hotfix](./CONTRIBUTING.md#ejemplo-5-hotfix-de-producción)

**TL;DR**:
```bash
git checkout main
git checkout -b hotfix/nombre-urgente
# Fix + commit convencional
git push -u origin hotfix/nombre-urgente
gh pr create --base main --title "HOTFIX: descripción" --label "urgent"
# Merge rápido → deploy automático
```

### ¿Qué pasa después del merge a `main`?

Ver [../CLAUDE.md - Flujo de integración](../CLAUDE.md#flujo-de-integración-login--clima--dashboard)

**CD Pipeline automático**:
1. ✅ Genera versión semántica (ej: v1.2.3)
2. ✅ Build Docker images (backend + frontend)
3. ✅ Push a Google Artifact Registry
4. ✅ Deploy a Cloud Run (backend + frontend)
5. ✅ Crea GitHub Release con changelog

### ¿Dónde están los tests?

Ver [../packages/backend/CLAUDE.md](../packages/backend/CLAUDE.md)

**Ubicación**:
- Unit tests: `packages/backend/test/unit/`
- E2E tests: `packages/backend/test/e2e/`

**Ejecutar**:
```bash
pnpm api:tests:ut    # Unit tests
pnpm api:tests:e2e   # E2E tests
```

---

## Recursos Externos

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub CLI](https://cli.github.com/)

---

## Mantenimiento de Documentación

### ¿Cuándo actualizar esta documentación?

- ✅ Al cambiar el workflow de desarrollo
- ✅ Al agregar nuevas reglas o convenciones
- ✅ Al modificar los pipelines CI/CD
- ✅ Al cambiar la branching strategy

### ¿Quién puede aprobar cambios en docs/?

Ver [../.github/CODEOWNERS](../.github/CODEOWNERS)

Por defecto: `@tech-writers` y `@team-lead`
