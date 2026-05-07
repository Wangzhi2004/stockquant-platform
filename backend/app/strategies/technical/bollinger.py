import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class BollingerStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("布林带突破", params)
        self.description = "基于布林带的价格突破策略"
        self.period = self.params.get("period", 20)
        self.std_dev = self.params.get("std_dev", 2)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []

        df = df.copy()
        df["ma"] = df["close"].rolling(window=self.period).mean()
        df["std"] = df["close"].rolling(window=self.period).std()
        df["upper"] = df["ma"] + (df["std"] * self.std_dev)
        df["lower"] = df["ma"] - (df["std"] * self.std_dev)

        signals = []

        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]

            # 触及下轨反弹
            if prev["close"] <= prev["lower"] and curr["close"] > curr["lower"]:
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="buy",
                    strength=3,
                    price=curr["close"],
                    description=f"布林带下轨反弹: 价格触及下轨后回升",
                    indicators={"upper": curr["upper"], "ma": curr["ma"], "lower": curr["lower"]}
                ))

            # 触及上轨回落
            elif prev["close"] >= prev["upper"] and curr["close"] < curr["upper"]:
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="sell",
                    strength=3,
                    price=curr["close"],
                    description=f"布林带上轨回落: 价格触及上轨后回落",
                    indicators={"upper": curr["upper"], "ma": curr["ma"], "lower": curr["lower"]}
                ))

        return signals
