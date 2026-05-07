from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from decimal import Decimal
import pandas as pd


class Signal:
    def __init__(
        self,
        stock_code: str,
        signal_type: str,  # buy, sell, strong_buy, strong_sell, hold
        strength: int,  # 1-5
        price: Optional[Decimal] = None,
        date: Optional[datetime] = None,
        description: str = "",
        indicators: Optional[Dict[str, Any]] = None
    ):
        self.stock_code = stock_code
        self.signal_type = signal_type
        self.strength = strength
        self.price = price
        self.date = date or datetime.now()
        self.description = description
        self.indicators = indicators or {}


class StrategyBase(ABC):
    def __init__(self, name: str, params: Optional[Dict[str, Any]] = None):
        self.name = name
        self.params = params or {}
        self.description = ""

    @abstractmethod
    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        """分析数据并生成信号"""
        pass

    def validate_data(self, df: pd.DataFrame) -> bool:
        """验证数据是否足够"""
        required_columns = ["open", "high", "low", "close", "volume"]
        return all(col in df.columns for col in required_columns) and len(df) >= 20
