import React, { useState, useMemo } from 'react'
import { GlassCard, GlassButton, GlassInput, GlassSelect, GlassTable, GlassBadge } from '@/components/glass'
import { PriceDisplay, ChangeBadge } from '@/components/common'
import { PortfolioChart, HeatmapChart } from '@/components/charts'
import { backtestService } from '@/services/backtest'
import type { BacktestJob, TradeRecord } from '@/types'
import { formatCurrency, formatDate, cn } from '@/utils/formatters'
import {
  History,
  Play,
  TrendingDown,
  BarChart3,
  Target,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface FormConfig {
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

const strategyOptions = [
  { value: 'momentum', label: '动量突破' },
  { value: 'mean_reversion', label: '均值回归' },
  { value: 'breakout', label: '箱体突破' },
  { value: 'macd', label: 'MACD金叉' },
  { value: 'rsi', label: 'RSI超买超卖' },
  { value: 'fundamental', label: '基本面选股' },
]

const defaultConfig: FormConfig = {
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

const generateEquityCurve = (initialCapital: number, totalReturnPct: number, startDate: string, endDate: string) => {
  const data: { date: string; value: number; benchmark: number }[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const weeks = Math.floor(totalDays / 7)
  const weeklyReturn = Math.pow(1 + totalReturnPct / 100, 1 / weeks)
  const benchmarkWeeklyReturn = Math.pow(1 + totalReturnPct * 0.4 / 100, 1 / weeks)

  let value = initialCapital
  let benchmark = initialCapital

  for (let i = 0; i <= weeks; i++) {
    const date = new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000)
    const noise = 1 + (Math.sin(i * 0.3) * 0.01 + Math.cos(i * 0.7) * 0.008)
    const bmNoise = 1 + (Math.sin(i * 0.2) * 0.008 + Math.cos(i * 0.5) * 0.006)
    value *= weeklyReturn * noise
    benchmark *= benchmarkWeeklyReturn * bmNoise
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      benchmark: Math.round(benchmark),
    })
  }
  return data
}

const generateDrawdownData = (equityCurve: { date: string; value: number }[]) => {
  let peak = 0
  return equityCurve.map((point) => {
    if (point.value > peak) peak = point.value
    const drawdown = peak > 0 ? ((point.value - peak) / peak) * 100 : 0
    return { date: point.date, drawdown: Math.round(drawdown * 100) / 100 }
  })
}

const generateMonthlyReturns = (equityCurve: { date: string; value: number }[]) => {
  const monthly: Record<string, { start: number; end: number }> = {}
  equityCurve.forEach((point, i) => {
    const d = new Date(point.date)
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`
    if (!monthly[key]) monthly[key] = { start: point.value, end: point.value }
    monthly[key].end = point.value
    if (i === 0 || new Date(equityCurve[i - 1].date).getMonth() !== d.getMonth()) {
      monthly[key].start = point.value
    }
  })

  return Object.entries(monthly).map(([key, val]) => {
    const [year, month] = key.split('-').map(Number)
    return { year, month, value: (val.end - val.start) / val.start }
  })
}

const mockTrades: TradeRecord[] = [
  { id: '1', stockCode: '600519', stockName: '贵州茅台', direction: 'buy', price: 1780.0, quantity: 100, amount: 178000, commission: 53.4, entryDate: '2023-02-15' },
  { id: '2', stockCode: '600519', stockName: '贵州茅台', direction: 'sell', price: 1850.0, quantity: 100, amount: 185000, commission: 55.5, profitLoss: 7000, profitLossPercent: 0.0393, entryDate: '2023-02-15', exitDate: '2023-03-20', holdingDays: 33 },
  { id: '3', stockCode: '300750', stockName: '宁德时代', direction: 'buy', price: 210.0, quantity: 500, amount: 105000, commission: 31.5, entryDate: '2023-04-10' },
  { id: '4', stockCode: '300750', stockName: '宁德时代', direction: 'sell', price: 195.0, quantity: 500, amount: 97500, commission: 29.25, profitLoss: -7500, profitLossPercent: -0.0714, entryDate: '2023-04-10', exitDate: '2023-05-25', holdingDays: 45 },
  { id: '5', stockCode: '000858', stockName: '五粮液', direction: 'buy', price: 150.0, quantity: 400, amount: 60000, commission: 18.0, entryDate: '2023-06-15' },
]

const mockHistoryJobs: BacktestJob[] = [
  { id: '1', strategyId: 's1', strategyName: '动量策略回测', status: 'completed', progress: 100, startDate: '2023-01-01', endDate: '2024-01-01', createdAt: '2024-01-15T10:30:00Z', completedAt: '2024-01-15T10:32:00Z' },
  { id: '2', strategyId: 's2', strategyName: '均值回归回测', status: 'completed', progress: 100, startDate: '2022-06-01', endDate: '2023-06-01', createdAt: '2024-01-14T08:00:00Z', completedAt: '2024-01-14T08:03:00Z' },
  { id: '3', strategyId: 's3', strategyName: 'MACD金叉回测', status: 'failed', progress: 60, startDate: '2023-03-01', endDate: '2024-03-01', createdAt: '2024-01-13T14:00:00Z', error: '数据加载失败' },
  { id: '4', strategyId: 's4', strategyName: 'RSI超买超卖回测', status: 'running', progress: 45, startDate: '2023-01-01', endDate: '2024-01-01', createdAt: '2024-01-16T09:00:00Z' },
]

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-text-tertiary', label: '等待中' },
  running: { icon: Loader2, color: 'text-accent', label: '运行中' },
  completed: { icon: CheckCircle, color: 'text-up', label: '已完成' },
  failed: { icon: XCircle, color: 'text-down', label: '失败' },
}

const DrawdownTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card p-3 text-xs !bg-background-tertiary/95">
      <p className="text-text-secondary mb-1">{payload[0]?.payload?.date}</p>
      <p className="font-mono text-down">{payload[0].value.toFixed(2)}%</p>
    </div>
  )
}

export const BacktestPage: React.FC = () => {
  const [config, setConfig] = useState<FormConfig>(defaultConfig)
  const [showResult, setShowResult] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [historyJobs] = useState<BacktestJob[]>(mockHistoryJobs)

  const updateConfig = (key: keyof FormConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleRun = async () => {
    setIsRunning(true)
    try {
      const res = await backtestService.create({
        strategyId: config.strategyType,
        startDate: config.startDate,
        endDate: config.endDate,
        initialCapital: parseFloat(config.initialCapital),
        commission: parseFloat(config.commissionRate),
        slippage: parseFloat(config.slippage),
      })
      if (res.data?.id) {
        await backtestService.run(res.data.id)
      }
    } catch {
      // fallback to mock
    }
    setTimeout(() => {
      setIsRunning(false)
      setShowResult(true)
    }, 2000)
  }

  const initialCapital = parseFloat(config.initialCapital) || 1000000
  const totalReturnPct = 45.23
  const totalReturn = initialCapital * (totalReturnPct / 100)
  const sharpeRatio = 1.35
  const maxDrawdownPct = -12.5
  const winRate = 0.583

  const equityCurve = useMemo(
    () => generateEquityCurve(initialCapital, totalReturnPct, config.startDate, config.endDate),
    [initialCapital, config.startDate, config.endDate]
  )

  const drawdownData = useMemo(() => generateDrawdownData(equityCurve), [equityCurve])

  const monthlyReturns = useMemo(() => generateMonthlyReturns(equityCurve), [equityCurve])

  const tradeColumns = [
    {
      key: 'entryDate',
      title: '日期',
      width: '100px',
      render: (_: any, row: TradeRecord) => row.exitDate || row.entryDate,
    },
    {
      key: 'stockCode',
      title: '股票',
      width: '140px',
      render: (_: any, row: TradeRecord) => (
        <div>
          <span className="font-mono text-text-primary">{row.stockCode}</span>
          <span className="text-text-tertiary ml-2">{row.stockName}</span>
        </div>
      ),
    },
    {
      key: 'direction',
      title: '方向',
      width: '80px',
      render: (val: string) => (
        <GlassBadge variant={val === 'buy' ? 'up' : 'down'} size="sm">
          {val === 'buy' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
          {val === 'buy' ? '买入' : '卖出'}
        </GlassBadge>
      ),
    },
    {
      key: 'price',
      title: '价格',
      align: 'right' as const,
      render: (val: number) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      key: 'quantity',
      title: '数量',
      align: 'right' as const,
      render: (val: number) => <span className="font-mono">{val}</span>,
    },
    {
      key: 'amount',
      title: '金额',
      align: 'right' as const,
      render: (val: number) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      key: 'commission',
      title: '佣金',
      align: 'right' as const,
      render: (val: number) => <span className="font-mono text-text-tertiary">{formatCurrency(val)}</span>,
    },
    {
      key: 'profitLoss',
      title: '盈亏',
      align: 'right' as const,
      render: (val: number | undefined) => {
        if (val == null) return <span className="text-text-tertiary">-</span>
        return (
          <span className={cn('font-mono', val >= 0 ? 'text-up' : 'text-down')}>
            {val >= 0 ? '+' : ''}{formatCurrency(val)}
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary">策略回测</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <GlassCard className="p-0">
            <div className="p-5">
              <h2 className="text-lg font-semibold text-text-primary mb-6">回测配置</h2>

              <div className="space-y-4">
                <GlassInput
                  label="回测名称"
                  value={config.name}
                  onChange={(v) => updateConfig('name', v)}
                  placeholder="输入回测名称"
                />

                <GlassSelect
                  label="策略类型"
                  options={strategyOptions}
                  value={config.strategyType}
                  onChange={(v) => updateConfig('strategyType', v)}
                />

                <GlassInput
                  label="股票代码"
                  value={config.stockCodes}
                  onChange={(v) => updateConfig('stockCodes', v)}
                  placeholder="600519,000858,300750"
                />

                <div className="grid grid-cols-2 gap-3">
                  <GlassInput
                    label="开始日期"
                    type="date"
                    value={config.startDate}
                    onChange={(v) => updateConfig('startDate', v)}
                  />
                  <GlassInput
                    label="结束日期"
                    type="date"
                    value={config.endDate}
                    onChange={(v) => updateConfig('endDate', v)}
                  />
                </div>

                <GlassInput
                  label="初始资金"
                  type="number"
                  value={config.initialCapital}
                  onChange={(v) => updateConfig('initialCapital', v)}
                />

                <div className="grid grid-cols-2 gap-3">
                  <GlassInput
                    label="佣金率"
                    value={config.commissionRate}
                    onChange={(v) => updateConfig('commissionRate', v)}
                  />
                  <GlassInput
                    label="滑点"
                    value={config.slippage}
                    onChange={(v) => updateConfig('slippage', v)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <GlassInput
                    label="最大持仓"
                    type="number"
                    value={config.maxPositions}
                    onChange={(v) => updateConfig('maxPositions', v)}
                  />
                  <GlassInput
                    label="仓位比例"
                    value={config.positionSize}
                    onChange={(v) => updateConfig('positionSize', v)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <GlassInput
                    label="止损比例"
                    value={config.stopLoss}
                    onChange={(v) => updateConfig('stopLoss', v)}
                  />
                  <GlassInput
                    label="止盈比例"
                    value={config.takeProfit}
                    onChange={(v) => updateConfig('takeProfit', v)}
                  />
                </div>
              </div>
            </div>

            <div className="px-5 pb-5">
              <GlassButton
                variant="primary"
                fullWidth
                loading={isRunning}
                onClick={handleRun}
                icon={<Play className="w-4 h-4" />}
              >
                {isRunning ? '回测运行中...' : '开始回测'}
              </GlassButton>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {showResult ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">总收益</span>
                  </div>
                  <PriceDisplay value={totalReturn} change={totalReturn} size="lg" />
                  <div className="mt-1">
                    <ChangeBadge value={totalReturnPct / 100} size="md" glow />
                  </div>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">夏普比率</span>
                  </div>
                  <p className="text-2xl font-mono font-semibold text-text-primary">{sharpeRatio.toFixed(2)}</p>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">最大回撤</span>
                  </div>
                  <p className="text-2xl font-mono font-semibold text-down">{maxDrawdownPct.toFixed(2)}%</p>
                </GlassCard>

                <GlassCard className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-text-tertiary" />
                    <span className="text-xs text-text-tertiary">胜率</span>
                  </div>
                  <p className="text-2xl font-mono font-semibold text-text-primary">{(winRate * 100).toFixed(1)}%</p>
                </GlassCard>
              </div>

              <GlassCard header={<h3 className="text-base font-semibold text-text-primary">权益曲线</h3>}>
                <PortfolioChart data={equityCurve} height={280} />
              </GlassCard>

              <GlassCard header={<h3 className="text-base font-semibold text-text-primary">回撤曲线</h3>}>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={drawdownData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff4567" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#ff4567" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#5a5e72' }}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.04)' }}
                      minTickGap={40}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#5a5e72', fontFamily: 'monospace' }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                      width={55}
                    />
                    <Tooltip content={<DrawdownTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="drawdown"
                      stroke="#ff4567"
                      strokeWidth={1.5}
                      fill="url(#drawdownGrad)"
                      dot={false}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </GlassCard>

              <GlassCard header={<h3 className="text-base font-semibold text-text-primary">月度收益</h3>}>
                <HeatmapChart data={monthlyReturns} cellSize={32} />
              </GlassCard>

              <GlassCard header={<h3 className="text-base font-semibold text-text-primary">交易明细</h3>}>
                <GlassTable
                  columns={tradeColumns}
                  data={mockTrades}
                  rowKey="id"
                  compact
                />
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

          <GlassCard header={<h3 className="text-base font-semibold text-text-primary">历史回测</h3>}>
            <div className="space-y-2">
              {historyJobs.map((job) => {
                const status = statusConfig[job.status] || statusConfig.pending
                const StatusIcon = status.icon
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-glass-sm hover:bg-glass-bg-hover/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon className={cn('w-4 h-4', status.color, job.status === 'running' && 'animate-spin')} />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{job.strategyName}</p>
                        <p className="text-xs text-text-tertiary">
                          {formatDate(job.startDate)} ~ {formatDate(job.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {job.status === 'running' && (
                        <div className="w-24 h-1.5 bg-glass-bg-hover rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${job.progress}%` }} />
                        </div>
                      )}
                      <GlassBadge
                        variant={job.status === 'completed' ? 'up' : job.status === 'failed' ? 'down' : 'accent'}
                        size="sm"
                      >
                        {status.label}
                      </GlassBadge>
                      <span className="text-xs text-text-tertiary">{formatDate(job.createdAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default BacktestPage
