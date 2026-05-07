import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class MomentumFactorStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("动量因子策略", params)
        self.description = "基于价格动量和相对强度的动量选股策略"
        self.short_period = self.params.get("short_period", 20)
        self.medium_period = self.params.get("medium_period", 60)
        self.long_period = self.params.get("long_period", 120)
        self.min_momentum = self.params.get("min_momentum", 5)
        self.top_n = self.params.get("top_n", 20)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df) or len(df) < self.long_period:
            return []

        df = df.copy()
        curr = df.iloc[-1]
        stock_code = df["stock_code"].iloc[-1] if "stock_code" in df.columns else ""

        short_momentum = (curr["close"] / df.iloc[-self.short_period]["close"] - 1) * 100
        medium_momentum = (curr["close"] / df.iloc[-self.medium_period]["close"] - 1) * 100
        long_momentum = (curr["close"] / df.iloc[-self.long_period]["close"] - 1) * 100

        signals = []
        passed = 0
        checks = []

        if short_momentum >= self.min_momentum:
            passed += 1
            checks.append(f"短期动量({short_momentum:.1f}%)")

        if medium_momentum >= self.min_momentum:
            passed += 1
            checks.append(f"中期动量({medium_momentum:.1f}%)")

        if long_momentum >= self.min_momentum:
            passed += 1
            checks.append(f"长期动量({long_momentum:.1f}%)")

        if short_momentum > medium_momentum > long_momentum:
            passed += 1
            checks.append("动量加速")

        if passed >= 2:
            strength = min(2 + passed, 5)
            signals.append(Signal(
                stock_code=stock_code,
                signal_type="buy",
                strength=strength,
                price=curr["close"],
                description=f"动量因子通过{passed}项: {', '.join(checks)}",
                indicators={
                    "short_momentum": short_momentum,
                    "medium_momentum": medium_momentum,
                    "long_momentum": long_momentum,
                    "passed": passed
                }
            ))

        return signals
