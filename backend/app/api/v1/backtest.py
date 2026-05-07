from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.models.user import User
from app.schemas.backtest import (
    BacktestCreateRequest,
    BacktestResponse,
    BacktestListResponse,
)
from app.services.backtest_service import BacktestService
from app.api.deps import get_current_user

router = APIRouter()


@router.get("", response_model=List[BacktestListResponse])
async def list_backtests(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = BacktestService(db)
    jobs = service.list(current_user.id, limit)

    result = []
    for job in jobs:
        item = BacktestListResponse.model_validate(job)
        if job.result and isinstance(job.result, dict):
            summary = job.result.get("summary")
            if summary:
                item.total_return_pct = summary.get("total_return_pct")
        result.append(item)

    return result


@router.post("", response_model=BacktestResponse, status_code=status.HTTP_201_CREATED)
async def create_backtest(
    request: BacktestCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = BacktestService(db)
    job = service.create(current_user.id, request)
    return job


@router.get("/{backtest_id}", response_model=BacktestResponse)
async def get_backtest(
    backtest_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = BacktestService(db)
    job = service.get(backtest_id, current_user.id)
    return job


@router.post("/{backtest_id}/run", response_model=BacktestResponse)
async def run_backtest(
    backtest_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = BacktestService(db)
    job = service.run(backtest_id, current_user.id)
    return job


@router.delete("/{backtest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_backtest(
    backtest_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = BacktestService(db)
    service.delete(backtest_id, current_user.id)
    return None
