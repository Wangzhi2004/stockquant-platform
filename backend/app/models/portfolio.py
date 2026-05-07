import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Numeric, DateTime, Integer, Enum
from sqlalchemy.orm import relationship
from app.models.base import Base, GUID


class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    name = Column(String(50), nullable=False)
    description = Column(String, nullable=True)
    initial_capital = Column(Numeric(15, 2), default=1000000)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="portfolios")
    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="portfolio", cascade="all, delete-orphan")


class Holding(Base):
    __tablename__ = "holdings"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(GUID, ForeignKey("portfolios.id"), nullable=False)
    stock_code = Column(String(10), nullable=False)
    stock_name = Column(String(50), nullable=False)
    cost_price = Column(Numeric(12, 4), nullable=False)
    quantity = Column(Integer, nullable=False)
    buy_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    portfolio = relationship("Portfolio", back_populates="holdings")


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    portfolio_id = Column(GUID, ForeignKey("portfolios.id"), nullable=False)
    stock_code = Column(String(10), nullable=False)
    type = Column(Enum("buy", "sell", "dividend", "split", name="transaction_type"), nullable=False)
    price = Column(Numeric(12, 4), nullable=False)
    quantity = Column(Integer, nullable=False)
    fee = Column(Numeric(12, 4), default=0)
    date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    portfolio = relationship("Portfolio", back_populates="transactions")
