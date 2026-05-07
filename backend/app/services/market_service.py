from typing import List
from sqlalchemy.orm import Session
from app.models.stock import Stock
from app.models.kline import KlineDaily
from app.data.akshare_client import AKShareClient
from app.schemas.market import StockInfo, KlineData, IndexQuote, HotSector


class MarketService:
    def __init__(self, db: Session):
        self.db = db
        self.client = AKShareClient()
    
    def get_stock_list(self, skip: int = 0, limit: int = 100) -> List[StockInfo]:
        stocks = self.db.query(Stock).offset(skip).limit(limit).all()
        return [StockInfo.model_validate(s) for s in stocks]
    
    def get_stock_detail(self, code: str) -> StockInfo:
        stock = self.db.query(Stock).filter(Stock.code == code).first()
        if not stock:
            raise Exception("Stock not found")
        return StockInfo.model_validate(stock)
    
    def get_kline(self, code: str, limit: int = 100) -> List[KlineData]:
        klines = self.db.query(KlineDaily).filter(
            KlineDaily.stock_code == code
        ).order_by(KlineDaily.date.desc()).limit(limit).all()
        return [KlineData.model_validate(k) for k in reversed(klines)]
    
    def get_indices(self) -> List[IndexQuote]:
        indices = [
            {"code": "000001", "name": "上证指数"},
            {"code": "399001", "name": "深证成指"},
            {"code": "399006", "name": "创业板指"},
            {"code": "000688", "name": "科创50"},
            {"code": "000300", "name": "沪深300"},
        ]
        
        result = []
        for idx in indices:
            try:
                quote = self.client.get_index_quote(idx["code"])
                result.append(IndexQuote(**quote))
            except Exception:
                continue
        
        return result
    
    def get_hot_sectors(self) -> List[HotSector]:
        try:
            df = self.client.get_hot_sectors()
            sectors = []
            for _, row in df.iterrows():
                sectors.append(HotSector(
                    name=row.get("板块名称", ""),
                    change_pct=row.get("涨跌幅", 0),
                ))
            return sectors
        except Exception:
            return []
