from app.strategies.technical.macd import MACDStrategy
from app.strategies.technical.kdj import KDJStrategy
from app.strategies.technical.rsi import RSIStrategy
from app.strategies.technical.ma import MAStrategy
from app.strategies.technical.bollinger import BollingerStrategy
from app.strategies.technical.volume import VolumeStrategy
from app.strategies.multi_factor.value import ValueFactorStrategy
from app.strategies.multi_factor.quality import QualityFactorStrategy
from app.strategies.multi_factor.momentum import MomentumFactorStrategy
from app.strategies.multi_factor.low_volatility import LowVolatilityStrategy
from app.strategies.mean_reversion.bollinger_reversion import BollingerReversionStrategy
from app.strategies.mean_reversion.rsi_reversion import RSIReversionStrategy
from app.strategies.trend_following.turtle import TurtleStrategy
from app.strategies.trend_following.dual_ma import DualMAStrategy
from app.strategies.event_driven.earnings import EarningsSurpriseStrategy
from app.strategies.event_driven.dividend import HighDividendStrategy
from app.strategies.flow.main_force import MainForceFlowStrategy
from app.strategies.composite.combined import CombinedStrategy

STRATEGY_REGISTRY = {
    "macd": MACDStrategy,
    "kdj": KDJStrategy,
    "rsi": RSIStrategy,
    "ma": MAStrategy,
    "bollinger": BollingerStrategy,
    "volume": VolumeStrategy,
    "value_factor": ValueFactorStrategy,
    "quality_factor": QualityFactorStrategy,
    "momentum_factor": MomentumFactorStrategy,
    "low_volatility": LowVolatilityStrategy,
    "bollinger_reversion": BollingerReversionStrategy,
    "rsi_reversion": RSIReversionStrategy,
    "turtle": TurtleStrategy,
    "dual_ma": DualMAStrategy,
    "earnings_surprise": EarningsSurpriseStrategy,
    "high_dividend": HighDividendStrategy,
    "main_force_flow": MainForceFlowStrategy,
    "combined": CombinedStrategy,
}


def get_strategy(strategy_type: str, params: dict = None):
    if strategy_type not in STRATEGY_REGISTRY:
        raise ValueError(f"Unknown strategy type: {strategy_type}")
    return STRATEGY_REGISTRY[strategy_type](params)


def list_strategies():
    return [
        {
            "type": key,
            "name": strategy_class(params={}).name,
            "description": strategy_class(params={}).description
        }
        for key, strategy_class in STRATEGY_REGISTRY.items()
    ]
