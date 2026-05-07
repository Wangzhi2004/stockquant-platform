import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base, GUID


class StrategyConfig(Base):
    __tablename__ = "strategy_configs"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    name = Column(String(50), nullable=False)
    type = Column(String(50), nullable=False)
    params = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="strategy_configs")
