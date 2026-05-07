import json
from typing import Optional

import httpx

from app.core.config import get_settings

settings = get_settings()


class WeChatPusher:
    def __init__(self, webhook_url: Optional[str] = None):
        self.webhook_url = webhook_url or settings.WECHAT_WEBHOOK
        self.client = httpx.AsyncClient(timeout=30.0)

    async def send_text(self, content: str, mentioned_list: Optional[list] = None) -> dict:
        if not self.webhook_url:
            return {"status": "skipped", "reason": "no webhook configured"}

        payload = {
            "msgtype": "text",
            "text": {
                "content": content,
                "mentioned_list": mentioned_list or [],
            },
        }
        return await self._post(payload)

    async def send_markdown(self, content: str) -> dict:
        if not self.webhook_url:
            return {"status": "skipped", "reason": "no webhook configured"}

        payload = {
            "msgtype": "markdown",
            "markdown": {"content": content},
        }
        return await self._post(payload)

    async def send_news_card(
        self,
        title: str,
        description: str,
        url: str,
        pic_url: Optional[str] = None,
    ) -> dict:
        if not self.webhook_url:
            return {"status": "skipped", "reason": "no webhook configured"}

        payload = {
            "msgtype": "news",
            "news": {
                "articles": [
                    {
                        "title": title,
                        "description": description,
                        "url": url,
                        "picurl": pic_url or "",
                    }
                ]
            },
        }
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
            if data.get("errcode") == 0:
                return {"status": "success", "response": data}
            return {"status": "failed", "error": data.get("errmsg", "unknown")}
        except Exception as e:
            return {"status": "failed", "error": str(e)}

    async def close(self):
        await self.client.aclose()
