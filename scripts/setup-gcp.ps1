# Smart Customer Service v2 - GCP Setup Script (PowerShell)
# Prerequisitos:
# - gcloud CLI instalado (Python 3.9+)
# - gh CLI instalado y autenticado
# - Permisos de Owner/Editor en el proyecto GCP

$ErrorActionPreference = "Stop"

# Configuración
$PROJECT_ID = "pure-highlander-487218-g2"
$REGION = "us-east1"
$SA_NAME = "github-actions-cd"
$SA_EMAIL = "$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
$REPO = "Nilmar518/smart-customer-service-v2"

Write-Host "========================================" -ForegroundColor Green
Write-Host "Smart Customer Service v2 - GCP Setup" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# 1. Verificar autenticación
Write-Host "[1/8] Verificando autenticación de gcloud..." -ForegroundColor Yellow
try {
    $account = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>&1
    if (-not $account) {
        throw "No hay cuenta activa"
    }
    Write-Host "✓ Autenticado correctamente`n" -ForegroundColor Green
} catch {
    Write-Host "Error: No hay cuenta activa en gcloud" -ForegroundColor Red
    Write-Host "Ejecuta: gcloud auth login"
    exit 1
}

# 2. Configurar proyecto
Write-Host "[2/8] Configurando proyecto GCP..." -ForegroundColor Yellow
gcloud config set project $PROJECT_ID
Write-Host "✓ Proyecto configurado: $PROJECT_ID`n" -ForegroundColor Green

# 3. Habilitar APIs
Write-Host "[3/8] Habilitando APIs de GCP..." -ForegroundColor Yellow
gcloud services enable `
    run.googleapis.com `
    artifactregistry.googleapis.com `
    secretmanager.googleapis.com `
    cloudbuild.googleapis.com `
    --quiet
Write-Host "✓ APIs habilitadas`n" -ForegroundColor Green

# 4. Crear Service Account
Write-Host "[4/8] Creando Service Account para GitHub Actions..." -ForegroundColor Yellow
$saExists = gcloud iam service-accounts describe $SA_EMAIL 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠ Service Account ya existe, usando existente" -ForegroundColor Yellow
} else {
    gcloud iam service-accounts create $SA_NAME `
        --display-name="GitHub Actions CI/CD" `
        --description="Service account para GitHub Actions workflows"
    Write-Host "✓ Service Account creado" -ForegroundColor Green
}

# Asignar roles
Write-Host "Asignando roles..."
$ROLES = @(
    "roles/artifactregistry.writer",
    "roles/run.admin",
    "roles/secretmanager.secretAccessor",
    "roles/iam.serviceAccountUser"
)

foreach ($ROLE in $ROLES) {
    gcloud projects add-iam-policy-binding $PROJECT_ID `
        --member="serviceAccount:$SA_EMAIL" `
        --role="$ROLE" `
        --quiet | Out-Null
}
Write-Host "✓ Roles asignados`n" -ForegroundColor Green

# 5. Crear key JSON
Write-Host "[5/8] Creando Service Account key..." -ForegroundColor Yellow
$KEY_FILE = "github-actions-key.json"
if (Test-Path $KEY_FILE) {
    Write-Host "⚠ Key file ya existe" -ForegroundColor Yellow
} else {
    gcloud iam service-accounts keys create $KEY_FILE `
        --iam-account=$SA_EMAIL
    Write-Host "✓ Key creada: $KEY_FILE" -ForegroundColor Green
}
Write-Host ""

# 6. Crear Artifact Registry
Write-Host "[6/8] Creando Artifact Registry repository..." -ForegroundColor Yellow
$repoExists = gcloud artifacts repositories describe smart-customer-service --location=$REGION 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠ Artifact Registry ya existe" -ForegroundColor Yellow
} else {
    gcloud artifacts repositories create smart-customer-service `
        --repository-format=docker `
        --location=$REGION `
        --description="Smart Customer Service v2 container images"
    Write-Host "✓ Artifact Registry creado" -ForegroundColor Green
}
Write-Host ""

# 7. Crear secrets en Secret Manager
Write-Host "[7/8] Creando secrets en Secret Manager..." -ForegroundColor Yellow

function Create-Secret {
    param (
        [string]$SecretName,
        [string]$SecretValue
    )

    $secretExists = gcloud secrets describe $SecretName 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ⚠ $SecretName ya existe, actualizando..."
        $SecretValue | gcloud secrets versions add $SecretName --data-file=-
    } else {
        Write-Host "  ✓ Creando $SecretName..."
        $SecretValue | gcloud secrets create $SecretName --data-file=-
    }
}

# Secrets con valores por defecto
Create-Secret "DB_HOST" "localhost"
Create-Secret "DB_PORT" "5432"
Create-Secret "DB_USER" "postgres"
Create-Secret "DB_NAME" "smart_customer_service"
Create-Secret "WEATHER_DEFAULT_CITY" "La Paz"
Create-Secret "FIREBASE_PROJECT_ID" $PROJECT_ID

# Secrets que requieren input
Write-Host "`nLos siguientes secrets requieren valores específicos:" -ForegroundColor Yellow

$DB_PASSWORD = Read-Host "Ingresa DB_PASSWORD" -AsSecureString
$DB_PASSWORD_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))
Create-Secret "DB_PASSWORD" $DB_PASSWORD_Plain

$JWT_SECRET = Read-Host "Ingresa JWT_SECRET (256 bits recomendado)" -AsSecureString
$JWT_SECRET_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($JWT_SECRET))
Create-Secret "JWT_SECRET" $JWT_SECRET_Plain

$WEATHER_API_KEY = Read-Host "Ingresa WEATHER_API_KEY (OpenWeatherMap)"
Create-Secret "WEATHER_API_KEY" $WEATHER_API_KEY

Write-Host "✓ Secrets creados en Secret Manager`n" -ForegroundColor Green

# 8. Configurar permisos Cloud Run
Write-Host "[8/8] Configurando permisos de Cloud Run..." -ForegroundColor Yellow
$PROJECT_NUMBER = gcloud projects describe $PROJECT_ID --format="value(projectNumber)"
gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com" `
    --role="roles/secretmanager.secretAccessor" `
    --quiet | Out-Null
Write-Host "✓ Cloud Run tiene acceso a Secret Manager`n" -ForegroundColor Green

# Configurar GitHub Secrets
Write-Host "========================================" -ForegroundColor Green
Write-Host "Configuración de GitHub Secrets" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Configurando secrets en GitHub..." -ForegroundColor Yellow

# Verificar gh CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "Error: gh CLI no está instalado" -ForegroundColor Red
    Write-Host "Instala desde: https://cli.github.com/"
    exit 1
}

# Configurar secrets
gh secret set GCP_PROJECT_ID --body $PROJECT_ID --repo $REPO
Get-Content $KEY_FILE | gh secret set GCP_SA_KEY --repo $REPO

Write-Host "✓ Secrets configurados en GitHub`n" -ForegroundColor Green

# Verificar secrets
Write-Host "Verificando secrets en GitHub..." -ForegroundColor Yellow
gh secret list --repo $REPO
Write-Host ""

# Limpiar key file
Write-Host "Eliminando key file local (ya está en GitHub Secrets)..." -ForegroundColor Yellow
Remove-Item $KEY_FILE -Force
Write-Host "✓ Key file eliminado por seguridad`n" -ForegroundColor Green

# Resumen final
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Configuración Completada" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Recursos creados:" -ForegroundColor Green
Write-Host "  ✓ Service Account: $SA_EMAIL"
Write-Host "  ✓ Artifact Registry: $REGION-docker.pkg.dev/$PROJECT_ID/smart-customer-service"
Write-Host "  ✓ 9 Secrets en Secret Manager"
Write-Host "  ✓ 2 GitHub Secrets (GCP_PROJECT_ID, GCP_SA_KEY)"

Write-Host "`nPróximos pasos:" -ForegroundColor Green
Write-Host "  1. Commitear cambios de Dockerfiles"
Write-Host "  2. Push a feature/tests"
Write-Host "  3. Mergear PR #1"
Write-Host "  4. Monitorear CD pipeline en GitHub Actions"
Write-Host "  5. Verificar deploy en Cloud Run"

Write-Host "`nComandos útiles:" -ForegroundColor Yellow
Write-Host "  gh run list                    # Ver workflows ejecutándose"
Write-Host "  gh run watch                   # Ver logs en tiempo real"
Write-Host "  gcloud run services list       # Ver servicios de Cloud Run"

Write-Host "`n🚀 ¡Todo listo para CI/CD!`n" -ForegroundColor Green
