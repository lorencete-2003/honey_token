from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import Token
from app.schemas import TokenCreate, TokenOut
from app.crud import create_token, get_token, get_tokens
from app.generator import generate_token

router = APIRouter(prefix="/tokens", tags=["tokens"])


@router.post("/", response_model=TokenOut)
async def create(request: TokenCreate, db: AsyncSession = Depends(get_db)):
    generated = generate_token(request.token_type, context=request.context, extra=request.extra)
    token = Token(
        id=generated["token_id"],
        token_type=request.token_type,
        name=request.name,
        value=generated["value"],
        fingerprint=generated["fingerprint"],
        location=request.location,
        context=request.context,
        status="active",
        extra=generated.get("extra", {}),
    )
    return await create_token(db, token)


@router.get("/", response_model=list[TokenOut])
async def list_tokens(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await get_tokens(db, skip=skip, limit=limit)


@router.get("/{token_id}", response_model=TokenOut)
async def read(token_id: str, db: AsyncSession = Depends(get_db)):
    token = await get_token(db, token_id)
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    return token
