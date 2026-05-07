import json
import hashlib
import base64
import hmac
import time
from typing import Optional

import httpx

from app.core.config import get_settings

settings = get_settings()


class FeishuPusher:
    def __init__(self, webhook_url: Optional[str] = None, secret: Optional[str] = None):
        self.webhook_url = webhook_url or settings.FEISHU_WEBHOOK
        self.secret = secret
        self.client = httpx.AsyncClient(timeout=30.0)

    def _sign(self) -> dict:
        if not self.secret:
            return {}
        timestamp = str(int(time.time()))
        string_to_sign = f"{timestamp}\n{self.secret}"
        hmac_code = hmac.new(
            string_to_sign.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).digest()
        sign = base64.b64encode(hmac_code).decode("utf-8")
        return {"timestamp": timestamp, "sign": sign}

    async def send_text(self, content: str) -> dict:
        if not self.webhook_url:
            return {"status": "skipped", "reason": "no webhook configured"}

        payload = {
            "msg_type": "text",
            "content": {"text": content},
        }
        payload.update(self._sign())
        return await self._post(payload)

    async def send_rich_text(self, title: str, content: list) -> dict:
        if not self.webhook_url:
            return {"status": "skipped", "reason": "no webhook configured"}

        payload = {
            "msg_type": "post",
            "content": {
                "post": {
                    "zh_cn": {
                        "title": title,
                        "content": content,
                    }
                }
            },
        }
        payload.update(self._sign())
        return await self._post(payload)

    async def send_interactive(self, card: dict) -> dict:
        if not self.webhook_url:
            return {"status": "skipped", "reason": "no webhook configured"}

        payload = {
            "msg_type": "interactive",
            "card": card,
        }
        payload.update(self._sign())
        return await self._post(payload)

    async def _post(self, payload: dict) -> dict:
        try:
            resp = await self.client.post(
                self.webhook_url,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("code") == 0:
                return {"status": "success", "response": data}
            return {"status": "failed", "error": data.get("msg", "unknown")}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    async def close(self):
        await self.client.aclose()
