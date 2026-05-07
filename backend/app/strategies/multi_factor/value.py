import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class ValueFactorStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("价值因子筛选", params)
        self.description = "基于PE/PB/ROE等价值因子的低估选股策略"
        self.max_pe = self.params.get("max_pe", 20)
        self.max_pb = self.params.get("max_pb", 3)
        self.min_roe = self.params.get("min_roe", 10)
        self.min_dividend_yield = self.params.get("min_dividend_yield", 2.0)
        self.top_n = self.params.get("top_n", 20)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []

        signals = []
        curr = df.iloc[-1]

        pe = curr.get("pe_ttm")
        pb = curr.get("pb")
        roe = curr.get("roe")
        dividend_yield = curr.get("dividend_yield")
        stock_code = df["stock_code"].iloc[-1] if "stock_code" in df.columns else ""

        passed = 0
        checks = []

        if pe is not None and pe > 0 and pe <= self.max_pe:
            passed += 1
            checks.append(f"PE({pe:.1f})<={self.max_pe}")

        if pb is not None and pb > 0 and pb <= self.max_pb:
            passed += 1
            checks.append(f"PB({pb:.1f})<={self.max_pb}")

        if roe is not None and roe >= self.min_roe:
            passed += 1
            checks.append(f"ROE({roe:.1f}%)>={self.min_roe}%")

        if dividend_yield is not None and dividend_yield >= self.min_dividend_yield:
            passed += 1
            checks.append(f"股息率({dividend_yield:.1f}%)>={self.min_dividend_yield}%")

        if passed >= 3:
            strength = min(3 + passed, 5)
            signals.append(Signal(
                stock_code=stock_code,
                signal_type="buy",
                strength=strength,
                price=curr["close"],
                description=f"价值因子通过{passed}项: {', '.join(checks)}",
                indicators={
                    "pe": pe,
                    "pb": pb,
                    "roe": roe,
                    "dividend_yield": dividend_yield,
                    "passed": passed
                }
            ))

        return signals
