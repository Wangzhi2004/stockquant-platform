import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class MainForceFlowStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("主力净流入", params)
        self.description = "基于主力资金净流入的跟随策略"
        self.min_main_inflow = self.params.get("min_main_inflow", 1000000)
        self.min_inflow_ratio = self.params.get("min_inflow_ratio", 5)
        self.consecutive_days = self.params.get("consecutive_days", 2)
        self.volume_ratio_threshold = self.params.get("volume_ratio_threshold", 1.2)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df) or len(df) < self.consecutive_days:
            return []

        signals = []
        curr = df.iloc[-1]
        stock_code = df["stock_code"].iloc[-1] if "stock_code" in df.columns else ""

        main_inflow = curr.get("main_force_inflow")
        inflow_ratio = curr.get("main_inflow_ratio")
        volume_ratio = curr.get("volume_ratio")

        recent = df.iloc[-self.consecutive_days:]
        consecutive_positive = all(
            r.get("main_force_inflow", 0) > 0 for _, r in recent.iterrows()
        ) if "main_force_inflow" in df.columns else False

        passed = 0
        checks = []

        if main_inflow is not None and main_inflow >= self.min_main_inflow:
            passed += 1
            checks.append(f"主力净流入{main_inflow/10000:.0f}万")

        if inflow_ratio is not None and inflow_ratio >= self.min_inflow_ratio:
            passed += 1
            checks.append(f"净流入占比{inflow_ratio:.1f}%")

        if volume_ratio is not None and volume_ratio >= self.volume_ratio_threshold:
            passed += 1
            checks.append(f"量比{volume_ratio:.1f}")

        if consecutive_positive:
            passed += 1
            checks.append(f"连续{self.consecutive_days}日净流入")

        if passed >= 2:
            strength = min(3 + passed, 5)
            signals.append(Signal(
                stock_code=stock_code,
                signal_type="buy",
                strength=strength,
                price=curr["close"],
                description=f"主力净流入信号通过{passed}项: {', '.join(checks)}",
                indicators={
                    "main_inflow": main_inflow,
                    "inflow_ratio": inflow_ratio,
                    "volume_ratio": volume_ratio,
                    "consecutive_positive": consecutive_positive,
                    "passed": passed
                }
            ))

        return signals
