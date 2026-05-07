from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict
from uuid import UUID
from datetime import datetime


class PushConfigBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    channel: str
    config: Optional[Dict] = {}
    is_active: bool = True


class PushConfigCreate(PushConfigBase):
    pass


class PushConfigUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    channel: Optional[str] = None
    config: Optional[Dict] = None
    is_active: Optional[bool] = None


class PushConfigResponse(PushConfigBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class PushLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    channel: str
    type: str
    title: str
    content: Optional[str] = None
    status: str
    error_msg: Optional[str] = None
    created_at: datetime


class PushSendRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    channel: str
    title: str
    content: str
    type: str = "notification"
    extra: Optional[Dict] = None


class PushBatchSendRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    channels: List[str]
    title: str
    content: str
    type: str = "notification"
    extra: Optional[Dict] = None


class PushTestRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    channel: str
    title: str = "测试消息"
    content: str = "这是一条测试推送消息"
