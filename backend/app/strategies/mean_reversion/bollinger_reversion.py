import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class BollingerReversionStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("布林带均值回归", params)
        self.description = "基于布林带的价格均值回归策略，下轨买入上轨卖出"
        self.period = self.params.get("period", 20)
        self.std_dev = self.params.get("std_dev", 2)
        self.entry_threshold = self.params.get("entry_threshold", 0.05)
        self.exit_threshold = self.params.get("exit_threshold", 0.95)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df) or len(df) < self.period:
            return []

        df = df.copy()
        df["ma"] = df["close"].rolling(window=self.period).mean()
        df["std"] = df["close"].rolling(window=self.period).std()
        df["upper"] = df["ma"] + (df["std"] * self.std_dev)
        df["lower"] = df["ma"] - (df["std"] * self.std_dev)
        df["percent_b"] = (df["close"] - df["lower"]) / (df["upper"] - df["lower"])

        signals = []

        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]
            stock_code = df["stock_code"].iloc[-1] if "stock_code" in df.columns else ""

            pb_prev = prev["percent_b"]
            pb_curr = curr["percent_b"]

            if pb_prev <= self.entry_threshold and pb_curr > self.entry_threshold:
                signals.append(Signal(
                    stock_code=stock_code,
                    signal_type="buy",
                    strength=4,
                    price=curr["close"],
                    description=f"布林带均值回归买入: %B从{pb_prev:.2f}回升至{pb_curr:.2f}，触及下轨后反弹",
                    indicators={
                        "percent_b": pb_curr,
                        "upper": curr["upper"],
                        "ma": curr["ma"],
                        "lower": curr["lower"]
                    }
                ))

            elif pb_prev >= self.exit_threshold and pb_curr < self.exit_threshold:
                signals.append(Signal(
                    stock_code=stock_code,
                    signal_type="sell",
                    strength=4,
                    price=curr["close"],
                    description=f"布林带均值回归卖出: %B从{pb_prev:.2f}回落至{pb_curr:.2f}，触及上轨后回落",
                    indicators={
                        "percent_b": pb_curr,
                        "upper": curr["upper"],
                        "ma": curr["ma"],
                        "lower": curr["lower"]
                    }
                ))

        return signals
