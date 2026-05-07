from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.news import NewsArticle
from app.schemas.news import NewsCreate, NewsUpdate, NewsListParams
from app.core.exceptions import NotFoundError


class NewsService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: NewsCreate) -> NewsArticle:
        article = NewsArticle(
            source=data.source,
            source_url=data.source_url,
            title=data.title,
            content=data.content,
            publish_time=data.publish_time,
            related_stocks=data.related_stocks,
            related_sectors=data.related_sectors,
        )
        self.db.add(article)
        self.db.commit()
        self.db.refresh(article)
        return article

    def create_from_crawler(self, items: List[dict]) -> List[NewsArticle]:
        articles: List[NewsArticle] = []
        for item in items:
            existing = self.db.query(NewsArticle).filter(
                NewsArticle.title == item.get("title"),
                NewsArticle.source == item.get("source"),
            ).first()
            if existing:
                continue
            article = NewsArticle(
                source=item.get("source", "unknown"),
                source_url=item.get("source_url"),
                title=item.get("title", ""),
                content=item.get("content"),
                publish_time=item.get("publish_time"),
                related_stocks=",".join(item.get("related_stocks", [])),
                related_sectors=",".join(item.get("related_sectors", [])),
            )
            self.db.add(article)
            articles.append(article)
        self.db.commit()
        for a in articles:
            self.db.refresh(a)
        return articles

    def get_by_id(self, news_id: UUID) -> NewsArticle:
        article = self.db.query(NewsArticle).filter(NewsArticle.id == news_id).first()
        if not article:
            raise NotFoundError("News article not found")
        return article

    def list_news(self, params: NewsListParams) -> List[NewsArticle]:
        query = self.db.query(NewsArticle)

        if params.source:
            query = query.filter(NewsArticle.source == params.source)
        if params.sentiment:
            query = query.filter(NewsArticle.sentiment == params.sentiment)
        if params.stock_code:
            query = query.filter(NewsArticle.related_stocks.contains(params.stock_code))
        if params.sector:
            query = query.filter(NewsArticle.related_sectors.contains(params.sector))
        if params.keyword:
            like_pat = f"%{params.keyword}%"
            query = query.filter(
                (NewsArticle.title.ilike(like_pat)) |
                (NewsArticle.content.ilike(like_pat))
            )
        if params.start_date:
            query = query.filter(NewsArticle.publish_time >= params.start_date)
        if params.end_date:
            query = query.filter(NewsArticle.publish_time <= params.end_date)

        return query.order_by(desc(NewsArticle.publish_time)).offset(params.skip).limit(params.limit).all()

    def update(self, news_id: UUID, data: NewsUpdate) -> NewsArticle:
        article = self.get_by_id(news_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(article, field, value)
        self.db.commit()
        self.db.refresh(article)
        return article

    def delete(self, news_id: UUID) -> None:
        article = self.get_by_id(news_id)
        self.db.delete(article)
        self.db.commit()

    def get_stats(self, days: int = 7) -> Dict:
        since = datetime.utcnow() - timedelta(days=days)
        total = self.db.query(NewsArticle).filter(NewsArticle.created_at >= since).count()
        positive = self.db.query(NewsArticle).filter(
            NewsArticle.created_at >= since,
            NewsArticle.sentiment == "positive"
        ).count()
        negative = self.db.query(NewsArticle).filter(
            NewsArticle.created_at >= since,
            NewsArticle.sentiment == "negative"
        ).count()
        neutral = self.db.query(NewsArticle).filter(
            NewsArticle.created_at >= since,
            NewsArticle.sentiment == "neutral"
        ).count()

        avg_score = self.db.query(func.avg(NewsArticle.opportunity_score)).filter(
            NewsArticle.created_at >= since
        ).scalar()

        return {
            "total": total,
            "positive_count": positive,
            "negative_count": negative,
            "neutral_count": neutral,
            "avg_opportunity_score": round(avg_score, 2) if avg_score else None,
        }

    def get_sector_stats(self, days: int = 7) -> List[Dict]:
        since = datetime.utcnow() - timedelta(days=days)
        articles = self.db.query(NewsArticle).filter(
            NewsArticle.created_at >= since,
            NewsArticle.related_sectors.isnot(None)
        ).all()

        sector_counts: Dict[str, int] = {}
        for article in articles:
            if article.related_sectors:
                for sector in article.related_sectors.split(","):
                    sector = sector.strip()
                    if sector:
                        sector_counts[sector] = sector_counts.get(sector, 0) + 1

        sorted_sectors = sorted(sector_counts.items(), key=lambda x: x[1], reverse=True)
        return [{"sector": s, "count": c} for s, c in sorted_sectors[:10]]

    def get_stock_stats(self, days: int = 7) -> List[Dict]:
        since = datetime.utcnow() - timedelta(days=days)
        articles = self.db.query(NewsArticle).filter(
            NewsArticle.created_at >= since,
            NewsArticle.related_stocks.isnot(None)
        ).all()

        stock_counts: Dict[str, int] = {}
        for article in articles:
            if article.related_stocks:
                for stock in article.related_stocks.split(","):
                    stock = stock.strip()
                    if stock:
                        stock_counts[stock] = stock_counts.get(stock, 0) + 1

        sorted_stocks = sorted(stock_counts.items(), key=lambda x: x[1], reverse=True)
        return [{"stock": s, "count": c} for s, c in sorted_stocks[:10]]
