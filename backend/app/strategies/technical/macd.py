import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class MACDStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("MACD金叉死叉", params)
        self.description = "基于MACD指标的金叉买入、死叉卖出策略"
        self.fast = self.params.get("fast", 12)
        self.slow = self.params.get("slow", 26)
        self.signal = self.params.get("signal", 9)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []

        df = df.copy()
        df["ema_fast"] = df["close"].ewm(span=self.fast, adjust=False).mean()
        df["ema_slow"] = df["close"].ewm(span=self.slow, adjust=False).mean()
        df["dif"] = df["ema_fast"] - df["ema_slow"]
        df["dea"] = df["dif"].ewm(span=self.signal, adjust=False).mean()
        df["macd"] = 2 * (df["dif"] - df["dea"])

        signals = []

        # 检查最近两天
        if len(df) >= 2:
            prev = df.iloc[-2]
            curr = df.iloc[-1]

            # 金叉: DIF上穿DEA
            if prev["dif"] <= prev["dea"] and curr["dif"] > curr["dea"]:
                strength = 3
                if curr["macd"] > 0:
                    strength = 4

                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="buy",
                    strength=strength,
                    price=curr["close"],
                    description=f"MACD金叉: DIF({curr['dif']:.2f})上穿DEA({curr['dea']:.2f})",
                    indicators={"dif": curr["dif"], "dea": curr["dea"], "macd": curr["macd"]}
                ))

            # 死叉: DIF下穿DEA
            elif prev["dif"] >= prev["dea"] and curr["dif"] < curr["dea"]:
                strength = 3
                if curr["macd"] < 0:
                    strength = 4

                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="sell",
                    strength=strength,
                    price=curr["close"],
                    description=f"MACD死叉: DIF({curr['dif']:.2f})下穿DEA({curr['dea']:.2f})",
                    indicators={"dif": curr["dif"], "dea": curr["dea"], "macd": curr["macd"]}
                ))

        return signals
