# Setup GCP para Proyecto info-lapaz-2

## Configuración Detectada ✅

**Proyecto GCP**: `info-lapaz-2`
**Región**: `us-central1`
**Registry**: `gcr.io` (Google Container Registry)
**Cloud SQL**: `info-lapaz-2:us-central1:smart-customer-db`

**Servicios Cloud Run Existentes**:
- ✅ `smart-customer-backend-v2` (us-central1)
- ✅ `smart-customer-frontend-v2` (us-central1)

**Secrets Existentes** (ya configurados):
- ✅ `db-user`
- ✅ `db-password`
- ✅ `db-name`
- ✅ `jwt-secret`

---

## Lo Que Falta Configurar

### 1. Service Account para GitHub Actions

**Opción A: Via Console (RECOMENDADO - 5 min)**

1. Ir a: https://console.cloud.google.com/iam-admin/serviceaccounts?project=info-lapaz-2

2. Click en **CREATE SERVICE ACCOUNT**

3. Configurar:
   - **Name**: `github-actions-cd`
   - **Description**: `Service account for GitHub Actions CI/CD pipeline`
   - Click **CREATE AND CONTINUE**

4. Asignar roles:
   - `Cloud Run Admin`
   - `Service Account User`
   - `Storage Admin` (para gcr.io)
   - Click **CONTINUE** → **DONE**

5. En la lista, click en `github-actions-cd@info-lapaz-2.iam.gserviceaccount.com`

6. Tab **KEYS** → **ADD KEY** → **Create new key** → **JSON** → **CREATE**

7. Se descarga un JSON. Guárdalo temporalmente.

**Opción B: Via gcloud (requiere Python 3.9+)**

```bash
# Crear service account
gcloud iam service-accounts create github-actions-cd \
  --display-name="GitHub Actions CI/CD" \
  --project=info-lapaz-2

# Asignar roles
gcloud projects add-iam-policy-binding info-lapaz-2 \
  --member="serviceAccount:github-actions-cd@info-lapaz-2.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding info-lapaz-2 \
  --member="serviceAccount:github-actions-cd@info-lapaz-2.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding info-lapaz-2 \
  --member="serviceAccount:github-actions-cd@info-lapaz-2.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Crear key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions-cd@info-lapaz-2.iam.gserviceaccount.com \
  --project=info-lapaz-2
```

---

### 2. Configurar GitHub Secret

Después de descargar el JSON del service account:

```powershell
# Desde PowerShell
cd ~\Downloads

# Configurar secret
gh secret set GCP_SA_KEY < info-lapaz-2-XXXXX.json --repo Nilmar518/smart-customer-service-v2

# Verificar
gh secret list --repo Nilmar518/smart-customer-service-v2

# Eliminar archivo local
Remove-Item info-lapaz-2-XXXXX.json
```

**Resultado esperado**:
```
GCP_PROJECT_ID     2026-02-18T18:37:47Z
GCP_SA_KEY         2026-02-18T18:XX:XXZ
```

---

### 3. Secrets Adicionales (Opcionales)

El backend actual solo usa estos secrets (ya configurados):
- db-user ✅
- db-password ✅
- db-name ✅
- jwt-secret ✅

**Si planeas usar Weather API o Firestore**, necesitarás crear:

#### Via Console:
https://console.cloud.google.com/security/secret-manager?project=info-lapaz-2

Crear:
- `weather-api-key` → Tu API key de OpenWeatherMap
- `weather-default-city` → `La Paz`
- `firebase-project-id` → `info-lapaz-2`
- `db-host` → Valor según tu configuración

#### Via gcloud:
```bash
echo -n "YOUR_WEATHER_KEY" | gcloud secrets create weather-api-key --data-file=- --project=info-lapaz-2
echo -n "La Paz" | gcloud secrets create weather-default-city --data-file=- --project=info-lapaz-2
echo -n "info-lapaz-2" | gcloud secrets create firebase-project-id --data-file=- --project=info-lapaz-2
```

**Nota**: Si no usas Weather API, NO necesitas estos secrets ahora.

---

### 4. Actualizar Backend para Usar Nuevos Secrets (Si los creas)

Si agregas secrets de Weather/Firebase, actualiza el workflow cd.yml:

```yaml
secrets: |
  DB_USER=db-user:latest
  DB_PASSWORD=db-password:latest
  DB_NAME=db-name:latest
  JWT_SECRET=jwt-secret:latest
  WEATHER_API_KEY=weather-api-key:latest
  WEATHER_DEFAULT_CITY=weather-default-city:latest
  FIREBASE_PROJECT_ID=firebase-project-id:latest
```

---

## Verificación de Configuración

### Secrets de GitHub (Deben existir 2):

```powershell
gh secret list --repo Nilmar518/smart-customer-service-v2
```

**Esperado**:
```
GCP_PROJECT_ID  ← info-lapaz-2
GCP_SA_KEY      ← Service account JSON
```

### Secrets de GCP (Mínimo 4):

Via Console: https://console.cloud.google.com/security/secret-manager?project=info-lapaz-2

**Existentes**:
- ✅ db-user
- ✅ db-password
- ✅ db-name
- ✅ jwt-secret

**Opcionales** (para Weather/Firebase):
- weather-api-key
- weather-default-city
- firebase-project-id
- db-host

---

## Workflow CD Configurado

El workflow ahora usa:

```yaml
PROJECT_ID: info-lapaz-2
REGION: us-central1
BACKEND_SERVICE: smart-customer-backend-v2
FRONTEND_SERVICE: smart-customer-frontend-v2
REGISTRY: gcr.io
CLOUD_SQL_INSTANCE: info-lapaz-2:us-central1:smart-customer-db
```

**Backend deploy**:
- Image: `gcr.io/info-lapaz-2/smart-customer-backend-v2:VERSION`
- Env vars: NODE_ENV, DB_PORT, INSTANCE_UNIX_SOCKET, FRONTEND_URL
- Secrets: DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
- Cloud SQL: Conectado automáticamente

**Frontend deploy**:
- Image: `gcr.io/info-lapaz-2/smart-customer-frontend-v2:VERSION`
- Port: 8080
- Memory: 256Mi

---

## Flujo Completo Después de Setup

### 1. Commitear cambios del workflow
```bash
git add .github/workflows/cd.yml
git commit -m "ci(cd): update workflow for info-lapaz-2 project

- change project from pure-highlander to info-lapaz-2
- update region to us-central1
- use gcr.io instead of artifact registry
- configure cloud sql instance
- add correct environment variables and secrets

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin feature/tests
```

### 2. Mergear PR
```bash
gh pr merge 1 --squash
```

### 3. Monitorear CD Pipeline
```bash
gh run watch
```

### 4. Verificar Deploy
```bash
# Backend logs
gcloud run services logs read smart-customer-backend-v2 \
  --region=us-central1 --limit=50 --project=info-lapaz-2

# Frontend logs
gcloud run services logs read smart-customer-frontend-v2 \
  --region=us-central1 --limit=50 --project=info-lapaz-2

# URLs de los servicios
gcloud run services describe smart-customer-backend-v2 \
  --region=us-central1 --project=info-lapaz-2 --format="value(status.url)"

gcloud run services describe smart-customer-frontend-v2 \
  --region=us-central1 --project=info-lapaz-2 --format="value(status.url)"
```

---

## Troubleshooting

### Error: "Permission denied"

**Solución**: Verificar que el service account tiene los 3 roles:
- Cloud Run Admin
- Service Account User
- Storage Admin

### Error: "Image not found"

**Solución**: El workflow build y push la imagen automáticamente. Verificar que GCP_SA_KEY esté configurado.

### Error: "Cloud SQL connection failed"

**Solución**: Verificar que el service account de Cloud Run tenga acceso a Cloud SQL:
```bash
gcloud projects add-iam-policy-binding info-lapaz-2 \
  --member="serviceAccount:SERVICE_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

---

## Checklist de Setup Completo

- [ ] Service Account `github-actions-cd` creado
- [ ] Service Account tiene 3 roles asignados
- [ ] Key JSON descargada
- [ ] GitHub secret `GCP_SA_KEY` configurado
- [ ] GitHub secret `GCP_PROJECT_ID` = `info-lapaz-2` ✅
- [ ] Workflow cd.yml actualizado ✅
- [ ] Secrets GCP verificados (4 mínimo) ✅
- [ ] Cloud SQL instance configurada ✅
- [ ] Cambios commiteados
- [ ] PR mergeado
- [ ] CD pipeline ejecutado
- [ ] Servicios desplegados

---

## Próximo Paso

**¿Tienes Python 3.9+ instalado?**
- **Sí** → Ejecutar `.\scripts\setup-gcp.ps1` (5 min)
- **No** → Seguir "Opción A: Via Console" arriba (5 min)

Después:
```bash
git add .github/workflows/cd.yml
git commit -m "ci(cd): update workflow for info-lapaz-2 project"
git push origin feature/tests
gh pr merge 1 --squash
gh run watch
```

🚀 **Total: 10-15 minutos para deploy automático funcionando**
