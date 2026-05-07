export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface Token {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface Portfolio {
  id: string
  name: string
  description?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Holding {
  id: string
  portfolioId: string
  stockCode: string
  stockName: string
  quantity: number
  avgCost: number
  currentPrice?: number
  marketValue?: number
  profitLoss?: number
  profitLossPercent?: number
  updatedAt: string
}

export interface Transaction {
  id: string
  portfolioId: string
  stockCode: string
  stockName: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  amount: number
  fee: number
  transactionDate: string
  createdAt: string
}

export interface PortfolioStats {
  totalValue: number
  totalCost: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  dailyProfitLoss: number
  dailyProfitLossPercent: number
  holdingsCount: number
  topGainer?: Holding
  topLoser?: Holding
}

export interface Stock {
  code: string
  name: string
  exchange?: string
  industry?: string
  currentPrice: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  amount: number
  turnoverRate?: number
  pe?: number
  pb?: number
  marketCap?: number
  updatedAt: string
}

export interface KlineData {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  amount: number
}

export interface IndexQuote {
  code: string
  name: string
  currentPrice: number
  change: number
  changePercent: number
  volume?: number
  amount?: number
}

export interface HotSector {
  code: string
  name: string
  changePercent: number
  stockCount: number
  topStocks: Stock[]
  updatedAt: string
}

export interface NewsArticle {
  id: string
  title: string
  summary?: string
  content?: string
  source: string
  url?: string
  publishedAt: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  relatedStocks?: string[]
  createdAt: string
}

export interface NewsAnalysis {
  articleId: string
  sentiment: 'positive' | 'negative' | 'neutral'
  sentimentScore: number
  keywords: string[]
  relatedStocks: string[]
  summary: string
}

export interface OpportunityScore {
  stockCode: string
  stockName: string
  score: number
  factors: {
    technical: number
    fundamental: number
    sentiment: number
    momentum: number
  }
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
  updatedAt: string
}

export interface StrategySignal {
  id: string
  strategyId: string
  strategyName: string
  stockCode: string
  stockName: string
  signalType: 'buy' | 'sell' | 'hold'
  price: number
  strength: number
  reason?: string
  triggeredAt: string
  createdAt: string
}

export interface SignalStats {
  totalSignals: number
  buySignals: number
  sellSignals: number
  holdSignals: number
  avgStrength: number
  winRate: number
  avgReturn: number
}

export interface SignalScanRequest {
  strategyIds?: string[]
  stockCodes?: string[]
  signalType?: 'buy' | 'sell' | 'hold'
  minStrength?: number
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

export interface StrategyConfig {
  name: string
  description?: string
  type: string
  parameters: Record<string, unknown>
  stockPool?: string[]
  enabled: boolean
}

export interface StrategyInfo {
  id: string
  name: string
  description?: string
  type: string
  parameters: Record<string, unknown>
  stockPool?: string[]
  enabled: boolean
  userId: string
  lastRunAt?: string
  createdAt: string
  updatedAt: string
}

export interface BacktestJob {
  id: string
  strategyId: string
  strategyName: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startDate: string
  endDate: string
  createdAt: string
  completedAt?: string
  error?: string
}

export interface BacktestResult {
  jobId: string
  totalReturn: number
  annualizedReturn: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  totalTrades: number
  profitTrades: number
  lossTrades: number
  avgProfit: number
  avgLoss: number
  profitFactor: number
  trades: TradeRecord[]
  equityCurve: { date: string; value: number }[]
}

export interface BacktestConfig {
  strategyId: string
  startDate: string
  endDate: string
  initialCapital: number
  commission: number
  slippage: number
  benchmark?: string
}

export interface TradeRecord {
  id: string
  stockCode: string
  stockName: string
  direction: 'buy' | 'sell'
  price: number
  quantity: number
  amount: number
  commission: number
  profitLoss?: number
  profitLossPercent?: number
  entryDate: string
  exitDate?: string
  holdingDays?: number
}

export interface PushConfig {
  id: string
  name: string
  type: 'email' | 'webhook' | 'wechat' | 'dingtalk'
  enabled: boolean
  config: Record<string, unknown>
  events: string[]
  userId: string
  createdAt: string
  updatedAt: string
}

export interface PushLog {
  id: string
  configId: string
  configName: string
  event: string
  status: 'success' | 'failed'
  message?: string
  recipient?: string
  createdAt: string
}
