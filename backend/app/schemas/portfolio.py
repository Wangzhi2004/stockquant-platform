from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal


class PortfolioBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    description: Optional[str] = None
    initial_capital: Optional[Decimal] = Decimal("1000000")


class PortfolioCreate(PortfolioBase):
    pass


class PortfolioUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    description: Optional[str] = None
    initial_capital: Optional[Decimal] = None


class HoldingBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    stock_code: str
    stock_name: str
    cost_price: Decimal
    quantity: int
    buy_date: date


class HoldingCreate(HoldingBase):
    pass


class HoldingUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    cost_price: Optional[Decimal] = None
    quantity: Optional[int] = None


class HoldingResponse(HoldingBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    portfolio_id: UUID
    created_at: datetime
    updated_at: datetime
    current_price: Optional[Decimal] = None
    market_value: Optional[Decimal] = None
    profit_loss: Optional[Decimal] = None
    profit_loss_pct: Optional[Decimal] = None


class TransactionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    stock_code: str
    type: str
    price: Decimal
    quantity: int
    fee: Optional[Decimal] = Decimal("0")
    date: date


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    portfolio_id: UUID
    created_at: datetime


class PortfolioResponse(PortfolioBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime
    total_market_value: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    total_profit_loss: Optional[Decimal] = None
    total_profit_loss_pct: Optional[Decimal] = None
    holdings_count: Optional[int] = None


class PortfolioDetailResponse(PortfolioResponse):
    model_config = ConfigDict(from_attributes=True)

    holdings: List[HoldingResponse]
    transactions: List[TransactionResponse]
