from datetime import datetime, timedelta
from decimal import Decimal
from celery import shared_task
from sqlalchemy import func

from app.models.base import SessionLocal
from app.models.news import NewsArticle
from app.models.signal import StrategySignal
from app.models.portfolio import Portfolio, Holding
from app.tasks.push_notification import send_push_to_all_active_users


@shared_task
def generate_daily_report():
    db = SessionLocal()
    try:
        today = datetime.utcnow().date()
        since = datetime.utcnow() - timedelta(days=1)

        news_stats = {
            "total": db.query(NewsArticle).filter(NewsArticle.created_at >= since).count(),
            "positive": db.query(NewsArticle).filter(
                NewsArticle.created_at >= since,
                NewsArticle.sentiment == "positive"
            ).count(),
            "negative": db.query(NewsArticle).filter(
                NewsArticle.created_at >= since,
                NewsArticle.sentiment == "negative"
            ).count(),
        }

        signal_stats = {
            "total": db.query(StrategySignal).filter(StrategySignal.created_at >= since).count(),
            "buy": db.query(StrategySignal).filter(
                StrategySignal.created_at >= since,
                StrategySignal.signal_type.in_(["buy", "strong_buy"])
            ).count(),
            "sell": db.query(StrategySignal).filter(
                StrategySignal.created_at >= since,
                StrategySignal.signal_type.in_(["sell", "strong_sell"])
            ).count(),
        }

        top_news = db.query(NewsArticle).filter(
            NewsArticle.created_at >= since,
            NewsArticle.opportunity_score.isnot(None)
        ).order_by(NewsArticle.opportunity_score.desc()).limit(5).all()

        report_lines = [
            f"# 每日市场报告 {today}",
            "",
            "## 新闻监控",
            f"- 总新闻数: {news_stats['total']}",
            f"- 正面: {news_stats['positive']} | 负面: {news_stats['negative']}",
            "",
            "## 策略信号",
            f"- 总信号数: {signal_stats['total']}",
            f"- 买入: {signal_stats['buy']} | 卖出: {signal_stats['sell']}",
            "",
            "## 高机会新闻",
        ]
        for news in top_news:
            report_lines.append(
                f"- {news.title} (机会分: {news.opportunity_score}, 建议: {news.ai_suggestion})"
            )

        report_text = "\n".join(report_lines)

        send_push_to_all_active_users.delay(
            title=f"每日市场报告 {today}",
            content=report_text,
            type_="markdown",
        )

        return {
            "status": "success",
            "news": news_stats,
            "signals": signal_stats,
            "top_news": len(top_news),
        }
    except Exception as e:
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()


@shared_task
def generate_portfolio_report(user_id: str):
    db = SessionLocal()
    try:
        from app.data.akshare_client import AKShareClient
        client = AKShareClient()
        portfolios = db.query(Portfolio).filter(Portfolio.user_id == user_id).all()
        lines = ["# 持仓日报", ""]
        for p in portfolios:
            lines.append(f"## {p.name}")
            total_cost = Decimal("0")
            total_value = Decimal("0")
            for h in p.holdings:
                try:
                    price = client.get_realtime_quote(h.stock_code)
                    value = price * h.quantity
                    cost = h.cost_price * h.quantity
                    total_cost += cost
                    total_value += value
                    pl = value - cost
                    pl_pct = (pl / cost * 100) if cost > 0 else Decimal("0")
                    lines.append(
                        f"- {h.stock_name}({h.stock_code}): 成本{cost}, 市值{value}, 盈亏{pl}({pl_pct:.2f}%)"
                    )
                except Exception:
                    continue
            pl_total = total_value - total_cost
            pl_total_pct = (pl_total / total_cost * 100) if total_cost > 0 else Decimal("0")
            lines.append(f"**总成本: {total_cost}, 总市值: {total_value}, 总盈亏: {pl_total}({pl_total_pct:.2f}%)**")
            lines.append("")

        report = "\n".join(lines)
        send_push_to_user = __import__("app.tasks.push_notification", fromlist=["send_push_to_user"]).send_push_to_user
        send_push_to_user.delay(user_id, "email", "持仓日报", report, "markdown")
        return {"status": "success"}
    except Exception as e:
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()
