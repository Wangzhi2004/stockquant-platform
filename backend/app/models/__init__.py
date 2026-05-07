from app.models.user import User
from app.models.portfolio import Portfolio, Holding, Transaction
from app.models.stock import Stock
from app.models.kline import KlineDaily, KlineMinute
from app.models.news import NewsArticle
from app.models.signal import StrategySignal
from app.models.strategy import StrategyConfig
from app.models.backtest import BacktestJob
from app.models.push import PushConfig, PushLog

User.portfolios = []
Portfolio.holdings = []
Portfolio.transactions = []
