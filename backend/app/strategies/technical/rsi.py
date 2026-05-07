import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class RSIStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("RSI强弱反转", params)
        self.description = "基于RSI指标的强弱反转策略"
        self.period = self.params.get("period", 14)
        self.overbought = self.params.get("overbought", 70)
        self.oversold = self.params.get("oversold", 30)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []

        df = df.copy()
        delta = df["close"].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=self.period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=self.period).mean()
        rs = gain / loss
        df["rsi"] = 100 - (100 / (1 + rs))

        signals = []

        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]

            # RSI<30 回升: 超卖买入
            if prev["rsi"] < self.oversold and curr["rsi"] > prev["rsi"]:
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="buy",
                    strength=3,
                    price=curr["close"],
                    description=f"RSI超卖回升: RSI({curr['rsi']:.1f})<{self.oversold}后回升",
                    indicators={"rsi": curr["rsi"]}
                ))

            # RSI>70 回落: 超买卖出
            elif prev["rsi"] > self.overbought and curr["rsi"] < prev["rsi"]:
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="sell",
                    strength=3,
                    price=curr["close"],
                    description=f"RSI超买回落: RSI({curr['rsi']:.1f})>{self.overbought}后回落",
                    indicators={"rsi": curr["rsi"]}
                ))

        return signals
