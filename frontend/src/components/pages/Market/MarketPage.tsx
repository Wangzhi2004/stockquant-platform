import React, { useEffect, useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassInput } from '@/components/glass/GlassInput'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Search,
  Activity,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { api } from '@/services/api'

interface IndexData {
  code: string
  name: string
  price: number
  change: number
  changePct: number
}

interface StockData {
  code: string
  name: string
  price: number
  change: number
  changePct: number
  volume: number
  turnover: string
  pe: number
  marketCap: string
}

interface SectorData {
  name: string
  changePct: number
  leadingStock: string
  heat: number
}

export const MarketPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'up' | 'down'>('all')
  const [indices, setIndices] = useState<IndexData[]>([])
  const [stocks, setStocks] = useState<StockData[]>([])
  const [sectors, setSectors] = useState<SectorData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [indicesRes, sectorsRes] = await Promise.all([
          api.get<any[]>('/market/indices'),
          api.get<any[]>('/market/hot-sectors?limit=10'),
        ])

        setIndices(indicesRes.map((i) => ({
          code: i.code,
          name: i.name,
          price: parseFloat(i.price),
          change: parseFloat(i.change),
          changePct: parseFloat(i.change_pct),
        })))

        setSectors(sectorsRes.map((s) => ({
          name: s.name,
          changePct: parseFloat(s.change_pct),
          leadingStock: s.leading_stock || '-',
          heat: Math.min(100, Math.max(0, parseFloat(s.change_pct) * 10 + 50)),
        })))

        // Fetch hot stocks from AKShare real-time
        const akshare = await import('@/services/akshare')
        const hotStocks = await akshare.getHotStocks(20)
        setStocks(hotStocks)
      } catch (e) {
        console.error('Market fetch error:', e)
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
        setIndices(msg.data.map((i: any) => ({
          code: i.code,
          name: i.name,
          price: i.price,
          change: i.change,
          changePct: i.change_pct,
        })))
      }
    }
    ws.onerror = () => {}

    return () => ws.close()
  }, [])

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.code.includes(searchQuery) || stock.name.includes(searchQuery)
    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'up'
        ? stock.changePct > 0
        : stock.changePct < 0
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-bold text-text-primary">市场行情</h1>
      </div>

      {/* Index Cards - Real-time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {indices.map((index) => (
          <GlassCard key={index.code} className="p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm text-text-tertiary">{index.name}</span>
              <Activity className="w-4 h-4 text-text-tertiary" />
            </div>
            <div className="text-2xl font-mono text-text-primary mb-2">
              {index.price.toLocaleString()}
            </div>
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-1 text-sm font-mono ${
                  index.change >= 0 ? 'text-up' : 'text-down'
                }`}
              >
                {index.change >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {index.change >= 0 ? '+' : ''}
                  {index.change.toFixed(2)}
                </span>
                <span>({index.change >= 0 ? '+' : ''}{index.changePct.toFixed(2)}%)</span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Table */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">股票列表</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                  <GlassInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="搜索股票代码/名称"
                    className="pl-9 w-56"
                  />
                </div>
                <div className="flex rounded-glass-sm overflow-hidden border border-glass-border">
                  {(['all', 'up', 'down'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                        filterType === type
                          ? 'bg-accent/20 text-accent'
                          : 'text-text-tertiary hover:text-text-primary'
                      }`}
                    >
                      {type === 'all' ? '全部' : type === 'up' ? '上涨' : '下跌'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-text-tertiary border-b border-glass-border">
                    <th className="pb-3 font-medium">股票</th>
                    <th className="pb-3 font-medium text-right">最新价</th>
                    <th className="pb-3 font-medium text-right">涨跌幅</th>
                    <th className="pb-3 font-medium text-right">成交量</th>
                    <th className="pb-3 font-medium text-right">市值</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => (
                    <tr
                      key={stock.code}
                      className="border-b border-glass-border/50 hover:bg-glass-bg-hover/30 transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-text-primary">{stock.code}</span>
                          <span className="text-sm text-text-secondary">{stock.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-text-primary">
                        ¥{stock.price.toFixed(2)}
                      </td>
                      <td
                        className={`py-3 text-right font-mono text-sm ${
                          stock.changePct >= 0 ? 'text-up' : 'text-down'
                        }`}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {stock.changePct >= 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {stock.changePct >= 0 ? '+' : ''}
                            {stock.changePct.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-text-primary">
                        {stock.volume.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-text-secondary">
                        {stock.marketCap}
                      </td>
                    </tr>
                  ))}
                  {filteredStocks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-tertiary text-sm">
                        暂无数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Hot Sectors */}
        <div className="space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">热门板块</h2>
            </div>

            <div className="space-y-3">
              {sectors.map((sector) => (
                <div
                  key={sector.name}
                  className="flex items-center justify-between p-3 rounded-glass-sm bg-glass-bg-hover/20 hover:bg-glass-bg-hover/40 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-text-primary">{sector.name}</span>
                      <div className="flex-1 h-1.5 bg-glass-bg-hover rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${sector.heat}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-text-tertiary">龙头: {sector.leadingStock}</span>
                  </div>
                  <div
                    className={`text-right font-mono text-sm ${
                      sector.changePct >= 0 ? 'text-up' : 'text-down'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {sector.changePct >= 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {sector.changePct >= 0 ? '+' : ''}
                        {sector.changePct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {sectors.length === 0 && <p className="text-text-tertiary text-sm">暂无数据</p>}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default MarketPage
