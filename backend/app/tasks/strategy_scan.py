from celery import shared_task
from sqlalchemy.orm import Session
import pandas as pd

from app.models.base import SessionLocal
from app.models.kline import KlineDaily
from app.models.signal import StrategySignal
from app.models.strategy import StrategyConfig
from app.strategies import STRATEGY_REGISTRY


@shared_task(bind=True, max_retries=2)
def scan_stock_signals(self, stock_code: str, strategy_type: str = None):
    db = SessionLocal()
    try:
        klines = db.query(KlineDaily).filter(
            KlineDaily.stock_code == stock_code
        ).order_by(KlineDaily.date.asc()).all()

        if len(klines) < 20:
            return {"status": "skipped", "reason": "insufficient data"}

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
        for stype, strategy_class in STRATEGY_REGISTRY.items():
            if strategy_type and stype != strategy_type:
                continue
            strategy = strategy_class()
            strategy_signals = strategy.analyze(df)
            for sig in strategy_signals:
                db_signal = StrategySignal(
                    strategy_id=None,
                    stock_code=sig.stock_code or stock_code,
                    signal_type=sig.signal_type,
                    signal_strength=sig.strength,
                    price=sig.price,
                    date=sig.date,
                    description=sig.description,
                )
                db.add(db_signal)
                signals.append({
                    "strategy": stype,
                    "type": sig.signal_type,
                    "strength": sig.strength,
                    "price": float(sig.price) if sig.price else None,
                })
        db.commit()
        return {"status": "success", "stock": stock_code, "signals": len(signals)}
    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc, countdown=30)
    finally:
        db.close()


@shared_task
def run_all_strategy_scans():
    db = SessionLocal()
    try:
        stocks = db.query(KlineDaily.stock_code).distinct().limit(100).all()
        stock_codes = [s[0] for s in stocks]
        results = []
        for code in stock_codes:
            result = scan_stock_signals.delay(code)
            results.append({"stock": code, "task_id": result.id})
        return {"status": "success", "queued": len(results)}
    finally:
        db.close()


@shared_task
def scan_user_strategies(user_id: str):
    db = SessionLocal()
    try:
        configs = db.query(StrategyConfig).filter(
            StrategyConfig.user_id == user_id,
            StrategyConfig.is_active == True,
        ).all()
        results = []
        for cfg in configs:
            strategy_class = STRATEGY_REGISTRY.get(cfg.type)
            if not strategy_class:
                continue
            stocks = cfg.params.get("stocks", [])
            for code in stocks:
                result = scan_stock_signals.delay(code, cfg.type)
                results.append({"stock": code, "strategy": cfg.type, "task_id": result.id})
        return {"status": "success", "queued": len(results)}
    finally:
        db.close()
