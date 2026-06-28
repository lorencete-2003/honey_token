# 🍯 Honeytoken Engine

Motor de honeytokens que genera datos falsos realistas, los inyecta en tu código y los monitoriza para detectar accesos no autorizados.

## Arquitectura

```
backend/      FastAPI + SQLite (API, generadores, scoring, alerting)
agent/        Monitor de filesystem cross-platform (watchdog)
injector/     CLI para inyectar tokens en .py y .env
dashboard/    React + Vite
```

## Tipos de tokens soportados

- `aws` — AWS Access Key + Secret
- `github` — Personal Access Token
- `jwt` — JWT con `kid` canario
- `database_url` — URL de PostgreSQL falsa
- `cookie` — Cookie de sesión
- `slack` / `discord` — Tokens de bot
- `password` — Credencial en código
- `canary_file` — Archivo `.env.honey` con contenido envenenado

## Requisitos

- Python 3.11+
- Node 18+

## Instalación

```bash
# Backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# Dashboard
cd dashboard
npm install
```

## Uso

### 1. Levantar la API

```bash
cd backend
python run.py
```

La API estará en `http://localhost:8000` y la documentación en `/docs`.

### 2. Crear un token vía API

```bash
curl -X POST http://localhost:8000/tokens/ \
  -H "Content-Type: application/json" \
  -d '{"token_type":"aws","name":"aws-staging-001","context":"staging","location":"./src/config.py"}'
```

### 3. Inyectar un token en el código

```bash
set HONEY_API_URL=http://localhost:8000
python -m backend.injector.cli --type aws --target ./src/config.py --context staging --line 12
```

### 4. Crear un archivo canario y vigilarlo

```bash
python -m backend.injector.cli --type canary_file --target ./secrets/.env.honey --context staging
python -m backend.app.monitor.fs_watcher honey_watcher_map.json
```

Cada vez que alguien toque el archivo, el monitor enviará un evento a la API.

### 5. Dashboard

```bash
cd dashboard
npm run dev
```

Abre `http://localhost:5173`.

## Alertas

Configura webhooks mediante variables de entorno:

```bash
set DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
set SLACK_WEBHOOK=https://hooks.slack.com/services/...
set GENERIC_WEBHOOK=https://tuservidor.com/webhook
```

El scoring de confianza se calcula automáticamente sumando pesos por tipo de evento y bonificando la correlación entre canales.

## Roadmap

- [x] Generator + 8 tipos de tokens
- [x] API REST con SQLite
- [x] Monitor de filesystem cross-platform
- [x] Alerting a Discord/Slack/webhook
- [x] Injector CLI básico
- [x] Dashboard React
- [ ] Migrar monitor a eBPF/auditd en Linux
- [ ] Soporte multi-lenguaje del injector (Go, JS)
- [ ] Docker Compose

## Licencia

MIT
