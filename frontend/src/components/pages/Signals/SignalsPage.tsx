import React, { useEffect, useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import { api } from '@/services/api'
import {
  Bell,
  Search,
  Zap,
  ScanLine,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react'

interface Signal {
  id: string
  stock_code: string
  signal_type: string
  signal_strength: number
  price: string
  description: string
  date: string
  strategy_id: string
}

interface SignalStats {
  total: number
  buy_count: number
  sell_count: number
  buy_ratio: number
  today_count: number
  week_count: number
}

export const SignalsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'buy' | 'sell'>('all')
  const [isScanning, setIsScanning] = useState(false)
  const [signals, setSignals] = useState<Signal[]>([])
  const [stats, setStats] = useState<SignalStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [signalsRes, statsRes] = await Promise.all([
          api.get<Signal[]>('/signals?limit=50'),
          api.get<SignalStats>('/signals/stats/summary'),
        ])
        setSignals(signalsRes)
        setStats(statsRes)
      } catch (e) {
        console.error('Signals fetch error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredSignals = signals.filter((signal) => {
    const matchesSearch = signal.stock_code.includes(searchQuery)
    const matchesType = typeFilter === 'all' ? true : signal.signal_type.includes(typeFilter)
    return matchesSearch && matchesType
  })

  const handleScan = async () => {
    setIsScanning(true)
    try {
      await api.post('/signals/scan', {})
      const res = await api.get<Signal[]>('/signals?limit=50')
      setSignals(res)
    } catch (e) {
      console.error('Scan error:', e)
    } finally {
      setIsScanning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary">交易信号</h1>
        </div>
        <GlassButton variant="primary" size="sm" onClick={handleScan} disabled={isScanning}>
          <ScanLine className={`w-4 h-4 mr-1 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? '扫描中...' : '扫描信号'}
        </GlassButton>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-5">
          <p className="text-xs text-text-tertiary mb-1">总信号数</p>
          <p className="text-2xl font-mono text-text-primary">{stats?.total || 0}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-text-tertiary mb-1">买入/卖出比</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-mono text-up">{stats?.buy_count || 0}</p>
            <span className="text-text-tertiary">/</span>
            <p className="text-2xl font-mono text-down">{stats?.sell_count || 0}</p>
          </div>
          <p className="text-xs text-text-tertiary mt-1">买入占比 {stats?.buy_ratio?.toFixed(1) || 0}%</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-text-tertiary mb-1">今日信号</p>
          <p className="text-2xl font-mono text-accent">{stats?.today_count || 0}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs text-text-tertiary mb-1">本周信号</p>
          <p className="text-2xl font-mono text-text-primary">{stats?.week_count || 0}</p>
        </GlassCard>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <GlassInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="搜索股票代码"
              className="pl-9 w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-tertiary" />
            <span className="text-sm text-text-tertiary">类型:</span>
            <div className="flex rounded-glass-sm overflow-hidden border border-glass-border">
              {(['all', 'buy', 'sell'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    typeFilter === type
                      ? 'bg-accent/20 text-accent'
                      : 'text-text-tertiary hover:text-text-primary'
                  }`}
                >
                  {type === 'all' ? '全部' : type === 'buy' ? '买入' : '卖出'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Signal List */}
      <div className="space-y-3">
        {filteredSignals.map((signal) => {
          const isBuy = signal.signal_type.includes('buy')
          return (
            <GlassCard key={signal.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-semibold text-text-primary">
                      {signal.stock_code}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${isBuy ? 'bg-up/10 text-up' : 'bg-down/10 text-down'}`}>
                      {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {signal.signal_type === 'strong_buy' ? '强烈买入' : isBuy ? '买入' : '卖出'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-accent/10 text-xs text-accent">
                      <Zap className="w-3 h-3" />
                      强度 {signal.signal_strength}/100
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary mb-2">{signal.description}</p>

                  <div className="flex items-center gap-4 text-xs text-text-tertiary">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(signal.date).toLocaleString('zh-CN')}
                    </span>
                    <span className="font-mono">触发价 ¥{parseFloat(signal.price).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-6 rounded-full ${
                        i < Math.round(signal.signal_strength / 20)
                          ? isBuy ? 'bg-up' : 'bg-down'
                          : 'bg-glass-bg-hover'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </GlassCard>
          )
        })}
        {filteredSignals.length === 0 && <p className="text-text-tertiary text-center py-12">暂无信号</p>}
      </div>
    </div>
  )
}

export default SignalsPage
