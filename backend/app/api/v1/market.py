from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.base import get_db
from app.schemas.market import StockInfo, KlineData, IndexQuote, HotSector
from app.services.market_service import MarketService

router = APIRouter()


@router.get("/stocks", response_model=List[StockInfo])
async def list_stocks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    service = MarketService(db)
    return service.get_stock_list(skip, limit)


@router.get("/stocks/{code}", response_model=StockInfo)
async def get_stock(code: str, db: Session = Depends(get_db)):
    service = MarketService(db)
    return service.get_stock_detail(code)


@router.get("/stocks/{code}/kline", response_model=List[KlineData])
async def get_kline(code: str, limit: int = 100, db: Session = Depends(get_db)):
    service = MarketService(db)
    return service.get_kline(code, limit)


@router.get("/indices", response_model=List[IndexQuote])
async def get_indices(db: Session = Depends(get_db)):
    service = MarketService(db)
    return service.get_indices()


@router.get("/hot-sectors", response_model=List[HotSector])
async def get_hot_sectors(db: Session = Depends(get_db)):
    service = MarketService(db)
    return service.get_hot_sectors()
