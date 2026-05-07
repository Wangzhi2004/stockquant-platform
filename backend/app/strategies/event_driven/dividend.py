import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class HighDividendStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("高分红策略", params)
        self.description = "基于高股息率和分红稳定性的选股策略"
        self.min_dividend_yield = self.params.get("min_dividend_yield", 3.0)
        self.min_dividend_years = self.params.get("min_dividend_years", 3)
        self.min_payout_ratio = self.params.get("min_payout_ratio", 20)
        self.max_payout_ratio = self.params.get("max_payout_ratio", 80)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []

        signals = []
        curr = df.iloc[-1]
        stock_code = df["stock_code"].iloc[-1] if "stock_code" in df.columns else ""

        dividend_yield = curr.get("dividend_yield")
        dividend_years = curr.get("dividend_years")
        payout_ratio = curr.get("payout_ratio")

        passed = 0
        checks = []

        if dividend_yield is not None and dividend_yield >= self.min_dividend_yield:
            passed += 1
            checks.append(f"股息率{dividend_yield:.1f}%")

        if dividend_years is not None and dividend_years >= self.min_dividend_years:
            passed += 1
            checks.append(f"连续分红{int(dividend_years)}年")

        if payout_ratio is not None and self.min_payout_ratio <= payout_ratio <= self.max_payout_ratio:
            passed += 1
            checks.append(f"派息率{payout_ratio:.1f}%")

        if passed >= 2:
            strength = min(3 + passed, 5)
            signals.append(Signal(
                stock_code=stock_code,
                signal_type="buy",
                strength=strength,
                price=curr["close"],
                description=f"高分红筛选通过{passed}项: {', '.join(checks)}",
                indicators={
                    "dividend_yield": dividend_yield,
                    "dividend_years": dividend_years,
                    "payout_ratio": payout_ratio,
                    "passed": passed
                }
            ))

        return signals
