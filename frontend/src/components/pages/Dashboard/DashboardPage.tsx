import React, { useEffect, useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { PortfolioChart } from '@/components/charts'
import { TrendingUp, TrendingDown, Activity, Bell, Zap, Newspaper } from 'lucide-react'
import { api } from '@/services/api'
import { Link } from 'react-router-dom'

interface IndexQuote {
  code: string
  name: string
  price: string
  change: string
  change_pct: string
}

interface Signal {
  stock_code: string
  signal_type: string
  signal_strength: number
  price: string
  description: string
}

interface NewsItem {
  title: string
  source: string
  sentiment: string | null
  opportunity_score: string | null
  related_stocks: string | null
}

export const DashboardPage: React.FC = () => {
  const [indices, setIndices] = useState<IndexQuote[]>([])
  const [signals, setSignals] = useState<Signal[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [portfolioData, setPortfolioData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [indicesRes, signalsRes, newsRes] = await Promise.all([
          api.get<IndexQuote[]>('/market/indices'),
          api.get<Signal[]>('/signals?limit=5'),
          api.get<NewsItem[]>('/news?limit=5'),
        ])
        setIndices(indicesRes)
        setSignals(signalsRes)
        setNews(newsRes)

        // Mock portfolio history for chart
        const mockData = Array.from({ length: 30 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (29 - i))
          const base = 1000000
          const drift = Math.sin(i * 0.3) * 50000 + i * 2000
          return {
            date: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
            value: Math.round(base + drift + Math.random() * 10000),
            benchmark: Math.round(base + drift * 0.6 + Math.random() * 5000),
          }
        })
        setPortfolioData(mockData)
      } catch (e) {
        console.error('Dashboard fetch error:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // WebSocket for real-time indices
    const ws = new WebSocket('ws://localhost:8000/ws/indices')
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'indices_update') {
        setIndices(msg.data)
      }
    }
    ws.onerror = () => {}

    return () => ws.close()
  }, [])

  const totalAssets = 1234567
  const dailyPnL = 12345
  const dailyPnLPct = 1.02

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Hero Card */}
      <GlassCard className="p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-up/5" />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-text-tertiary text-sm mb-2">总资产</p>
              <h1 className="text-4xl font-mono text-text-primary">
                ¥{totalAssets.toLocaleString()}<span className="text-2xl opacity-60">.89</span>
              </h1>
            </div>
            <div className="text-right">
              <p className="text-text-tertiary text-sm mb-2">当日盈亏</p>
              <div className={`flex items-center gap-2 ${dailyPnL >= 0 ? 'text-up' : 'text-down'}`}>
                {dailyPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span className="text-2xl font-mono">{dailyPnL >= 0 ? '+' : ''}¥{dailyPnL.toLocaleString()}</span>
                <span className="text-sm">({dailyPnL >= 0 ? '+' : ''}{dailyPnLPct.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Index Cards - Real-time */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indices.slice(0, 3).map((idx) => {
          const isUp = parseFloat(idx.change_pct) >= 0
          return (
            <GlassCard key={idx.code} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="text-text-tertiary text-sm">{idx.name}</span>
                <Activity className="w-4 h-4 text-text-tertiary" />
              </div>
              <div className="text-2xl font-mono text-text-primary mb-2">{parseFloat(idx.price).toLocaleString()}</div>
              <div className={`flex items-center gap-1 ${isUp ? 'text-up' : 'text-down'}`}>
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isUp ? '+' : ''}{idx.change_pct}%</span>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Portfolio Chart */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">收益曲线</h3>
        <PortfolioChart data={portfolioData} height={300} />
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Signals */}
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
              const isBuy = s.signal_type.includes('buy')
              return (
                <div key={s.stock_code + s.signal_type} className="flex items-center justify-between py-2 border-b border-glass-border/50 last:border-0">
                  <div>
                    <span className="font-mono text-sm text-text-primary">{s.stock_code}</span>
                    <p className="text-xs text-text-tertiary mt-0.5">{s.description}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isBuy ? 'bg-up/10 text-up' : 'bg-down/10 text-down'}`}>
                      {s.signal_type === 'strong_buy' ? '强烈买入' : s.signal_type === 'buy' ? '买入' : s.signal_type === 'sell' ? '卖出' : '持有'}
                    </span>
                    <p className="text-xs text-text-tertiary mt-1">强度 {s.signal_strength}</p>
                  </div>
                </div>
              )
            })}
            {signals.length === 0 && <p className="text-text-tertiary text-sm">暂无信号</p>}
          </div>
        </GlassCard>

        {/* Latest News */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-semibold text-text-primary">机会发现</h3>
            </div>
            <Link to="/news" className="text-sm text-accent hover:underline">查看全部</Link>
          </div>
          <div className="space-y-3">
            {news.map((n, i) => {
              const sentiment = n.sentiment || 'neutral'
              const score = parseFloat(n.opportunity_score || '0')
              return (
                <div key={i} className="py-2 border-b border-glass-border/50 last:border-0">
                  <p className="text-sm text-text-primary line-clamp-2">{n.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-text-tertiary">{n.source}</span>
                    {n.related_stocks && <span className="text-xs font-mono text-accent">{n.related_stocks}</span>}
                    <span className={`text-xs ${sentiment === 'positive' ? 'text-up' : sentiment === 'negative' ? 'text-down' : 'text-text-tertiary'}`}>
                      机会分 {score.toFixed(0)}
                    </span>
                  </div>
                </div>
              )
            })}
            {news.length === 0 && <p className="text-text-tertiary text-sm">暂无新闻</p>}
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions */}
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
