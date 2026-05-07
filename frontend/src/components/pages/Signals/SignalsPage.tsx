import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassTabs } from '@/components/glass/GlassTabs'
import { GlassSelect } from '@/components/glass/GlassSelect'
import { GlassBadge } from '@/components/glass/GlassBadge'
import { GlassTable } from '@/components/glass/GlassTable'
import { StatusDot } from '@/components/common/StatusDot'
import { StrengthBar } from '@/components/common/StrengthBar'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { signalsService } from '@/services/signals'
import { StrategySignal, SignalStats, SignalScanRequest } from '@/types'
import { formatCurrency, formatDateTime, formatNumber } from '@/utils/formatters'
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Radar,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react'

const SIGNAL_TYPE_TABS = [
  { key: 'all', label: '全部' },
  { key: 'buy', label: '买入', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { key: 'sell', label: '卖出', icon: <TrendingDown className="w-3.5 h-3.5" /> },
]

const SIGNAL_TYPE_BADGE_MAP: Record<string, { variant: 'up' | 'down' | 'warning'; label: string; icon: React.ReactNode }> = {
  buy: { variant: 'up', label: '买入', icon: <ArrowUpRight className="w-3 h-3" /> },
  sell: { variant: 'down', label: '卖出', icon: <ArrowDownRight className="w-3 h-3" /> },
  hold: { variant: 'warning', label: '持有', icon: <Minus className="w-3 h-3" /> },
}

export const SignalsPage: React.FC = () => {
  const [signals, setSignals] = useState<StrategySignal[]>([])
  const [stats, setStats] = useState<SignalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [strategyFilter, setStrategyFilter] = useState<string>('')
  const [strategyOptions, setStrategyOptions] = useState<{ value: string; label: string }[]>([])

  const fetchData = useCallback(async () => {
    try {
      const params: SignalScanRequest = {}
      if (activeTab !== 'all') {
        params.signalType = activeTab as 'buy' | 'sell' | 'hold'
      }
      if (strategyFilter) {
        params.strategyIds = [strategyFilter]
      }

      const [signalsRes, statsRes] = await Promise.all([
        signalsService.list(params),
        signalsService.getStats(),
      ])

      if (signalsRes.data) {
        setSignals(signalsRes.data)
      }
      if (statsRes.data) {
        setStats(statsRes.data)
      }
    } catch {
      setSignals([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [activeTab, strategyFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const uniqueStrategies = Array.from(
      new Map(signals.map((s) => [s.strategyId, s.strategyName])).entries()
    )
    setStrategyOptions([
      { value: '', label: '全部策略' },
      ...uniqueStrategies.map(([id, name]) => ({ value: id, label: name })),
    ])
  }, [signals])

  const handleScan = async () => {
    setScanning(true)
    try {
      const scanReq: SignalScanRequest = {}
      if (activeTab !== 'all') {
        scanReq.signalType = activeTab as 'buy' | 'sell' | 'hold'
      }
      const res = await signalsService.scan(scanReq)
      if (res.data) {
        setSignals(res.data)
      }
      const statsRes = await signalsService.getStats()
      if (statsRes.data) {
        setStats(statsRes.data)
      }
    } catch {
    } finally {
      setScanning(false)
    }
  }

  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      if (activeTab !== 'all' && s.signalType !== activeTab) return false
      if (strategyFilter && s.strategyId !== strategyFilter) return false
      return true
    })
  }, [signals, activeTab, strategyFilter])

  const columns = useMemo(
    () => [
      {
        key: 'triggeredAt',
        title: '时间',
        width: '160px',
        sortable: true,
        render: (_: string, row: StrategySignal) => (
          <span className="font-mono text-text-secondary text-xs">
            {formatDateTime(row.triggeredAt)}
          </span>
        ),
      },
      {
        key: 'stockName',
        title: '股票',
        width: '140px',
        sortable: true,
        render: (_: string, row: StrategySignal) => (
          <div className="flex flex-col">
            <span className="text-text-primary font-medium">{row.stockName}</span>
            <span className="text-text-tertiary text-[10px] font-mono">{row.stockCode}</span>
          </div>
        ),
      },
      {
        key: 'signalType',
        title: '信号类型',
        width: '100px',
        align: 'center' as const,
        render: (value: string) => {
          const config = SIGNAL_TYPE_BADGE_MAP[value]
          if (!config) return value
          return (
            <GlassBadge variant={config.variant} glow size="sm">
              <span className="inline-flex items-center gap-1">
                {config.icon}
                {config.label}
              </span>
            </GlassBadge>
          )
        },
      },
      {
        key: 'strength',
        title: '强度',
        width: '120px',
        sortable: true,
        render: (value: number) => (
          <div className="flex items-center gap-2">
            <StrengthBar value={value} size="sm" />
            <span className="text-text-tertiary text-xs font-mono w-8 text-right">
              {value}
            </span>
          </div>
        ),
      },
      {
        key: 'price',
        title: '价格',
        width: '110px',
        align: 'right' as const,
        sortable: true,
        render: (value: number) => (
          <span className="font-mono text-text-primary">{formatCurrency(value)}</span>
        ),
      },
      {
        key: 'strategyName',
        title: '策略来源',
        render: (_: string, row: StrategySignal) => (
          <span className="text-text-secondary text-xs">{row.strategyName}</span>
        ),
      },
    ],
    []
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary">交易信号</h1>
        </div>
        <GlassButton
          variant="primary"
          icon={<Radar className="w-4 h-4" />}
          onClick={handleScan}
          loading={scanning}
        >
          {scanning ? '扫描中...' : '手动扫描'}
        </GlassButton>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-tertiary font-medium">今日信号数</span>
            <StatusDot status="online" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-text-primary">
              {stats?.totalSignals ?? 0}
            </span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-tertiary font-medium">买入信号</span>
            <StatusDot status="online" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-up">
              {stats?.buySignals ?? 0}
            </span>
            <TrendingUp className="w-4 h-4 text-up" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-tertiary font-medium">卖出信号</span>
            <StatusDot status="error" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-down">
              {stats?.sellSignals ?? 0}
            </span>
            <TrendingDown className="w-4 h-4 text-down" />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-text-tertiary font-medium">平均强度</span>
            <StatusDot status="warning" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-warning">
              {stats?.avgStrength != null ? formatNumber(stats.avgStrength, 1) : '-'}
            </span>
            <BarChart3 className="w-4 h-4 text-warning" />
          </div>
        </GlassCard>
      </div>

      <GlassCard
        header={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <GlassTabs
              tabs={SIGNAL_TYPE_TABS}
              activeKey={activeTab}
              onChange={setActiveTab}
              size="sm"
            />
            <div className="w-48">
              <GlassSelect
                options={strategyOptions}
                value={strategyFilter}
                onChange={setStrategyFilter}
                placeholder="全部策略"
              />
            </div>
          </div>
        }
      >
        {filteredSignals.length > 0 ? (
          <GlassTable
            columns={columns}
            data={filteredSignals}
            rowKey="id"
            compact
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
            <Radar className="w-10 h-10 mb-3 opacity-30" />
            <span className="text-sm">暂无信号数据</span>
          </div>
        )}
      </GlassCard>
    </div>
  )
}

export default SignalsPage
