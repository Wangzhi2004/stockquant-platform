from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.portfolio import Portfolio, Holding, Transaction
from app.models.stock import Stock
from app.schemas.portfolio import (
    PortfolioCreate, PortfolioUpdate, HoldingCreate, HoldingUpdate,
    TransactionCreate
)
from app.core.exceptions import NotFoundError, ValidationError
from app.data.akshare_client import AKShareClient


class PortfolioService:
    def __init__(self, db: Session):
        self.db = db
        self.market_client = AKShareClient()

    def create_portfolio(self, user_id: UUID, data: PortfolioCreate) -> Portfolio:
        portfolio = Portfolio(
            user_id=user_id,
            name=data.name,
            description=data.description,
            initial_capital=data.initial_capital,
        )
        self.db.add(portfolio)
        self.db.commit()
        self.db.refresh(portfolio)
        return portfolio

    def get_portfolios(self, user_id: UUID) -> List[Portfolio]:
        return self.db.query(Portfolio).filter(Portfolio.user_id == user_id).all()

    def get_portfolio(self, portfolio_id: UUID, user_id: UUID) -> Portfolio:
        portfolio = self.db.query(Portfolio).filter(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == user_id
        ).first()
        if not portfolio:
            raise NotFoundError("Portfolio not found")
        return portfolio

    def update_portfolio(self, portfolio_id: UUID, user_id: UUID, data: PortfolioUpdate) -> Portfolio:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(portfolio, field, value)
        self.db.commit()
        self.db.refresh(portfolio)
        return portfolio

    def delete_portfolio(self, portfolio_id: UUID, user_id: UUID) -> None:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        self.db.delete(portfolio)
        self.db.commit()

    def add_holding(self, portfolio_id: UUID, user_id: UUID, data: HoldingCreate) -> Holding:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        holding = Holding(
            portfolio_id=portfolio_id,
            stock_code=data.stock_code,
            stock_name=data.stock_name,
            cost_price=data.cost_price,
            quantity=data.quantity,
            buy_date=data.buy_date,
        )
        self.db.add(holding)
        self.db.commit()
        self.db.refresh(holding)
        return holding

    def get_holdings(self, portfolio_id: UUID, user_id: UUID) -> List[Holding]:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        return portfolio.holdings

    def update_holding(self, holding_id: UUID, user_id: UUID, data: HoldingUpdate) -> Holding:
        holding = self.db.query(Holding).join(Portfolio).filter(
            Holding.id == holding_id,
            Portfolio.user_id == user_id
        ).first()
        if not holding:
            raise NotFoundError("Holding not found")

        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(holding, field, value)
        self.db.commit()
        self.db.refresh(holding)
        return holding

    def delete_holding(self, holding_id: UUID, user_id: UUID) -> None:
        holding = self.db.query(Holding).join(Portfolio).filter(
            Holding.id == holding_id,
            Portfolio.user_id == user_id
        ).first()
        if not holding:
            raise NotFoundError("Holding not found")
        self.db.delete(holding)
        self.db.commit()

    def add_transaction(self, portfolio_id: UUID, user_id: UUID, data: TransactionCreate) -> Transaction:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        transaction = Transaction(
            portfolio_id=portfolio_id,
            stock_code=data.stock_code,
            type=data.type,
            price=data.price,
            quantity=data.quantity,
            fee=data.fee,
            date=data.date,
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def get_transactions(self, portfolio_id: UUID, user_id: UUID) -> List[Transaction]:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        return portfolio.transactions

    def calculate_portfolio_stats(self, portfolio_id: UUID, user_id: UUID) -> dict:
        portfolio = self.get_portfolio(portfolio_id, user_id)
        holdings = portfolio.holdings

        total_cost = sum(h.cost_price * h.quantity for h in holdings)
        total_market_value = 0
        total_profit_loss = 0

        for holding in holdings:
            try:
                current_price = self.market_client.get_realtime_quote(holding.stock_code)
                market_value = current_price * holding.quantity
                profit_loss = market_value - (holding.cost_price * holding.quantity)

                total_market_value += market_value
                total_profit_loss += profit_loss
            except Exception:
                continue

        profit_loss_pct = (total_profit_loss / total_cost * 100) if total_cost > 0 else 0

        return {
            "total_cost": total_cost,
            "total_market_value": total_market_value,
            "total_profit_loss": total_profit_loss,
            "total_profit_loss_pct": profit_loss_pct,
            "holdings_count": len(holdings),
        }
