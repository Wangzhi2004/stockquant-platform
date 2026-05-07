from typing import List
from celery import shared_task
from sqlalchemy.orm import Session

from app.models.base import SessionLocal
from app.models.push import PushConfig
from app.push.wechat import WeChatPusher
from app.push.dingtalk import DingTalkPusher
from app.push.feishu import FeishuPusher
from app.push.email_sender import EmailSender


@shared_task
def send_push_to_user(user_id: str, channel: str, title: str, content: str, type_: str = "notification"):
    db = SessionLocal()
    try:
        config = db.query(PushConfig).filter(
            PushConfig.user_id == user_id,
            PushConfig.channel == channel,
            PushConfig.is_active == True,
        ).first()
        if not config:
            return {"status": "skipped", "reason": "no active config"}

        cfg = config.config or {}
        result = {"status": "failed", "error": "unknown"}

        if channel == "wechat":
            pusher = WeChatPusher(webhook_url=cfg.get("webhook_url"))
            if type_ == "markdown":
                result = pusher.send_markdown(content)
            else:
                result = pusher.send_text(content)
        elif channel == "dingtalk":
            pusher = DingTalkPusher(webhook_url=cfg.get("webhook_url"), secret=cfg.get("secret"))
            if type_ == "markdown":
                result = pusher.send_markdown(title, content)
            else:
                result = pusher.send_text(content)
        elif channel == "feishu":
            pusher = FeishuPusher(webhook_url=cfg.get("webhook_url"), secret=cfg.get("secret"))
            if type_ == "markdown":
                result = pusher.send_rich_text(title, [[{"tag": "text", "text": content}]])
            else:
                result = pusher.send_text(content)
        elif channel == "email":
            sender = EmailSender(
                host=cfg.get("smtp_host"),
                port=cfg.get("smtp_port"),
                user=cfg.get("smtp_user"),
                password=cfg.get("smtp_password"),
            )
            to_addrs = cfg.get("to_addrs", [])
            if type_ == "html":
                result = sender.send_html(to_addrs, title, content)
            else:
                result = sender.send_text(to_addrs, title, content)
        else:
            return {"status": "failed", "error": f"unsupported channel {channel}"}

        from app.models.push import PushLog
        log = PushLog(
            user_id=user_id,
            channel=channel,
            type=type_,
            title=title,
            content=content,
            status="success" if result.get("status") == "success" else "failed",
            error_msg=result.get("error"),
        )
        db.add(log)
        db.commit()
        return result
    except Exception as e:
        db.rollback()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()


@shared_task
def send_push_to_all_active_users(title: str, content: str, type_: str = "notification"):
    db = SessionLocal()
    try:
        configs = db.query(PushConfig).filter(
            PushConfig.is_active == True,
        ).all()
        results = []
        for cfg in configs:
            result = send_push_to_user.delay(
                str(cfg.user_id), cfg.channel, title, content, type_
            )
            results.append({"user": str(cfg.user_id), "channel": cfg.channel, "task_id": result.id})
        return {"status": "success", "queued": len(results)}
    finally:
        db.close()


@shared_task
def send_signal_alert(stock_code: str, signal_type: str, strength: int, description: str):
    title = f"信号提醒: {stock_code} {signal_type}"
    content = f"股票: {stock_code}\n信号: {signal_type}\n强度: {strength}\n描述: {description}"
    return send_push_to_all_active_users.delay(title, content, "notification")
