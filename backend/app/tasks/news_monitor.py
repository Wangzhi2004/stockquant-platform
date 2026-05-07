import asyncio
from celery import shared_task
from sqlalchemy.orm import Session

from app.models.base import SessionLocal
from app.models.news import NewsArticle
from app.news.crawler import NewsCrawler
from app.news.ai_analyzer import AINewsAnalyzer
from app.tasks.push_notification import send_push_to_all_active_users


@shared_task(bind=True, max_retries=3)
def fetch_and_analyze_news(self):
    db = SessionLocal()
    crawler = NewsCrawler()
    analyzer = AINewsAnalyzer()
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        cailianshe_items = loop.run_until_complete(crawler.fetch_cailianshe(limit=30))
        eastmoney_items = loop.run_until_complete(crawler.fetch_eastmoney(limit=30))
        all_items = crawler.deduplicate(cailianshe_items + eastmoney_items)

        saved = 0
        high_opportunity = []

        for item in all_items:
            existing = db.query(NewsArticle).filter(
                NewsArticle.title == item.title,
                NewsArticle.source == item.source,
            ).first()
            if existing:
                continue

            sentiment_result = loop.run_until_complete(
                analyzer.analyze_sentiment(item.title, item.content or "")
            )
            summary = loop.run_until_complete(
                analyzer.generate_summary(item.title, item.content or "")
            )
            opportunity = loop.run_until_complete(
                analyzer.score_opportunity(
                    item.title,
                    item.content or "",
                    sentiment_result["sentiment"],
                    sentiment_result["score"],
                )
            )

            article = NewsArticle(
                source=item.source,
                source_url=item.source_url,
                title=item.title,
                content=item.content,
                publish_time=item.publish_time,
                related_stocks=",".join(item.related_stocks),
                related_sectors=",".join(item.related_sectors),
                sentiment=sentiment_result["sentiment"],
                sentiment_score=sentiment_result["score"],
                opportunity_score=opportunity["opportunity_score"],
                ai_summary=summary,
                ai_suggestion=opportunity["suggestion"],
            )
            db.add(article)
            saved += 1

            if opportunity["opportunity_score"] >= 75:
                high_opportunity.append({
                    "title": item.title,
                    "score": opportunity["opportunity_score"],
                    "suggestion": opportunity["suggestion"],
                })

        db.commit()

        if high_opportunity:
            content = "\n".join(
                f"• {n['title']} (机会分:{n['score']}, 建议:{n['suggestion']})"
                for n in high_opportunity[:5]
            )
            send_push_to_all_active_users.delay(
                title="高机会新闻提醒",
                content=content,
                type_="notification",
            )

        return {"status": "success", "saved": saved, "high_opportunity": len(high_opportunity)}
    except Exception as exc:
        db.rollback()
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()
        loop.run_until_complete(crawler.close())
        loop.run_until_complete(analyzer.close())
        loop.close()


@shared_task
def fetch_sector_news(sector: str, limit: int = 20):
    db = SessionLocal()
    crawler = NewsCrawler()
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        items = loop.run_until_complete(crawler.fetch_sector_news(sector, limit))
        saved = 0
        for item in items:
            existing = db.query(NewsArticle).filter(
                NewsArticle.title == item.title,
            ).first()
            if existing:
                continue
            article = NewsArticle(
                source=item.source,
                title=item.title,
                content=item.content,
                source_url=item.source_url,
                related_stocks=",".join(item.related_stocks),
                related_sectors=",".join(item.related_sectors),
            )
            db.add(article)
            saved += 1
        db.commit()
        return {"status": "success", "sector": sector, "saved": saved}
    except Exception as e:
        db.rollback()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()
        loop.run_until_complete(crawler.close())
        loop.close()
