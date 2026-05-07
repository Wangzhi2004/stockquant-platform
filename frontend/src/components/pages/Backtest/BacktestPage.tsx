import React, { useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import {
  History,
  Play,
  TrendingDown,
  BarChart3,
  Target,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

interface BacktestConfig {
  name: string
  strategyType: string
  stockCodes: string
  startDate: string
  endDate: string
  initialCapital: string
  commissionRate: string
  slippage: string
  maxPositions: string
  positionSize: string
  stopLoss: string
  takeProfit: string
}

interface BacktestResult {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed'
  progress: number
  summary: {
    initialCapital: number
    finalCapital: number
    totalReturn: number
    totalReturnPct: number
    sharpeRatio: number
    maxDrawdown: number
    maxDrawdownPct: number
    winRate: number
    profitFactor: number
    totalTrades: number
    winningTrades: number
    losingTrades: number
  }
  trades: {
    date: string
    stockCode: string
    action: 'buy' | 'sell'
    price: number
    quantity: number
    amount: number
    commission: number
    reason: string
  }[]
}

const defaultConfig: BacktestConfig = {
  name: '',
  strategyType: 'momentum',
  stockCodes: '600519,000858,300750',
  startDate: '2023-01-01',
  endDate: '2024-01-01',
  initialCapital: '1000000',
  commissionRate: '0.0003',
  slippage: '0.001',
  maxPositions: '10',
  positionSize: '0.1',
  stopLoss: '0.08',
  takeProfit: '0.2',
}

const mockResult: BacktestResult = {
  id: '1',
  name: '动量策略回测',
  status: 'completed',
  progress: 100,
  summary: {
    initialCapital: 1000000,
    finalCapital: 1452300,
    totalReturn: 452300,
    totalReturnPct: 45.23,
    sharpeRatio: 1.35,
    maxDrawdown: -125000,
    maxDrawdownPct: -12.5,
    winRate: 58.3,
    profitFactor: 1.82,
    totalTrades: 124,
    winningTrades: 72,
    losingTrades: 52,
  },
  trades: [
    { date: '2023-02-15', stockCode: '600519', action: 'buy', price: 1780.0, quantity: 100, amount: 178000, commission: 53.4, reason: '动量突破' },
    { date: '2023-03-20', stockCode: '600519', action: 'sell', price: 1850.0, quantity: 100, amount: 185000, commission: 55.5, reason: '止盈' },
    { date: '2023-04-10', stockCode: '300750', action: 'buy', price: 210.0, quantity: 500, amount: 105000, commission: 31.5, reason: '动量突破' },
    { date: '2023-05-25', stockCode: '300750', action: 'sell', price: 195.0, quantity: 500, amount: 97500, commission: 29.25, reason: '止损' },
    { date: '2023-06-15', stockCode: '000858', action: 'buy', price: 150.0, quantity: 400, amount: 60000, commission: 18.0, reason: '动量突破' },
  ],
}

export const BacktestPage: React.FC = () => {
  const [config, setConfig] = useState<BacktestConfig>(defaultConfig)
  const [showResult, setShowResult] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [expandedTrades, setExpandedTrades] = useState(false)

  const handleRun = () => {
    setIsRunning(true)
    setTimeout(() => {
      setIsRunning(false)
      setShowResult(true)
    }, 2000)
  }

  const updateConfig = (key: keyof BacktestConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary">策略回测</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Form */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-6">回测配置</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">回测名称</label>
                <GlassInput
                  value={config.name}
                  onChange={(v) => updateConfig('name', v)}
                  placeholder="输入回测名称"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">策略类型</label>
                <select
                  value={config.strategyType}
                  onChange={(e) => updateConfig('strategyType', e.target.value)}
                  className="w-full bg-black/20 backdrop-blur-md border border-glass-border rounded-glass-sm px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-accent/50"
                >
                  <option value="momentum">动量突破</option>
                  <option value="mean_reversion">均值回归</option>
                  <option value="breakout">箱体突破</option>
                  <option value="macd">MACD金叉</option>
                  <option value="rsi">RSI超买超卖</option>
                  <option value="fundamental">基本面选股</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">股票代码</label>
                <GlassInput
                  value={config.stockCodes}
                  onChange={(v) => updateConfig('stockCodes', v)}
                  placeholder="600519,000858,300750"
                />
                <p className="text-xs text-text-tertiary mt-1">多个代码用逗号分隔</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">开始日期</label>
                  <GlassInput
                    type="date"
                    value={config.startDate}
                    onChange={(v) => updateConfig('startDate', v)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">结束日期</label>
                  <GlassInput
                    type="date"
                    value={config.endDate}
                    onChange={(v) => updateConfig('endDate', v)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">初始资金</label>
                <GlassInput
                  type="number"
                  value={config.initialCapital}
                  onChange={(v) => updateConfig('initialCapital', v)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">佣金率</label>
                  <GlassInput
                    value={config.commissionRate}
                    onChange={(v) => updateConfig('commissionRate', v)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">滑点</label>
                  <GlassInput
                    value={config.slippage}
                    onChange={(v) => updateConfig('slippage', v)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">最大持仓</label>
                  <GlassInput
                    type="number"
                    value={config.maxPositions}
                    onChange={(v) => updateConfig('maxPositions', v)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">仓位比例</label>
                  <GlassInput
                    value={config.positionSize}
                    onChange={(v) => updateConfig('positionSize', v)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">止损比例</label>
                  <GlassInput
                    value={config.stopLoss}
                    onChange={(v) => updateConfig('stopLoss', v)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">止盈比例</label>
                  <GlassInput
                    value={config.takeProfit}
                    onChange={(v) => updateConfig('takeProfit', v)}
                  />
                </div>
              </div>
            </div>

            <GlassButton
              variant="primary"
              className="w-full mt-6"
              onClick={handleRun}
              disabled={isRunning}
            >
              <Play className={`w-4 h-4 mr-2 ${isRunning ? 'animate-pulse' : ''}`} />
              {isRunning ? '回测运行中...' : '开始回测'}
            </GlassButton>
          </GlassCard>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {showResult ? (
            <>
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">总收益</span>
                  </div>
                  <p className={`text-xl font-mono font-semibold ${mockResult.summary.totalReturn >= 0 ? 'text-up' : 'text-down'}`}>
                    {mockResult.summary.totalReturn >= 0 ? '+' : ''}¥{mockResult.summary.totalReturn.toLocaleString()}
                  </p>
                  <p className={`text-sm font-mono mt-1 ${mockResult.summary.totalReturnPct >= 0 ? 'text-up' : 'text-down'}`}>
                    {mockResult.summary.totalReturnPct >= 0 ? '+' : ''}{mockResult.summary.totalReturnPct.toFixed(2)}%
                  </p>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">夏普比率</span>
                  </div>
                  <p className="text-xl font-mono text-text-primary">{mockResult.summary.sharpeRatio.toFixed(2)}</p>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">最大回撤</span>
                  </div>
                  <p className="text-xl font-mono text-down">{mockResult.summary.maxDrawdownPct.toFixed(2)}%</p>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">胜率</span>
                  </div>
                  <p className="text-xl font-mono text-text-primary">{mockResult.summary.winRate.toFixed(1)}%</p>
                </GlassCard>
              </div>

              {/* Equity Curve Placeholder */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">权益曲线</h3>
                <div className="h-64 flex items-end justify-center gap-1">
                  {Array.from({ length: 50 }).map((_, i) => {
                    const height = 30 + Math.sin(i * 0.2) * 20 + (i / 50) * 40 + Math.random() * 10
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-accent/40 rounded-t hover:bg-accent/60 transition-colors"
                        style={{ height: `${Math.min(height, 100)}%` }}
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between mt-4 text-xs text-text-tertiary">
                  <span>初始: ¥{mockResult.summary.initialCapital.toLocaleString()}</span>
                  <span>最终: ¥{mockResult.summary.finalCapital.toLocaleString()}</span>
                </div>
              </GlassCard>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard className="p-4">
                  <p className="text-xs text-text-tertiary mb-1">盈亏因子</p>
                  <p className="text-lg font-mono text-text-primary">{mockResult.summary.profitFactor.toFixed(2)}</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <p className="text-xs text-text-tertiary mb-1">总交易</p>
                  <p className="text-lg font-mono text-text-primary">{mockResult.summary.totalTrades}</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <p className="text-xs text-text-tertiary mb-1">盈利交易</p>
                  <p className="text-lg font-mono text-up">{mockResult.summary.winningTrades}</p>
                </GlassCard>
                <GlassCard className="p-4">
                  <p className="text-xs text-text-tertiary mb-1">亏损交易</p>
                  <p className="text-lg font-mono text-down">{mockResult.summary.losingTrades}</p>
                </GlassCard>
              </div>

              {/* Trade List */}
              <GlassCard className="p-6">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedTrades(!expandedTrades)}
                >
                  <h3 className="text-lg font-semibold text-text-primary">交易明细</h3>
                  {expandedTrades ? (
                    <ChevronUp className="w-5 h-5 text-text-tertiary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-text-tertiary" />
                  )}
                </div>

                {expandedTrades && (
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs text-text-tertiary border-b border-glass-border">
                          <th className="pb-3 font-medium">日期</th>
                          <th className="pb-3 font-medium">股票</th>
                          <th className="pb-3 font-medium">操作</th>
                          <th className="pb-3 font-medium text-right">价格</th>
                          <th className="pb-3 font-medium text-right">数量</th>
                          <th className="pb-3 font-medium text-right">金额</th>
                          <th className="pb-3 font-medium text-right">佣金</th>
                          <th className="pb-3 font-medium">原因</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockResult.trades.map((trade, index) => (
                          <tr
                            key={index}
                            className="border-b border-glass-border/50 hover:bg-glass-bg-hover/30 transition-colors"
                          >
                            <td className="py-3 text-sm text-text-secondary">{trade.date}</td>
                            <td className="py-3 font-mono text-sm text-text-primary">{trade.stockCode}</td>
                            <td className="py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                  trade.action === 'buy'
                                    ? 'bg-up/10 text-up'
                                    : 'bg-down/10 text-down'
                                }`}
                              >
                                {trade.action === 'buy' ? (
                                  <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3" />
                                )}
                                {trade.action === 'buy' ? '买入' : '卖出'}
                              </span>
                            </td>
                            <td className="py-3 text-right font-mono text-sm text-text-primary">
                              ¥{trade.price.toFixed(2)}
                            </td>
                            <td className="py-3 text-right font-mono text-sm text-text-primary">
                              {trade.quantity}
                            </td>
                            <td className="py-3 text-right font-mono text-sm text-text-primary">
                              ¥{trade.amount.toLocaleString()}
                            </td>
                            <td className="py-3 text-right font-mono text-sm text-text-tertiary">
                              ¥{trade.commission.toFixed(2)}
                            </td>
                            <td className="py-3 text-sm text-text-secondary">{trade.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            </>
          ) : (
            <GlassCard className="p-12 flex flex-col items-center justify-center text-center">
              <History className="w-16 h-16 text-text-tertiary/50 mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">开始回测</h3>
              <p className="text-sm text-text-secondary max-w-md">
                配置回测参数后点击"开始回测"，系统将模拟历史交易并生成详细的回测报告
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  )
}

export default BacktestPage
