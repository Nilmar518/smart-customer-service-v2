# Setup Rápido - Smart Customer Service v2

Guía de configuración rápida para nuevos desarrolladores.

---

## 1. Clonar Repositorio

```bash
git clone https://github.com/YOUR_ORG/smart-customer-service-v2.git
cd smart-customer-service-v2
```

---

## 2. Instalar Dependencias

```bash
# Instalar pnpm si no lo tienes
npm install -g pnpm@9.15.4

# Instalar dependencias del proyecto
pnpm install

# Esto instalará automáticamente:
# - Dependencias de backend y frontend
# - Herramientas de desarrollo (commitlint, husky)
# - Configurará git hooks para validación de commits
```

---

## 3. Configurar Variables de Entorno

### Backend

Crear `packages/backend/.env`:

```bash
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=smart_customer_service

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Firebase Admin (Firestore)
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
FIREBASE_PROJECT_ID=pure-highlander-487218-g2

# Weather API (OpenWeatherMap)
WEATHER_API_KEY=your-openweathermap-api-key
WEATHER_DEFAULT_CITY=La Paz

# Database initialization
CLEAN_DB_ON_START=false
```

### Service Account (Firestore)

1. Solicitar `service-account.json` al team lead
2. Guardar en `packages/backend/service-account.json`
3. **NUNCA commitear este archivo** (está en .gitignore)

---

## 4. Base de Datos PostgreSQL

### Opción A: Docker (Recomendado)

```bash
docker run --name postgres-smart-service \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=smart_customer_service \
  -p 5432:5432 \
  -d postgres:15-alpine
```

### Opción B: Instalación Local

1. Instalar PostgreSQL 15+
2. Crear base de datos:
   ```bash
   createdb smart_customer_service
   ```

---

## 5. Ejecutar Proyecto

### Backend

```bash
cd packages/backend
pnpm dev

# Esperado:
# [DatabaseInitService] ✓ Database initialized successfully
# [NestApplication] Nest application successfully started
# [NestApplication] Listening on http://localhost:8080
```

### Frontend

```bash
cd packages/frontend
pnpm dev

# Esperado:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
```

---

## 6. Ejecutar Tests

```bash
# Tests unitarios (55 tests, 100% coverage)
pnpm api:tests:ut

# Tests E2E (21 tests, 100% coverage)
pnpm api:tests:e2e

# Ambos deben pasar:
# ✓ Tests passed
# ✓ Coverage: 100%
```

---

## 7. Verificar Git Hooks

```bash
# Intenta un commit con formato incorrecto
git add .
git commit -m "Added something"

# Esperado (debe fallar):
# ⧗   input: Added something
# ✖   subject may not be empty [subject-empty]
# ✖   type may not be empty [type-empty]

# Intenta con formato correcto
git commit -m "test(setup): verify commitlint hook"

# Esperado (debe pasar):
# [branch abc123] test(setup): verify commitlint hook
```

---

## 8. Flujo de Desarrollo

### Crear Feature

```bash
# Actualizar main
git checkout main
git pull origin main

# Crear feature branch
git checkout -b feature/mi-feature

# Desarrollar con commits convencionales
git add .
git commit -m "feat(scope): descripción"

# Push
git push -u origin feature/mi-feature

# Crear PR
gh pr create --base main --title "feat(scope): descripción"
```

### Tipos de Commit Permitidos

```bash
feat(scope): nueva funcionalidad
fix(scope): corrección de bug
docs(scope): cambios en documentación
test(scope): agregar tests
refactor(scope): refactorización
chore(scope): mantenimiento
ci(scope): cambios en CI/CD
build(scope): cambios en build
perf(scope): mejoras de performance
style(scope): formato (no lógica)
```

---

## 9. Documentación Importante

Leer antes de empezar a desarrollar:

1. **[CLAUDE.md](./CLAUDE.md)** - Estructura del proyecto, comandos, convenciones
2. **[docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md)** - Workflow completo, Conventional Commits, branching
3. **[.planning/plan.md](./.planning/plan.md)** - Estado del proyecto, fases completadas

---

## 10. Comandos Útiles

```bash
# Desarrollo
pnpm dev                  # Ejecutar todo (backend + frontend)
pnpm build                # Build todo
pnpm lint                 # Lint todo

# Tests
pnpm api:tests:ut         # Unit tests backend
pnpm api:tests:e2e        # E2E tests backend

# Commits
pnpm commit:check         # Verificar último commit
git log --oneline -10     # Ver últimos commits

# Git
git branch --merged main  # Ver ramas merged
gh pr list                # Listar PRs
gh pr view 123            # Ver PR específico
gh pr merge --squash      # Merge PR con squash
```

---

## 11. Troubleshooting

### Error: "Cannot find module 'firebase-admin'"

```bash
cd packages/backend
pnpm install
```

### Error: "Database connection failed"

Verificar que PostgreSQL está corriendo:
```bash
docker ps  # Si usas Docker
# O
pg_isready  # Si usas instalación local
```

### Error: "Port 8080 already in use"

Matar proceso:
```bash
# Linux/Mac
lsof -ti:8080 | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Tests fallan con "Cannot find module"

```bash
pnpm install  # En la raíz
```

### Git hook no funciona

```bash
pnpm prepare  # Reinstala husky
chmod +x .husky/commit-msg  # Da permisos (Mac/Linux)
```

### Error: "GOOGLE_APPLICATION_CREDENTIALS not found"

Verificar que `service-account.json` existe:
```bash
ls -la packages/backend/service-account.json
```

Si no existe, solicitar al team lead.

---

## 12. Recursos

- **GitHub**: [Repository URL]
- **Documentación**: [docs/](./docs/)
- **Slack**: #smart-customer-service
- **API Docs**: http://localhost:8080/api (después de ejecutar backend)

---

## 13. Checklist de Setup Completo

Marca cada paso completado:

- [ ] Repositorio clonado
- [ ] `pnpm install` ejecutado exitosamente
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Service account obtenido (`service-account.json`)
- [ ] PostgreSQL corriendo
- [ ] Backend ejecuta correctamente (`pnpm dev` en packages/backend)
- [ ] Frontend ejecuta correctamente (`pnpm dev` en packages/frontend)
- [ ] Tests unitarios pasan (`pnpm api:tests:ut`)
- [ ] Tests E2E pasan (`pnpm api:tests:e2e`)
- [ ] Git hook funciona (commit inválido rechazado)
- [ ] Documentación leída (CLAUDE.md, CONTRIBUTING.md)
- [ ] Primer feature branch creado
- [ ] Primer commit convencional realizado
- [ ] Primer PR creado (opcional, para práctica)

---

**¡Listo para desarrollar!** 🚀

Si tienes problemas, consulta:
1. [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) - FAQs
2. [CLAUDE.md](./CLAUDE.md) - Convenciones
3. Slack #smart-customer-service
4. Team lead
