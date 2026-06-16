import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta


class OpportunityScorer:
    def __init__(self, params: Optional[Dict[str, Any]] = None):
        self.params = params or {}
        self.sentiment_weight = self.params.get("sentiment_weight", 0.35)
        self.relevance_weight = self.params.get("relevance_weight", 0.25)
        self.timeliness_weight = self.params.get("timeliness_weight", 0.20)
        self.verification_weight = self.params.get("verification_weight", 0.20)

        self.positive_keywords = [
            "涨停", "大涨", "暴涨", "飙升", "利好", "突破", "创新高",
            "超预期", "增长", "盈利", "增持", "回购", "强劲", "爆发",
            "反弹", "回升", "看好", "买入", "领先", "优势",
        ]
        self.negative_keywords = [
            "跌停", "大跌", "暴跌", "暴跌", "利空", "跌破", "创新低",
            "不及预期", "亏损", "减持", "暴雷", "退市", "疲软", "下滑",
            "回落", "看空", "卖出", "风险", "警示", "处罚",
        ]
        self.market_keywords = [
            "A股", "股市", "沪指", "深成指", "创业板", "科创板",
            "大盘", "板块", "龙头", "资金", "主力", "机构",
        ]
        self.sector_keywords = [
            "半导体", "芯片", "新能源", "光伏", "锂电池", "医药",
            "白酒", "银行", "券商", "地产", "军工", "人工智能",
            "机器人", "5G", "物联网", "云计算", "大数据",
        ]

    def calculate_score(
        self,
        title: str,
        content: str,
        sentiment: str = "neutral",
        sentiment_score: float = 50.0,
        published_at: Optional[datetime] = None,
        stock_codes: Optional[List[str]] = None,
        historical_accuracy: float = 50.0,
    ) -> Dict[str, Any]:
        text = f"{title} {content}"

        sentiment_result = self._score_sentiment(text, sentiment, sentiment_score)
        relevance_result = self._score_relevance(text, stock_codes)
        timeliness_result = self._score_timeliness(published_at)
        verification_result = self._score_verification(historical_accuracy, text)

        total_score = (
            sentiment_result["score"] * self.sentiment_weight
            + relevance_result["score"] * self.relevance_weight
            + timeliness_result["score"] * self.timeliness_weight
            + verification_result["score"] * self.verification_weight
        )

        total_score = max(0, min(100, round(total_score, 2)))

        if total_score >= 75:
            suggestion = "strong_buy"
        elif total_score >= 60:
            suggestion = "buy"
        elif total_score >= 40:
            suggestion = "hold"
        elif total_score >= 25:
            suggestion = "sell"
        else:
            suggestion = "strong_sell"

        return {
            "total_score": total_score,
            "suggestion": suggestion,
            "sentiment_score": sentiment_result["score"],
            "relevance_score": relevance_result["score"],
            "timeliness_score": timeliness_result["score"],
            "verification_score": verification_result["score"],
            "details": {
                "sentiment": sentiment_result,
                "relevance": relevance_result,
                "timeliness": timeliness_result,
                "verification": verification_result,
            },
        }

    def _score_sentiment(
        self, text: str, sentiment: str, sentiment_score: float
    ) -> Dict[str, Any]:
        pos_count = sum(1 for w in self.positive_keywords if w in text)
        neg_count = sum(1 for w in self.negative_keywords if w in text)
        total_keywords = pos_count + neg_count

        keyword_score = 50.0
        if total_keywords > 0:
            keyword_score = 50 + (pos_count - neg_count) / total_keywords * 50

        combined = sentiment_score * 0.6 + keyword_score * 0.4
        score = max(0, min(100, combined))

        reason = ""
        if pos_count > neg_count:
            reason = f"正面关键词{pos_count}个多于负面{neg_count}个"
        elif neg_count > pos_count:
            reason = f"负面关键词{neg_count}个多于正面{pos_count}个"
        else:
            reason = "正负面关键词数量相当"

        return {"score": round(score, 2), "reason": reason}

    def _score_relevance(
        self, text: str, stock_codes: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        score = 30.0
        reasons = []

        market_count = sum(1 for w in self.market_keywords if w in text)
        if market_count > 0:
            score += min(market_count * 8, 25)
            reasons.append(f"包含{market_count}个市场关键词")

        sector_count = sum(1 for w in self.sector_keywords if w in text)
        if sector_count > 0:
            score += min(sector_count * 6, 20)
            reasons.append(f"包含{sector_count}个行业关键词")

        if stock_codes:
            code_count = sum(1 for c in stock_codes if c in text)
            if code_count > 0:
                score += min(code_count * 10, 25)
                reasons.append(f"提及{code_count}只个股")

        stock_pattern = re.findall(r"\d{6}", text)
        if stock_pattern:
            score += min(len(stock_pattern) * 5, 15)
            reasons.append(f"检测到{len(stock_pattern)}个股票代码")

        score = max(0, min(100, score))
        reason = "; ".join(reasons) if reasons else "与市场关联度较低"

        return {"score": round(score, 2), "reason": reason}

    def _score_timeliness(self, published_at: Optional[datetime]) -> Dict[str, Any]:
        if published_at is None:
            return {"score": 50.0, "reason": "发布时间未知"}

        now = datetime.now()
        delta = now - published_at
        hours = delta.total_seconds() / 3600

        if hours < 0:
            score = 95.0
            reason = "未来时间（数据可能有误）"
        elif hours <= 1:
            score = 100.0
            reason = "1小时内发布"
        elif hours <= 4:
            score = 90.0
            reason = "4小时内发布"
        elif hours <= 12:
            score = 75.0
            reason = "12小时内发布"
        elif hours <= 24:
            score = 60.0
            reason = "1天内发布"
        elif hours <= 72:
            score = 40.0
            reason = "3天内发布"
        elif hours <= 168:
            score = 25.0
            reason = "1周内发布"
        else:
            score = 10.0
            reason = "超过1周前发布"

        return {"score": score, "reason": reason}

    def _score_verification(
        self, historical_accuracy: float, text: str
    ) -> Dict[str, Any]:
        score = historical_accuracy
        reasons = []

        if historical_accuracy >= 70:
            reasons.append("历史预测准确率较高")
        elif historical_accuracy >= 50:
            reasons.append("历史预测准确率一般")
        else:
            reasons.append("历史预测准确率较低")

        quantifiable_patterns = [
            (r"\d+\.?\d*%", "百分比数据"),
            (r"\d+\.?\d*亿", "金额数据"),
            (r"\d+\.?\d*万", "金额数据"),
            (r"同比增长\d+", "同比数据"),
            (r"环比增长\d+", "环比数据"),
        ]

        data_points = 0
        for pattern, label in quantifiable_patterns:
            matches = re.findall(pattern, text)
            if matches:
                data_points += len(matches)

        if data_points >= 3:
            score = min(100, score + 15)
            reasons.append(f"包含{data_points}个可量化数据点")
        elif data_points >= 1:
            score = min(100, score + 5)
            reasons.append(f"包含{data_points}个可量化数据点")

        score = max(0, min(100, score))
        reason = "; ".join(reasons)

        return {"score": round(score, 2), "reason": reason}
