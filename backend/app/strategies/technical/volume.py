import pandas as pd
from typing import List
from app.strategies.base import StrategyBase, Signal


class VolumeStrategy(StrategyBase):
    def __init__(self, params=None):
        super().__init__("量价齐升", params)
        self.description = "基于成交量配合的价格突破策略"
        self.volume_ma_period = self.params.get("volume_ma_period", 20)
        self.volume_ratio = self.params.get("volume_ratio", 1.5)

    def analyze(self, df: pd.DataFrame) -> List[Signal]:
        if not self.validate_data(df):
            return []

        df = df.copy()
        df["volume_ma"] = df["volume"].rolling(window=self.volume_ma_period).mean()
        df["price_change"] = df["close"].pct_change()

        signals = []

        if len(df) >= 2:
            curr = df.iloc[-1]

            # 放量上涨
            if (curr["volume"] > curr["volume_ma"] * self.volume_ratio and
                curr["price_change"] > 0.02):
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="buy",
                    strength=3,
                    price=curr["close"],
                    description=f"放量上涨: 成交量放大{curr['volume']/curr['volume_ma']:.1f}倍, 涨幅{curr['price_change']*100:.1f}%",
                    indicators={"volume": curr["volume"], "volume_ma": curr["volume_ma"], "change": curr["price_change"]}
                ))

            # 缩量滞涨或放量下跌
            elif (curr["volume"] > curr["volume_ma"] * self.volume_ratio and
                  curr["price_change"] < -0.02):
                signals.append(Signal(
                    stock_code=df["stock_code"].iloc[-1] if "stock_code" in df.columns else "",
                    signal_type="sell",
                    strength=3,
                    price=curr["close"],
                    description=f"放量下跌: 成交量放大{curr['volume']/curr['volume_ma']:.1f}倍, 跌幅{curr['price_change']*100:.1f}%",
                    indicators={"volume": curr["volume"], "volume_ma": curr["volume_ma"], "change": curr["price_change"]}
                ))

        return signals
