from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from decimal import Decimal


class StockInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    name: str
    exchange: str
    industry: Optional[str] = None
    sector: Optional[str] = None
    market_cap: Optional[int] = None
    pe_ttm: Optional[Decimal] = None
    pb: Optional[Decimal] = None
    roe: Optional[Decimal] = None
    dividend_yield: Optional[Decimal] = None


class KlineData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: str
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: int
    amount: Decimal
    change_pct: Optional[Decimal] = None


class IndexQuote(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    name: str
    price: Decimal
    change: Decimal
    change_pct: Decimal


class HotSector(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    change_pct: Decimal
    leading_stock: Optional[str] = None
