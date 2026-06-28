import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Float
from app.database import Base


class Token(Base):
    __tablename__ = "tokens"

    id = Column(String, primary_key=True, index=True)
    token_type = Column(String, nullable=False, index=True)
    name = Column(String, nullable=True)
    value = Column(JSON, nullable=False)
    fingerprint = Column(String, nullable=False, unique=True, index=True)
    location = Column(String, nullable=True)
    context = Column(String, nullable=True)
    status = Column(String, default="active")  # active, triggered, disabled
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    triggered_at = Column(DateTime, nullable=True)
    extra = Column(JSON, default=dict)


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    token_id = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False)  # fs_open, dns_query, http_hit, webhook
    source_ip = Column(String, nullable=True)
    process_info = Column(JSON, default=dict)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    token_id = Column(String, nullable=False, index=True)
    event_ids = Column(JSON, default=list)
    score = Column(Float, default=0.0)
    status = Column(String, default="open")  # open, acknowledged, closed
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)
    channels = Column(JSON, default=list)
    message = Column(Text, nullable=True)
