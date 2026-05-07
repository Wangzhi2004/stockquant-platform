import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, Enum, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base, GUID


class BacktestJob(Base):
    __tablename__ = "backtest_jobs"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    strategy_id = Column(GUID, ForeignKey("strategy_configs.id"), nullable=True)
    name = Column(String(50), nullable=False)
    params = Column(JSON, default={})
    status = Column(Enum("pending", "running", "completed", "failed", name="backtest_status"), default="pending")
    progress = Column(Integer, default=0)
    result = Column(JSON, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="backtest_jobs")
