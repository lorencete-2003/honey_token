from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routers import tokens, events, alerts, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Inicializa la base de datos al arrancar la aplicación."""
    await init_db()
    yield


app = FastAPI(
    title="Honeytoken Engine",
    description="Genera, inyecta y monitoriza honeytokens.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tokens.router)
app.include_router(events.router)
app.include_router(alerts.router)
app.include_router(stats.router)


@app.get("/")
async def root():
    return {"status": "ok", "service": "honeytoken-engine"}
