from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import StatsOut
from app.crud import get_stats

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/", response_model=StatsOut)
async def stats(db: AsyncSession = Depends(get_db)):
    return await get_stats(db)
