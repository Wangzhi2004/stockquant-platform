import pandas as pd
import numpy as np
from typing import List
from app.strategies.base import StrategyBase, Signal


class LowVolatilityStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("低波动策略", params)
        self.description = "基于波动率因子的低波动选股策略，追求稳健收益"
        self.vol_period = self.params.get("vol_period", 20)
        self.max_volatility = self.params.get("max_volatility", 30)
        self.min_return = self.params.get("min_return", 0)
        self.top_n = self.params.get("top_n", 20)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df) or len(df) < self.vol_period:
            return []

        df = df.copy()
        df["returns"] = df["close"].pct_change() * 100
        df["volatility"] = df["returns"].rolling(window=self.vol_period).std() * np.sqrt(252)

        curr = df.iloc[-1]
        stock_code = df["stock_code"].iloc[-1] if "stock_code" in df.columns else ""

        volatility = curr["volatility"]
        avg_return = df["returns"].iloc[-self.vol_period:].mean() * 252

        signals = []

        if volatility is not None and volatility <= self.max_volatility:
            if avg_return >= self.min_return:
                strength = max(1, int(5 - volatility / self.max_volatility * 3))
                signals.append(Signal(
                    stock_code=stock_code,
                    signal_type="buy",
                    strength=strength,
                    price=curr["close"],
                    description=f"低波动优质股: 年化波动率{volatility:.1f}%<={self.max_volatility}%, 年化收益{avg_return:.1f}%",
                    indicators={
                        "volatility": volatility,
                        "annual_return": avg_return,
                        "sharpe_like": avg_return / volatility if volatility > 0 else 0
                    }
                ))

        return signals
