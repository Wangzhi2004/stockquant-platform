from sqlalchemy import Column, String, Date, DateTime, Numeric, BigInteger, UniqueConstraint, Integer
from app.models.base import Base


class KlineDaily(Base):
    __tablename__ = "kline_daily"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    stock_code = Column(String(10), nullable=False)
    date = Column(Date, nullable=False)
    open = Column(Numeric(12, 4), nullable=False)
    high = Column(Numeric(12, 4), nullable=False)
    low = Column(Numeric(12, 4), nullable=False)
    close = Column(Numeric(12, 4), nullable=False)
    volume = Column(BigInteger, nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    change_pct = Column(Numeric(10, 4), nullable=True)
    
    __table_args__ = (
        UniqueConstraint("stock_code", "date", name="uix_kline_stock_date"),
    )


class KlineMinute(Base):
    __tablename__ = "kline_minute"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    stock_code = Column(String(10), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    interval_minutes = Column(Integer, nullable=False)  # 1, 5, 15, 30, 60
    open = Column(Numeric(12, 4), nullable=False)
    high = Column(Numeric(12, 4), nullable=False)
    low = Column(Numeric(12, 4), nullable=False)
    close = Column(Numeric(12, 4), nullable=False)
    volume = Column(BigInteger, nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    
    __table_args__ = (
        UniqueConstraint("stock_code", "timestamp", "interval_minutes", name="uix_kline_minute_stock_ts"),
    )
