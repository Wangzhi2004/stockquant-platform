from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
import pandas as pd

from app.models.backtest import BacktestJob
from app.models.kline import KlineDaily
from app.strategies import get_strategy
from app.backtest.engine import BacktestConfig, EventDrivenBacktest
from app.schemas.backtest import BacktestCreateRequest, BacktestResultSchema
from app.core.exceptions import NotFoundError, ValidationError


class BacktestService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: UUID, request: BacktestCreateRequest) -> BacktestJob:
        job = BacktestJob(
            user_id=user_id,
            name=request.name,
            params={
                "strategy_type": request.strategy_type,
                "strategy_params": request.strategy_params,
                "stock_codes": request.stock_codes,
                "config": request.config.model_dump(),
            },
            status="pending",
            progress=0,
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def get(self, backtest_id: UUID, user_id: UUID) -> BacktestJob:
        job = self.db.query(BacktestJob).filter(
            BacktestJob.id == backtest_id,
            BacktestJob.user_id == user_id
        ).first()
        if not job:
            raise NotFoundError("Backtest job not found")
        return job

    def list(self, user_id: UUID, limit: int = 50) -> List[BacktestJob]:
        return self.db.query(BacktestJob).filter(
            BacktestJob.user_id == user_id
        ).order_by(BacktestJob.created_at.desc()).limit(limit).all()

    def run(self, backtest_id: UUID, user_id: UUID) -> BacktestJob:
        job = self.get(backtest_id, user_id)

        if job.status == "running":
            raise ValidationError("Backtest is already running")

        job.status = "running"
        job.started_at = datetime.utcnow()
        job.progress = 10
        self.db.commit()

        try:
            params = job.params or {}
            strategy_type = params.get("strategy_type")
            strategy_params = params.get("strategy_params", {})
            stock_codes = params.get("stock_codes", [])
            config_data = params.get("config", {})

            if not strategy_type or not stock_codes:
                raise ValidationError("Invalid backtest parameters")

            strategy = get_strategy(strategy_type, strategy_params)

            config = BacktestConfig(
                start_date=config_data.get("start_date"),
                end_date=config_data.get("end_date"),
                initial_capital=config_data.get("initial_capital", 1000000),
                commission_rate=config_data.get("commission_rate", 0.0003),
                slippage=config_data.get("slippage", 0.001),
                max_positions=config_data.get("max_positions", 10),
                position_size=config_data.get("position_size", 0.1),
                stop_loss=config_data.get("stop_loss", 0.08),
                take_profit=config_data.get("take_profit", 0.2),
            )

            job.progress = 30
            self.db.commit()

            data = self._load_kline_data(stock_codes, config.start_date, config.end_date)

            job.progress = 60
            self.db.commit()

            engine = EventDrivenBacktest(config, strategy)
            result = engine.run(data)
            report = engine.generate_report(result)

            job.result = report
            job.status = "completed"
            job.progress = 100
            job.completed_at = datetime.utcnow()
            self.db.commit()

        except Exception as e:
            job.status = "failed"
            job.result = {"error": str(e)}
            job.completed_at = datetime.utcnow()
            self.db.commit()
            raise

        return job

    def delete(self, backtest_id: UUID, user_id: UUID) -> None:
        job = self.get(backtest_id, user_id)
        self.db.delete(job)
        self.db.commit()

    def _load_kline_data(
        self,
        stock_codes: List[str],
        start_date,
        end_date
    ) -> Dict[str, pd.DataFrame]:
        data = {}

        for code in stock_codes:
            klines = self.db.query(KlineDaily).filter(
                KlineDaily.stock_code == code,
                KlineDaily.date >= start_date,
                KlineDaily.date <= end_date
            ).order_by(KlineDaily.date.asc()).all()

            if len(klines) < 20:
                continue

            df = pd.DataFrame([{
                "date": k.date,
                "open": float(k.open),
                "high": float(k.high),
                "low": float(k.low),
                "close": float(k.close),
                "volume": k.volume,
                "amount": float(k.amount),
                "stock_code": code,
            } for k in klines])

            df.set_index("date", inplace=True)
            data[code] = df

        if not data:
            raise ValidationError("No sufficient kline data for backtest")

        return data
