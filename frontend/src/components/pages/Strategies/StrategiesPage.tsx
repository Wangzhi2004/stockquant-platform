import React, { useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import {
  Layers,
  ToggleLeft,
  ToggleRight,
  BarChart3,
  TrendingUp,
  X,
  Settings2,
  Zap,
  Activity,
  Target,
  LineChart,
  CandlestickChart,
  BrainCircuit,
  Sigma,
  Timer,
  GitBranch,
} from 'lucide-react'

interface Strategy {
  id: string
  name: string
  description: string
  category: string
  icon: React.ElementType
  enabled: boolean
  params: Record<string, number | string | boolean>
  performance: {
    totalReturn: number
    sharpeRatio: number
    maxDrawdown: number
    winRate: number
    tradeCount: number
  }
}

const initialStrategies: Strategy[] = [
  {
    id: '1', name: '动量突破', description: '基于价格动量和成交量突破的交易策略', category: '技术面',
    icon: Zap, enabled: true,
    params: { lookbackPeriod: 20, volumeMultiplier: 2, threshold: 0.05 },
    performance: { totalReturn: 45.2, sharpeRatio: 1.35, maxDrawdown: -12.5, winRate: 58.3, tradeCount: 124 },
  },
  {
    id: '2', name: '均值回归', description: '价格偏离均线后回归均值的策略', category: '技术面',
    icon: Activity, enabled: true,
    params: { maPeriod: 30, deviationThreshold: 0.08, holdingDays: 5 },
    performance: { totalReturn: 32.8, sharpeRatio: 1.12, maxDrawdown: -8.9, winRate: 62.1, tradeCount: 98 },
  },
  {
    id: '3', name: '箱体突破', description: '识别价格箱体整理后的突破信号', category: '技术面',
    icon: Target, enabled: false,
    params: { boxPeriod: 40, breakoutThreshold: 0.03, confirmDays: 2 },
    performance: { totalReturn: 28.5, sharpeRatio: 0.98, maxDrawdown: -15.2, winRate: 52.4, tradeCount: 76 },
  },
  {
    id: '4', name: 'MACD金叉', description: '基于MACD指标金叉死叉的择时策略', category: '技术指标',
    icon: LineChart, enabled: true,
    params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
    performance: { totalReturn: 22.1, sharpeRatio: 0.85, maxDrawdown: -10.3, winRate: 55.6, tradeCount: 156 },
  },
  {
    id: '5', name: 'RSI超买超卖', description: '利用RSI指标识别超买超卖区域', category: '技术指标',
    icon: BarChart3, enabled: false,
    params: { rsiPeriod: 14, overbought: 70, oversold: 30 },
    performance: { totalReturn: 18.9, sharpeRatio: 0.72, maxDrawdown: -11.8, winRate: 48.9, tradeCount: 203 },
  },
  {
    id: '6', name: '布林带策略', description: '基于布林带上下轨的突破与回归', category: '技术指标',
    icon: CandlestickChart, enabled: true,
    params: { bbPeriod: 20, stdDev: 2, meanReversion: true },
    performance: { totalReturn: 35.6, sharpeRatio: 1.08, maxDrawdown: -9.5, winRate: 59.2, tradeCount: 112 },
  },
  {
    id: '7', name: '基本面选股', description: '基于ROE、PE、PB等财务指标选股', category: '基本面',
    icon: BrainCircuit, enabled: true,
    params: { minRoe: 15, maxPe: 30, minProfitGrowth: 0.2 },
    performance: { totalReturn: 52.3, sharpeRatio: 1.45, maxDrawdown: -14.1, winRate: 65.8, tradeCount: 45 },
  },
  {
    id: '8', name: '价值投资', description: '低估值高分红的长期投资策略', category: '基本面',
    icon: Target, enabled: false,
    params: { maxPb: 2, minDividendYield: 0.03, maxDebtRatio: 0.6 },
    performance: { totalReturn: 38.7, sharpeRatio: 1.22, maxDrawdown: -7.2, winRate: 68.4, tradeCount: 34 },
  },
  {
    id: '9', name: '成长投资', description: '高营收利润增长的成长股策略', category: '基本面',
    icon: TrendingUp, enabled: true,
    params: { minRevenueGrowth: 0.3, minProfitGrowth: 0.25, maxPe: 50 },
    performance: { totalReturn: 48.9, sharpeRatio: 1.28, maxDrawdown: -18.5, winRate: 56.7, tradeCount: 67 },
  },
  {
    id: '10', name: '事件驱动', description: '基于业绩预告、分红送股等事件', category: '事件',
    icon: Zap, enabled: false,
    params: { eventTypes: 'earnings,dividend', holdingDays: 10, positionSize: 0.1 },
    performance: { totalReturn: 25.4, sharpeRatio: 0.92, maxDrawdown: -13.6, winRate: 54.3, tradeCount: 89 },
  },
  {
    id: '11', name: '资金流向', description: '跟踪主力资金流向的择时策略', category: '资金面',
    icon: Activity, enabled: true,
    params: { capitalThreshold: 10000000, followDays: 3 },
    performance: { totalReturn: 30.2, sharpeRatio: 1.05, maxDrawdown: -10.8, winRate: 57.1, tradeCount: 134 },
  },
  {
    id: '12', name: '多因子模型', description: '综合估值、动量、质量因子的多因子策略', category: '量化模型',
    icon: Sigma, enabled: true,
    params: { factorWeights: 'value:0.4,momentum:0.3,quality:0.3', rebalanceDays: 20 },
    performance: { totalReturn: 55.8, sharpeRatio: 1.52, maxDrawdown: -11.3, winRate: 61.5, tradeCount: 78 },
  },
  {
    id: '13', name: '机器学习', description: '基于XGBoost的AI选股模型', category: '量化模型',
    icon: BrainCircuit, enabled: false,
    params: { modelType: 'xgboost', features: 'price,volume,fundamental', retrainDays: 60 },
    performance: { totalReturn: 42.1, sharpeRatio: 1.38, maxDrawdown: -13.9, winRate: 60.2, tradeCount: 92 },
  },
  {
    id: '14', name: '统计套利', description: '基于协整关系的配对交易策略', category: '量化模型',
    icon: GitBranch, enabled: false,
    params: { lookbackPeriod: 60, entryThreshold: 2, exitThreshold: 0.5 },
    performance: { totalReturn: 15.6, sharpeRatio: 0.68, maxDrawdown: -6.3, winRate: 52.8, tradeCount: 245 },
  },
  {
    id: '15', name: '日内回转', description: '基于开盘缺口和日内趋势的T+0策略', category: '高频',
    icon: Timer, enabled: false,
    params: { gapThreshold: 0.02, stopLoss: 0.01, maxHoldingMinutes: 240 },
    performance: { totalReturn: 28.3, sharpeRatio: 0.95, maxDrawdown: -8.7, winRate: 51.2, tradeCount: 567 },
  },
  {
    id: '16', name: '趋势跟踪', description: '基于均线系统的趋势跟随策略', category: '技术面',
    icon: TrendingUp, enabled: true,
    params: { fastMa: 10, slowMa: 30, trendFilter: 60 },
    performance: { totalReturn: 40.5, sharpeRatio: 1.18, maxDrawdown: -12.8, winRate: 45.6, tradeCount: 87 },
  },
  {
    id: '17', name: '波动率策略', description: '基于ATR和波动率指数的风险管理策略', category: '风险管理',
    icon: BarChart3, enabled: false,
    params: { atrPeriod: 14, volThreshold: 0.25, positionScale: true },
    performance: { totalReturn: 20.8, sharpeRatio: 0.78, maxDrawdown: -7.5, winRate: 53.9, tradeCount: 156 },
  },
  {
    id: '18', name: '行业轮动', description: '基于行业景气度和资金流向的轮动策略', category: '宏观',
    icon: Layers, enabled: true,
    params: { topSectors: 3, rotationPeriod: 20, momentumLookback: 60 },
    performance: { totalReturn: 36.4, sharpeRatio: 1.15, maxDrawdown: -9.2, winRate: 58.9, tradeCount: 68 },
  },
]

export const StrategiesPage: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies)
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const categories = ['all', ...Array.from(new Set(strategies.map((s) => s.category)))]

  const filteredStrategies =
    categoryFilter === 'all' ? strategies : strategies.filter((s) => s.category === categoryFilter)

  const toggleStrategy = (id: string) => {
    setStrategies((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary">策略中心</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-tertiary">
            已启用 {strategies.filter((s) => s.enabled).length}/{strategies.length}
          </span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-glass-sm text-xs font-medium transition-colors border ${
              categoryFilter === cat
                ? 'bg-accent/20 border-accent/30 text-accent'
                : 'border-glass-border text-text-tertiary hover:text-text-primary hover:bg-glass-bg-hover'
            }`}
          >
            {cat === 'all' ? '全部' : cat}
          </button>
        ))}
      </div>

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStrategies.map((strategy) => {
          const Icon = strategy.icon
          return (
            <GlassCard
              key={strategy.id}
              className="p-5 cursor-pointer transition-all"
              glow={strategy.enabled ? 'accent' : null}
              onClick={() => setSelectedStrategy(strategy)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      strategy.enabled ? 'bg-accent/20' : 'bg-glass-bg-hover'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${strategy.enabled ? 'text-accent' : 'text-text-tertiary'}`}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{strategy.name}</h3>
                    <span className="text-xs text-text-tertiary">{strategy.category}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleStrategy(strategy.id)
                  }}
                  className="text-text-tertiary hover:text-text-primary transition-colors"
                >
                  {strategy.enabled ? (
                    <ToggleRight className="w-6 h-6 text-accent" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </button>
              </div>

              <p className="text-xs text-text-secondary mb-4 line-clamp-2">{strategy.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-text-tertiary mb-0.5">总收益</p>
                  <p
                    className={`text-sm font-mono font-semibold ${
                      strategy.performance.totalReturn >= 0 ? 'text-up' : 'text-down'
                    }`}
                  >
                    {strategy.performance.totalReturn >= 0 ? '+' : ''}
                    {strategy.performance.totalReturn.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-0.5">夏普比率</p>
                  <p className="text-sm font-mono text-text-primary">
                    {strategy.performance.sharpeRatio.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-0.5">最大回撤</p>
                  <p className="text-sm font-mono text-down">
                    {strategy.performance.maxDrawdown.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-0.5">胜率</p>
                  <p className="text-sm font-mono text-text-primary">
                    {strategy.performance.winRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Detail Modal */}
      {selectedStrategy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <GlassCard className="w-full max-w-lg p-6 mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                  <selectedStrategy.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {selectedStrategy.name}
                  </h3>
                  <span className="text-xs text-text-tertiary">{selectedStrategy.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStrategy(null)}
                className="p-1 rounded-glass-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-6">{selectedStrategy.description}</p>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-glass-bg-hover/30 rounded-glass-sm p-3 text-center">
                <p className="text-xs text-text-tertiary mb-1">总收益</p>
                <p
                  className={`text-lg font-mono font-semibold ${
                    selectedStrategy.performance.totalReturn >= 0 ? 'text-up' : 'text-down'
                  }`}
                >
                  {selectedStrategy.performance.totalReturn >= 0 ? '+' : ''}
                  {selectedStrategy.performance.totalReturn.toFixed(1)}%
                </p>
              </div>
              <div className="bg-glass-bg-hover/30 rounded-glass-sm p-3 text-center">
                <p className="text-xs text-text-tertiary mb-1">夏普比率</p>
                <p className="text-lg font-mono text-text-primary">
                  {selectedStrategy.performance.sharpeRatio.toFixed(2)}
                </p>
              </div>
              <div className="bg-glass-bg-hover/30 rounded-glass-sm p-3 text-center">
                <p className="text-xs text-text-tertiary mb-1">交易次数</p>
                <p className="text-lg font-mono text-text-primary">
                  {selectedStrategy.performance.tradeCount}
                </p>
              </div>
            </div>

            {/* Parameters */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                策略参数
              </h4>
              <div className="space-y-3">
                {Object.entries(selectedStrategy.params).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-glass-bg-hover/20 rounded-glass-sm"
                  >
                    <span className="text-sm text-text-secondary">{key}</span>
                    <span className="text-sm font-mono text-text-primary">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <GlassButton
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedStrategy(null)}
              >
                关闭
              </GlassButton>
              <GlassButton
                variant="primary"
                className="flex-1"
                onClick={() => {
                  toggleStrategy(selectedStrategy.id)
                  setSelectedStrategy((prev) =>
                    prev ? { ...prev, enabled: !prev.enabled } : null
                  )
                }}
              >
                {selectedStrategy.enabled ? '禁用策略' : '启用策略'}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}

export default StrategiesPage
