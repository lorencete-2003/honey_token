import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Token, Event, Alert


# ---- Tokens ----

async def create_token(db: AsyncSession, token: Token) -> Token:
    db.add(token)
    await db.commit()
    await db.refresh(token)
    return token


async def get_token(db: AsyncSession, token_id: str) -> Token | None:
    return await db.get(Token, token_id)


async def get_tokens(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(Token).offset(skip).limit(limit).order_by(Token.created_at.desc()))
    return result.scalars().all()


async def mark_token_triggered(db: AsyncSession, token_id: str):
    token = await get_token(db, token_id)
    if token and token.status == "active":
        token.status = "triggered"
        token.triggered_at = datetime.datetime.utcnow()
        await db.commit()
        await db.refresh(token)
    return token


# ---- Events ----

async def create_event(db: AsyncSession, event: Event) -> Event:
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


async def get_events_for_token(db: AsyncSession, token_id: str, limit: int = 100):
    result = await db.execute(
        select(Event)
        .where(Event.token_id == token_id)
        .order_by(Event.timestamp.desc())
        .limit(limit)
    )
    return result.scalars().all()


async def get_recent_events(db: AsyncSession, limit: int = 100):
    result = await db.execute(select(Event).order_by(Event.timestamp.desc()).limit(limit))
    return result.scalars().all()


# ---- Alerts ----

async def create_alert(db: AsyncSession, alert: Alert) -> Alert:
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return alert


async def get_alerts(db: AsyncSession, status: str | None = None, limit: int = 100):
    stmt = select(Alert)
    if status:
        stmt = stmt.where(Alert.status == status)
    result = await db.execute(stmt.order_by(Alert.sent_at.desc()).limit(limit))
    return result.scalars().all()


async def get_alert(db: AsyncSession, alert_id: int) -> Alert | None:
    return await db.get(Alert, alert_id)


async def update_alert_status(db: AsyncSession, alert_id: int, status: str):
    alert = await get_alert(db, alert_id)
    if alert:
        alert.status = status
        await db.commit()
        await db.refresh(alert)
    return alert


# ---- Stats ----

async def get_stats(db: AsyncSession):
    total_tokens = await db.scalar(select(func.count(Token.id)))
    active_tokens = await db.scalar(select(func.count(Token.id)).where(Token.status == "active"))
    triggered_tokens = await db.scalar(select(func.count(Token.id)).where(Token.status == "triggered"))
    total_events = await db.scalar(select(func.count(Event.id)))
    open_alerts = await db.scalar(select(func.count(Alert.id)).where(Alert.status == "open"))
    return {
        "total_tokens": total_tokens or 0,
        "active_tokens": active_tokens or 0,
        "triggered_tokens": triggered_tokens or 0,
        "total_events": total_events or 0,
        "open_alerts": open_alerts or 0,
    }
