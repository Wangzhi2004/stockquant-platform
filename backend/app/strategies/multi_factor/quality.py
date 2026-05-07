import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class QualityFactorStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("质量因子筛选", params)
        self.description = "基于ROE/毛利率/现金流等质量因子的优质股筛选策略"
        self.min_roe = self.params.get("min_roe", 15)
        self.min_gross_margin = self.params.get("min_gross_margin", 30)
        self.min_operating_cash_flow = self.params.get("min_operating_cash_flow", 0)
        self.min_revenue_growth = self.params.get("min_revenue_growth", 10)
        self.top_n = self.params.get("top_n", 20)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []

        signals = []
        curr = df.iloc[-1]
        stock_code = df["stock_code"].iloc[-1] if "stock_code" in df.columns else ""

        roe = curr.get("roe")
        gross_margin = curr.get("gross_margin")
        operating_cash_flow = curr.get("operating_cash_flow")
        revenue_growth = curr.get("revenue_growth")

        passed = 0
        checks = []

        if roe is not None and roe >= self.min_roe:
            passed += 1
            checks.append(f"ROE({roe:.1f}%)>={self.min_roe}%")

        if gross_margin is not None and gross_margin >= self.min_gross_margin:
            passed += 1
            checks.append(f"毛利率({gross_margin:.1f}%)>={self.min_gross_margin}%")

        if operating_cash_flow is not None and operating_cash_flow >= self.min_operating_cash_flow:
            passed += 1
            checks.append(f"经营现金流({operating_cash_flow:.0f})>={self.min_operating_cash_flow}")

        if revenue_growth is not None and revenue_growth >= self.min_revenue_growth:
            passed += 1
            checks.append(f"营收增长({revenue_growth:.1f}%)>={self.min_revenue_growth}%")

        if passed >= 3:
            strength = min(3 + passed, 5)
            signals.append(Signal(
                stock_code=stock_code,
                signal_type="buy",
                strength=strength,
                price=curr["close"],
                description=f"质量因子通过{passed}项: {', '.join(checks)}",
                indicators={
                    "roe": roe,
                    "gross_margin": gross_margin,
                    "operating_cash_flow": operating_cash_flow,
                    "revenue_growth": revenue_growth,
                    "passed": passed
                }
            ))

        return signals
