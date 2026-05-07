from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.base import get_db
from app.schemas.news import (
    NewsResponse, NewsListParams, NewsUpdate,
    NewsAnalyzeRequest, NewsBatchAnalyzeRequest, NewsStatsResponse,
)
from app.services.news_service import NewsService
from app.news.crawler import NewsCrawler
from app.news.ai_analyzer import AINewsAnalyzer
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("", response_model=List[NewsResponse])
async def list_news(
    params: NewsListParams = Depends(),
    db: Session = Depends(get_db),
):
    service = NewsService(db)
    return service.list_news(params)


@router.get("/{news_id}", response_model=NewsResponse)
async def get_news(news_id: UUID, db: Session = Depends(get_db)):
    service = NewsService(db)
    return service.get_by_id(news_id)


@router.put("/{news_id}", response_model=NewsResponse)
async def update_news(
    news_id: UUID,
    data: NewsUpdate,
    db: Session = Depends(get_db),
):
    service = NewsService(db)
    return service.update(news_id, data)


@router.delete("/{news_id}")
async def delete_news(news_id: UUID, db: Session = Depends(get_db)):
    service = NewsService(db)
    service.delete(news_id)
    return {"message": "News deleted"}


@router.post("/crawl")
async def crawl_news(
    source: str = "all",
    limit: int = 50,
    db: Session = Depends(get_db),
):
    crawler = NewsCrawler()
    try:
        items: List[dict] = []
        if source in ("all", "cailianshe"):
            cailianshe_items = await crawler.fetch_cailianshe(limit=limit)
            items.extend([i.to_dict() for i in cailianshe_items])
        if source in ("all", "eastmoney"):
            eastmoney_items = await crawler.fetch_eastmoney(limit=limit)
            items.extend([i.to_dict() for i in eastmoney_items])

        items = crawler.deduplicate([type("obj", (object,), {"_id": i["id"], **i})() for i in items])
        items = [i.to_dict() if hasattr(i, "to_dict") else i for i in items]

        service = NewsService(db)
        saved = service.create_from_crawler(items)
        return {"count": len(saved), "items": [NewsResponse.model_validate(s) for s in saved]}
    finally:
        await crawler.close()


@router.post("/analyze")
async def analyze_news(
    request: NewsAnalyzeRequest,
    db: Session = Depends(get_db),
):
    service = NewsService(db)
    article = service.get_by_id(request.news_id)
    analyzer = AINewsAnalyzer()
    try:
        sentiment_result = await analyzer.analyze_sentiment(article.title, article.content or "")
        keywords = await analyzer.extract_keywords(article.title, article.content or "")
        summary = await analyzer.generate_summary(article.title, article.content or "")
        opportunity = await analyzer.score_opportunity(
            article.title,
            article.content or "",
            sentiment_result["sentiment"],
            sentiment_result["score"],
        )

        article = service.update(request.news_id, NewsUpdate(
            sentiment=sentiment_result["sentiment"],
            sentiment_score=sentiment_result["score"],
            opportunity_score=opportunity["opportunity_score"],
            ai_summary=summary,
            ai_suggestion=opportunity["suggestion"],
        ))
        return NewsResponse.model_validate(article)
    finally:
        await analyzer.close()


@router.post("/analyze-batch")
async def analyze_news_batch(
    request: NewsBatchAnalyzeRequest,
    db: Session = Depends(get_db),
):
    service = NewsService(db)
    analyzer = AINewsAnalyzer()
    results: List[NewsResponse] = []
    try:
        for news_id in request.news_ids:
            article = service.get_by_id(news_id)
            sentiment_result = await analyzer.analyze_sentiment(article.title, article.content or "")
            summary = await analyzer.generate_summary(article.title, article.content or "")
            opportunity = await analyzer.score_opportunity(
                article.title,
                article.content or "",
                sentiment_result["sentiment"],
                sentiment_result["score"],
            )
            article = service.update(news_id, NewsUpdate(
                sentiment=sentiment_result["sentiment"],
                sentiment_score=sentiment_result["score"],
                opportunity_score=opportunity["opportunity_score"],
                ai_summary=summary,
                ai_suggestion=opportunity["suggestion"],
            ))
            results.append(NewsResponse.model_validate(article))
        return {"count": len(results), "items": results}
    finally:
        await analyzer.close()


@router.get("/stats/overview", response_model=NewsStatsResponse)
async def get_news_stats(days: int = 7, db: Session = Depends(get_db)):
    service = NewsService(db)
    stats = service.get_stats(days)
    top_sectors = service.get_sector_stats(days)
    top_stocks = service.get_stock_stats(days)
    return NewsStatsResponse(
        total=stats["total"],
        positive_count=stats["positive_count"],
        negative_count=stats["negative_count"],
        neutral_count=stats["neutral_count"],
        avg_opportunity_score=stats["avg_opportunity_score"],
        top_sectors=top_sectors,
        top_stocks=top_stocks,
    )
