from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.models.base import get_db
from app.models.user import User
from app.schemas.portfolio import (
    PortfolioCreate, PortfolioUpdate, PortfolioResponse, PortfolioDetailResponse,
    HoldingCreate, HoldingUpdate, HoldingResponse,
    TransactionCreate, TransactionResponse,
    HoldingImportRequest, HoldingImportResponse,
)
from app.services.portfolio_service import PortfolioService
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[PortfolioResponse])
async def list_portfolios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    portfolios = service.get_portfolios(current_user.id)
    return [PortfolioResponse.model_validate(p) for p in portfolios]


@router.post("", response_model=PortfolioResponse, status_code=201)
async def create_portfolio(
    data: PortfolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    portfolio = service.create_portfolio(current_user.id, data)
    return portfolio


@router.get("/{portfolio_id}", response_model=PortfolioDetailResponse)
async def get_portfolio(
    portfolio_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    portfolio = service.get_portfolio(portfolio_id, current_user.id)
    return portfolio


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(
    portfolio_id: UUID,
    data: PortfolioUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    portfolio = service.update_portfolio(portfolio_id, current_user.id, data)
    return portfolio


@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    service.delete_portfolio(portfolio_id, current_user.id)
    return {"message": "Portfolio deleted"}


@router.get("/{portfolio_id}/holdings", response_model=List[HoldingResponse])
async def list_holdings(
    portfolio_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    holdings = service.get_holdings(portfolio_id, current_user.id)
    return holdings


@router.post("/{portfolio_id}/holdings", response_model=HoldingResponse, status_code=201)
async def add_holding(
    portfolio_id: UUID,
    data: HoldingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    holding = service.add_holding(portfolio_id, current_user.id, data)
    return holding


@router.put("/holdings/{holding_id}", response_model=HoldingResponse)
async def update_holding(
    holding_id: UUID,
    data: HoldingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    holding = service.update_holding(holding_id, current_user.id, data)
    return holding


@router.delete("/holdings/{holding_id}")
async def delete_holding(
    holding_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    service.delete_holding(holding_id, current_user.id)
    return {"message": "Holding deleted"}


@router.get("/{portfolio_id}/transactions", response_model=List[TransactionResponse])
async def list_transactions(
    portfolio_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    transactions = service.get_transactions(portfolio_id, current_user.id)
    return transactions


@router.post("/{portfolio_id}/transactions", response_model=TransactionResponse, status_code=201)
async def add_transaction(
    portfolio_id: UUID,
    data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    transaction = service.add_transaction(portfolio_id, current_user.id, data)
    return transaction


@router.post("/{portfolio_id}/holdings/import", response_model=HoldingImportResponse)
async def import_holdings(
    portfolio_id: UUID,
    data: HoldingImportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PortfolioService(db)
    result = service.import_holdings(portfolio_id, current_user.id, data.holdings)
    return result
