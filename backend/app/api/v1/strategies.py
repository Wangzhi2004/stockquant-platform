from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.models.base import get_db
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()


class StrategyResponse:
    def __init__(self, id: str, name: str, description: str, category: str, enabled: bool, params: dict, performance: dict):
        self.id = id
        self.name = name
        self.description = description
        self.category = category
        self.enabled = enabled
        self.params = params
        self.performance = performance


STRATEGIES_DB = [
    {
        "id": "1", "name": "动量突破", "description": "基于价格动量和成交量突破的交易策略",
        "category": "技术面", "enabled": True,
        "params": {"lookbackPeriod": 20, "volumeMultiplier": 2, "threshold": 0.05},
        "performance": {"totalReturn": 45.2, "sharpeRatio": 1.35, "maxDrawdown": -12.5, "winRate": 58.3, "tradeCount": 124}
    },
    {
        "id": "2", "name": "均值回归", "description": "价格偏离均线后回归均值的策略",
        "category": "技术面", "enabled": True,
        "params": {"maPeriod": 30, "deviationThreshold": 0.08, "holdingDays": 5},
        "performance": {"totalReturn": 32.8, "sharpeRatio": 1.12, "maxDrawdown": -8.9, "winRate": 62.1, "tradeCount": 98}
    },
    {
        "id": "3", "name": "箱体突破", "description": "识别价格箱体整理后的突破信号",
        "category": "技术面", "enabled": False,
        "params": {"boxPeriod": 40, "breakoutThreshold": 0.03, "confirmDays": 2},
        "performance": {"totalReturn": 28.5, "sharpeRatio": 0.98, "maxDrawdown": -15.2, "winRate": 52.4, "tradeCount": 76}
    },
    {
        "id": "4", "name": "MACD金叉", "description": "基于MACD指标金叉死叉的择时策略",
        "category": "技术指标", "enabled": True,
        "params": {"fastPeriod": 12, "slowPeriod": 26, "signalPeriod": 9},
        "performance": {"totalReturn": 22.1, "sharpeRatio": 0.85, "maxDrawdown": -10.3, "winRate": 55.6, "tradeCount": 156}
    },
    {
        "id": "5", "name": "RSI超买超卖", "description": "利用RSI指标识别超买超卖区域",
        "category": "技术指标", "enabled": False,
        "params": {"rsiPeriod": 14, "overbought": 70, "oversold": 30},
        "performance": {"totalReturn": 18.9, "sharpeRatio": 0.72, "maxDrawdown": -11.8, "winRate": 48.9, "tradeCount": 203}
    },
    {
        "id": "6", "name": "布林带策略", "description": "基于布林带上下轨的突破与回归",
        "category": "技术指标", "enabled": True,
        "params": {"bbPeriod": 20, "stdDev": 2, "meanReversion": True},
        "performance": {"totalReturn": 35.6, "sharpeRatio": 1.08, "maxDrawdown": -9.5, "winRate": 59.2, "tradeCount": 112}
    },
    {
        "id": "7", "name": "基本面选股", "description": "基于ROE、PE、PB等财务指标选股",
        "category": "基本面", "enabled": True,
        "params": {"minRoe": 15, "maxPe": 30, "minProfitGrowth": 0.2},
        "performance": {"totalReturn": 52.3, "sharpeRatio": 1.45, "maxDrawdown": -14.1, "winRate": 65.8, "tradeCount": 45}
    },
    {
        "id": "8", "name": "价值投资", "description": "低估值高分红的长期投资策略",
        "category": "基本面", "enabled": False,
        "params": {"maxPb": 2, "minDividendYield": 0.03, "maxDebtRatio": 0.6},
        "performance": {"totalReturn": 38.7, "sharpeRatio": 1.22, "maxDrawdown": -7.2, "winRate": 68.4, "tradeCount": 34}
    },
    {
        "id": "9", "name": "成长投资", "description": "高营收利润增长的成长股策略",
        "category": "基本面", "enabled": True,
        "params": {"minRevenueGrowth": 0.3, "minProfitGrowth": 0.25, "maxPe": 50},
        "performance": {"totalReturn": 48.9, "sharpeRatio": 1.28, "maxDrawdown": -18.5, "winRate": 56.7, "tradeCount": 67}
    },
    {
        "id": "10", "name": "事件驱动", "description": "基于业绩预告、分红送股等事件",
        "category": "事件", "enabled": False,
        "params": {"eventTypes": "earnings,dividend", "holdingDays": 10, "positionSize": 0.1},
        "performance": {"totalReturn": 25.4, "sharpeRatio": 0.92, "maxDrawdown": -13.6, "winRate": 54.3, "tradeCount": 89}
    },
    {
        "id": "11", "name": "资金流向", "description": "跟踪主力资金流向的择时策略",
        "category": "资金面", "enabled": True,
        "params": {"capitalThreshold": 10000000, "followDays": 3},
        "performance": {"totalReturn": 30.2, "sharpeRatio": 1.05, "maxDrawdown": -10.8, "winRate": 57.1, "tradeCount": 134}
    },
    {
        "id": "12", "name": "多因子模型", "description": "综合估值、动量、质量因子的多因子策略",
        "category": "量化模型", "enabled": True,
        "params": {"factorWeights": "value:0.4,momentum:0.3,quality:0.3", "rebalanceDays": 20},
        "performance": {"totalReturn": 55.8, "sharpeRatio": 1.52, "maxDrawdown": -11.3, "winRate": 61.5, "tradeCount": 78}
    },
    {
        "id": "13", "name": "机器学习", "description": "基于XGBoost的AI选股模型",
        "category": "量化模型", "enabled": False,
        "params": {"modelType": "xgboost", "features": "price,volume,fundamental", "retrainDays": 60},
        "performance": {"totalReturn": 42.1, "sharpeRatio": 1.38, "maxDrawdown": -13.9, "winRate": 60.2, "tradeCount": 92}
    },
    {
        "id": "14", "name": "统计套利", "description": "基于协整关系的配对交易策略",
        "category": "量化模型", "enabled": False,
        "params": {"lookbackPeriod": 60, "entryThreshold": 2, "exitThreshold": 0.5},
        "performance": {"totalReturn": 15.6, "sharpeRatio": 0.68, "maxDrawdown": -6.3, "winRate": 52.8, "tradeCount": 245}
    },
    {
        "id": "15", "name": "日内回转", "description": "基于开盘缺口和日内趋势的T+0策略",
        "category": "高频", "enabled": False,
        "params": {"gapThreshold": 0.02, "stopLoss": 0.01, "maxHoldingMinutes": 240},
        "performance": {"totalReturn": 28.3, "sharpeRatio": 0.95, "maxDrawdown": -8.7, "winRate": 51.2, "tradeCount": 567}
    },
    {
        "id": "16", "name": "趋势跟踪", "description": "基于均线系统的趋势跟随策略",
        "category": "技术面", "enabled": True,
        "params": {"fastMa": 10, "slowMa": 30, "trendFilter": 60},
        "performance": {"totalReturn": 40.5, "sharpeRatio": 1.18, "maxDrawdown": -12.8, "winRate": 45.6, "tradeCount": 87}
    },
    {
        "id": "17", "name": "波动率策略", "description": "基于ATR和波动率指数的风险管理策略",
        "category": "风险管理", "enabled": False,
        "params": {"atrPeriod": 14, "volThreshold": 0.25, "positionScale": True},
        "performance": {"totalReturn": 20.8, "sharpeRatio": 0.78, "maxDrawdown": -7.5, "winRate": 53.9, "tradeCount": 156}
    },
    {
        "id": "18", "name": "行业轮动", "description": "基于行业景气度和资金流向的轮动策略",
        "category": "宏观", "enabled": True,
        "params": {"topSectors": 3, "rotationPeriod": 20, "momentumLookback": 60},
        "performance": {"totalReturn": 36.4, "sharpeRatio": 1.15, "maxDrawdown": -9.2, "winRate": 58.9, "tradeCount": 68}
    },
]


@router.get("", response_model=List[dict])
async def list_strategies(
    category: Optional[str] = None,
    enabled: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
):
    result = STRATEGIES_DB
    if category:
        result = [s for s in result if s["category"] == category]
    if enabled is not None:
        result = [s for s in result if s["enabled"] == enabled]
    return result


@router.get("/{strategy_id}", response_model=dict)
async def get_strategy(
    strategy_id: str,
    current_user: User = Depends(get_current_user),
):
    for s in STRATEGIES_DB:
        if s["id"] == strategy_id:
            return s
    return {"error": "Strategy not found"}


@router.put("/{strategy_id}/toggle", response_model=dict)
async def toggle_strategy(
    strategy_id: str,
    current_user: User = Depends(get_current_user),
):
    for s in STRATEGIES_DB:
        if s["id"] == strategy_id:
            s["enabled"] = not s["enabled"]
            return s
    return {"error": "Strategy not found"}


@router.put("/{strategy_id}/params", response_model=dict)
async def update_strategy_params(
    strategy_id: str,
    params: dict,
    current_user: User = Depends(get_current_user),
):
    for s in STRATEGIES_DB:
        if s["id"] == strategy_id:
            s["params"].update(params)
            return s
    return {"error": "Strategy not found"}


@router.get("/stats/summary", response_model=dict)
async def get_strategy_stats(
    current_user: User = Depends(get_current_user),
):
    enabled_count = sum(1 for s in STRATEGIES_DB if s["enabled"])
    total_return_avg = sum(s["performance"]["totalReturn"] for s in STRATEGIES_DB) / len(STRATEGIES_DB)
    best_strategy = max(STRATEGIES_DB, key=lambda s: s["performance"]["totalReturn"])
    return {
        "total": len(STRATEGIES_DB),
        "enabled": enabled_count,
        "disabled": len(STRATEGIES_DB) - enabled_count,
        "avgReturn": round(total_return_avg, 2),
        "bestStrategy": best_strategy["name"],
        "bestReturn": best_strategy["performance"]["totalReturn"],
    }
