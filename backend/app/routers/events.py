import datetime
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Event, Alert, Token
from app.schemas import EventCreate, EventOut
from app.crud import create_event as crud_create_event, mark_token_triggered, create_alert, get_events_for_token, get_recent_events
from app.alerting import Notifier

router = APIRouter(prefix="/events", tags=["events"])


SCORE_WEIGHTS = {
    "fs_open": 30,
    "dns_query": 50,
    "http_hit": 60,
    "webhook": 70,
}


def calculate_score(events: list[Event]) -> float:
    score = 0.0
    unique_types = set()
    for ev in events:
        score += SCORE_WEIGHTS.get(ev.event_type, 10)
        unique_types.add(ev.event_type)
    # bonus for correlation across multiple channels
    score += (len(unique_types) - 1) * 20
    return min(score, 100.0)


async def _maybe_alert(db: AsyncSession, token: Token, event: Event):
    events = await get_events_for_token(db, token.id, limit=100)
    score = calculate_score(events)
    if score < 80:
        return None
    notifier = Notifier()
    channels = notifier.enabled_channels()
    if not channels:
        return None
    message = (
        f"Token **{token.name or token.id}** ({token.token_type}) triggered "
        f"with confidence {score:.0f}%."
    )
    payload = {
        "token_id": token.id,
        "token_type": token.token_type,
        "location": token.location,
        "context": token.context,
        "score": score,
        "trigger_event": event.event_type,
        "details": event.details,
    }
    sent_channels = notifier.send(message, payload)
    alert = Alert(
        token_id=token.id,
        event_ids=[e.id for e in events],
        score=score,
        status="open",
        channels=sent_channels,
        message=message,
    )
    return await create_alert(db, alert)


@router.post("/", response_model=EventOut)
async def create_event(
    request: EventCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    token = await db.get(Token, request.token_id)
    if not token:
        # silently accept unknown tokens? No, 404
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Token not found")

    event = Event(
        token_id=request.token_id,
        event_type=request.event_type,
        source_ip=request.source_ip,
        process_info=request.process_info,
        details=request.details,
    )
    event = await crud_create_event(db, event)

    if token.status == "active":
        await mark_token_triggered(db, token.id)
        await _maybe_alert(db, token, event)

    return event


@router.get("/", response_model=list[EventOut])
async def list_recent(limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await get_recent_events(db, limit=limit)


@router.get("/token/{token_id}", response_model=list[EventOut])
async def by_token(token_id: str, db: AsyncSession = Depends(get_db)):
    return await get_events_for_token(db, token_id)
