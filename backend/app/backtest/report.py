import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.backtest.metrics import BacktestMetrics


class BacktestReportGenerator:
    def __init__(self, risk_free_rate: float = 0.03):
        self.risk_free_rate = risk_free_rate

    def generate_report(
        self,
        daily_values: List[Dict[str, Any]],
        trades: List[Dict[str, Any]],
        benchmark_daily_values: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        metrics = BacktestMetrics(
            daily_values=daily_values,
            trades=trades,
            risk_free_rate=self.risk_free_rate,
            benchmark_returns=self._extract_benchmark_returns(benchmark_daily_values),
        )

        all_metrics = metrics.calculate_all_metrics()

        return {
            "summary": all_metrics,
            "equity_curve": self._build_equity_curve(daily_values),
            "drawdown_curve": self._build_drawdown_curve(daily_values),
            "monthly_returns": self._build_monthly_returns_heatmap(daily_values),
            "trade_details": self._build_trade_details(trades),
            "period_stats": self._build_period_stats(daily_values),
        }

    def _extract_benchmark_returns(self, benchmark_daily_values: Optional[List[Dict[str, Any]]]) -> Optional[pd.Series]:
        if not benchmark_daily_values or len(benchmark_daily_values) < 2:
            return None
        values = np.array([float(d["total_value"]) for d in benchmark_daily_values])
        returns = np.diff(values) / values[:-1]
        return pd.Series(returns)

    def _build_equity_curve(self, daily_values: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        curve = []
        for d in daily_values:
            date_val = d.get("date")
            if isinstance(date_val, datetime):
                date_str = date_val.strftime("%Y-%m-%d")
            else:
                date_str = str(date_val)
            curve.append({
                "date": date_str,
                "value": float(d["total_value"]),
                "cash": float(d.get("cash", 0)),
                "position_count": d.get("position_count", 0),
            })
        return curve

    def _build_drawdown_curve(self, daily_values: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if len(daily_values) < 2:
            return []
        values = np.array([float(d["total_value"]) for d in daily_values])
        peak = np.maximum.accumulate(values)
        drawdown_pct = (values - peak) / peak * 100

        curve = []
        for i, d in enumerate(daily_values):
            date_val = d.get("date")
            if isinstance(date_val, datetime):
                date_str = date_val.strftime("%Y-%m-%d")
            else:
                date_str = str(date_val)
            curve.append({
                "date": date_str,
                "drawdown": float(drawdown_pct[i]),
                "peak": float(peak[i]),
                "value": float(values[i]),
            })
        return curve

    def _build_monthly_returns_heatmap(self, daily_values: List[Dict[str, Any]]) -> Dict[str, Any]:
        if len(daily_values) < 2:
            return {"months": [], "data": {}}

        records = []
        for d in daily_values:
            date_val = d.get("date")
            if isinstance(date_val, datetime):
                dt = date_val
            else:
                try:
                    dt = pd.Timestamp(str(date_val)).to_pydatetime()
                except Exception:
                    continue
            records.append({
                "year": dt.year,
                "month": dt.month,
                "value": float(d["total_value"]),
            })

        if not records:
            return {"months": [], "data": {}}

        df = pd.DataFrame(records)
        monthly = df.groupby(["year", "month"]).agg(
            first_value=("value", "first"),
            last_value=("value", "last"),
        ).reset_index()
        monthly["return"] = (monthly["last_value"] / monthly["first_value"] - 1) * 100

        months = sorted(set(monthly["month"].tolist()))
        years = sorted(set(monthly["year"].tolist()))

        data = {}
        for _, row in monthly.iterrows():
            key = str(int(row["year"]))
            if key not in data:
                data[key] = {}
            data[key][str(int(row["month"]))] = round(float(row["return"]), 2)

        return {
            "months": months,
            "years": years,
            "data": data,
        }

    def _build_trade_details(self, trades: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        details = []
        for t in trades:
            date_val = t.get("date")
            if isinstance(date_val, datetime):
                date_str = date_val.strftime("%Y-%m-%d")
            else:
                date_str = str(date_val)

            entry_date = t.get("entry_date")
            if isinstance(entry_date, datetime):
                entry_str = entry_date.strftime("%Y-%m-%d")
            elif entry_date is not None:
                entry_str = str(entry_date)
            else:
                entry_str = None

            exit_date = t.get("exit_date")
            if isinstance(exit_date, datetime):
                exit_str = exit_date.strftime("%Y-%m-%d")
            elif exit_date is not None:
                exit_str = str(exit_date)
            else:
                exit_str = None

            detail = {
                "date": date_str,
                "stock_code": t.get("stock_code", ""),
                "action": t.get("action", ""),
                "price": float(t.get("price", 0)),
                "quantity": int(t.get("quantity", 0)),
                "amount": float(t.get("amount", 0)),
                "commission": float(t.get("commission", 0)),
                "reason": t.get("reason", ""),
                "pnl": float(t.get("pnl", 0)) if t.get("pnl") is not None else None,
            }
            if entry_str:
                detail["entry_date"] = entry_str
            if exit_str:
                detail["exit_date"] = exit_str
            details.append(detail)
        return details

    def _build_period_stats(self, daily_values: List[Dict[str, Any]]) -> Dict[str, Any]:
        if len(daily_values) < 2:
            return {}
        first = daily_values[0]
        last = daily_values[-1]
        start_date = first.get("date")
        end_date = last.get("date")
        if isinstance(start_date, datetime):
            start_str = start_date.strftime("%Y-%m-%d")
        else:
            start_str = str(start_date)
        if isinstance(end_date, datetime):
            end_str = end_date.strftime("%Y-%m-%d")
        else:
            end_str = str(end_date)

        trading_days = len(daily_values)
        values = [float(d["total_value"]) for d in daily_values]
        daily_changes = np.diff(values) / values[:-1] if len(values) > 1 else []

        return {
            "start_date": start_str,
            "end_date": end_str,
            "trading_days": trading_days,
            "initial_capital": float(first["total_value"]),
            "final_capital": float(last["total_value"]),
            "best_day": float(np.max(daily_changes) * 100) if len(daily_changes) > 0 else 0.0,
            "worst_day": float(np.min(daily_changes) * 100) if len(daily_changes) > 0 else 0.0,
            "avg_daily_return": float(np.mean(daily_changes) * 100) if len(daily_changes) > 0 else 0.0,
        }
