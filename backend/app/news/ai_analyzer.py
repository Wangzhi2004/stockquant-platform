import json
import re
from typing import List, Dict, Optional
from datetime import datetime

import httpx

from app.core.config import get_settings

settings = get_settings()


class AINewsAnalyzer:
    def __init__(self):
        self.api_key = settings.DEEPSEEK_API_KEY
        self.api_url = settings.DEEPSEEK_API_URL
        self.client = httpx.AsyncClient(timeout=60.0)

    async def analyze_sentiment(self, title: str, content: str) -> Dict[str, any]:
        if not self.api_key:
            return self._fallback_sentiment(title + " " + content)

        prompt = (
            "请分析以下财经新闻的情感倾向，以JSON格式返回：\n"
            "{\"sentiment\": \"positive|negative|neutral\", \"score\": 0到100的整数}\n\n"
            f"标题：{title}\n内容：{content[:500]}"
        )
        try:
            result = await self._call_llm(prompt)
            data = json.loads(result)
            sentiment = data.get("sentiment", "neutral")
            score = float(data.get("score", 50))
            return {"sentiment": sentiment, "score": score}
        except Exception:
            return self._fallback_sentiment(title + " " + content)

    async def extract_keywords(self, title: str, content: str) -> List[str]:
        if not self.api_key:
            return self._fallback_keywords(title + " " + content)

        prompt = (
            "请从以下财经新闻中提取5-10个关键词，以JSON数组格式返回：\n"
            "[\"keyword1\", \"keyword2\", ...]\n\n"
            f"标题：{title}\n内容：{content[:500]}"
        )
        try:
            result = await self._call_llm(prompt)
            keywords = json.loads(result)
            if isinstance(keywords, list):
                return [str(k) for k in keywords[:10]]
        except Exception:
            pass
        return self._fallback_keywords(title + " " + content)

    async def generate_summary(self, title: str, content: str) -> str:
        if not self.api_key:
            return self._fallback_summary(title, content)

        prompt = (
            "请用一句话（不超过80字）总结以下财经新闻的核心要点：\n\n"
            f"标题：{title}\n内容：{content[:800]}"
        )
        try:
            summary = await self._call_llm(prompt)
            return summary.strip()[:200]
        except Exception:
            return self._fallback_summary(title, content)

    async def score_opportunity(
        self,
        title: str,
        content: str,
        sentiment: str,
        sentiment_score: float,
    ) -> Dict[str, any]:
        if not self.api_key:
            return self._fallback_opportunity(title + " " + content, sentiment, sentiment_score)

        prompt = (
            "请评估以下财经新闻对A股市场的短期投资机会，以JSON格式返回：\n"
            "{\"opportunity_score\": 0到100的整数, \"suggestion\": \"buy|sell|hold|watch\", \"reason\": \"简要理由\"}\n\n"
            f"标题：{title}\n内容：{content[:500]}\n"
            f"情感：{sentiment}，情感分数：{sentiment_score}"
        )
        try:
            result = await self._call_llm(prompt)
            data = json.loads(result)
            return {
                "opportunity_score": float(data.get("opportunity_score", 50)),
                "suggestion": data.get("suggestion", "watch"),
                "reason": data.get("reason", ""),
            }
        except Exception:
            return self._fallback_opportunity(title + " " + content, sentiment, sentiment_score)

    async def _call_llm(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "deepseek-chat",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
            "max_tokens": 512,
        }
        resp = await self.client.post(self.api_url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]

    def _fallback_sentiment(self, text: str) -> Dict[str, any]:
        positive_words = [
            "涨", "上涨", "大涨", "涨停", "反弹", "回升", "利好", "突破",
            "增长", "盈利", "超预期", "增持", "买入", "看好", "强劲",
            "爆发", "创新高", "领跑", "领先", "优势", "红利",
        ]
        negative_words = [
            "跌", "下跌", "大跌", "跌停", "暴跌", "回落", "利空", "跌破",
            "亏损", "不及预期", "减持", "卖出", "看空", "疲软",
            "暴雷", "创新低", "垫底", "落后", "风险", "警示",
        ]
        pos_count = sum(1 for w in positive_words if w in text)
        neg_count = sum(1 for w in negative_words if w in text)
        total = pos_count + neg_count
        if total == 0:
            return {"sentiment": "neutral", "score": 50.0}
        score = 50 + (pos_count - neg_count) / total * 50
        if score > 60:
            sentiment = "positive"
        elif score < 40:
            sentiment = "negative"
        else:
            sentiment = "neutral"
        return {"sentiment": sentiment, "score": round(score, 2)}

    def _fallback_keywords(self, text: str) -> List[str]:
        words = re.findall(r"[\u4e00-\u9fa5]{2,8}", text)
        freq: Dict[str, int] = {}
        stopwords = set([
            "公司", "市场", "今日", "表示", "认为", "目前", "进行", "可以",
            "已经", "开始", "成为", "需要", "通过", "随着", "由于", "但是",
            "虽然", "因为", "所以", "如果", "那么", "其中", "主要", "相关",
            "包括", "涉及", "影响", "预计", "有望", "或将", "可能", "据悉",
        ])
        for w in words:
            if w in stopwords or len(w) < 2:
                continue
            freq[w] = freq.get(w, 0) + 1
        sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        return [w for w, _ in sorted_words[:8]]

    def _fallback_summary(self, title: str, content: str) -> str:
        text = content if content else title
        sentences = re.split(r"[。！？\n]", text)
        for s in sentences:
            s = s.strip()
            if len(s) >= 15 and len(s) <= 80:
                return s
        return title[:80]

    def _fallback_opportunity(
        self, text: str, sentiment: str, sentiment_score: float
    ) -> Dict[str, any]:
        score = sentiment_score
        if "涨停" in text or "大涨" in text or "突破" in text:
            score = min(95, score + 20)
        if "跌停" in text or "大跌" in text or "暴雷" in text:
            score = max(5, score - 20)
        if sentiment == "positive":
            suggestion = "buy" if score > 70 else "watch"
        elif sentiment == "negative":
            suggestion = "sell" if score < 30 else "hold"
        else:
            suggestion = "watch"
        return {
            "opportunity_score": round(score, 2),
            "suggestion": suggestion,
            "reason": "基于情感分析和关键词匹配的自动评估",
        }

    async def close(self):
        await self.client.aclose()
