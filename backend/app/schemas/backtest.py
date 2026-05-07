from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal


class BacktestConfigSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    start_date: date
    end_date: date
    initial_capital: Decimal = Decimal("1000000")
    commission_rate: Decimal = Decimal("0.0003")
    slippage: Decimal = Decimal("0.001")
    max_positions: int = 10
    position_size: Decimal = Decimal("0.1")
    stop_loss: Optional[Decimal] = Decimal("0.08")
    take_profit: Optional[Decimal] = Decimal("0.2")


class BacktestCreateRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., min_length=1, max_length=50)
    strategy_type: str
    strategy_params: Optional[Dict[str, Any]] = {}
    stock_codes: List[str]
    config: BacktestConfigSchema


class BacktestRunRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    backtest_id: UUID


class TradeRecordSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: str
    stock_code: str
    action: str
    price: float
    quantity: int
    amount: float
    commission: float
    reason: str


class DailyValueSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: str
    total_value: float
    cash: float
    position_count: int


class BacktestSummarySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    initial_capital: float
    final_capital: float
    total_return: float
    total_return_pct: float
    sharpe_ratio: float
    max_drawdown: float
    max_drawdown_pct: float
    win_rate: float
    profit_factor: float
    total_trades: int
    winning_trades: int
    losing_trades: int


class BacktestResultSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    summary: BacktestSummarySchema
    trades: List[TradeRecordSchema]
    daily_values: List[DailyValueSchema]
    equity_curve: List[Dict[str, Any]]


class BacktestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    strategy_id: Optional[UUID] = None
    name: str
    params: Dict[str, Any]
    status: str
    progress: int
    result: Optional[BacktestResultSchema] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime


class BacktestListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    status: str
    progress: int
    created_at: datetime
    total_return_pct: Optional[float] = None
