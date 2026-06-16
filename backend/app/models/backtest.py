import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.models.base import Base


class BacktestJob(Base):
    __tablename__ = "backtest_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategy_configs.id"), nullable=True)
    name = Column(String(50), nullable=False)
    params = Column(JSONB, default={})
    status = Column(Enum("pending", "running", "completed", "failed", name="backtest_status"), default="pending")
    progress = Column(Integer, default=0)
    result = Column(JSONB, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
