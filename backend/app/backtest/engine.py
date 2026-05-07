from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from decimal import Decimal
import pandas as pd
import numpy as np

from app.strategies.base import StrategyBase, Signal


@dataclass
class BacktestConfig:
    start_date: date
    end_date: date
    initial_capital: Decimal = Decimal("1000000")
    commission_rate: Decimal = Decimal("0.0003")
    slippage: Decimal = Decimal("0.001")
    max_positions: int = 10
    position_size: Decimal = Decimal("0.1")
    stop_loss: Optional[Decimal] = Decimal("0.08")
    take_profit: Optional[Decimal] = Decimal("0.2")


@dataclass
class TradeRecord:
    date: datetime
    stock_code: str
    action: str
    price: Decimal
    quantity: int
    amount: Decimal
    commission: Decimal
    reason: str


@dataclass
class BacktestResult:
    config: BacktestConfig
    trades: List[TradeRecord] = field(default_factory=list)
    daily_values: List[Dict[str, Any]] = field(default_factory=list)
    final_capital: Decimal = Decimal("0")
    total_return: Decimal = Decimal("0")
    total_return_pct: Decimal = Decimal("0")
    sharpe_ratio: Decimal = Decimal("0")
    max_drawdown: Decimal = Decimal("0")
    max_drawdown_pct: Decimal = Decimal("0")
    win_rate: Decimal = Decimal("0")
    profit_factor: Decimal = Decimal("0")
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    avg_profit: Decimal = Decimal("0")
    avg_loss: Decimal = Decimal("0")


class EventDrivenBacktest:
    def __init__(self, config: BacktestConfig, strategy: StrategyBase):
        self.config = config
        self.strategy = strategy
        self.capital = config.initial_capital
        self.positions: Dict[str, Dict[str, Any]] = {}
        self.trades: List[TradeRecord] = []
        self.daily_values: List[Dict[str, Any]] = []
        self.closed_trades: List[Dict[str, Any]] = []

    def run(self, data: Dict[str, pd.DataFrame]) -> BacktestResult:
        stock_codes = list(data.keys())
        if not stock_codes:
            return BacktestResult(config=self.config)

        all_dates = sorted(set(
            d for df in data.values() for d in df.index
        ))

        for current_date in all_dates:
            day_signals = []

            for stock_code, df in data.items():
                if current_date not in df.index:
                    continue

                hist = df.loc[:current_date]
                if len(hist) < 20:
                    continue

                signals = self.strategy.analyze(hist)
                for sig in signals:
                    sig.stock_code = stock_code
                    day_signals.append(sig)

            self._process_signals(current_date, day_signals, data)
            self._check_stop_loss_take_profit(current_date, data)

            day_value = self._calculate_portfolio_value(current_date, data)
            self.daily_values.append({
                "date": current_date,
                "total_value": day_value,
                "cash": self.capital,
                "position_count": len(self.positions)
            })

        result = BacktestResult(
            config=self.config,
            trades=self.trades,
            daily_values=self.daily_values,
            final_capital=self._calculate_portfolio_value(all_dates[-1], data) if all_dates else self.config.initial_capital
        )

        self._calculate_metrics(result)
        return result

    def _process_signals(self, current_date, signals: List[Signal], data: Dict[str, pd.DataFrame]):
        for sig in signals:
            stock_code = sig.stock_code
            if stock_code not in data or current_date not in data[stock_code].index:
                continue

            price = Decimal(str(data[stock_code].loc[current_date, "close"]))

            if sig.signal_type in ("buy", "strong_buy"):
                if len(self.positions) >= self.config.max_positions:
                    continue
                if stock_code in self.positions:
                    continue

                position_value = self.capital * self.config.position_size
                quantity = int(position_value / price)
                if quantity <= 0:
                    continue

                amount = price * quantity
                commission = amount * self.config.commission_rate
                total_cost = amount + commission

                if total_cost > self.capital:
                    continue

                self.capital -= total_cost
                self.positions[stock_code] = {
                    "entry_price": price,
                    "quantity": quantity,
                    "entry_date": current_date,
                    "highest_price": price
                }

                self.trades.append(TradeRecord(
                    date=current_date,
                    stock_code=stock_code,
                    action="buy",
                    price=price,
                    quantity=quantity,
                    amount=amount,
                    commission=commission,
                    reason=sig.description
                ))

            elif sig.signal_type in ("sell", "strong_sell"):
                if stock_code not in self.positions:
                    continue

                self._close_position(stock_code, current_date, price, sig.description)

    def _check_stop_loss_take_profit(self, current_date, data: Dict[str, pd.DataFrame]):
        for stock_code in list(self.positions.keys()):
            if stock_code not in data or current_date not in data[stock_code].index:
                continue

            position = self.positions[stock_code]
            current_price = Decimal(str(data[stock_code].loc[current_date, "close"]))

            if current_price > position["highest_price"]:
                position["highest_price"] = current_price

            entry_price = position["entry_price"]

            if self.config.stop_loss:
                loss_pct = (entry_price - current_price) / entry_price
                if loss_pct >= self.config.stop_loss:
                    self._close_position(stock_code, current_date, current_price, "止损")
                    continue

            if self.config.take_profit:
                profit_pct = (current_price - entry_price) / entry_price
                if profit_pct >= self.config.take_profit:
                    self._close_position(stock_code, current_date, current_price, "止盈")
                    continue

    def _close_position(self, stock_code: str, current_date, price: Decimal, reason: str):
        position = self.positions.pop(stock_code)
        quantity = position["quantity"]
        amount = price * quantity
        commission = amount * self.config.commission_rate
        net_proceeds = amount - commission

        self.capital += net_proceeds

        self.trades.append(TradeRecord(
            date=current_date,
            stock_code=stock_code,
            action="sell",
            price=price,
            quantity=quantity,
            amount=amount,
            commission=commission,
            reason=reason
        ))

        entry_amount = position["entry_price"] * quantity
        pnl = (price - position["entry_price"]) * quantity - commission - (entry_amount * self.config.commission_rate)
        self.closed_trades.append({
            "stock_code": stock_code,
            "entry_price": position["entry_price"],
            "exit_price": price,
            "quantity": quantity,
            "pnl": pnl,
            "entry_date": position["entry_date"],
            "exit_date": current_date
        })

    def _calculate_portfolio_value(self, current_date, data: Dict[str, pd.DataFrame]) -> Decimal:
        total = self.capital
        for stock_code, position in self.positions.items():
            if stock_code in data and current_date in data[stock_code].index:
                price = Decimal(str(data[stock_code].loc[current_date, "close"]))
                total += price * position["quantity"]
        return total

    def _calculate_metrics(self, result: BacktestResult):
        initial = self.config.initial_capital
        final = result.final_capital

        result.total_return = final - initial
        result.total_return_pct = (result.total_return / initial * 100) if initial > 0 else Decimal("0")

        if result.daily_values:
            values = [Decimal(str(d["total_value"])) for d in result.daily_values]
            result.max_drawdown, result.max_drawdown_pct = self._calculate_max_drawdown(values)
            result.sharpe_ratio = self._calculate_sharpe(values)

        result.total_trades = len(self.closed_trades)
        if result.total_trades > 0:
            profits = [t["pnl"] for t in self.closed_trades if t["pnl"] > 0]
            losses = [t["pnl"] for t in self.closed_trades if t["pnl"] <= 0]

            result.winning_trades = len(profits)
            result.losing_trades = len(losses)
            result.win_rate = Decimal(str(result.winning_trades / result.total_trades * 100))

            if profits:
                result.avg_profit = sum(profits) / len(profits)
            if losses:
                result.avg_loss = sum(losses) / len(losses)

            total_profit = sum(profits) if profits else Decimal("0")
            total_loss = abs(sum(losses)) if losses else Decimal("0")
            result.profit_factor = (total_profit / total_loss) if total_loss > 0 else Decimal("0")

    def _calculate_max_drawdown(self, values: List[Decimal]) -> tuple:
        peak = values[0]
        max_dd = Decimal("0")
        max_dd_pct = Decimal("0")

        for v in values:
            if v > peak:
                peak = v
            dd = peak - v
            dd_pct = (dd / peak * 100) if peak > 0 else Decimal("0")
            if dd > max_dd:
                max_dd = dd
                max_dd_pct = dd_pct

        return max_dd, max_dd_pct

    def _calculate_sharpe(self, values: List[Decimal], risk_free_rate: float = 0.03) -> Decimal:
        if len(values) < 2:
            return Decimal("0")

        returns = []
        for i in range(1, len(values)):
            r = (values[i] - values[i - 1]) / values[i - 1] if values[i - 1] > 0 else Decimal("0")
            returns.append(float(r))

        if not returns:
            return Decimal("0")

        avg_return = np.mean(returns)
        std_return = np.std(returns)

        if std_return == 0:
            return Decimal("0")

        sharpe = (avg_return * 252 - risk_free_rate) / (std_return * np.sqrt(252))
        return Decimal(str(sharpe))

    def generate_report(self, result: BacktestResult) -> Dict[str, Any]:
        return {
            "summary": {
                "initial_capital": float(result.config.initial_capital),
                "final_capital": float(result.final_capital),
                "total_return": float(result.total_return),
                "total_return_pct": float(result.total_return_pct),
                "sharpe_ratio": float(result.sharpe_ratio),
                "max_drawdown": float(result.max_drawdown),
                "max_drawdown_pct": float(result.max_drawdown_pct),
                "win_rate": float(result.win_rate),
                "profit_factor": float(result.profit_factor),
                "total_trades": result.total_trades,
                "winning_trades": result.winning_trades,
                "losing_trades": result.losing_trades,
            },
            "trades": [
                {
                    "date": t.date.isoformat() if hasattr(t.date, 'isoformat') else str(t.date),
                    "stock_code": t.stock_code,
                    "action": t.action,
                    "price": float(t.price),
                    "quantity": t.quantity,
                    "amount": float(t.amount),
                    "commission": float(t.commission),
                    "reason": t.reason
                }
                for t in result.trades
            ],
            "daily_values": [
                {
                    "date": d["date"].isoformat() if hasattr(d["date"], 'isoformat') else str(d["date"]),
                    "total_value": float(d["total_value"]),
                    "cash": float(d["cash"]),
                    "position_count": d["position_count"]
                }
                for d in result.daily_values
            ],
            "equity_curve": [
                {
                    "date": d["date"].isoformat() if hasattr(d["date"], 'isoformat') else str(d["date"]),
                    "value": float(d["total_value"])
                }
                for d in result.daily_values
            ]
        }
