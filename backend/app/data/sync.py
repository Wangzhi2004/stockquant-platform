import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta

import pandas as pd

from app.data.akshare_client import AKShareClient
from app.core.logging import get_logger

logger = get_logger(__name__)


class DataSync:
    def __init__(self):
        self.client = AKShareClient()

    async def sync_stock_list(self) -> Dict[str, Any]:
        try:
            df = await asyncio.to_thread(self.client.get_stock_list)
            if df is None or df.empty:
                logger.warning("sync_stock_list: empty result")
                return {"synced": 0, "status": "empty"}

            records = df.to_dict("records")
            logger.info(f"sync_stock_list: synced {len(records)} stocks")
            return {
                "synced": len(records),
                "status": "success",
                "timestamp": datetime.now().isoformat(),
            }
        except Exception as e:
            logger.error(f"sync_stock_list failed: {e}")
            return {"synced": 0, "status": "error", "error": str(e)}

    async def sync_kline_daily(
        self,
        stock_codes: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        if not end_date:
            end_date = date.today().strftime("%Y%m%d")
        if not start_date:
            start_date = (date.today() - timedelta(days=365)).strftime("%Y%m%d")

        results = {"synced": 0, "failed": 0, "details": {}}

        for code in stock_codes:
            try:
                df = await asyncio.to_thread(
                    self.client.get_kline_daily,
                    stock_code=code,
                    start_date=start_date,
                    end_date=end_date,
                )
                if df is not None and not df.empty:
                    results["synced"] += 1
                    results["details"][code] = {
                        "rows": len(df),
                        "start": start_date,
                        "end": end_date,
                    }
                else:
                    results["failed"] += 1
                    results["details"][code] = {"rows": 0, "error": "empty data"}
            except Exception as e:
                results["failed"] += 1
                results["details"][code] = {"rows": 0, "error": str(e)}
                logger.error(f"sync_kline_daily failed for {code}: {e}")

        logger.info(
            f"sync_kline_daily: synced {results['synced']}, failed {results['failed']}"
        )
        return results

    async def sync_fundamental(
        self,
        stock_codes: List[str],
    ) -> Dict[str, Any]:
        results = {"synced": 0, "failed": 0, "details": {}}

        for code in stock_codes:
            try:
                fundamental_data = await asyncio.to_thread(
                    self._fetch_fundamental, code
                )
                if fundamental_data:
                    results["synced"] += 1
                    results["details"][code] = fundamental_data
                else:
                    results["failed"] += 1
                    results["details"][code] = {"error": "no data"}
            except Exception as e:
                results["failed"] += 1
                results["details"][code] = {"error": str(e)}
                logger.error(f"sync_fundamental failed for {code}: {e}")

        logger.info(
            f"sync_fundamental: synced {results['synced']}, failed {results['failed']}"
        )
        return results

    def _fetch_fundamental(self, stock_code: str) -> Optional[Dict[str, Any]]:
        try:
            import akshare as ak

            df = ak.stock_individual_info_em(symbol=stock_code)
            if df is None or df.empty:
                return None

            data = {}
            for _, row in df.iterrows():
                key = str(row.iloc[0]).strip()
                value = row.iloc[1]
                data[key] = value

            return {
                "stock_code": stock_code,
                "total_market_cap": data.get("总市值"),
                "circulating_market_cap": data.get("流通市值"),
                "industry": data.get("行业"),
                "list_date": data.get("上市时间"),
                "timestamp": datetime.now().isoformat(),
            }
        except Exception:
            return None
