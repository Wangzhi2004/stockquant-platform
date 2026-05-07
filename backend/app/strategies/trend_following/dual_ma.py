import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class DualMAStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("双均线趋势跟踪", params)
        self.description = "基于双均线交叉的趋势跟踪策略，金叉买入死叉卖出"
        self.fast_period = self.params.get("fast_period", 10)
        self.slow_period = self.params.get("slow_period", 30)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df) or len(df) < self.slow_period:
            return []

        df = df.copy()
        df["ma_fast"] = df["close"].rolling(window=self.fast_period).mean()
        df["ma_slow"] = df["close"].rolling(window=self.slow_period).mean()

        signals = []

        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]
            stock_code = df["stock_code"].iloc[-1] if "stock_code" in df.columns else ""

            if prev["ma_fast"] <= prev["ma_slow"] and curr["ma_fast"] > curr["ma_slow"]:
                strength = 4
                signals.append(Signal(
                    stock_code=stock_code,
                    signal_type="buy",
                    strength=strength,
                    price=curr["close"],
                    description=f"双均线金叉买入: MA{self.fast_period}({curr['ma_fast']:.2f})上穿MA{self.slow_period}({curr['ma_slow']:.2f})",
                    indicators={
                        f"ma{self.fast_period}": curr["ma_fast"],
                        f"ma{self.slow_period}": curr["ma_slow"]
                    }
                ))

            elif prev["ma_fast"] >= prev["ma_slow"] and curr["ma_fast"] < curr["ma_slow"]:
                strength = 4
                signals.append(Signal(
                    stock_code=stock_code,
                    signal_type="sell",
                    strength=strength,
                    price=curr["close"],
                    description=f"双均线死叉卖出: MA{self.fast_period}({curr['ma_fast']:.2f})下穿MA{self.slow_period}({curr['ma_slow']:.2f})",
                    indicators={
                        f"ma{self.fast_period}": curr["ma_fast"],
                        f"ma{self.slow_period}": curr["ma_slow"]
                    }
                ))

        return signals
