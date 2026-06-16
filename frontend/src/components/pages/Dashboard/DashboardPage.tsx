import React, { useEffect, useState, useMemo } from 'react'
import { GlassCard, GlassBadge, GlassButton } from '@/components/glass'
import { PriceDisplay, ChangeBadge, StrengthBar, LoadingSpinner } from '@/components/common'
import { PortfolioChart, Sparkline, DonutChart } from '@/components/charts'
import { usePortfolio, useMarket, useWebSocket } from '@/hooks'
import { signalsService, newsService } from '@/services'
import { formatCurrency, cn } from '@/utils/formatters'
import { Wallet, Zap, Newspaper, Bell, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { StrategySignal, OpportunityScore } from '@/types'

export const DashboardPage: React.FC = () => {
  const { stats, holdings, loading: portfolioLoading } = usePortfolio()
  const { indices, fetchIndices } = useMarket()
  const [signals, setSignals] = useState<StrategySignal[]>([])
  const [opportunities, setOpportunities] = useState<OpportunityScore[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [sparklineData, setSparklineData] = useState<Record<string, number[]>>({})

  useWebSocket({
    url: 'ws://localhost:8000/ws/indices',
    onMessage: (data) => {
      if (data.type === 'indices_update') {
        fetchIndices()
      }
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [signalsRes, oppRes] = await Promise.all([
          signalsService.list({ pageSize: 5 }),
          newsService.getOpportunities({ pageSize: 3 }),
        ])
        setSignals(signalsRes.data)
        setOpportunities(oppRes.data)
      } catch {
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const data: Record<string, number[]> = {}
    indices.forEach((idx) => {
      const base = idx.currentPrice
      data[idx.code] = Array.from({ length: 20 }, (_, i) =>
        base + (Math.random() - 0.5) * base * 0.02 * (i + 1)
      )
    })
    setSparklineData(data)
  }, [indices])

  const portfolioChartData = useMemo(() => {
    const base = stats?.totalValue || 1000000
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const drift = Math.sin(i * 0.3) * 50000 + i * 2000
      return {
        date: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        value: Math.round(base + drift + Math.random() * 10000),
        benchmark: Math.round(base + drift * 0.6 + Math.random() * 5000),
      }
    })
  }, [stats?.totalValue])

  const donutSegments = useMemo(() => {
    if (!holdings.length) return []
    const colors = ['#5b8def', '#00e5a0', '#ffb347', '#ff4567', '#a855f7', '#06b6d4']
    return holdings.slice(0, 6).map((h, i) => ({
      label: h.stockName,
      value: h.marketValue || h.quantity * h.avgCost,
      color: colors[i % colors.length],
    }))
  }, [holdings])

  const totalAssets = stats?.totalValue || 0
  const dailyPnL = stats?.dailyProfitLoss || 0
  const dailyPnLPct = stats?.dailyProfitLossPercent || 0

  if (portfolioLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const signalTypeMap: Record<string, { label: string; variant: 'up' | 'down' | 'accent' | 'warning' | 'default' }> = {
    buy: { label: '买入', variant: 'up' },
    sell: { label: '卖出', variant: 'down' },
    hold: { label: '持有', variant: 'warning' },
  }

  const recommendationMap: Record<string, { label: string; variant: 'up' | 'down' | 'accent' | 'warning' | 'default' }> = {
    strong_buy: { label: '强烈买入', variant: 'up' },
    buy: { label: '买入', variant: 'up' },
    hold: { label: '持有', variant: 'warning' },
    sell: { label: '卖出', variant: 'down' },
    strong_sell: { label: '强烈卖出', variant: 'down' },
  }

  return (
    <div className="space-y-6 p-6">
      <GlassCard
        className="p-8 relative overflow-hidden"
        glow={dailyPnL >= 0 ? 'up' : 'down'}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-up/5" />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-accent" />
                <p className="text-text-tertiary text-sm">总资产</p>
              </div>
              <PriceDisplay value={totalAssets} size="xl" />
            </div>
            <div className="text-right">
              <p className="text-text-tertiary text-sm mb-2">当日盈亏</p>
              <div className="flex items-center gap-3 justify-end">
                <PriceDisplay value={Math.abs(dailyPnL)} change={dailyPnL} size="lg" />
                <ChangeBadge value={dailyPnLPct} size="md" glow />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indices.slice(0, 3).map((idx) => (
          <GlassCard key={idx.code} className="p-5" hover>
            <div className="flex justify-between items-start mb-3">
              <span className="text-text-tertiary text-sm">{idx.name}</span>
              <Sparkline data={sparklineData[idx.code] || []} width={80} height={28} />
            </div>
            <PriceDisplay value={idx.currentPrice} change={idx.change} size="lg" />
            <div className="mt-2">
              <ChangeBadge value={idx.changePercent} size="sm" />
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">收益曲线</h3>
        <PortfolioChart data={portfolioChartData} height={300} />
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-text-primary">最新信号</h3>
            </div>
            <Link to="/signals" className="text-sm text-accent hover:underline">查看全部</Link>
          </div>
          <div className="space-y-3">
            {signals.map((s) => {
              const mapped = signalTypeMap[s.signalType] || { label: s.signalType, variant: 'default' as const }
              return (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-text-primary">{s.stockCode}</span>
                    <GlassBadge variant={mapped.variant} size="sm">
                      {s.signalType === 'buy' ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : s.signalType === 'sell' ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : null}
                      {mapped.label}
                    </GlassBadge>
                  </div>
                  <div className="flex items-center gap-3">
                    <StrengthBar value={s.strength * 20} size="sm" />
                    <span className="text-xs text-text-tertiary font-mono">{s.strength.toFixed(1)}</span>
                  </div>
                </div>
              )
            })}
            {signals.length === 0 && <p className="text-text-tertiary text-sm">暂无信号</p>}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-text-primary">机会发现</h3>
            </div>
            <Link to="/news" className="text-sm text-accent hover:underline">查看全部</Link>
          </div>
          <div className="space-y-3">
            {opportunities.map((opp) => {
              const rec = recommendationMap[opp.recommendation] || { label: opp.recommendation, variant: 'default' as const }
              return (
                <div key={opp.stockCode} className="py-2 border-b border-white/[0.04] last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-text-primary">{opp.stockCode}</span>
                      <span className="text-sm text-text-secondary">{opp.stockName}</span>
                    </div>
                    <GlassBadge variant={rec.variant} size="sm">{rec.label}</GlassBadge>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          opp.score >= 70 ? 'bg-up' : opp.score >= 40 ? 'bg-warning' : 'bg-down'
                        )}
                        style={{ width: `${opp.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-text-tertiary">{opp.score}分</span>
                  </div>
                </div>
              )
            })}
            {opportunities.length === 0 && <p className="text-text-tertiary text-sm">暂无机会</p>}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold text-text-primary">持仓概览</h3>
        </div>
        {donutSegments.length > 0 ? (
          <div className="flex items-center gap-8">
            <DonutChart segments={donutSegments} size={140} strokeWidth={16} />
            <div className="flex-1 space-y-2">
              {stats && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">持仓数量</span>
                    <span className="text-text-primary font-mono">{stats.holdingsCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">总市值</span>
                    <span className="text-text-primary font-mono">{formatCurrency(stats.totalValue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">总成本</span>
                    <span className="text-text-primary font-mono">{formatCurrency(stats.totalCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-tertiary">总盈亏</span>
                    <span className={cn('font-mono', stats.totalProfitLoss >= 0 ? 'text-up' : 'text-down')}>
                      {formatCurrency(stats.totalProfitLoss)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-text-tertiary text-sm">暂无持仓</p>
        )}
      </GlassCard>

      <div className="flex gap-4">
        <Link to="/signals">
          <GlassButton variant="primary" size="md">
            <Bell className="w-4 h-4 mr-2" />
            查看信号
          </GlassButton>
        </Link>
        <Link to="/portfolio">
          <GlassButton variant="secondary" size="md">持仓管理</GlassButton>
        </Link>
        <Link to="/backtest">
          <GlassButton variant="secondary" size="md">策略回测</GlassButton>
        </Link>
      </div>
    </div>
  )
}

export default DashboardPage
