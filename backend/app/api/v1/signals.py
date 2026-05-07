from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.schemas.signal import SignalResponse, SignalScanRequest, SignalStats
from app.services.signal_service import SignalService

router = APIRouter()


@router.get("", response_model=List[SignalResponse])
async def list_signals(
    stock_code: str = None,
    signal_type: str = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    service = SignalService(db)
    return service.get_signals(stock_code, signal_type, limit)


@router.post("/scan")
async def scan_signals(
    request: SignalScanRequest,
    db: Session = Depends(get_db)
):
    service = SignalService(db)
    signals = service.scan_signals(request.stock_code, request.strategy_type)
    return {"count": len(signals), "signals": signals}


@router.get("/stats", response_model=SignalStats)
async def get_signal_stats(db: Session = Depends(get_db)):
    service = SignalService(db)
    return service.get_signal_stats()
