from typing import List
from sqlalchemy.orm import Session
from app.models.signal import StrategySignal
from app.models.kline import KlineDaily
from app.models.strategy import StrategyConfig
from app.strategies import get_strategy
from app.schemas.signal import SignalCreate, SignalResponse
import pandas as pd


class SignalService:
    def __init__(self, db: Session):
        self.db = db

    def scan_signals(self, stock_code: str, strategy_type: str = None) -> List[StrategySignal]:
        """扫描指定股票的信号"""
        # 获取K线数据
        klines = self.db.query(KlineDaily).filter(
            KlineDaily.stock_code == stock_code
        ).order_by(KlineDaily.date.asc()).all()

        if len(klines) < 20:
            return []

        # 转换为DataFrame
        df = pd.DataFrame([{
            "date": k.date,
            "open": float(k.open),
            "high": float(k.high),
            "low": float(k.low),
            "close": float(k.close),
            "volume": k.volume,
            "amount": float(k.amount),
            "stock_code": stock_code,
        } for k in klines])

        signals = []

        # 运行所有策略
        from app.strategies import STRATEGY_REGISTRY
        for stype, strategy_class in STRATEGY_REGISTRY.items():
            if strategy_type and stype != strategy_type:
                continue

            strategy = strategy_class()
            strategy_signals = strategy.analyze(df)

            for sig in strategy_signals:
                db_signal = StrategySignal(
                    strategy_id=None,  # 系统策略
                    stock_code=sig.stock_code,
                    signal_type=sig.signal_type,
                    signal_strength=sig.strength,
                    price=sig.price,
                    date=sig.date,
                    description=sig.description,
                )
                self.db.add(db_signal)
                signals.append(db_signal)

        self.db.commit()
        return signals

    def get_signals(self, stock_code: str = None, signal_type: str = None, limit: int = 100) -> List[StrategySignal]:
        query = self.db.query(StrategySignal)

        if stock_code:
            query = query.filter(StrategySignal.stock_code == stock_code)
        if signal_type:
            query = query.filter(StrategySignal.signal_type == signal_type)

        return query.order_by(StrategySignal.created_at.desc()).limit(limit).all()

    def get_signal_stats(self) -> dict:
        """获取信号统计"""
        total = self.db.query(StrategySignal).count()
        buy_count = self.db.query(StrategySignal).filter(StrategySignal.signal_type.in_(["buy", "strong_buy"])).count()
        sell_count = self.db.query(StrategySignal).filter(StrategySignal.signal_type.in_(["sell", "strong_sell"])).count()

        return {
            "total": total,
            "buy_count": buy_count,
            "sell_count": sell_count,
            "buy_ratio": buy_count / total * 100 if total > 0 else 0,
        }
