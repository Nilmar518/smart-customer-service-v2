# Deploy Final - CI/CD Completo

## ✅ Pre-requisitos

Antes de continuar, verifica que completaste:

- [x] Service Account `github-actions-cd` creado en info-lapaz-2
- [x] GitHub secret `GCP_PROJECT_ID` = `info-lapaz-2`
- [x] GitHub secret `GCP_SA_KEY` configurado
- [x] Workflow `cd.yml` actualizado

**Verificar**:
```powershell
gh secret list --repo Nilmar518/smart-customer-service-v2
```

Debe mostrar:
```
GCP_PROJECT_ID
GCP_SA_KEY
```

---

## Paso 1: Commitear Cambios del Workflow

```bash
# Verificar cambios
git status

# Agregar workflow y scripts
git add .github/workflows/cd.yml scripts/

# Commit
git commit -m "ci(cd): configure workflow for info-lapaz-2 deployment

- update project from pure-highlander to info-lapaz-2
- change region to us-central1
- use gcr.io registry instead of artifact registry
- configure cloud sql instance connection
- set correct environment variables and secrets
- add deployment scripts and documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push
git push origin feature/tests
```

---

## Paso 2: Verificar CI del PR

```bash
# Ver estado del PR
gh pr view 1

# Ver checks
gh pr checks 1
```

**Debe mostrar**:
```
✓ Unit Tests       - PASS
✓ E2E Tests        - PASS
✓ Commit Messages  - PASS
```

Si alguno falla, revisar logs antes de continuar.

---

## Paso 3: Mergear PR

### Opción A: Via CLI (Recomendado)

```bash
gh pr merge 1 --squash --auto
```

### Opción B: Via Web

1. Ir a: https://github.com/Nilmar518/smart-customer-service-v2/pull/1
2. Clic en **"Squash and merge"**
3. Confirmar merge

---

## Paso 4: Monitorear CD Pipeline

### 4.1 Ver workflows en ejecución

```bash
gh run list --limit 5
```

Deberías ver el workflow **CD - Deploy to Cloud Run** ejecutándose.

### 4.2 Ver logs en tiempo real

```bash
gh run watch
```

Esto mostrará los logs del deployment en tiempo real.

### 4.3 O ver en Web

🔗 https://github.com/Nilmar518/smart-customer-service-v2/actions

---

## Paso 5: Verificar Jobs del CD

El CD pipeline ejecuta estos jobs en orden:

### Job 1: Generate Version
```
✓ Analiza commits con Conventional Commits
✓ Genera versión semántica (ej: v1.0.0)
✓ Crea tag en GitHub
```

### Job 2: Build Backend (paralelo)
```
✓ Install dependencies (pnpm)
✓ Build backend (TypeScript → JavaScript)
✓ Authenticate to GCP
✓ Build Docker image
✓ Push to gcr.io/info-lapaz-2/smart-customer-backend-v2:v1.0.0
✓ Push to gcr.io/info-lapaz-2/smart-customer-backend-v2:latest
```

### Job 3: Build Frontend (paralelo)
```
✓ Install dependencies (pnpm)
✓ Build frontend (Vite)
✓ Authenticate to GCP
✓ Build Docker image
✓ Push to gcr.io/info-lapaz-2/smart-customer-frontend-v2:v1.0.0
✓ Push to gcr.io/info-lapaz-2/smart-customer-frontend-v2:latest
```

### Job 4: Deploy Backend
```
✓ Authenticate to GCP
✓ Deploy to Cloud Run
  - Service: smart-customer-backend-v2
  - Region: us-central1
  - Image: gcr.io/info-lapaz-2/smart-customer-backend-v2:v1.0.0
  - Env vars: NODE_ENV, DB_PORT, INSTANCE_UNIX_SOCKET, FRONTEND_URL
  - Secrets: DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
  - Cloud SQL: info-lapaz-2:us-central1:smart-customer-db
✓ Service deployed successfully
```

### Job 5: Deploy Frontend
```
✓ Authenticate to GCP
✓ Deploy to Cloud Run
  - Service: smart-customer-frontend-v2
  - Region: us-central1
  - Image: gcr.io/info-lapaz-2/smart-customer-frontend-v2:v1.0.0
✓ Service deployed successfully
```

### Job 6: Notify
```
✓ Create GitHub Release v1.0.0
✓ Include changelog from commits
✓ Tag repository
```

**Tiempo total**: ~8-12 minutos

---

## Paso 6: Verificar Deploy Exitoso

### 6.1 Ver URLs de los servicios

```bash
# Backend URL
gcloud run services describe smart-customer-backend-v2 \
  --region=us-central1 \
  --project=info-lapaz-2 \
  --format="value(status.url)"

# Frontend URL
gcloud run services describe smart-customer-frontend-v2 \
  --region=us-central1 \
  --project=info-lapaz-2 \
  --format="value(status.url)"
```

O via Console:
🔗 https://console.cloud.google.com/run?project=info-lapaz-2

### 6.2 Ver logs del backend

```bash
gcloud run services logs read smart-customer-backend-v2 \
  --region=us-central1 \
  --project=info-lapaz-2 \
  --limit=50
```

### 6.3 Probar endpoints

```bash
# Obtener URL del backend
BACKEND_URL=$(gcloud run services describe smart-customer-backend-v2 --region=us-central1 --project=info-lapaz-2 --format="value(status.url)")

# Probar health check
curl $BACKEND_URL/api/hello

# Probar signup
curl -X POST $BACKEND_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'
```

### 6.4 Ver GitHub Release

🔗 https://github.com/Nilmar518/smart-customer-service-v2/releases

Deberías ver **Release v1.0.0** con changelog automático.

---

## Paso 7: Verificar Imágenes en GCR

```bash
# Ver imágenes del backend
gcloud container images list-tags gcr.io/info-lapaz-2/smart-customer-backend-v2 \
  --project=info-lapaz-2

# Ver imágenes del frontend
gcloud container images list-tags gcr.io/info-lapaz-2/smart-customer-frontend-v2 \
  --project=info-lapaz-2
```

O via Console:
🔗 https://console.cloud.google.com/gcr/images/info-lapaz-2

Deberías ver:
- `smart-customer-backend-v2:v1.0.0`
- `smart-customer-backend-v2:latest`
- `smart-customer-frontend-v2:v1.0.0`
- `smart-customer-frontend-v2:latest`

---

## ✅ Deploy Completo

Si todo funcionó, ahora tienes:

### CI/CD Funcionando
- ✅ Tests automáticos en cada PR (UT + E2E + Commit Lint)
- ✅ Deploy automático al mergear a main
- ✅ Versionado semántico automático
- ✅ GitHub Releases automáticos

### Infraestructura
- ✅ Backend en Cloud Run (us-central1)
- ✅ Frontend en Cloud Run (us-central1)
- ✅ Cloud SQL conectado
- ✅ Secrets configurados
- ✅ Imágenes en gcr.io

### Próximos Deployments
Cada vez que merges un PR a main:
1. Automáticamente genera versión
2. Build de imágenes
3. Deploy a Cloud Run
4. Crea GitHub Release

**Tiempo de deploy**: 8-12 minutos automático

---

## Flujo de Desarrollo Continuo

### Para agregar nuevas features:

```bash
# 1. Crear feature branch
git checkout main
git pull origin main
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollar con Conventional Commits
git add .
git commit -m "feat(scope): descripción de la feature"

# 3. Push y crear PR
git push -u origin feature/nueva-funcionalidad
gh pr create --base main --title "feat(scope): descripción"

# 4. CI ejecuta automáticamente
# - ✓ Unit Tests
# - ✓ E2E Tests
# - ✓ Commit Lint

# 5. Code review y merge
gh pr merge --squash

# 6. CD ejecuta automáticamente
# - Genera v1.1.0 (MINOR por feat)
# - Build y deploy
# - GitHub Release
```

### Versionado Automático

Basado en Conventional Commits:

| Commit | Bump | Ejemplo |
|--------|------|---------|
| `fix:` | PATCH | 1.0.0 → 1.0.1 |
| `feat:` | MINOR | 1.0.0 → 1.1.0 |
| `BREAKING CHANGE:` o `!` | MAJOR | 1.0.0 → 2.0.0 |

---

## Troubleshooting

### CD falla en "Build Backend"

**Síntomas**:
```
Error: failed to push image
Permission denied
```

**Solución**:
Verificar que el service account tiene rol `Storage Admin`:
```bash
gcloud projects get-iam-policy info-lapaz-2 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:github-actions-cd@info-lapaz-2.iam.gserviceaccount.com"
```

### CD falla en "Deploy Backend"

**Síntomas**:
```
Error: Permission denied on Cloud Run service
```

**Solución**:
Verificar que el service account tiene rol `Cloud Run Admin`.

### Cloud SQL connection failed

**Síntomas**:
```
Error: ECONNREFUSED connecting to Cloud SQL
```

**Solución**:
Verificar que Cloud SQL instance está incluida en el deploy:
```yaml
--add-cloudsql-instances=info-lapaz-2:us-central1:smart-customer-db
```

---

## Monitoreo Continuo

### Ver últimos deployments

```bash
gh run list --workflow=cd.yml --limit 10
```

### Ver logs de un deployment específico

```bash
# Obtener ID del último run
RUN_ID=$(gh run list --workflow=cd.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# Ver logs
gh run view $RUN_ID --log
```

### Alertas (Opcional)

Configurar notificaciones en:
🔗 https://console.cloud.google.com/monitoring/alerting?project=info-lapaz-2

---

## 🎉 ¡Felicidades!

Has completado la implementación de CI/CD para Smart Customer Service v2.

**Logros**:
- ✅ 76 tests (55 UT + 21 E2E) con 100% coverage
- ✅ CI pipeline en paralelo (3 checks)
- ✅ CD pipeline automático (6 jobs)
- ✅ Versionado semántico
- ✅ Deploy a Cloud Run
- ✅ Conventional Commits
- ✅ GitHub Releases automáticos

**Documentación creada**:
- CONTRIBUTING.md (1000+ líneas)
- BRANCH_PROTECTION.md (800+ líneas)
- CICD_IMPLEMENTATION.md (detalles técnicos)
- SETUP.md (guía rápida)
- CREATE_SERVICE_ACCOUNT_STEPS.md (este documento)

---

**Próximos pasos recomendados**:
1. Configurar Branch Protection rules en GitHub
2. Agregar más desarrolladores al equipo
3. Implementar entorno de staging
4. Configurar monitoreo y alertas

🚀 **Happy Deploying!**
