from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import AlertOut
from app.crud import get_alerts, get_alert, update_alert_status

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=list[AlertOut])
async def list_alerts(status: str | None = None, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await get_alerts(db, status=status, limit=limit)


@router.get("/{alert_id}", response_model=AlertOut)
async def read(alert_id: int, db: AsyncSession = Depends(get_db)):
    alert = await get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.patch("/{alert_id}/status", response_model=AlertOut)
async def set_status(alert_id: int, status: str, db: AsyncSession = Depends(get_db)):
    alert = await update_alert_status(db, alert_id, status)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
