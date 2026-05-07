from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal


class PortfolioBase(BaseModel):
    name: str
    description: Optional[str] = None
    initial_capital: Optional[Decimal] = Decimal("1000000")


class PortfolioCreate(PortfolioBase):
    pass


class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    initial_capital: Optional[Decimal] = None


class HoldingBase(BaseModel):
    stock_code: str
    stock_name: str
    cost_price: Decimal
    quantity: int
    buy_date: date


class HoldingCreate(HoldingBase):
    pass


class HoldingUpdate(BaseModel):
    cost_price: Optional[Decimal] = None
    quantity: Optional[int] = None


class HoldingResponse(HoldingBase):
    id: UUID
    portfolio_id: UUID
    created_at: datetime
    updated_at: datetime
    current_price: Optional[Decimal] = None
    market_value: Optional[Decimal] = None
    profit_loss: Optional[Decimal] = None
    profit_loss_pct: Optional[Decimal] = None
    
    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    stock_code: str
    type: str
    price: Decimal
    quantity: int
    fee: Optional[Decimal] = Decimal("0")
    date: date


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: UUID
    portfolio_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class PortfolioResponse(PortfolioBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    total_market_value: Optional[Decimal] = None
    total_cost: Optional[Decimal] = None
    total_profit_loss: Optional[Decimal] = None
    total_profit_loss_pct: Optional[Decimal] = None
    holdings_count: Optional[int] = None
    
    class Config:
        from_attributes = True


class PortfolioDetailResponse(PortfolioResponse):
    holdings: List[HoldingResponse]
    transactions: List[TransactionResponse]


class HoldingImportItem(BaseModel):
    stock_code: str
    stock_name: str
    cost_price: Decimal
    quantity: int
    buy_date: date


class HoldingImportRequest(BaseModel):
    holdings: List[HoldingImportItem]


class HoldingImportResponse(BaseModel):
    success_count: int
    failed_count: int
    errors: List[str] = []
    imported: List[HoldingResponse] = []
