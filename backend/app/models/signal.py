import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Numeric, DateTime, Integer, Enum, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class StrategySignal(Base):
    __tablename__ = "strategy_signals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategy_configs.id"), nullable=False)
    stock_code = Column(String(10), nullable=False)
    signal_type = Column(Enum("buy", "sell", "strong_buy", "strong_sell", "hold", name="signal_type"), nullable=False)
    signal_strength = Column(Integer, default=1)
    price = Column(Numeric(12, 4), nullable=True)
    date = Column(DateTime, nullable=False)
    description = Column(Text, nullable=True)
    is_validated = Column(Boolean, default=False)
    validated_result = Column(Numeric(10, 4), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
