from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal


class NewsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    source: str
    source_url: Optional[str] = None
    title: str
    content: Optional[str] = None
    publish_time: Optional[datetime] = None
    related_stocks: Optional[str] = None
    related_sectors: Optional[str] = None


class NewsCreate(NewsBase):
    pass


class NewsUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    sentiment: Optional[str] = None
    sentiment_score: Optional[Decimal] = None
    opportunity_score: Optional[Decimal] = None
    ai_summary: Optional[str] = None
    ai_suggestion: Optional[str] = None


class NewsResponse(NewsBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    sentiment: Optional[str] = None
    sentiment_score: Optional[Decimal] = None
    opportunity_score: Optional[Decimal] = None
    ai_summary: Optional[str] = None
    ai_suggestion: Optional[str] = None
    created_at: datetime


class NewsListParams(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    source: Optional[str] = None
    sentiment: Optional[str] = None
    stock_code: Optional[str] = None
    sector: Optional[str] = None
    keyword: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    skip: int = 0
    limit: int = 50


class NewsAnalyzeRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    news_id: UUID


class NewsBatchAnalyzeRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    news_ids: List[UUID]


class NewsStatsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    total: int
    positive_count: int
    negative_count: int
    neutral_count: int
    avg_opportunity_score: Optional[Decimal] = None
    top_sectors: List[dict]
    top_stocks: List[dict]
