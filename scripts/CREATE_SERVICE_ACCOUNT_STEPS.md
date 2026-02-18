# Crear Service Account - Paso a Paso

## 🎯 Objetivo
Crear service account `github-actions-cd` para el proyecto `info-lapaz-2` y configurarlo en GitHub.

**Tiempo estimado**: 5-7 minutos

---

## Paso 1: Abrir IAM Console

🔗 **Clic aquí**: https://console.cloud.google.com/iam-admin/serviceaccounts?project=info-lapaz-2

Verás una pantalla con la lista de Service Accounts.

---

## Paso 2: Crear Service Account

### 2.1 Clic en el botón azul **"CREATE SERVICE ACCOUNT"** (arriba)

### 2.2 Llenar el formulario:

**Service account details**:
```
Service account name: github-actions-cd
Service account ID: github-actions-cd (se autocompletará)
Service account description: Service account for GitHub Actions CI/CD pipeline
```

### 2.3 Clic en **"CREATE AND CONTINUE"**

---

## Paso 3: Asignar Roles

En la pantalla "Grant this service account access to project":

### 3.1 Agregar el primer rol:

**Clic en "Select a role"** → Buscar y seleccionar:
```
Cloud Run Admin
```
(Aparecerá como: Cloud Run → Cloud Run Admin)

### 3.2 Clic en **"+ ADD ANOTHER ROLE"**

**Seleccionar segundo rol**:
```
Service Account User
```
(Aparecerá como: Service Accounts → Service Account User)

### 3.3 Clic en **"+ ADD ANOTHER ROLE"**

**Seleccionar tercer rol**:
```
Storage Admin
```
(Aparecerá como: Cloud Storage → Storage Admin)

**Importante**: Este rol permite push a `gcr.io`

### 3.4 Verificar que tengas 3 roles:
- ✅ Cloud Run Admin
- ✅ Service Account User
- ✅ Storage Admin

### 3.5 Clic en **"CONTINUE"**

### 3.6 En "Grant users access to this service account" (opcional):
- Dejar vacío
- Clic en **"DONE"**

---

## Paso 4: Crear Key JSON

### 4.1 En la lista de Service Accounts, busca:
```
github-actions-cd@info-lapaz-2.iam.gserviceaccount.com
```

### 4.2 **Clic en el email** del service account

### 4.3 Ir a la pestaña **"KEYS"** (arriba)

### 4.4 Clic en **"ADD KEY"** → **"Create new key"**

### 4.5 Seleccionar formato:
```
○ P12
● JSON  ← Seleccionar este
```

### 4.6 Clic en **"CREATE"**

**Se descargará un archivo**: `info-lapaz-2-XXXXXXXXXXXX.json`

⚠️ **Guarda este archivo temporalmente** - Lo usaremos en el siguiente paso y luego lo eliminaremos.

---

## Paso 5: Configurar en GitHub

### 5.1 Abrir PowerShell

```powershell
# Ir a la carpeta de Descargas
cd ~\Downloads

# Listar archivos JSON recién descargados
ls *.json | Sort-Object LastWriteTime -Descending | Select-Object -First 3
```

### 5.2 Identificar el archivo

Deberías ver algo como:
```
info-lapaz-2-abc123def456.json
```

### 5.3 Configurar secret en GitHub

```powershell
# Reemplaza NOMBRE_ARCHIVO.json con el nombre real del archivo
gh secret set GCP_SA_KEY < info-lapaz-2-XXXXXXXXXXXX.json --repo Nilmar518/smart-customer-service-v2
```

**Resultado esperado**:
```
✓ Set secret GCP_SA_KEY for Nilmar518/smart-customer-service-v2
```

### 5.4 Verificar secrets

```powershell
gh secret list --repo Nilmar518/smart-customer-service-v2
```

**Debe mostrar**:
```
GCP_PROJECT_ID     2026-02-18T18:37:47Z
GCP_SA_KEY         2026-02-18T18:XX:XXZ  ← Nuevo
```

### 5.5 Eliminar archivo JSON local (IMPORTANTE)

```powershell
# Reemplaza con el nombre real
Remove-Item info-lapaz-2-XXXXXXXXXXXX.json

# Verificar que se eliminó
ls *.json | Where-Object {$_.Name -like "info-lapaz-2*"}
```

**No debe mostrar nada** (archivo eliminado)

---

## Paso 6: Verificar Configuración Completa

### 6.1 GitHub Secrets (2 requeridos):

```powershell
gh secret list --repo Nilmar518/smart-customer-service-v2
```

**Checklist**:
- [x] GCP_PROJECT_ID = `info-lapaz-2`
- [x] GCP_SA_KEY = `(archivo JSON completo)`

### 6.2 Service Account en GCP:

🔗 Verificar: https://console.cloud.google.com/iam-admin/serviceaccounts?project=info-lapaz-2

**Checklist**:
- [x] Email: `github-actions-cd@info-lapaz-2.iam.gserviceaccount.com`
- [x] Roles: Cloud Run Admin, Service Account User, Storage Admin
- [x] Key creada (1 active key)

---

## ✅ Configuración Completa

Si todo está correcto, ya puedes continuar con el deploy.

**Próximos pasos**:
1. Commitear cambios del workflow
2. Mergear PR
3. Ver el CD pipeline en acción

---

## Troubleshooting

### No veo el botón "CREATE SERVICE ACCOUNT"

**Causa**: No tienes permisos de Owner/Editor en el proyecto.

**Solución**:
1. Verifica el proyecto: https://console.cloud.google.com/iam-admin/iam?project=info-lapaz-2
2. Busca tu email y verifica que tienes rol de Owner o Editor

### Error al crear key: "Service account key creation is disabled"

**Causa**: La organización tiene políticas que bloquean la creación de keys.

**Solución**: Contactar al administrador de GCP de la organización.

### El archivo JSON no se descargó

**Solución**:
1. Verifica la carpeta de Descargas del navegador
2. Verifica si el navegador bloqueó la descarga
3. Intenta de nuevo desde el paso 4.4

### Error en gh secret set: "Not found"

**Causa**: No estás autenticado en gh CLI o el repo es incorrecto.

**Solución**:
```powershell
# Verificar autenticación
gh auth status

# Re-login si es necesario
gh auth login
```

---

## Siguiente Documento

Después de completar este paso, continúa con:
- `FINAL_DEPLOY.md` (próximo a crear)

---

**Estado**: ⏳ Esperando que completes los pasos

**Tiempo total**: ~5-7 minutos
