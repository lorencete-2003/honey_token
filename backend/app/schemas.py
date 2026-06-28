from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field


class TokenBase(BaseModel):
    token_type: str
    name: Optional[str] = None
    location: Optional[str] = None
    context: Optional[str] = None


class TokenCreate(TokenBase):
    extra: dict = Field(default_factory=dict)


class TokenOut(TokenBase):
    id: str
    value: dict
    fingerprint: str
    status: str
    created_at: datetime
    triggered_at: Optional[datetime] = None
    extra: dict

    class Config:
        from_attributes = True


class EventBase(BaseModel):
    token_id: str
    event_type: str
    source_ip: Optional[str] = None
    process_info: dict = Field(default_factory=dict)
    details: dict = Field(default_factory=dict)


class EventCreate(EventBase):
    pass


class EventOut(EventBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True


class AlertBase(BaseModel):
    token_id: str
    score: float
    event_ids: list[int] = Field(default_factory=list)
    message: Optional[str] = None


class AlertOut(AlertBase):
    id: int
    status: str
    sent_at: datetime
    channels: list[str]

    class Config:
        from_attributes = True


class AlertingConfig(BaseModel):
    discord_webhook: Optional[str] = None
    slack_webhook: Optional[str] = None
    generic_webhook: Optional[str] = None
    enabled_channels: list[str] = Field(default_factory=list)


class StatsOut(BaseModel):
    total_tokens: int
    active_tokens: int
    triggered_tokens: int
    total_events: int
    open_alerts: int
