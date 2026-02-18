# Verificación de Servicios Cloud Run Existentes

## Servicios Identificados

Según tu configuración:
- **Backend**: `smart-customer-backend-v2`
- **Frontend**: `smart-customer-frontend-v2`

---

## Paso 1: Verificar Servicios en Console

### 1.1 Abrir Cloud Run Console

🔗 **URL**: https://console.cloud.google.com/run?project=pure-highlander-487218-g2

### 1.2 Verificar Backend Service

Busca: `smart-customer-backend-v2`

**Información necesaria**:
- ✅ Región: __________ (esperado: `us-east1`)
- ✅ URL del servicio: __________
- ✅ Puerto configurado: __________ (esperado: `8080`)
- ✅ Imagen actual: __________
- ✅ Variables de entorno: (listar las que están configuradas)
- ✅ Secrets montados: (listar cuáles)

### 1.3 Verificar Frontend Service

Busca: `smart-customer-frontend-v2`

**Información necesaria**:
- ✅ Región: __________ (esperado: `us-east1`)
- ✅ URL del servicio: __________
- ✅ Puerto configurado: __________ (esperado: `8080`)
- ✅ Imagen actual: __________

---

## Paso 2: Verificar Artifact Registry

### 2.1 Abrir Artifact Registry Console

🔗 **URL**: https://console.cloud.google.com/artifacts?project=pure-highlander-487218-g2

### 2.2 Buscar Repositorio Existente

**¿Existe un repositorio Docker?**
- ✅ Sí → Nombre: __________ Región: __________
- ❌ No → Necesitamos crear `smart-customer-service` en `us-east1`

---

## Paso 3: Verificar Secret Manager

### 3.1 Abrir Secret Manager Console

🔗 **URL**: https://console.cloud.google.com/security/secret-manager?project=pure-highlander-487218-g2

### 3.2 Verificar Secrets Necesarios

Marca cuáles **YA EXISTEN**:

**Secrets de Base de Datos**:
- [ ] `DB_HOST`
- [ ] `DB_PORT`
- [ ] `DB_USER`
- [ ] `DB_PASSWORD`
- [ ] `DB_NAME`

**Secrets de Aplicación**:
- [ ] `JWT_SECRET`
- [ ] `WEATHER_API_KEY`
- [ ] `WEATHER_DEFAULT_CITY`
- [ ] `FIREBASE_PROJECT_ID`

**Nota**: Solo necesitamos crear los que **NO** existen.

---

## Paso 4: Verificar Service Accounts

### 4.1 Abrir IAM Console

🔗 **URL**: https://console.cloud.google.com/iam-admin/serviceaccounts?project=pure-highlander-487218-g2

### 4.2 Buscar Service Account para GitHub Actions

**¿Existe un service account para CI/CD?**
- ✅ Sí → Nombre: __________ Email: __________
- ❌ No → Necesitamos crear `github-actions-cd@pure-highlander-487218-g2.iam.gserviceaccount.com`

**Si existe**, verificar roles:
- [ ] Artifact Registry Writer
- [ ] Cloud Run Admin
- [ ] Secret Manager Secret Accessor
- [ ] Service Account User

---

## Paso 5: Información de la Imagen Actual

### 5.1 ¿De dónde vienen las imágenes actuales?

Click en el servicio backend → Tab **REVISIONS** → Ver **Image**

**Formato esperado**:
```
us-east1-docker.pkg.dev/pure-highlander-487218-g2/REPO_NAME/IMAGE_NAME:TAG
```

**Anota aquí**:
- Registry: __________
- Repositorio: __________
- Imagen backend: __________
- Imagen frontend: __________

---

## Resultado de la Verificación

Después de completar los pasos anteriores, tendrás clara la situación:

### Escenario A: Todo Existe (Ideal)
- ✅ Servicios Cloud Run configurados
- ✅ Artifact Registry existe
- ✅ Secrets configurados
- ✅ Service Account existe

**Acción**: Solo necesitas configurar `GCP_SA_KEY` en GitHub y hacer merge.

### Escenario B: Parcialmente Configurado
- ✅ Servicios Cloud Run configurados
- ❌ Algunos secrets faltan
- ❌ Artifact Registry no existe
- ❌ Service Account no existe

**Acción**: Crear recursos faltantes siguiendo la guía en `MANUAL_GCP_SETUP.md`.

### Escenario C: Servicios Configurados, Sin CI/CD
- ✅ Servicios Cloud Run funcionando
- ❌ No hay infraestructura de CI/CD

**Acción**: Configuración completa siguiendo `MANUAL_GCP_SETUP.md`.

---

## Próximos Pasos Según Escenario

### Si Todo Existe (Escenario A):

1. **Obtener Key del Service Account Existente** (o crear nueva):
   ```
   Console → IAM → Service Accounts → github-actions-cd
   → KEYS → ADD KEY → Create new key → JSON → CREATE
   ```

2. **Configurar en GitHub**:
   ```powershell
   cd ~\Downloads
   gh secret set GCP_SA_KEY < pure-highlander-XXXXX.json --repo Nilmar518/smart-customer-service-v2
   Remove-Item pure-highlander-XXXXX.json
   ```

3. **Listo para merge**.

### Si Faltan Recursos (Escenario B o C):

Crear recursos faltantes usando:
- `scripts/MANUAL_GCP_SETUP.md` (guía paso a paso)
- O `scripts/setup-gcp.ps1` (después de actualizar Python)

---

## Comandos Alternativos (Si actualizas Python)

```powershell
# Después de instalar Python 3.11+
$env:CLOUDSDK_PYTHON = "C:\Python311\python.exe"

# Verificar servicios
gcloud run services list --project=pure-highlander-487218-g2 --region=us-east1

# Ver configuración de backend
gcloud run services describe smart-customer-backend-v2 \
  --region=us-east1 \
  --project=pure-highlander-487218-g2

# Ver configuración de frontend
gcloud run services describe smart-customer-frontend-v2 \
  --region=us-east1 \
  --project=pure-highlander-487218-g2

# Listar secrets
gcloud secrets list --project=pure-highlander-487218-g2

# Listar service accounts
gcloud iam service-accounts list --project=pure-highlander-487218-g2
```

---

## Información a Reportar

Después de verificar, reporta:

1. **¿Qué región usan los servicios?** (us-east1 o diferente)
2. **¿Existe Artifact Registry?** (Sí/No, nombre si existe)
3. **¿Cuántos secrets existen?** (0-9)
4. **¿Existe service account para CI/CD?** (Sí/No)
5. **¿De dónde vienen las imágenes actuales?** (Registry completo)

Con esta información, ajustaré el workflow para que coincida **exactamente** con tu configuración existente.
