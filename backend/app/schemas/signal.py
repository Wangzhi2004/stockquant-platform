from typing import List, Optional, Dict
from datetime import datetime, date
from decimal import Decimal


class SignalCreate(BaseModel):
    strategy_id: Optional[str] = None
    stock_code: str
    signal_type: str
    signal_strength: int = 1
    price: Optional[Decimal] = None
    date: datetime
    description: Optional[str] = None


class SignalResponse(BaseModel):
    id: str
    strategy_id: Optional[str]
    stock_code: str
    signal_type: str
    signal_strength: int
    price: Optional[Decimal]
    date: datetime
    description: Optional[str]
    is_validated: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class SignalScanRequest(BaseModel):
    stock_code: str
    strategy_type: Optional[str] = None
