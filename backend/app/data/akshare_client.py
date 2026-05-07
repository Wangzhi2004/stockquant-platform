import akshare as ak
import pandas as pd
from typing import List, Dict, Optional
from datetime import datetime, date
from decimal import Decimal


class AKShareClient:
    def __init__(self):
        self._cache = {}

    def get_stock_list(self) -> pd.DataFrame:
        """获取A股列表"""
        try:
            df = ak.stock_zh_a_spot_em()
            return df
        except Exception as e:
            raise Exception(f"Failed to get stock list: {str(e)}")

    def get_realtime_quote(self, stock_code: str) -> Decimal:
        """获取实时行情"""
        try:
            df = ak.stock_zh_a_spot_em()
            stock = df[df["代码"] == stock_code]
            if stock.empty:
                raise Exception(f"Stock {stock_code} not found")
            return Decimal(str(stock.iloc[0]["最新价"]))
        except Exception as e:
            raise Exception(f"Failed to get quote for {stock_code}: {str(e)}")

    def get_kline_daily(self, stock_code: str, start_date: str, end_date: str) -> pd.DataFrame:
        """获取日K线数据"""
        try:
            df = ak.stock_zh_a_hist(
                symbol=stock_code,
                period="daily",
                start_date=start_date,
                end_date=end_date,
                adjust="qfq"
            )
            return df
        except Exception as e:
            raise Exception(f"Failed to get kline for {stock_code}: {str(e)}")

    def get_index_quote(self, index_code: str) -> Dict:
        """获取指数行情"""
        try:
            df = ak.stock_zh_index_spot_em()
            index = df[df["代码"] == index_code]
            if index.empty:
                raise Exception(f"Index {index_code} not found")
            row = index.iloc[0]
            return {
                "code": index_code,
                "name": row["名称"],
                "price": Decimal(str(row["最新价"])),
                "change": Decimal(str(row["涨跌额"])),
                "change_pct": Decimal(str(row["涨跌幅"])),
            }
        except Exception as e:
            raise Exception(f"Failed to get index quote: {str(e)}")

    def get_hot_sectors(self) -> pd.DataFrame:
        """获取热点板块"""
        try:
            df = ak.stock_board_industry_name_em()
            return df.head(20)
        except Exception as e:
            raise Exception(f"Failed to get hot sectors: {str(e)}")
