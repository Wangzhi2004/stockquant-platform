import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from datetime import datetime


class BacktestMetrics:
    def __init__(
        self,
        daily_values: List[Dict[str, Any]],
        trades: Optional[List[Dict[str, Any]]] = None,
        risk_free_rate: float = 0.03,
        benchmark_returns: Optional[pd.Series] = None,
    ):
        self.daily_values = daily_values
        self.trades = trades or []
        self.risk_free_rate = risk_free_rate
        self.benchmark_returns = benchmark_returns

        self._values = np.array([float(d["total_value"]) for d in daily_values])
        self._dates = [d.get("date", datetime.now()) for d in daily_values]
        self._returns = self._calculate_daily_returns()

    def _calculate_daily_returns(self) -> np.ndarray:
        if len(self._values) < 2:
            return np.array([])
        return np.diff(self._values) / self._values[:-1]

    def calculate_all_metrics(self) -> Dict[str, Any]:
        return {
            "total_return": self._total_return(),
            "annualized_return": self.annualized_return(),
            "sharpe_ratio": self._sharpe_ratio(),
            "sortino_ratio": self.sortino_ratio(),
            "max_drawdown": self._max_drawdown(),
            "calmar_ratio": self.calmar_ratio(),
            "alpha": self.alpha_beta()[0],
            "beta": self.alpha_beta()[1],
            "win_rate": self._win_rate(),
            "profit_factor": self._profit_factor(),
            "total_trades": len(self.trades),
            "volatility": self._annualized_volatility(),
        }

    def _total_return(self) -> float:
        if len(self._values) < 2:
            return 0.0
        return (self._values[-1] / self._values[0]) - 1.0

    def annualized_return(self) -> float:
        if len(self._values) < 2:
            return 0.0
        total_days = len(self._values) - 1
        if total_days <= 0:
            return 0.0
        total_ret = self._total_return()
        annual_factor = 252.0 / total_days
        return (1.0 + total_ret) ** annual_factor - 1.0

    def _sharpe_ratio(self) -> float:
        if len(self._returns) < 2:
            return 0.0
        avg_return = np.mean(self._returns)
        std_return = np.std(self._returns, ddof=1)
        if std_return == 0:
            return 0.0
        daily_rf = self.risk_free_rate / 252
        excess_return = avg_return - daily_rf
        return (excess_return / std_return) * np.sqrt(252)

    def sortino_ratio(self) -> float:
        if len(self._returns) < 2:
            return 0.0
        daily_rf = self.risk_free_rate / 252
        excess_returns = self._returns - daily_rf
        downside = excess_returns[excess_returns < 0]
        if len(downside) == 0:
            return float("inf") if np.mean(excess_returns) > 0 else 0.0
        downside_std = np.sqrt(np.mean(downside ** 2))
        if downside_std == 0:
            return 0.0
        return (np.mean(excess_returns) / downside_std) * np.sqrt(252)

    def _max_drawdown(self) -> float:
        if len(self._values) < 2:
            return 0.0
        peak = np.maximum.accumulate(self._values)
        drawdown = (self._values - peak) / peak
        return float(np.min(drawdown))

    def calmar_ratio(self) -> float:
        max_dd = abs(self._max_drawdown())
        if max_dd == 0:
            return 0.0
        ann_ret = self.annualized_return()
        return ann_ret / max_dd

    def alpha_beta(self) -> tuple:
        if self.benchmark_returns is None or len(self._returns) < 2:
            return 0.0, 1.0

        benchmark = self.benchmark_returns.values
        min_len = min(len(self._returns), len(benchmark))
        if min_len < 2:
            return 0.0, 1.0

        strategy_ret = self._returns[:min_len]
        benchmark_ret = benchmark[:min_len]

        covariance = np.cov(strategy_ret, benchmark_ret)
        beta = covariance[0, 1] / covariance[1, 1] if covariance[1, 1] != 0 else 1.0

        alpha = (np.mean(strategy_ret) - beta * np.mean(benchmark_ret)) * 252
        alpha -= self.risk_free_rate * (1 - beta)

        return float(alpha), float(beta)

    def _win_rate(self) -> float:
        if not self.trades:
            return 0.0
        winning = sum(1 for t in self.trades if (t.get("pnl") is not None and float(t.get("pnl", 0)) > 0))
        return winning / len(self.trades)

    def _profit_factor(self) -> float:
        if not self.trades:
            return 0.0
        profits = sum(float(t["pnl"]) for t in self.trades if t.get("pnl") is not None and float(t["pnl"]) > 0)
        losses = abs(sum(float(t["pnl"]) for t in self.trades if t.get("pnl") is not None and float(t["pnl"]) < 0))
        if losses == 0:
            return float("inf") if profits > 0 else 0.0
        return profits / losses

    def _annualized_volatility(self) -> float:
        if len(self._returns) < 2:
            return 0.0
        return float(np.std(self._returns, ddof=1) * np.sqrt(252))
