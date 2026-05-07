from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class SignalBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    stock_code: str
    signal_type: str
    signal_strength: int = 1
    price: Optional[Decimal] = None
    description: Optional[str] = None


class SignalCreate(SignalBase):
    pass


class SignalUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    is_validated: Optional[bool] = None
    validated_result: Optional[Decimal] = None


class SignalResponse(SignalBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    strategy_id: Optional[UUID] = None
    date: datetime
    is_validated: bool
    validated_result: Optional[Decimal] = None
    created_at: datetime


class SignalScanRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    stock_code: str
    strategy_type: Optional[str] = None


class SignalStats(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total: int
    buy_count: int
    sell_count: int
    buy_ratio: float
