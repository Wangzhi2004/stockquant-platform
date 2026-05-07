from celery import Celery
from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "stockquant",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.market_data",
        "app.tasks.strategy_scan",
        "app.tasks.news_monitor",
        "app.tasks.push_notification",
        "app.tasks.daily_report",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,
    worker_prefetch_multiplier=1,
    beat_schedule={
        "sync-market-data-every-minute": {
            "task": "app.tasks.market_data.sync_realtime_quotes",
            "schedule": 60.0,
        },
        "scan-strategies-every-5-minutes": {
            "task": "app.tasks.strategy_scan.run_all_strategy_scans",
            "schedule": 300.0,
        },
        "monitor-news-every-2-minutes": {
            "task": "app.tasks.news_monitor.fetch_and_analyze_news",
            "schedule": 120.0,
        },
        "send-daily-report-at-16-30": {
            "task": "app.tasks.daily_report.generate_daily_report",
            "schedule": "cron",
            "schedule_kwargs": {"hour": 16, "minute": 30},
        },
    },
)
