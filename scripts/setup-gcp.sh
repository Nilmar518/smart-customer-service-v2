#!/bin/bash
#
# Script de configuración automática de GCP para CI/CD
# Smart Customer Service v2
#
# Prerequisitos:
# - gcloud CLI instalado y configurado con Python 3.9+
# - gh CLI instalado y autenticado
# - Permisos de Owner/Editor en el proyecto GCP
#

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ID="pure-highlander-487218-g2"
REGION="us-east1"
SA_NAME="github-actions-cd"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
REPO="Nilmar518/smart-customer-service-v2"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Smart Customer Service v2 - GCP Setup${NC}"
echo -e "${GREEN}========================================${NC}\n"

# 1. Verificar autenticación de gcloud
echo -e "${YELLOW}[1/8] Verificando autenticación de gcloud...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}Error: No hay cuenta activa en gcloud${NC}"
    echo "Ejecuta: gcloud auth login"
    exit 1
fi
echo -e "${GREEN}✓ Autenticado correctamente${NC}\n"

# 2. Verificar proyecto
echo -e "${YELLOW}[2/8] Configurando proyecto GCP...${NC}"
gcloud config set project $PROJECT_ID
echo -e "${GREEN}✓ Proyecto configurado: $PROJECT_ID${NC}\n"

# 3. Habilitar APIs necesarias
echo -e "${YELLOW}[3/8] Habilitando APIs de GCP...${NC}"
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com \
    --quiet

echo -e "${GREEN}✓ APIs habilitadas${NC}\n"

# 4. Crear Service Account (si no existe)
echo -e "${YELLOW}[4/8] Creando Service Account para GitHub Actions...${NC}"
if gcloud iam service-accounts describe $SA_EMAIL &>/dev/null; then
    echo -e "${YELLOW}⚠ Service Account ya existe, usando existente${NC}"
else
    gcloud iam service-accounts create $SA_NAME \
        --display-name="GitHub Actions CI/CD" \
        --description="Service account para GitHub Actions workflows"
    echo -e "${GREEN}✓ Service Account creado${NC}"
fi

# Asignar roles necesarios
echo "Asignando roles..."
ROLES=(
    "roles/artifactregistry.writer"
    "roles/run.admin"
    "roles/secretmanager.secretAccessor"
    "roles/iam.serviceAccountUser"
)

for ROLE in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$ROLE" \
        --quiet > /dev/null
done
echo -e "${GREEN}✓ Roles asignados${NC}\n"

# 5. Crear key JSON (si no existe)
echo -e "${YELLOW}[5/8] Creando Service Account key...${NC}"
KEY_FILE="github-actions-key.json"
if [ -f "$KEY_FILE" ]; then
    echo -e "${YELLOW}⚠ Key file ya existe${NC}"
else
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SA_EMAIL
    echo -e "${GREEN}✓ Key creada: $KEY_FILE${NC}"
fi
echo -e "${NC}"

# 6. Crear Artifact Registry repository (si no existe)
echo -e "${YELLOW}[6/8] Creando Artifact Registry repository...${NC}"
if gcloud artifacts repositories describe smart-customer-service \
    --location=$REGION &>/dev/null; then
    echo -e "${YELLOW}⚠ Artifact Registry ya existe${NC}"
else
    gcloud artifacts repositories create smart-customer-service \
        --repository-format=docker \
        --location=$REGION \
        --description="Smart Customer Service v2 container images"
    echo -e "${GREEN}✓ Artifact Registry creado${NC}"
fi
echo -e "${NC}"

# 7. Crear secrets en Secret Manager
echo -e "${YELLOW}[7/8] Creando secrets en Secret Manager...${NC}"

create_secret() {
    local SECRET_NAME=$1
    local SECRET_VALUE=$2

    if gcloud secrets describe $SECRET_NAME &>/dev/null; then
        echo "  ⚠ $SECRET_NAME ya existe, actualizando..."
        echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=-
    else
        echo "  ✓ Creando $SECRET_NAME..."
        echo -n "$SECRET_VALUE" | gcloud secrets create $SECRET_NAME --data-file=-
    fi
}

# Secrets con valores por defecto (ajustar según necesidad)
create_secret "DB_HOST" "localhost"
create_secret "DB_PORT" "5432"
create_secret "DB_USER" "postgres"
create_secret "DB_NAME" "smart_customer_service"
create_secret "WEATHER_DEFAULT_CITY" "La Paz"
create_secret "FIREBASE_PROJECT_ID" "$PROJECT_ID"

# Secrets que requieren input del usuario
echo -e "\n${YELLOW}Los siguientes secrets requieren valores específicos:${NC}"

read -sp "Ingresa DB_PASSWORD: " DB_PASSWORD
echo
create_secret "DB_PASSWORD" "$DB_PASSWORD"

read -sp "Ingresa JWT_SECRET (256 bits recomendado): " JWT_SECRET
echo
create_secret "JWT_SECRET" "$JWT_SECRET"

read -p "Ingresa WEATHER_API_KEY (OpenWeatherMap): " WEATHER_API_KEY
create_secret "WEATHER_API_KEY" "$WEATHER_API_KEY"

echo -e "${GREEN}✓ Secrets creados en Secret Manager${NC}\n"

# 8. Dar acceso a Cloud Run service account
echo -e "${YELLOW}[8/8] Configurando permisos de Cloud Run...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet > /dev/null
echo -e "${GREEN}✓ Cloud Run tiene acceso a Secret Manager${NC}\n"

# Configurar GitHub Secrets
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Configuración de GitHub Secrets${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Configurando secrets en GitHub...${NC}"

# Verificar gh CLI
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: gh CLI no está instalado${NC}"
    echo "Instala desde: https://cli.github.com/"
    exit 1
fi

# Configurar GCP_PROJECT_ID
gh secret set GCP_PROJECT_ID --body "$PROJECT_ID" --repo $REPO

# Configurar GCP_SA_KEY
gh secret set GCP_SA_KEY < $KEY_FILE --repo $REPO

echo -e "${GREEN}✓ Secrets configurados en GitHub${NC}\n"

# Verificar secrets
echo -e "${YELLOW}Verificando secrets en GitHub...${NC}"
gh secret list --repo $REPO
echo -e "${NC}"

# Limpiar key file
echo -e "${YELLOW}Eliminando key file local (ya está en GitHub Secrets)...${NC}"
rm -f $KEY_FILE
echo -e "${GREEN}✓ Key file eliminado por seguridad${NC}\n"

# Resumen final
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Configuración Completada${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${GREEN}Recursos creados:${NC}"
echo "  ✓ Service Account: $SA_EMAIL"
echo "  ✓ Artifact Registry: $REGION-docker.pkg.dev/$PROJECT_ID/smart-customer-service"
echo "  ✓ 9 Secrets en Secret Manager"
echo "  ✓ 2 GitHub Secrets (GCP_PROJECT_ID, GCP_SA_KEY)"
echo -e "\n${GREEN}Próximos pasos:${NC}"
echo "  1. Commitear cambios de Dockerfiles"
echo "  2. Push a feature/tests"
echo "  3. Mergear PR #1"
echo "  4. Monitorear CD pipeline en GitHub Actions"
echo "  5. Verificar deploy en Cloud Run"
echo -e "\n${YELLOW}Comandos útiles:${NC}"
echo "  gh run list                    # Ver workflows ejecutándose"
echo "  gh run watch                   # Ver logs en tiempo real"
echo "  gcloud run services list       # Ver servicios de Cloud Run"
echo -e "\n${GREEN}🚀 ¡Todo listo para CI/CD!${NC}\n"
