import json
import hmac
import hashlib
import base64
import time
from typing import Optional
from urllib.parse import quote_plus

import httpx

from app.core.config import get_settings

settings = get_settings()


class DingTalkPusher:
    def __init__(self, webhook_url: Optional[str] = None, secret: Optional[str] = None):
        self.webhook_url = webhook_url or settings.DINGTALK_WEBHOOK
        self.secret = secret
        self.client = httpx.AsyncClient(timeout=30.0)

    def _sign(self) -> str:
        if not self.secret:
            return ""
        timestamp = str(round(time.time() * 1000))
        string_to_sign = f"{timestamp}\n{self.secret}"
        hmac_code = hmac.new(
            self.secret.encode("utf-8"),
            string_to_sign.encode("utf-8"),
            digestmod=hashlib.sha256,
        ).digest()
        sign = quote_plus(base64.b64encode(hmac_code))
        return f"&timestamp={timestamp}&sign={sign}"

    async def send_text(self, content: str, at_mobiles: Optional[list] = None, is_at_all: bool = False) -> dict:
        if not self.webhook_url:
            return {"status": "skipped", "reason": "no webhook configured"}

        payload = {
            "msgtype": "text",
            "text": {"content": content},
            "at": {
                "atMobiles": at_mobiles or [],
                "isAtAll": is_at_all,
            },
        }
        return await self._post(payload)

    async def send_markdown(self, title: str, text: str) -> dict:
        if not self.webhook_url:
            return {"status": "skipped", "reason": "no webhook configured"}

        payload = {
            "msgtype": "markdown",
            "markdown": {
                "title": title,
                "text": text,
            },
        }
        return await self._post(payload)

    async def send_action_card(
        self,
        title: str,
        markdown: str,
        single_title: str = "查看详情",
        single_url: str = "",
    ) -> dict:
        if not self.webhook_url:
            return {"status": "skipped", "reason": "no webhook configured"}

        payload = {
            "msgtype": "action_card",
            "action_card": {
                "title": title,
                "markdown": markdown,
                "single_title": single_title,
                "single_url": single_url,
            },
        }
        return await self._post(payload)

    async def _post(self, payload: dict) -> dict:
        url = self.webhook_url + self._sign()
        try:
            resp = await self.client.post(
                url,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            resp.raise_for_status()
            data = resp.json()
            if data.get("errcode") == 0:
                return {"status": "success", "response": data}
            return {"status": "failed", "error": data.get("errmsg", "unknown")}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    async def close(self):
        await self.client.aclose()
