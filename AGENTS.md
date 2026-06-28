# Guía para agentes - Honeytoken Engine

## Convenciones

- Backend en **Python 3.11+** con **FastAPI** y **SQLAlchemy 2.0 async**.
- Código en inglés, comentarios y documentación en español/inglés según contexto.
- Prefiere dependencias ligeras y bien mantenidas.

## Estructura

- `backend/app/routers/` — endpoints REST.
- `backend/app/generator/` — un módulo por tipo de token; extiende `HoneytokenGenerator`.
- `backend/app/monitor/` — watchers. Actualmente `fs_watcher.py` usa `watchdog` para funcionar en Windows/Linux/macOS.
- `backend/app/alerting/` — notificaciones a Discord/Slack/webhook genérico.
- `backend/injector/` — CLI con `click` para inyectar tokens.
- `dashboard/` — React + Vite.

## Cómo añadir un nuevo tipo de token

1. Crea un generador en `backend/app/generator/<tipo>.py` que herede de `HoneytokenGenerator`.
2. Regístralo en `backend/app/generator/factory.py`.
3. Añade las variables de entorno correspondientes en `backend/injector/cli.py` (`PY_VARIABLES`).

## Tests

Actualmente no hay suite de tests. Antes de añadir tests, pregunta al usuario.

## Notas

- Docker no está disponible en el entorno actual; no generes `docker-compose.yml` sin confirmar.
- El monitor eBPF es objetivo futuro; la versión actual es cross-platform con `watchdog`.
