from typing import List, Optional, Dict
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.push import PushConfig, PushLog
from app.schemas.push import PushConfigCreate, PushConfigUpdate, PushSendRequest
from app.core.exceptions import NotFoundError
from app.push.wechat import WeChatPusher
from app.push.dingtalk import DingTalkPusher
from app.push.feishu import FeishuPusher
from app.push.email_sender import EmailSender


class PushService:
    def __init__(self, db: Session):
        self.db = db

    def get_configs(self, user_id: UUID) -> List[PushConfig]:
        return self.db.query(PushConfig).filter(
            PushConfig.user_id == user_id
        ).all()

    def get_config(self, config_id: UUID, user_id: UUID) -> PushConfig:
        config = self.db.query(PushConfig).filter(
            PushConfig.id == config_id,
            PushConfig.user_id == user_id,
        ).first()
        if not config:
            raise NotFoundError("Push config not found")
        return config

    def create_config(self, user_id: UUID, data: PushConfigCreate) -> PushConfig:
        config = PushConfig(
            user_id=user_id,
            channel=data.channel,
            config=data.config or {},
            is_active=data.is_active,
        )
        self.db.add(config)
        self.db.commit()
        self.db.refresh(config)
        return config

    def update_config(self, config_id: UUID, user_id: UUID, data: PushConfigUpdate) -> PushConfig:
        config = self.get_config(config_id, user_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(config, field, value)
        self.db.commit()
        self.db.refresh(config)
        return config

    def delete_config(self, config_id: UUID, user_id: UUID) -> None:
        config = self.get_config(config_id, user_id)
        self.db.delete(config)
        self.db.commit()

    def get_logs(self, user_id: UUID, limit: int = 100) -> List[PushLog]:
        return self.db.query(PushLog).filter(
            PushLog.user_id == user_id
        ).order_by(PushLog.created_at.desc()).limit(limit).all()

    def _create_pusher(self, channel: str, config: Optional[dict] = None):
        cfg = config or {}
        if channel == "wechat":
            return WeChatPusher(webhook_url=cfg.get("webhook_url"))
        elif channel == "dingtalk":
            return DingTalkPusher(
                webhook_url=cfg.get("webhook_url"),
                secret=cfg.get("secret"),
            )
        elif channel == "feishu":
            return FeishuPusher(
                webhook_url=cfg.get("webhook_url"),
                secret=cfg.get("secret"),
            )
        elif channel == "email":
            return EmailSender(
                host=cfg.get("smtp_host"),
                port=cfg.get("smtp_port"),
                user=cfg.get("smtp_user"),
                password=cfg.get("smtp_password"),
            )
        else:
            raise ValueError(f"Unsupported channel: {channel}")

    async def send(self, user_id: UUID, request: PushSendRequest) -> dict:
        config = self.db.query(PushConfig).filter(
            PushConfig.user_id == user_id,
            PushConfig.channel == request.channel,
            PushConfig.is_active == True,
        ).first()

        if not config:
            return {"status": "failed", "error": f"No active config for channel {request.channel}"}

        pusher = self._create_pusher(request.channel, config.config)
        result = {"status": "failed", "error": "unknown"}

        try:
            if request.channel in ("wechat", "dingtalk", "feishu"):
                if request.type == "markdown":
                    if request.channel == "wechat":
                        result = await pusher.send_markdown(request.content)
                    elif request.channel == "dingtalk":
                        result = await pusher.send_markdown(request.title, request.content)
                    elif request.channel == "feishu":
                        result = await pusher.send_rich_text(request.title, [[{"tag": "text", "text": request.content}]])
                else:
                    if request.channel == "wechat":
                        result = await pusher.send_text(request.content)
                    elif request.channel == "dingtalk":
                        result = await pusher.send_text(request.content)
                    elif request.channel == "feishu":
                        result = await pusher.send_text(request.content)
            elif request.channel == "email":
                to_addrs = config.config.get("to_addrs", [])
                if request.type == "html":
                    result = pusher.send_html(to_addrs, request.title, request.content)
                else:
                    result = pusher.send_text(to_addrs, request.title, request.content)
        finally:
            if hasattr(pusher, "close"):
                await pusher.close()

        log = PushLog(
            user_id=user_id,
            channel=request.channel,
            type=request.type,
            title=request.title,
            content=request.content,
            status="success" if result.get("status") == "success" else "failed",
            error_msg=result.get("error"),
        )
        self.db.add(log)
        self.db.commit()

        return result

    async def send_to_all(self, user_id: UUID, title: str, content: str, type_: str = "notification") -> List[dict]:
        configs = self.get_configs(user_id)
        results = []
        for cfg in configs:
            if not cfg.is_active:
                continue
            request = PushSendRequest(
                channel=cfg.channel,
                title=title,
                content=content,
                type=type_,
            )
            result = await self.send(user_id, request)
            results.append({"channel": cfg.channel, "result": result})
        return results
