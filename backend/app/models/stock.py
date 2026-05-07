from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Numeric, DateTime
from app.models.base import Base


class Stock(Base):
    __tablename__ = "stocks"
    
    code = Column(String(10), primary_key=True)
    name = Column(String(50), nullable=False)
    exchange = Column(String(10), nullable=False)
    industry = Column(String(50), nullable=True)
    sector = Column(String(50), nullable=True)
    market_cap = Column(BigInteger, nullable=True)
    pe_ttm = Column(Numeric(10, 2), nullable=True)
    pb = Column(Numeric(10, 2), nullable=True)
    roe = Column(Numeric(10, 2), nullable=True)
    dividend_yield = Column(Numeric(10, 4), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
