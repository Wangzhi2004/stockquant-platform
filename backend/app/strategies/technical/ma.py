import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class MAStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("均线多头排列", params)
        self.description = "基于均线系统的多头排列/空头排列策略"
        self.short_period = self.params.get("short_period", 5)
        self.medium_period = self.params.get("medium_period", 20)
        self.long_period = self.params.get("long_period", 60)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []

        df = df.copy()
        df["ma_short"] = df["close"].rolling(window=self.short_period).mean()
        df["ma_medium"] = df["close"].rolling(window=self.medium_period).mean()
        df["ma_long"] = df["close"].rolling(window=self.long_period).mean()

        signals = []

        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]

            # 金叉: 短期上穿长期
            if (prev["ma_short"] <= prev["ma_long"] and
                curr["ma_short"] > curr["ma_long"] and
                curr["ma_short"] > curr["ma_medium"] > curr["ma_long"]):
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="buy",
                    strength=4,
                    price=curr["close"],
                    description=f"均线多头排列: MA{self.short_period}上穿MA{self.long_period}",
                    indicators={
                        f"ma{self.short_period}": curr["ma_short"],
                        f"ma{self.medium_period}": curr["ma_medium"],
                        f"ma{self.long_period}": curr["ma_long"]
                    }
                ))

            # 死叉: 短期下穿长期
            elif (prev["ma_short"] >= prev["ma_long"] and
                  curr["ma_short"] < curr["ma_long"] and
                  curr["ma_short"] < curr["ma_medium"] < curr["ma_long"]):
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="sell",
                    strength=4,
                    price=curr["close"],
                    description=f"均线空头排列: MA{self.short_period}下穿MA{self.long_period}",
                    indicators={
                        f"ma{self.short_period}": curr["ma_short"],
                        f"ma{self.medium_period}": curr["ma_medium"],
                        f"ma{self.long_period}": curr["ma_long"]
                    }
                ))

        return signals
