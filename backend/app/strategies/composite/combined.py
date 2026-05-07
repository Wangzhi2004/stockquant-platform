import pandas as pd
from typing import List, Dict, Any
from app.strategies.base import StrategyBase, Signal


class CombinedStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("组合策略", params)
        self.description = "多策略组合评分系统，综合技术面、基本面、资金面信号"
        self.sub_strategies = self.params.get("sub_strategies", [])
        self.min_score = self.params.get("min_score", 6)
        self.max_holdings = self.params.get("max_holdings", 10)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []

        signals = []
        curr = df.iloc[-1]
        stock_code = df["stock_code"].iloc[-1] if "stock_code" in df.columns else ""

        score = 0
        details = []
        indicators: Dict[str, Any] = {}

        pe = curr.get("pe_ttm")
        pb = curr.get("pb")
        roe = curr.get("roe")
        if pe is not None and pe > 0 and pe <= 25:
            score += 1
            details.append(f"PE合理({pe:.1f})")
            indicators["pe"] = pe
        if pb is not None and pb > 0 and pb <= 3:
            score += 1
            details.append(f"PB合理({pb:.1f})")
            indicators["pb"] = pb
        if roe is not None and roe >= 10:
            score += 2
            details.append(f"ROE优良({roe:.1f}%)")
            indicators["roe"] = roe

        df = df.copy()
        df["ma20"] = df["close"].rolling(window=20).mean()
        df["ma60"] = df["close"].rolling(window=60).mean()
        if len(df) >= 2:
            latest = df.iloc[-1]
            if latest["close"] > latest["ma20"] > latest["ma60"]:
                score += 2
                details.append("均线多头排列")
                indicators["trend"] = "bull"

        volume_ma = df["volume"].rolling(window=20).mean()
        if len(volume_ma) > 0 and curr["volume"] > volume_ma.iloc[-1] * 1.2:
            score += 1
            details.append("放量")
            indicators["volume_signal"] = True

        main_inflow = curr.get("main_force_inflow")
        if main_inflow is not None and main_inflow > 0:
            score += 1
            details.append("主力净流入")
            indicators["main_inflow"] = main_inflow

        if score >= self.min_score:
            strength = min(3 + score // 2, 5)
            signals.append(Signal(
                stock_code=stock_code,
                signal_type="buy",
                strength=strength,
                price=curr["close"],
                description=f"组合评分{score}分: {', '.join(details)}",
                indicators={**indicators, "total_score": score}
            ))

        return signals
