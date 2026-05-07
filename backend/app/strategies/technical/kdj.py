import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class KDJStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("KDJ超买超卖", params)
        self.description = "基于KDJ指标的超买超卖策略"
        self.n = self.params.get("n", 9)
        self.m1 = self.params.get("m1", 3)
        self.m2 = self.params.get("m2", 3)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []

        df = df.copy()
        low_list = df["low"].rolling(window=self.n, min_periods=self.n).min()
        high_list = df["high"].rolling(window=self.n, min_periods=self.n).max()
        rsv = (df["close"] - low_list) / (high_list - low_list) * 100

        df["k"] = rsv.ewm(com=self.m1 - 1, adjust=False).mean()
        df["d"] = df["k"].ewm(com=self.m2 - 1, adjust=False).mean()
        df["j"] = 3 * df["k"] - 2 * df["d"]

        signals = []

        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]

            # K<20 且 K上穿D: 超卖反弹
            if curr["k"] < 20 and prev["k"] <= prev["d"] and curr["k"] > curr["d"]:
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="buy",
                    strength=4,
                    price=curr["close"],
                    description=f"KDJ超卖反弹: K({curr['k']:.1f})<20 且上穿D({curr['d']:.1f})",
                    indicators={"k": curr["k"], "d": curr["d"], "j": curr["j"]}
                ))

            # K>80 且 K下穿D: 超买回落
            elif curr["k"] > 80 and prev["k"] >= prev["d"] and curr["k"] < curr["d"]:
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="sell",
                    strength=4,
                    price=curr["close"],
                    description=f"KDJ超买回落: K({curr['k']:.1f})>80 且下穿D({curr['d']:.1f})",
                    indicators={"k": curr["k"], "d": curr["d"], "j": curr["j"]}
                ))

        return signals
