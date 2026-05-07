import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, Enum, Text, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base, GUID


class PushConfig(Base):
    __tablename__ = "push_configs"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    channel = Column(Enum("wechat", "dingtalk", "feishu", "email", name="push_channel"), nullable=False)
    config = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="push_configs")


class PushLog(Base):
    __tablename__ = "push_logs"
    
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID, ForeignKey("users.id"), nullable=False)
    channel = Column(String(20), nullable=False)
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    status = Column(Enum("success", "failed", name="push_status"), nullable=False)
    error_msg = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="push_logs")
