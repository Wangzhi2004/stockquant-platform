import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class TurtleStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("海龟交易", params)
        self.description = "经典海龟交易法则，突破N日高点买入，跌破N日低点卖出"
        self.entry_period = self.params.get("entry_period", 20)
        self.exit_period = self.params.get("exit_period", 10)
        self.atr_period = self.params.get("atr_period", 20)
        self.risk_factor = self.params.get("risk_factor", 0.02)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df) or len(df) < self.entry_period:
            return []

        df = df.copy()

        df["high_max"] = df["high"].rolling(window=self.entry_period).max()
        df["low_min"] = df["low"].rolling(window=self.exit_period).min()

        df["tr1"] = df["high"] - df["low"]
        df["tr2"] = abs(df["high"] - df["close"].shift(1))
        df["tr3"] = abs(df["low"] - df["close"].shift(1))
        df["tr"] = df[["tr1", "tr2", "tr3"]].max(axis=1)
        df["atr"] = df["tr"].rolling(window=self.atr_period).mean()

        signals = []

        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]
            stock_code = df["stock_code"].iloc[-1] if "stock_code" in df.columns else ""

            if prev["high"] < prev["high_max"] and curr["high"] >= curr["high_max"]:
                signals.append(Signal(
                    stock_code=stock_code,
                    signal_type="buy",
                    strength=4,
                    price=curr["close"],
                    description=f"海龟买入: 突破{self.entry_period}日高点{curr['high_max']:.2f}",
                    indicators={
                        "high_max": curr["high_max"],
                        "low_min": curr["low_min"],
                        "atr": curr["atr"]
                    }
                ))

            elif prev["low"] > prev["low_min"] and curr["low"] <= curr["low_min"]:
                signals.append(Signal(
                    stock_code=stock_code,
                    signal_type="sell",
                    strength=4,
                    price=curr["close"],
                    description=f"海龟卖出: 跌破{self.exit_period}日低点{curr['low_min']:.2f}",
                    indicators={
                        "high_max": curr["high_max"],
                        "low_min": curr["low_min"],
                        "atr": curr["atr"]
                    }
                ))

        return signals
