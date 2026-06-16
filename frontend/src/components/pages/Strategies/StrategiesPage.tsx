import React, { useState, useEffect, useCallback } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { GlassTabs } from '@/components/glass/GlassTabs'
import { GlassDialog } from '@/components/glass/GlassDialog'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { StrengthBar } from '@/components/common/StrengthBar'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { strategiesService } from '@/services/strategies'
import { formatPercent, formatNumber, formatDateTime } from '@/utils/formatters'
import type { StrategyInfo, StrategySignal } from '@/types'
import {
  Layers,
  ToggleLeft,
  ToggleRight,
  Settings2,
  Zap,
  Activity,
  LineChart,
  BarChart3,
  TrendingUp,
  BrainCircuit,
  Sigma,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Save,
} from 'lucide-react'

interface StrategyPerformance {
  winRate: number
  totalReturn: number
  sharpeRatio: number
  maxDrawdown: number
  tradeCount: number
  runCount: number
}

interface ExtendedStrategy extends StrategyInfo {
  performance: StrategyPerformance
}

const CATEGORY_TABS = [
  { key: 'all', label: '全部', icon: <Layers className="w-3.5 h-3.5" /> },
  { key: 'technical', label: '技术面', icon: <LineChart className="w-3.5 h-3.5" /> },
  { key: 'fundamental', label: '基本面', icon: <BrainCircuit className="w-3.5 h-3.5" /> },
  { key: 'composite', label: '复合策略', icon: <Sigma className="w-3.5 h-3.5" /> },
  { key: 'mean_reversion', label: '均值回归', icon: <Activity className="w-3.5 h-3.5" /> },
  { key: 'trend_following', label: '趋势跟踪', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { key: 'event_driven', label: '事件驱动', icon: <Zap className="w-3.5 h-3.5" /> },
  { key: 'capital_flow', label: '资金流向', icon: <BarChart3 className="w-3.5 h-3.5" /> },
]

const TYPE_BADGE_MAP: Record<string, { variant: 'up' | 'down' | 'accent' | 'warning' | 'default'; label: string }> = {
  technical: { variant: 'accent', label: '技术面' },
  fundamental: { variant: 'up', label: '基本面' },
  composite: { variant: 'warning', label: '复合策略' },
  mean_reversion: { variant: 'default', label: '均值回归' },
  trend_following: { variant: 'accent', label: '趋势跟踪' },
  event_driven: { variant: 'down', label: '事件驱动' },
  capital_flow: { variant: 'warning', label: '资金流向' },
}

const TYPE_ICON_MAP: Record<string, React.ElementType> = {
  technical: LineChart,
  fundamental: BrainCircuit,
  composite: Sigma,
  mean_reversion: Activity,
  trend_following: TrendingUp,
  event_driven: Zap,
  capital_flow: BarChart3,
}

const MOCK_PERFORMANCE: Record<string, StrategyPerformance> = {
  '1': { winRate: 58.3, totalReturn: 0.452, sharpeRatio: 1.35, maxDrawdown: -0.125, tradeCount: 124, runCount: 89 },
  '2': { winRate: 62.1, totalReturn: 0.328, sharpeRatio: 1.12, maxDrawdown: -0.089, tradeCount: 98, runCount: 76 },
  '3': { winRate: 52.4, totalReturn: 0.285, sharpeRatio: 0.98, maxDrawdown: -0.152, tradeCount: 76, runCount: 54 },
  '4': { winRate: 55.6, totalReturn: 0.221, sharpeRatio: 0.85, maxDrawdown: -0.103, tradeCount: 156, runCount: 112 },
  '5': { winRate: 48.9, totalReturn: 0.189, sharpeRatio: 0.72, maxDrawdown: -0.118, tradeCount: 203, runCount: 145 },
  '6': { winRate: 59.2, totalReturn: 0.356, sharpeRatio: 1.08, maxDrawdown: -0.095, tradeCount: 112, runCount: 83 },
  '7': { winRate: 65.8, totalReturn: 0.523, sharpeRatio: 1.45, maxDrawdown: -0.141, tradeCount: 45, runCount: 32 },
  '8': { winRate: 68.4, totalReturn: 0.387, sharpeRatio: 1.22, maxDrawdown: -0.072, tradeCount: 34, runCount: 28 },
  '9': { winRate: 56.7, totalReturn: 0.489, sharpeRatio: 1.28, maxDrawdown: -0.185, tradeCount: 67, runCount: 51 },
  '10': { winRate: 54.3, totalReturn: 0.254, sharpeRatio: 0.92, maxDrawdown: -0.136, tradeCount: 89, runCount: 67 },
  '11': { winRate: 57.1, totalReturn: 0.302, sharpeRatio: 1.05, maxDrawdown: -0.108, tradeCount: 134, runCount: 98 },
  '12': { winRate: 61.5, totalReturn: 0.558, sharpeRatio: 1.52, maxDrawdown: -0.113, tradeCount: 78, runCount: 60 },
}

const MOCK_SIGNALS: StrategySignal[] = [
  { id: 's1', strategyId: '1', strategyName: '动量突破', stockCode: '600519', stockName: '贵州茅台', signalType: 'buy', price: 1688.5, strength: 85, reason: '放量突破20日均线', triggeredAt: '2026-05-06T14:30:00Z', createdAt: '2026-05-06T14:30:00Z' },
  { id: 's2', strategyId: '1', strategyName: '动量突破', stockCode: '000858', stockName: '五粮液', signalType: 'sell', price: 142.3, strength: 72, reason: '跌破支撑位', triggeredAt: '2026-05-06T10:15:00Z', createdAt: '2026-05-06T10:15:00Z' },
  { id: 's3', strategyId: '2', strategyName: '均值回归', stockCode: '601318', stockName: '中国平安', signalType: 'buy', price: 48.6, strength: 90, reason: '偏离30日均线8%以上', triggeredAt: '2026-05-05T15:00:00Z', createdAt: '2026-05-05T15:00:00Z' },
  { id: 's4', strategyId: '7', strategyName: '基本面选股', stockCode: '300750', stockName: '宁德时代', signalType: 'hold', price: 215.8, strength: 65, reason: 'ROE持续高于15%', triggeredAt: '2026-05-04T09:30:00Z', createdAt: '2026-05-04T09:30:00Z' },
  { id: 's5', strategyId: '12', strategyName: '多因子模型', stockCode: '002475', stockName: '立讯精密', signalType: 'buy', price: 32.5, strength: 78, reason: '多因子综合评分靠前', triggeredAt: '2026-05-03T14:00:00Z', createdAt: '2026-05-03T14:00:00Z' },
]

const FALLBACK_STRATEGIES: ExtendedStrategy[] = [
  { id: '1', name: '动量突破', description: '基于价格动量和成交量突破的交易策略，捕捉强势股的持续上涨趋势', type: 'technical', parameters: { lookbackPeriod: 20, volumeMultiplier: 2, threshold: 0.05 }, enabled: true, userId: 'u1', lastRunAt: '2026-05-06T14:30:00Z', createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-05-06T14:30:00Z', performance: MOCK_PERFORMANCE['1'] },
  { id: '2', name: '均值回归', description: '价格偏离均线后回归均值的策略，适合震荡行情', type: 'mean_reversion', parameters: { maPeriod: 30, deviationThreshold: 0.08, holdingDays: 5 }, enabled: true, userId: 'u1', lastRunAt: '2026-05-05T15:00:00Z', createdAt: '2026-01-20T08:00:00Z', updatedAt: '2026-05-05T15:00:00Z', performance: MOCK_PERFORMANCE['2'] },
  { id: '3', name: '箱体突破', description: '识别价格箱体整理后的突破信号，配合量能确认', type: 'technical', parameters: { boxPeriod: 40, breakoutThreshold: 0.03, confirmDays: 2 }, enabled: false, userId: 'u1', lastRunAt: '2026-04-28T10:00:00Z', createdAt: '2026-02-01T08:00:00Z', updatedAt: '2026-04-28T10:00:00Z', performance: MOCK_PERFORMANCE['3'] },
  { id: '4', name: 'MACD金叉', description: '基于MACD指标金叉死叉的择时策略，适合中短线交易', type: 'technical', parameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }, enabled: true, userId: 'u1', lastRunAt: '2026-05-06T09:30:00Z', createdAt: '2026-02-10T08:00:00Z', updatedAt: '2026-05-06T09:30:00Z', performance: MOCK_PERFORMANCE['4'] },
  { id: '5', name: 'RSI超买超卖', description: '利用RSI指标识别超买超卖区域，逆向交易', type: 'mean_reversion', parameters: { rsiPeriod: 14, overbought: 70, oversold: 30 }, enabled: false, userId: 'u1', lastRunAt: '2026-04-20T11:00:00Z', createdAt: '2026-02-15T08:00:00Z', updatedAt: '2026-04-20T11:00:00Z', performance: MOCK_PERFORMANCE['5'] },
  { id: '6', name: '布林带策略', description: '基于布林带上下轨的突破与回归，动态调整仓位', type: 'mean_reversion', parameters: { bbPeriod: 20, stdDev: 2, meanReversion: true }, enabled: true, userId: 'u1', lastRunAt: '2026-05-06T13:00:00Z', createdAt: '2026-03-01T08:00:00Z', updatedAt: '2026-05-06T13:00:00Z', performance: MOCK_PERFORMANCE['6'] },
  { id: '7', name: '基本面选股', description: '基于ROE、PE、PB等财务指标选股，长期持有优质标的', type: 'fundamental', parameters: { minRoe: 15, maxPe: 30, minProfitGrowth: 0.2 }, enabled: true, userId: 'u1', lastRunAt: '2026-05-04T09:30:00Z', createdAt: '2026-01-10T08:00:00Z', updatedAt: '2026-05-04T09:30:00Z', performance: MOCK_PERFORMANCE['7'] },
  { id: '8', name: '价值投资', description: '低估值高分红的长期投资策略，注重安全边际', type: 'fundamental', parameters: { maxPb: 2, minDividendYield: 0.03, maxDebtRatio: 0.6 }, enabled: false, userId: 'u1', lastRunAt: '2026-04-15T08:00:00Z', createdAt: '2026-01-25T08:00:00Z', updatedAt: '2026-04-15T08:00:00Z', performance: MOCK_PERFORMANCE['8'] },
  { id: '9', name: '成长投资', description: '高营收利润增长的成长股策略，关注行业景气度', type: 'fundamental', parameters: { minRevenueGrowth: 0.3, minProfitGrowth: 0.25, maxPe: 50 }, enabled: true, userId: 'u1', lastRunAt: '2026-05-05T10:00:00Z', createdAt: '2026-02-20T08:00:00Z', updatedAt: '2026-05-05T10:00:00Z', performance: MOCK_PERFORMANCE['9'] },
  { id: '10', name: '事件驱动', description: '基于业绩预告、分红送股等事件驱动的短期交易策略', type: 'event_driven', parameters: { eventTypes: 'earnings,dividend', holdingDays: 10, positionSize: 0.1 }, enabled: false, userId: 'u1', lastRunAt: '2026-04-10T14:00:00Z', createdAt: '2026-03-05T08:00:00Z', updatedAt: '2026-04-10T14:00:00Z', performance: MOCK_PERFORMANCE['10'] },
  { id: '11', name: '资金流向', description: '跟踪主力资金流向的择时策略，跟随聪明钱', type: 'capital_flow', parameters: { capitalThreshold: 10000000, followDays: 3 }, enabled: true, userId: 'u1', lastRunAt: '2026-05-06T15:00:00Z', createdAt: '2026-02-28T08:00:00Z', updatedAt: '2026-05-06T15:00:00Z', performance: MOCK_PERFORMANCE['11'] },
  { id: '12', name: '多因子模型', description: '综合估值、动量、质量因子的多因子策略，系统化选股', type: 'composite', parameters: { factorWeights: 'value:0.4,momentum:0.3,quality:0.3', rebalanceDays: 20 }, enabled: true, userId: 'u1', lastRunAt: '2026-05-03T14:00:00Z', createdAt: '2026-01-05T08:00:00Z', updatedAt: '2026-05-03T14:00:00Z', performance: MOCK_PERFORMANCE['12'] },
]

const EQUITY_CURVE_POINTS = [
  0, 2.1, 4.5, 3.8, 6.2, 8.1, 7.5, 9.3, 11.2, 10.8, 13.5, 15.2, 14.8, 17.1, 19.5, 18.2, 20.8, 22.4, 24.1, 23.5, 26.3, 28.7, 27.9, 30.2, 32.5, 31.8, 34.1, 36.8, 38.2, 37.5, 40.1, 42.3, 44.8, 43.2, 45.6, 47.1, 49.3, 48.5, 51.2, 53.8,
]

function MiniEquityChart({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 280
  const h = 80
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x},${y}`
  }).join(' ')
  const areaPoints = `0,${h} ${points} ${w},${h}`
  const isPositive = data[data.length - 1] > data[0]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isPositive ? '#00E5A0' : '#FF4567'} stopOpacity="0.25" />
          <stop offset="100%" stopColor={isPositive ? '#00E5A0' : '#FF4567'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#eqGrad)" />
      <polyline points={points} fill="none" stroke={isPositive ? '#00E5A0' : '#FF4567'} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

const SIGNAL_TYPE_CONFIG = {
  buy: { icon: ArrowUpRight, color: 'text-up', bg: 'bg-up/10', label: '买入' },
  sell: { icon: ArrowDownRight, color: 'text-down', bg: 'bg-down/10', label: '卖出' },
  hold: { icon: Minus, color: 'text-text-tertiary', bg: 'bg-white/[0.06]', label: '持有' },
}

export const StrategiesPage: React.FC = () => {
  const [strategies, setStrategies] = useState<ExtendedStrategy[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [detailStrategy, setDetailStrategy] = useState<ExtendedStrategy | null>(null)
  const [editingStrategy, setEditingStrategy] = useState<ExtendedStrategy | null>(null)
  const [editParams, setEditParams] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchStrategies = useCallback(async () => {
    try {
      setLoading(true)
      const res = await strategiesService.list()
      if (res.data) {
        const extended: ExtendedStrategy[] = res.data.map((s: StrategyInfo) => ({
          ...s,
          performance: MOCK_PERFORMANCE[s.id] || { winRate: 50, totalReturn: 0, sharpeRatio: 0, maxDrawdown: 0, tradeCount: 0, runCount: 0 },
        }))
        setStrategies(extended)
      }
    } catch {
      setStrategies(FALLBACK_STRATEGIES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStrategies()
  }, [fetchStrategies])

  const filteredStrategies = activeCategory === 'all'
    ? strategies
    : strategies.filter((s) => s.type === activeCategory)

  const enabledCount = strategies.filter((s) => s.enabled).length

  const handleToggle = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const strategy = strategies.find((s) => s.id === id)
    if (!strategy) return
    setTogglingId(id)
    const newEnabled = !strategy.enabled
    setStrategies((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: newEnabled } : s)))
    if (detailStrategy?.id === id) {
      setDetailStrategy((prev) => prev ? { ...prev, enabled: newEnabled } : null)
    }
    try {
      await strategiesService.update(id, { enabled: newEnabled })
    } catch {
      setStrategies((prev) => prev.map((s) => (s.id === id ? { ...s, enabled: !newEnabled } : s)))
      if (detailStrategy?.id === id) {
        setDetailStrategy((prev) => prev ? { ...prev, enabled: !newEnabled } : null)
      }
    } finally {
      setTogglingId(null)
    }
  }

  const handleOpenDetail = (strategy: ExtendedStrategy) => {
    setDetailStrategy(strategy)
  }

  const handleOpenEdit = (strategy: ExtendedStrategy) => {
    const params: Record<string, string> = {}
    Object.entries(strategy.parameters).forEach(([k, v]) => {
      params[k] = String(v)
    })
    setEditParams(params)
    setEditingStrategy(strategy)
  }

  const handleSaveParams = async () => {
    if (!editingStrategy) return
    setSaving(true)
    const newParams: Record<string, unknown> = {}
    Object.entries(editParams).forEach(([k, v]) => {
      const num = Number(v)
      newParams[k] = isNaN(num) ? v : num
    })
    try {
      await strategiesService.update(editingStrategy.id, { parameters: newParams })
      setStrategies((prev) => prev.map((s) => (s.id === editingStrategy.id ? { ...s, parameters: newParams } : s)))
      if (detailStrategy?.id === editingStrategy.id) {
        setDetailStrategy((prev) => prev ? { ...prev, parameters: newParams } : null)
      }
      setEditingStrategy(null)
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const strategySignals = detailStrategy
    ? MOCK_SIGNALS.filter((s) => s.strategyId === detailStrategy.id)
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary">策略中心</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-glass-sm bg-glass-bg border border-glass-border">
            <span className="text-xs text-text-tertiary">已启用</span>
            <span className="text-sm font-mono font-semibold text-accent">{enabledCount}</span>
            <span className="text-xs text-text-tertiary">/</span>
            <span className="text-sm font-mono text-text-secondary">{strategies.length}</span>
          </div>
        </div>
      </div>

      <GlassTabs
        tabs={CATEGORY_TABS}
        activeKey={activeCategory}
        onChange={setActiveCategory}
        size="sm"
      />

      {filteredStrategies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
          <Layers className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">该分类下暂无策略</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStrategies.map((strategy) => {
            const Icon = TYPE_ICON_MAP[strategy.type] || Activity
            const badgeInfo = TYPE_BADGE_MAP[strategy.type] || { variant: 'default' as const, label: strategy.type }
            const isToggling = togglingId === strategy.id
            return (
              <GlassCard
                key={strategy.id}
                glow={strategy.enabled ? 'accent' : null}
                onClick={() => handleOpenDetail(strategy)}
                header={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${strategy.enabled ? 'bg-accent/20' : 'bg-white/[0.04]'}`}>
                        <Icon className={`w-4.5 h-4.5 ${strategy.enabled ? 'text-accent' : 'text-text-tertiary'}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-text-primary">{strategy.name}</h3>
                        <GlassBadge variant={badgeInfo.variant} size="sm">{badgeInfo.label}</GlassBadge>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleToggle(strategy.id, e)}
                      className="transition-colors"
                      disabled={isToggling}
                    >
                      {isToggling ? (
                        <LoadingSpinner size="sm" />
                      ) : strategy.enabled ? (
                        <ToggleRight className="w-6 h-6 text-accent" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-text-tertiary" />
                      )}
                    </button>
                  </div>
                }
                footer={
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-text-tertiary">
                      <Play className="w-3 h-3" />
                      <span className="text-xs font-mono">{strategy.performance.runCount}次运行</span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        icon={<Settings2 className="w-3.5 h-3.5" />}
                        onClick={() => handleOpenEdit(strategy)}
                      >
                        参数
                      </GlassButton>
                    </div>
                  </div>
                }
              >
                <p className="text-xs text-text-secondary mb-4 line-clamp-2">{strategy.description}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-text-tertiary mb-1">胜率</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-mono font-semibold ${strategy.performance.winRate >= 55 ? 'text-up' : strategy.performance.winRate >= 50 ? 'text-text-primary' : 'text-down'}`}>
                        {strategy.performance.winRate.toFixed(1)}%
                      </span>
                      <StrengthBar value={strategy.performance.winRate} size="sm" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-tertiary mb-1">收益率</p>
                    <span className={`text-sm font-mono font-semibold ${strategy.performance.totalReturn >= 0 ? 'text-up' : 'text-down'}`}>
                      {formatPercent(strategy.performance.totalReturn)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-tertiary mb-1">夏普</p>
                    <span className={`text-sm font-mono font-semibold ${strategy.performance.sharpeRatio >= 1 ? 'text-up' : strategy.performance.sharpeRatio >= 0.5 ? 'text-text-primary' : 'text-down'}`}>
                      {strategy.performance.sharpeRatio.toFixed(2)}
                    </span>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}

      <GlassDialog
        open={!!detailStrategy}
        onClose={() => setDetailStrategy(null)}
        title={detailStrategy?.name}
        size="lg"
        footer={
          <>
            <GlassButton variant="secondary" onClick={() => setDetailStrategy(null)}>
              关闭
            </GlassButton>
            {detailStrategy && (
              <GlassButton
                variant={detailStrategy.enabled ? 'danger' : 'primary'}
                onClick={() => handleToggle(detailStrategy.id)}
                loading={togglingId === detailStrategy.id}
                icon={detailStrategy.enabled ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
              >
                {detailStrategy.enabled ? '禁用策略' : '启用策略'}
              </GlassButton>
            )}
          </>
        }
      >
        {detailStrategy && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <GlassBadge variant={TYPE_BADGE_MAP[detailStrategy.type]?.variant || 'default'} size="md">
                {TYPE_BADGE_MAP[detailStrategy.type]?.label || detailStrategy.type}
              </GlassBadge>
              <GlassBadge variant={detailStrategy.enabled ? 'up' : 'default'} size="md" glow={detailStrategy.enabled}>
                {detailStrategy.enabled ? '运行中' : '已停用'}
              </GlassBadge>
              {detailStrategy.lastRunAt && (
                <span className="text-xs text-text-tertiary">
                  最近运行: {formatDateTime(detailStrategy.lastRunAt)}
                </span>
              )}
            </div>

            <p className="text-sm text-text-secondary">{detailStrategy.description}</p>

            <div className="grid grid-cols-4 gap-3">
              <div className="bg-black/20 rounded-glass-sm p-3 text-center border border-white/[0.04]">
                <p className="text-[10px] text-text-tertiary mb-1">胜率</p>
                <p className={`text-lg font-mono font-semibold ${detailStrategy.performance.winRate >= 55 ? 'text-up' : 'text-text-primary'}`}>
                  {detailStrategy.performance.winRate.toFixed(1)}%
                </p>
              </div>
              <div className="bg-black/20 rounded-glass-sm p-3 text-center border border-white/[0.04]">
                <p className="text-[10px] text-text-tertiary mb-1">收益率</p>
                <p className={`text-lg font-mono font-semibold ${detailStrategy.performance.totalReturn >= 0 ? 'text-up' : 'text-down'}`}>
                  {formatPercent(detailStrategy.performance.totalReturn)}
                </p>
              </div>
              <div className="bg-black/20 rounded-glass-sm p-3 text-center border border-white/[0.04]">
                <p className="text-[10px] text-text-tertiary mb-1">夏普比率</p>
                <p className="text-lg font-mono font-semibold text-text-primary">
                  {detailStrategy.performance.sharpeRatio.toFixed(2)}
                </p>
              </div>
              <div className="bg-black/20 rounded-glass-sm p-3 text-center border border-white/[0.04]">
                <p className="text-[10px] text-text-tertiary mb-1">最大回撤</p>
                <p className="text-lg font-mono font-semibold text-down">
                  {formatPercent(detailStrategy.performance.maxDrawdown)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                收益曲线
              </h4>
              <div className="bg-black/20 rounded-glass-sm p-4 border border-white/[0.04]">
                <MiniEquityChart data={EQUITY_CURVE_POINTS} className="w-full h-20" />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-accent" />
                策略参数
              </h4>
              <div className="space-y-2">
                {Object.entries(detailStrategy.parameters).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-black/20 rounded-glass-sm border border-white/[0.04]"
                  >
                    <span className="text-sm text-text-secondary">{key}</span>
                    <span className="text-sm font-mono text-text-primary">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                最近信号
              </h4>
              {strategySignals.length === 0 ? (
                <div className="text-xs text-text-tertiary py-4 text-center bg-black/20 rounded-glass-sm border border-white/[0.04]">
                  暂无信号记录
                </div>
              ) : (
                <div className="space-y-2">
                  {strategySignals.map((signal) => {
                    const cfg = SIGNAL_TYPE_CONFIG[signal.signalType]
                    const SigIcon = cfg.icon
                    return (
                      <div
                        key={signal.id}
                        className="flex items-center justify-between p-3 bg-black/20 rounded-glass-sm border border-white/[0.04]"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${cfg.bg}`}>
                            <SigIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-text-primary">{signal.stockName}</span>
                              <span className="text-[10px] text-text-tertiary font-mono">{signal.stockCode}</span>
                              <GlassBadge variant={signal.signalType === 'buy' ? 'up' : signal.signalType === 'sell' ? 'down' : 'default'} size="sm">
                                {cfg.label}
                              </GlassBadge>
                            </div>
                            <p className="text-[10px] text-text-tertiary mt-0.5">{signal.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-text-primary">{formatNumber(signal.price)}</p>
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            <span className="text-[10px] text-text-tertiary">强度</span>
                            <StrengthBar value={signal.strength} size="sm" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </GlassDialog>

      <GlassDialog
        open={!!editingStrategy}
        onClose={() => setEditingStrategy(null)}
        title={`参数配置 - ${editingStrategy?.name}`}
        size="md"
        footer={
          <>
            <GlassButton variant="secondary" onClick={() => setEditingStrategy(null)}>
              取消
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handleSaveParams}
              loading={saving}
              icon={<Save className="w-4 h-4" />}
            >
              保存
            </GlassButton>
          </>
        }
      >
        {editingStrategy && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">{editingStrategy.description}</p>
            <div className="space-y-3">
              {Object.entries(editParams).map(([key, value]) => (
                <GlassInput
                  key={key}
                  label={key}
                  value={value}
                  onChange={(v) => setEditParams((prev) => ({ ...prev, [key]: v }))}
                  type={/^\d/.test(value) || /^-\d/.test(value) ? 'number' : 'text'}
                />
              ))}
            </div>
          </div>
        )}
      </GlassDialog>
    </div>
  )
}

export default StrategiesPage
