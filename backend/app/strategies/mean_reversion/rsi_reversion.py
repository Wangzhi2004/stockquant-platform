import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class RSIReversionStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("RSI均值回归", params)
        self.description = "基于RSI超买超卖的均值回归策略"
        self.period = self.params.get("period", 14)
        self.oversold = self.params.get("oversold", 30)
        self.overbought = self.params.get("overbought", 70)
        self.exit_oversold = self.params.get("exit_oversold", 50)
        self.exit_overbought = self.params.get("exit_overbought", 50)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df) or len(df) < self.period:
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
            stock_code = df["stock_code"].iloc[-1] if "stock_code" in df.columns else ""

            rsi_prev = prev["rsi"]
            rsi_curr = curr["rsi"]

            if rsi_prev <= self.oversold and rsi_curr > self.oversold:
                strength = 4
                if rsi_prev < self.oversold - 10:
                    strength = 5
                signals.append(Signal(
                    stock_code=stock_code,
                    signal_type="buy",
                    strength=strength,
                    price=curr["close"],
                    description=f"RSI超卖反弹买入: RSI从{rsi_prev:.1f}回升至{rsi_curr:.1f}，脱离超卖区",
                    indicators={"rsi": rsi_curr, "prev_rsi": rsi_prev}
                ))

            elif rsi_prev >= self.overbought and rsi_curr < self.overbought:
                strength = 4
                if rsi_prev > self.overbought + 10:
                    strength = 5
                signals.append(Signal(
                    stock_code=stock_code,
                    signal_type="sell",
                    strength=strength,
                    price=curr["close"],
                    description=f"RSI超买回落卖出: RSI从{rsi_prev:.1f}回落至{rsi_curr:.1f}，脱离超买区",
                    indicators={"rsi": rsi_curr, "prev_rsi": rsi_prev}
                ))

        return signals
