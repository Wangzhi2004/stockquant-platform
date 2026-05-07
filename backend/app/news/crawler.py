import hashlib
import json
import re
from datetime import datetime
from typing import List, Dict, Optional
from urllib.parse import urljoin

import httpx
import akshare as ak
from bs4 import BeautifulSoup

from app.core.config import get_settings

settings = get_settings()


class NewsItem:
    def __init__(
        self,
        source: str,
        title: str,
        content: Optional[str] = None,
        source_url: Optional[str] = None,
        publish_time: Optional[datetime] = None,
        related_stocks: Optional[List[str]] = None,
        related_sectors: Optional[List[str]] = None,
    ):
        self.source = source
        self.title = title
        self.content = content or ""
        self.source_url = source_url
        self.publish_time = publish_time or datetime.utcnow()
        self.related_stocks = related_stocks or []
        self.related_sectors = related_sectors or []
        self._id = self._generate_id()

    def _generate_id(self) -> str:
        raw = f"{self.source}:{self.title}:{self.publish_time.isoformat() if self.publish_time else ''}"
        return hashlib.md5(raw.encode("utf-8")).hexdigest()

    def to_dict(self) -> dict:
        return {
            "id": self._id,
            "source": self.source,
            "title": self.title,
            "content": self.content,
            "source_url": self.source_url,
            "publish_time": self.publish_time.isoformat() if self.publish_time else None,
            "related_stocks": self.related_stocks,
            "related_sectors": self.related_sectors,
        }


class NewsCrawler:
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0, headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        })
        self.seen_ids: set = set()

    def fetch_stock_news_sync(self, stock_code: str = "600519", limit: int = 50) -> List[NewsItem]:
        """使用 AKShare 获取个股新闻（同步接口）"""
        items: List[NewsItem] = []
        try:
            df = ak.stock_news_em(symbol=stock_code)
            for _, row in df.head(limit).iterrows():
                title = str(row.get("新闻标题", ""))
                content = str(row.get("新闻内容", ""))
                pub_time = str(row.get("发布时间", ""))
                source = str(row.get("文章来源", "eastmoney"))
                url = str(row.get("新闻链接", ""))

                publish_time = None
                if pub_time:
                    try:
                        publish_time = datetime.strptime(pub_time, "%Y-%m-%d %H:%M:%S")
                    except ValueError:
                        pass

                stocks = self._extract_stock_codes(title + " " + content)
                sectors = self._extract_sectors(title + " " + content)
                items.append(NewsItem(
                    source=source,
                    title=title,
                    content=content,
                    source_url=url,
                    publish_time=publish_time,
                    related_stocks=stocks if stocks else [stock_code],
                    related_sectors=sectors,
                ))
        except Exception as e:
            print(f"Stock news fetch error: {e}")
        return items

    async def fetch_cailianshe(self, limit: int = 50) -> List[NewsItem]:
        """财联社快讯 - 使用 AKShare 备用"""
        items: List[NewsItem] = []
        try:
            df = ak.news_cctv(start_date=datetime.now().strftime("%Y%m%d"), end_date=datetime.now().strftime("%Y%m%d"))
            for _, row in df.head(limit).iterrows():
                title = str(row.get("title", ""))
                content = str(row.get("content", ""))
                pub_time = str(row.get("date", ""))
                publish_time = None
                if pub_time:
                    try:
                        publish_time = datetime.strptime(pub_time, "%Y-%m-%d %H:%M:%S")
                    except ValueError:
                        pass
                stocks = self._extract_stock_codes(title + " " + content)
                sectors = self._extract_sectors(title + " " + content)
                items.append(NewsItem(
                    source="cctv",
                    title=title,
                    content=content,
                    publish_time=publish_time,
                    related_stocks=stocks,
                    related_sectors=sectors,
                ))
        except Exception as e:
            print(f"CCTV news fetch error: {e}")
        return items

    async def fetch_eastmoney(self, limit: int = 50) -> List[NewsItem]:
        """东方财富新闻 - 使用 AKShare 个股新闻聚合"""
        items: List[NewsItem] = []
        # 获取热门股票的最新新闻
        hot_stocks = ["600519", "000858", "300750", "000001", "002594"]
        for stock in hot_stocks:
            try:
                stock_items = self.fetch_stock_news_sync(stock, limit=limit // len(hot_stocks) + 1)
                items.extend(stock_items)
            except Exception:
                continue
        return items[:limit]

    async def fetch_sector_news(self, sector: str, limit: int = 20) -> List[NewsItem]:
        url = "https://searchapi.eastmoney.com/api/sns/get"
        params = {
            "type": "all",
            "count": limit,
            "keyword": sector,
        }
        items: List[NewsItem] = []
        try:
            resp = await self.client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            for article in data.get("result", []):
                title = article.get("title", "")
                content = article.get("summary", "")
                stocks = self._extract_stock_codes(title + " " + content)
                sectors = [sector] + self._extract_sectors(title + " " + content)
                items.append(NewsItem(
                    source="eastmoney_search",
                    title=title,
                    content=content,
                    source_url=article.get("url"),
                    related_stocks=stocks,
                    related_sectors=list(set(sectors)),
                ))
        except Exception as e:
            print(f"Sector news fetch error: {e}")
        return items

    def deduplicate(self, items: List[NewsItem]) -> List[NewsItem]:
        unique: List[NewsItem] = []
        seen: set = set()
        for item in items:
            if item._id not in seen:
                seen.add(item._id)
                unique.append(item)
        return unique

    def filter_by_keywords(
        self,
        items: List[NewsItem],
        keywords: List[str],
        mode: str = "any",
    ) -> List[NewsItem]:
        if not keywords:
            return items
        filtered: List[NewsItem] = []
        for item in items:
            text = f"{item.title} {item.content}".lower()
            matches = [k.lower() in text for k in keywords]
            if mode == "all" and all(matches):
                filtered.append(item)
            elif mode == "any" and any(matches):
                filtered.append(item)
        return filtered

    def _extract_stock_codes(self, text: str) -> List[str]:
        patterns = [
            r"\b(\d{6})\b",
            r"([\u4e00-\u9fa5]{2,4})\((\d{6})\)",
        ]
        codes: set = set()
        for pat in patterns:
            for match in re.finditer(pat, text):
                if len(match.groups()) == 2:
                    codes.add(match.group(2))
                else:
                    code = match.group(1)
                    if code.startswith(("6", "0", "3")):
                        codes.add(code)
        return sorted(codes)

    def _extract_sectors(self, text: str) -> List[str]:
        sector_keywords = [
            "半导体", "新能源", "光伏", "锂电池", "医药", "医疗", "白酒",
            "银行", "保险", "证券", "地产", "基建", "军工", "航空", "汽车",
            "人工智能", "芯片", "5G", "云计算", "大数据", "物联网", "区块链",
            "消费电子", "食品饮料", "家电", "化工", "钢铁", "煤炭", "石油",
            "电力", "环保", "农业", "养殖", "物流", "零售", "传媒", "游戏",
        ]
        found: set = set()
        for kw in sector_keywords:
            if kw in text:
                found.add(kw)
        return sorted(found)

    async def close(self):
        await self.client.aclose()
