import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class EarningsSurpriseStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("财报超预期", params)
        self.description = "基于财报业绩超预期的 event-driven 策略"
        self.eps_surprise_threshold = self.params.get("eps_surprise_threshold", 10)
        self.revenue_surprise_threshold = self.params.get("revenue_surprise_threshold", 10)
        self.lookback_days = self.params.get("lookback_days", 5)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []

        signals = []
        curr = df.iloc[-1]
        stock_code = df["stock_code"].iloc[-1] if "stock_code" in df.columns else ""

        eps_surprise = curr.get("eps_surprise")
        revenue_surprise = curr.get("revenue_surprise")
        earnings_date = curr.get("earnings_date")

        passed = 0
        checks = []

        if eps_surprise is not None and eps_surprise >= self.eps_surprise_threshold:
            passed += 1
            checks.append(f"EPS超预期{eps_surprise:.1f}%")

        if revenue_surprise is not None and revenue_surprise >= self.revenue_surprise_threshold:
            passed += 1
            checks.append(f"营收超预期{revenue_surprise:.1f}%")

        if passed >= 1:
            strength = min(3 + passed, 5)
            signals.append(Signal(
                stock_code=stock_code,
                signal_type="buy",
                strength=strength,
                price=curr["close"],
                description=f"财报超预期: {', '.join(checks)}",
                indicators={
                    "eps_surprise": eps_surprise,
                    "revenue_surprise": revenue_surprise,
                    "earnings_date": str(earnings_date) if earnings_date else None,
                    "passed": passed
                }
            ))

        return signals
