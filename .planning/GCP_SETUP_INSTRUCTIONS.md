# Configuración de GCP para CD Pipeline

Estos pasos deben completarse antes de mergear el PR para que el CD pipeline funcione correctamente.

## 1. Crear Service Account para GitHub Actions

```bash
# 1.1 Crear service account
gcloud iam service-accounts create github-actions-cd \
  --display-name="GitHub Actions CI/CD" \
  --project=pure-highlander-487218-g2

# 1.2 Asignar roles necesarios
gcloud projects add-iam-policy-binding pure-highlander-487218-g2 \
  --member="serviceAccount:github-actions-cd@pure-highlander-487218-g2.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding pure-highlander-487218-g2 \
  --member="serviceAccount:github-actions-cd@pure-highlander-487218-g2.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding pure-highlander-487218-g2 \
  --member="serviceAccount:github-actions-cd@pure-highlander-487218-g2.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding pure-highlander-487218-g2 \
  --member="serviceAccount:github-actions-cd@pure-highlander-487218-g2.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# 1.3 Crear key JSON
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions-cd@pure-highlander-487218-g2.iam.gserviceaccount.com \
  --project=pure-highlander-487218-g2
```

## 2. Crear Artifact Registry Repository

```bash
gcloud artifacts repositories create smart-customer-service \
  --repository-format=docker \
  --location=us-east1 \
  --description="Smart Customer Service v2 container images" \
  --project=pure-highlander-487218-g2
```

## 3. Crear Secrets en Secret Manager

```bash
# Backend secrets
echo -n "localhost" | gcloud secrets create DB_HOST --data-file=- --project=pure-highlander-487218-g2
echo -n "5432" | gcloud secrets create DB_PORT --data-file=- --project=pure-highlander-487218-g2
echo -n "postgres" | gcloud secrets create DB_USER --data-file=- --project=pure-highlander-487218-g2
echo -n "YOUR_DB_PASSWORD" | gcloud secrets create DB_PASSWORD --data-file=- --project=pure-highlander-487218-g2
echo -n "smart_customer_service" | gcloud secrets create DB_NAME --data-file=- --project=pure-highlander-487218-g2
echo -n "YOUR_JWT_SECRET_256_BITS" | gcloud secrets create JWT_SECRET --data-file=- --project=pure-highlander-487218-g2
echo -n "YOUR_WEATHER_API_KEY" | gcloud secrets create WEATHER_API_KEY --data-file=- --project=pure-highlander-487218-g2
echo -n "La Paz" | gcloud secrets create WEATHER_DEFAULT_CITY --data-file=- --project=pure-highlander-487218-g2
echo -n "pure-highlander-487218-g2" | gcloud secrets create FIREBASE_PROJECT_ID --data-file=- --project=pure-highlander-487218-g2
```

## 4. Configurar Secrets en GitHub

### 4.1 Ir a GitHub Repository Settings

https://github.com/Nilmar518/smart-customer-service-v2/settings/secrets/actions

### 4.2 Agregar Secrets

Click en **New repository secret** y agregar:

**GCP_PROJECT_ID**:
```
pure-highlander-487218-g2
```

**GCP_SA_KEY**:
```
(Copiar contenido completo de github-actions-key.json)
```

### 4.3 Verificar Secrets

```bash
gh secret list
```

Deberías ver:
```
GCP_PROJECT_ID
GCP_SA_KEY
```

## 5. Verificar Configuración

### 5.1 Verificar Service Account

```bash
gcloud iam service-accounts list --project=pure-highlander-487218-g2 | grep github-actions
```

### 5.2 Verificar Artifact Registry

```bash
gcloud artifacts repositories list --location=us-east1 --project=pure-highlander-487218-g2
```

### 5.3 Verificar Secret Manager

```bash
gcloud secrets list --project=pure-highlander-487218-g2
```

Deberías ver:
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- JWT_SECRET
- WEATHER_API_KEY
- WEATHER_DEFAULT_CITY
- FIREBASE_PROJECT_ID

## 6. Dar Acceso a Cloud Run Service Account

```bash
# Permitir que Cloud Run acceda a Secret Manager
PROJECT_NUMBER=$(gcloud projects describe pure-highlander-487218-g2 --format="value(projectNumber)")

gcloud projects add-iam-policy-binding pure-highlander-487218-g2 \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## 7. Probar Autenticación

```bash
# Autenticar con el service account
gcloud auth activate-service-account --key-file=github-actions-key.json

# Verificar permisos
gcloud auth list
gcloud config set project pure-highlander-487218-g2

# Probar acceso a Artifact Registry
gcloud artifacts repositories describe smart-customer-service \
  --location=us-east1

# Probar acceso a Secret Manager
gcloud secrets versions access latest --secret=DB_HOST
```

## 8. Limpiar

```bash
# IMPORTANTE: Eliminar el archivo de key después de subirlo a GitHub
rm github-actions-key.json

# NUNCA commitear este archivo
```

---

## Checklist de Configuración

- [ ] Service account `github-actions-cd` creado
- [ ] Roles asignados (4 roles)
- [ ] Key JSON creada
- [ ] Artifact Registry creado (`smart-customer-service`)
- [ ] 9 secrets creados en Secret Manager
- [ ] Secrets configurados en GitHub (GCP_PROJECT_ID, GCP_SA_KEY)
- [ ] Cloud Run service account tiene acceso a Secret Manager
- [ ] Configuración verificada
- [ ] Key JSON eliminada localmente

---

## Troubleshooting

### Error: "Permission denied on resource project"

```bash
# Verificar que el usuario actual tiene permisos de Owner/Editor
gcloud projects get-iam-policy pure-highlander-487218-g2 \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:YOUR_EMAIL"
```

### Error: "Secret already exists"

```bash
# Actualizar secret existente
echo -n "NEW_VALUE" | gcloud secrets versions add SECRET_NAME --data-file=-
```

### Error: "Artifact Registry repository already exists"

```bash
# Usar repositorio existente, no es necesario crear uno nuevo
gcloud artifacts repositories describe REPO_NAME --location=us-east1
```

---

## Siguiente Paso

Después de completar esta configuración:

1. Verificar que todos los secrets estén en GitHub
2. Hacer merge del PR #1
3. El CD pipeline se ejecutará automáticamente
4. Monitorear en GitHub Actions
5. Verificar deploy en Cloud Run
