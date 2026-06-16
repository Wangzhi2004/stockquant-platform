import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base


class NewsArticle(Base):
    __tablename__ = "news_articles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source = Column(String(50), nullable=False)
    source_url = Column(String(500), nullable=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    publish_time = Column(DateTime, nullable=True)
    related_stocks = Column(String(500), nullable=True)
    related_sectors = Column(String(500), nullable=True)
    sentiment = Column(Enum("positive", "negative", "neutral", name="news_sentiment"), nullable=True)
    sentiment_score = Column(Numeric(5, 2), nullable=True)
    opportunity_score = Column(Numeric(5, 2), nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_suggestion = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
