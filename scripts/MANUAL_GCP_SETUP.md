# Configuración Manual de GCP para CD Pipeline

**IMPORTANTE**: Tu sistema tiene Python 3.8, pero gcloud CLI requiere Python 3.9-3.14.

Tienes 3 opciones para continuar:

---

## Opción A: Actualizar Python y Ejecutar Script Automatizado (RECOMENDADO)

### 1. Instalar Python 3.11+

**Descargar desde**:
- https://www.python.org/downloads/

**Versión recomendada**: Python 3.11.x (LTS)

### 2. Configurar gcloud con el nuevo Python

```powershell
# Después de instalar Python 3.11
$env:CLOUDSDK_PYTHON = "C:\Python311\python.exe"

# Verificar
python --version  # Debe mostrar 3.11.x
```

### 3. Ejecutar script automatizado

```powershell
# Ejecutar desde la raíz del proyecto
.\scripts\setup-gcp.ps1
```

El script hará todo automáticamente:
- ✅ Crear Service Account
- ✅ Asignar roles
- ✅ Crear Artifact Registry
- ✅ Crear 9 secrets en Secret Manager
- ✅ Configurar GitHub secret GCP_SA_KEY
- ✅ Limpiar archivos temporales

**Tiempo estimado**: 5-10 minutos

---

## Opción B: Configuración Manual via Google Cloud Console (SIN gcloud CLI)

Si no quieres actualizar Python, puedes configurar todo desde el navegador:

### 1. Crear Service Account

1. Ve a: https://console.cloud.google.com/iam-admin/serviceaccounts?project=pure-highlander-487218-g2

2. Click en **Create Service Account**

3. Configurar:
   - **Name**: `github-actions-cd`
   - **Description**: `Service account para GitHub Actions workflows`
   - Click **Create and Continue**

4. Asignar roles (Grant this service account access to project):
   - `Artifact Registry Writer`
   - `Cloud Run Admin`
   - `Secret Manager Secret Accessor`
   - `Service Account User`
   - Click **Continue** → **Done**

5. En la lista de service accounts, click en `github-actions-cd@pure-highlander-487218-g2.iam.gserviceaccount.com`

6. Click en tab **KEYS**

7. **Add Key → Create new key → JSON** → **CREATE**

8. Se descargará un archivo JSON. **GUÁRDALO TEMPORALMENTE** (lo eliminaremos después)

### 2. Crear Artifact Registry Repository

1. Ve a: https://console.cloud.google.com/artifacts?project=pure-highlander-487218-g2

2. Click en **CREATE REPOSITORY**

3. Configurar:
   - **Name**: `smart-customer-service`
   - **Format**: Docker
   - **Location type**: Region
   - **Region**: `us-east1`
   - Click **CREATE**

### 3. Crear Secrets en Secret Manager

1. Ve a: https://console.cloud.google.com/security/secret-manager?project=pure-highlander-487218-g2

2. Click en **CREATE SECRET** para cada uno de los siguientes:

| Secret Name | Value (ejemplo) | Descripción |
|-------------|-----------------|-------------|
| `DB_HOST` | `localhost` | Host de PostgreSQL |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_USER` | `postgres` | Usuario de PostgreSQL |
| `DB_PASSWORD` | `YOUR_SECURE_PASSWORD` | ⚠️ Contraseña real de PostgreSQL |
| `DB_NAME` | `smart_customer_service` | Nombre de la BD |
| `JWT_SECRET` | `YOUR_256_BIT_SECRET` | ⚠️ Secret para JWT (generar aleatorio) |
| `WEATHER_API_KEY` | `YOUR_OPENWEATHER_KEY` | ⚠️ API key de OpenWeatherMap |
| `WEATHER_DEFAULT_CITY` | `La Paz` | Ciudad por defecto |
| `FIREBASE_PROJECT_ID` | `pure-highlander-487218-g2` | ID del proyecto GCP |

**Para cada secret**:
- Name: (nombre de la tabla)
- Secret value: (valor de la tabla)
- Click **CREATE SECRET**

### 4. Dar Permisos a Cloud Run

1. Ve a: https://console.cloud.google.com/iam-admin/iam?project=pure-highlander-487218-g2

2. Click en **GRANT ACCESS**

3. Configurar:
   - **New principals**: `XXXXX-compute@developer.gserviceaccount.com`
     (donde XXXXX es el número de proyecto, visible en la página)
   - **Role**: `Secret Manager Secret Accessor`
   - Click **SAVE**

### 5. Configurar GitHub Secret GCP_SA_KEY

```powershell
# Asumiendo que descargaste el JSON en Descargas/
cd ~\Downloads

# Configurar en GitHub
gh secret set GCP_SA_KEY < pure-highlander-487218-g2-XXXXX.json --repo Nilmar518/smart-customer-service-v2

# Verificar
gh secret list --repo Nilmar518/smart-customer-service-v2

# ELIMINAR el archivo JSON
Remove-Item pure-highlander-487218-g2-XXXXX.json
```

**Tiempo estimado**: 15-20 minutos

---

## Opción C: Continuar Solo con CI (Sin Deploy Automático)

Si prefieres configurar GCP más tarde:

1. **Hacer merge del PR ahora**:
   ```powershell
   gh pr merge 1 --squash
   ```

2. **El CD Pipeline fallará** (esperado - sin GCP_SA_KEY)

3. **CI seguirá funcionando perfectamente**:
   - ✅ Tests en paralelo
   - ✅ Commit validation
   - ✅ PR protection

4. **Configurar GCP después** siguiendo Opción A o B

5. **Re-ejecutar CD manualmente**:
   ```powershell
   gh workflow run cd.yml
   ```

---

## Verificación de Configuración

### Secrets de GitHub (Deben existir 2):

```powershell
gh secret list --repo Nilmar518/smart-customer-service-v2
```

**Esperado**:
```
GCP_PROJECT_ID     	2026-02-18T18:17:11Z
GCP_SA_KEY         	2026-02-18T18:XX:XXZ
```

### Comandos Útiles Después de Configurar:

```powershell
# Ver workflows ejecutándose
gh run list --limit 5

# Ver logs de CD en tiempo real (después del merge)
gh run watch

# Ver servicios de Cloud Run (requiere gcloud)
gcloud run services list --project=pure-highlander-487218-g2 --region=us-east1
```

---

## Valores a Generar

### JWT_SECRET (256 bits)

```powershell
# Generar con PowerShell
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### DB_PASSWORD

```powershell
# Generar con PowerShell
Add-Type -AssemblyName System.Web
[System.Web.Security.Membership]::GeneratePassword(24, 4)
```

### WEATHER_API_KEY

1. Registrarse en: https://openweathermap.org/api
2. Free tier es suficiente
3. API key se activa en ~2 horas

---

## Troubleshooting

### Error: "Python version not compatible"

**Solución**: Actualizar Python a 3.9+ (ver Opción A)

### Error: "Permission denied on resource project"

**Solución**:
1. Verificar que tu cuenta sea Owner/Editor del proyecto
2. Ve a https://console.cloud.google.com/iam-admin/iam?project=pure-highlander-487218-g2
3. Busca tu email y verifica roles

### Error: "Secret already exists"

**Solución**: Está bien, significa que ya fue creado. Puedes actualizar su valor si es necesario.

### Error: "Service account key already exists"

**Solución**: Si ya tienes un JSON, úsalo. Si no, elimina la key antigua y crea una nueva.

---

## Estado Actual

✅ **Completado**:
- CI Pipeline funcionando (UT + E2E + Commit Lint)
- Dockerfiles corregidos para monorepo
- Scripts de setup creados (bash + PowerShell)
- GitHub secret `GCP_PROJECT_ID` configurado

⏳ **Pendiente**:
- GitHub secret `GCP_SA_KEY` (requiere configuración GCP)
- Artifact Registry repository
- Secrets en Secret Manager (9 secrets)
- Permisos de Cloud Run

---

## Próximos Pasos

1. **Elegir Opción A, B o C**
2. **Configurar GCP_SA_KEY** (según opción elegida)
3. **Hacer merge del PR**:
   ```powershell
   gh pr merge 1 --squash
   ```
4. **Monitorear CD Pipeline**:
   ```powershell
   gh run watch
   ```
5. **Verificar deploy en Cloud Run**

---

## Contacto y Soporte

- **Documentación GCP**: https://cloud.google.com/run/docs
- **GitHub Actions**: https://docs.github.com/actions
- **Conventional Commits**: https://www.conventionalcommits.org/

**¿Necesitas ayuda?** Consulta `docs/CONTRIBUTING.md` o `.planning/CICD_IMPLEMENTATION.md`
