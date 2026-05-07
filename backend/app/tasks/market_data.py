import asyncio
from datetime import datetime, timedelta
from decimal import Decimal

import pandas as pd
from celery import shared_task
from sqlalchemy.orm import Session

from app.models.base import SessionLocal
from app.models.kline import KlineDaily
from app.models.stock import Stock
from app.data.akshare_client import AKShareClient


@shared_task(bind=True, max_retries=3)
def sync_stock_list(self):
    db = SessionLocal()
    try:
        client = AKShareClient()
        df = client.get_stock_list()
        count = 0
        for _, row in df.iterrows():
            code = str(row.get("代码", "")).strip()
            if not code:
                continue
            stock = db.query(Stock).filter(Stock.code == code).first()
            if not stock:
                stock = Stock(code=code)
            stock.name = str(row.get("名称", ""))
            stock.exchange = "SH" if code.startswith("6") else "SZ"
            stock.industry = str(row.get("所属行业", "")) if pd.notna(row.get("所属行业")) else None
            market_cap = row.get("总市值")
            stock.market_cap = int(market_cap) if pd.notna(market_cap) else None
            db.add(stock)
            count += 1
        db.commit()
        return {"status": "success", "synced": count}
    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()


@shared_task(bind=True, max_retries=3)
def sync_kline_daily(self, stock_code: str = None, days: int = 365):
    db = SessionLocal()
    try:
        client = AKShareClient()
        if stock_code:
            stocks = [stock_code]
        else:
            stocks = [s.code for s in db.query(Stock).limit(500).all()]

        end_date = datetime.now().strftime("%Y%m%d")
        start_date = (datetime.now() - timedelta(days=days)).strftime("%Y%m%d")
        synced = 0

        for code in stocks:
            try:
                df = client.get_kline_daily(code, start_date, end_date)
                for _, row in df.iterrows():
                    date_val = row.get("日期")
                    if not date_val:
                        continue
                    kline = db.query(KlineDaily).filter(
                        KlineDaily.stock_code == code,
                        KlineDaily.date == date_val,
                    ).first()
                    if not kline:
                        kline = KlineDaily(stock_code=code, date=date_val)
                    kline.open = Decimal(str(row.get("开盘", 0)))
                    kline.high = Decimal(str(row.get("最高", 0)))
                    kline.low = Decimal(str(row.get("最低", 0)))
                    kline.close = Decimal(str(row.get("收盘", 0)))
                    kline.volume = int(row.get("成交量", 0))
                    kline.amount = Decimal(str(row.get("成交额", 0)))
                    kline.change_pct = Decimal(str(row.get("涨跌幅", 0)))
                    db.add(kline)
                    synced += 1
                db.commit()
            except Exception as e:
                db.rollback()
                continue
        return {"status": "success", "synced": synced, "stocks": len(stocks)}
    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()


@shared_task
def sync_realtime_quotes():
    db = SessionLocal()
    try:
        client = AKShareClient()
        df = client.get_stock_list()
        hot = []
        for _, row in df.head(20).iterrows():
            hot.append({
                "code": str(row.get("代码", "")),
                "name": str(row.get("名称", "")),
                "price": float(row.get("最新价", 0)),
                "change_pct": float(row.get("涨跌幅", 0)),
            })
        return {"status": "success", "quotes_count": len(df), "hot": hot}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()
