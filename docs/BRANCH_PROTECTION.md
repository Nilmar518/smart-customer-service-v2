# Branch Protection Rules

Esta guía explica cómo configurar las reglas de protección de ramas en GitHub para garantizar la calidad y seguridad del código.

## Tabla de Contenidos

- [Configuración para `main`](#configuración-para-main)
- [Configuración para `develop` (opcional)](#configuración-para-develop-opcional)
- [Verificación de Configuración](#verificación-de-configuración)
- [CODEOWNERS](#codeowners)
- [Status Checks Requeridos](#status-checks-requeridos)

---

## Configuración para `main`

### Paso 1: Acceder a Branch Protection Rules

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (⚙️)
3. En el menú lateral, click en **Branches**
4. Click en **Add branch protection rule**

### Paso 2: Pattern de la Rama

```
Branch name pattern: main
```

### Paso 3: Configurar Protecciones

#### ✅ Require a pull request before merging

**Activa esta opción** y configura:

- [x] **Require approvals**: `1`
  - Número mínimo de aprobaciones requeridas

- [x] **Dismiss stale pull request approvals when new commits are pushed**
  - Invalida aprobaciones anteriores si se pushean nuevos commits

- [x] **Require review from Code Owners**
  - Solo si tienes archivo CODEOWNERS configurado (ver sección [CODEOWNERS](#codeowners))

- [ ] **Restrict who can dismiss pull request reviews**
  - Opcional: Solo administradores pueden descartar reviews

- [x] **Allow specified actors to bypass required pull requests**
  - Desactivado (nadie debe hacer bypass)

#### ✅ Require status checks to pass before merging

**Activa esta opción** y configura:

- [x] **Require branches to be up to date before merging**
  - Obliga a que la rama esté actualizada con `main` antes del merge

**Status checks required** (selecciona los siguientes):

- `Unit Tests` - Desde [.github/workflows/ci.yml](.github/workflows/ci.yml)
- `E2E Tests` - Desde [.github/workflows/ci.yml](.github/workflows/ci.yml)
- `Validate Commit Messages` (opcional) - Desde [.github/workflows/commit-lint.yml](.github/workflows/commit-lint.yml)

**Cómo agregar status checks**:
1. Después de crear la regla, los status checks aparecerán después de la primera ejecución del workflow
2. Busca "Unit Tests" y "E2E Tests" en la lista
3. Marca ambos como requeridos

#### ✅ Require conversation resolution before merging

**Activa esta opción**:

- [x] **All conversations on code must be resolved before a pull request can be merged**
  - Obliga a resolver todos los comentarios antes del merge

#### ⚠️ Require signed commits (Opcional)

- [ ] **Require signed commits**
  - Solo si tu equipo usa GPG signing

#### ⚠️ Require linear history (Opcional)

- [ ] **Require linear history**
  - Fuerza rebase en lugar de merge commits
  - **Recomendado**: Dejar desactivado y usar "Squash and Merge"

#### ✅ Require deployments to succeed before merging (Opcional)

- [ ] **Require deployments to succeed before merging**
  - Solo si tienes entornos de staging configurados

#### ✅ Lock branch

- [ ] **Lock branch**
  - **NO ACTIVAR**: Esto haría la rama completamente read-only

#### ❌ Do not allow bypassing the above settings

**Activa esta opción**:

- [x] **Do not allow bypassing the above settings**
  - Ni siquiera administradores pueden hacer bypass
  - **CRÍTICO**: Asegura que nadie pueda saltarse las reglas

#### ❌ Allow force pushes

**NUNCA activar en `main`**:

- [ ] **Allow force pushes**
  - ❌ DESACTIVADO
  - Force push puede sobrescribir historial y causar pérdida de datos

#### ❌ Allow deletions

**NUNCA activar en `main`**:

- [ ] **Allow deletions**
  - ❌ DESACTIVADO
  - Previene eliminación accidental de la rama `main`

### Paso 4: Guardar Configuración

Click en **Create** o **Save changes**

---

## Configuración para `develop` (Opcional)

Si usas una rama `develop` para integración antes de producción:

### Branch name pattern

```
Branch name pattern: develop
```

### Protecciones Recomendadas

- [x] **Require a pull request before merging**
  - Require approvals: `1`
  - Dismiss stale pull request approvals when new commits are pushed

- [x] **Require status checks to pass before merging**
  - Require branches to be up to date before merging
  - Status checks: `Unit Tests`, `E2E Tests`

- [x] **Require conversation resolution before merging**

- [ ] **Do not allow bypassing the above settings**
  - Opcional: Puedes permitir bypass en `develop` para mayor flexibilidad

- [ ] **Allow force pushes**
  - ❌ DESACTIVADO en `develop` también

- [ ] **Allow deletions**
  - ❌ DESACTIVADO

---

## Verificación de Configuración

### Comando para verificar protecciones (GitHub CLI)

```bash
# Ver reglas de main
gh api repos/:owner/:repo/branches/main/protection

# Ver reglas de develop
gh api repos/:owner/:repo/branches/develop/protection
```

### Verificar manualmente

1. Ve a **Settings → Branches**
2. Deberías ver:

```
Branch protection rules
main
  ✓ Require pull request reviews before merging
  ✓ Require status checks to pass before merging
  ✓ Require conversation resolution before merging
  ✓ Do not allow bypassing
  ✓ Restrict force pushes
  ✓ Restrict deletions
```

### Probar las protecciones

1. Intenta hacer push directo a `main`:
   ```bash
   git checkout main
   echo "test" >> README.md
   git add .
   git commit -m "test: direct push"
   git push origin main
   ```

   **Resultado esperado**:
   ```
   remote: error: GH006: Protected branch update failed for refs/heads/main.
   remote: error: Changes must be made through a pull request.
   ```

2. Crear un PR sin tests pasando:
   - Modifica código y crea PR
   - El botón "Merge pull request" debe estar deshabilitado
   - Debe mostrar: "Required status check 'Unit Tests' has not succeeded"

---

## CODEOWNERS

Configura quién debe aprobar cambios en archivos específicos.

### Crear archivo CODEOWNERS

Ubicación: `.github/CODEOWNERS`

```bash
# Backend
/packages/backend/           @team-backend @lead-backend
/packages/backend/src/auth/  @security-team

# Frontend
/packages/frontend/          @team-frontend @lead-frontend

# Infrastructure
/.github/workflows/          @devops-team @lead-devops
/Dockerfile                  @devops-team
/docker-compose.yml          @devops-team

# Docs
/docs/                       @tech-writers @lead-devops
/README.md                   @tech-writers

# CI/CD
/.github/workflows/ci.yml    @devops-team
/.github/workflows/cd.yml    @devops-team @lead-devops

# Database
/packages/backend/src/database/  @dba-team @lead-backend

# Tests
/test/                       @qa-team @team-backend
```

### Ejemplo con usuarios reales

```bash
# Ejemplo si tu equipo tiene estos usuarios:

# Backend - Requiere aprobación de al menos un dev backend
/packages/backend/ @johndoe @janedoe

# Workflows - Solo DevOps puede aprobar
/.github/workflows/ @devops-lead

# Todo lo demás - Cualquier desarrollador
* @team-developers
```

### Activar CODEOWNERS en Branch Protection

1. Ve a **Settings → Branches → main**
2. En "Require pull request reviews before merging"
3. Activa: **Require review from Code Owners**

### Verificar CODEOWNERS

```bash
# Ver quién es owner de un archivo
gh api repos/:owner/:repo/contents/.github/CODEOWNERS
```

---

## Status Checks Requeridos

Los siguientes workflows deben pasar antes de merge:

### 1. Unit Tests
**Workflow**: [.github/workflows/ci.yml](.github/workflows/ci.yml)
**Job**: `unit-tests`
**Comando**: `pnpm api:tests:ut`

**Qué valida**:
- ✅ Tests unitarios de servicios
- ✅ Tests de controllers
- ✅ Tests de guards
- ✅ 100% code coverage (excluyendo `*.module.ts` y `main.ts`)

### 2. E2E Tests
**Workflow**: [.github/workflows/ci.yml](.github/workflows/ci.yml)
**Job**: `e2e-tests`
**Comando**: `pnpm api:tests:e2e`

**Qué valida**:
- ✅ Tests end-to-end de endpoints
- ✅ Integración de servicios
- ✅ 100% code coverage de flujos E2E

### 3. Commit Lint (Opcional)
**Workflow**: [.github/workflows/commit-lint.yml](.github/workflows/commit-lint.yml)
**Job**: `commitlint`

**Qué valida**:
- ✅ Todos los commits siguen Conventional Commits
- ✅ Tipos válidos (feat, fix, docs, etc.)
- ✅ Formato correcto del mensaje

---

## Configuración Recomendada: Resumen Visual

### Para `main` (Producción)

| Protección | Estado | Configuración |
|------------|--------|---------------|
| Require PR | ✅ Activo | Min. 1 approval |
| Status checks | ✅ Activo | Unit Tests, E2E Tests |
| Dismiss stale approvals | ✅ Activo | Sí |
| Up to date before merge | ✅ Activo | Sí |
| Conversation resolution | ✅ Activo | Sí |
| Bypass settings | ❌ Bloqueado | Nadie puede bypass |
| Force push | ❌ Bloqueado | Nunca permitir |
| Deletions | ❌ Bloqueado | Nunca permitir |
| Code Owners | ⚠️ Opcional | Si tienes CODEOWNERS |
| Signed commits | ⚠️ Opcional | Si usas GPG |

### Para `develop` (Staging)

| Protección | Estado | Configuración |
|------------|--------|---------------|
| Require PR | ✅ Activo | Min. 1 approval |
| Status checks | ✅ Activo | Unit Tests, E2E Tests |
| Dismiss stale approvals | ✅ Activo | Sí |
| Up to date before merge | ✅ Activo | Sí |
| Conversation resolution | ✅ Activo | Sí |
| Bypass settings | ⚠️ Flexible | Opcional permitir |
| Force push | ❌ Bloqueado | Nunca permitir |
| Deletions | ❌ Bloqueado | Nunca permitir |

---

## Troubleshooting

### Problema: No puedo hacer merge aunque los tests pasen

**Causa**: Los status checks no están marcados como "required"

**Solución**:
1. Ve a Settings → Branches → main
2. Edita la regla
3. En "Require status checks", busca "Unit Tests" y "E2E Tests"
4. Márcalos como required
5. Guarda cambios

### Problema: El botón de merge sigue habilitado aunque falle CI

**Causa**: "Require status checks to pass" no está activado

**Solución**:
1. Ve a Settings → Branches → main
2. Activa "Require status checks to pass before merging"
3. Marca "Require branches to be up to date"

### Problema: Necesito hacer un hotfix urgente pero las reglas me bloquean

**Solución correcta**:
1. **NO desactives las protecciones**
2. Crea una rama `hotfix/nombre-del-fix`
3. Haz el fix y commitea con formato correcto
4. Crea PR hacia `main`
5. Los tests se ejecutarán automáticamente
6. Aprueba el PR (1 aprobación)
7. Merge (será rápido si los tests pasan)
8. El deploy a producción será automático

**Solución INCORRECTA** ❌:
- Desactivar temporalmente branch protection
- Hacer push directo a `main`
- Saltarse los tests

### Problema: Los administradores no pueden hacer bypass

**Causa**: "Do not allow bypassing the above settings" está activado

**Decisión**:
- ✅ **Mantener activado**: Mejor práctica, ni siquiera admins pueden bypass
- ⚠️ **Desactivar solo si es absolutamente necesario**: Permite a admins hacer bypass en emergencias críticas

---

## Comandos Útiles

### Listar todas las branch protection rules

```bash
gh api repos/:owner/:repo/branches --jq '.[].name'
```

### Ver protección de una rama específica

```bash
gh api repos/:owner/:repo/branches/main/protection
```

### Actualizar branch protection via API (avanzado)

```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/:owner/:repo/branches/main/protection \
  --input protection.json
```

Donde `protection.json`:

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["Unit Tests", "E2E Tests"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

---

## Checklist de Configuración

Antes de considerar la configuración completa, verifica:

- [ ] Regla creada para `main`
- [ ] "Require pull request" activado con min. 1 approval
- [ ] "Require status checks" activado
- [ ] Status checks agregados: Unit Tests, E2E Tests
- [ ] "Require branches to be up to date" activado
- [ ] "Dismiss stale approvals" activado
- [ ] "Conversation resolution" activado
- [ ] "Do not allow bypassing" activado
- [ ] "Allow force pushes" DESACTIVADO
- [ ] "Allow deletions" DESACTIVADO
- [ ] Prueba: Intenta push directo a `main` (debe fallar)
- [ ] Prueba: Crea PR sin tests (merge debe estar bloqueado)
- [ ] Prueba: Crea PR con tests passing (merge debe funcionar)
- [ ] (Opcional) Archivo CODEOWNERS creado
- [ ] (Opcional) "Require code owner reviews" activado

---

## Recursos

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
- [GitHub Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Workflow y Conventional Commits
