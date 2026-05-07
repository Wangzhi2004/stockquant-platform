import React, { useEffect, useState, useMemo } from 'react'
import { GlassCard, GlassInput, GlassTable, GlassDialog, GlassSelect, GlassBadge } from '@/components/glass'
import { PriceDisplay, ChangeBadge, LoadingSpinner } from '@/components/common'
import { KlineChart, Sparkline } from '@/components/charts'
import { useMarket, useWebSocket } from '@/hooks'
import { formatNumber, formatVolume, cn } from '@/utils/formatters'
import { BarChart3, Search, Flame } from 'lucide-react'
import type { Stock } from '@/types'

export const MarketPage: React.FC = () => {
  const {
    stocks,
    indices,
    hotSectors,
    currentStock,
    klineData,
    loading,
    fetchStocks,
    fetchIndices,
    fetchHotSectors,
    fetchKline,
    setCurrentStock,
  } = useMarket()

  const [searchQuery, setSearchQuery] = useState('')
  const [exchangeFilter, setExchangeFilter] = useState('all')
  const [sectorFilter, setSectorFilter] = useState('all')
  const [klineDialogOpen, setKlineDialogOpen] = useState(false)
  const [klineLoading, setKlineLoading] = useState(false)
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
    fetchStocks({ pageSize: 50 })
    fetchHotSectors()
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

  const handleStockClick = async (stock: Stock) => {
    setCurrentStock(stock)
    setKlineDialogOpen(true)
    setKlineLoading(true)
    await fetchKline(stock.code, { period: '1d', limit: 120 })
    setKlineLoading(false)
  }

  const handleCloseKlineDialog = () => {
    setKlineDialogOpen(false)
    setCurrentStock(null)
  }

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchesSearch = searchQuery
        ? stock.code.includes(searchQuery) || stock.name.includes(searchQuery)
        : true
      const matchesExchange = exchangeFilter === 'all'
        ? true
        : stock.exchange === exchangeFilter
      const matchesSector = sectorFilter === 'all'
        ? true
        : stock.industry === sectorFilter
      return matchesSearch && matchesExchange && matchesSector
    })
  }, [stocks, searchQuery, exchangeFilter, sectorFilter])

  const exchangeOptions = [
    { value: 'all', label: '全部交易所' },
    { value: 'SH', label: '沪市' },
    { value: 'SZ', label: '深市' },
  ]

  const sectorOptions = useMemo(() => [
    { value: 'all', label: '全部板块' },
    ...Array.from(new Set(stocks.filter(s => s.industry).map(s => s.industry!))).map(industry => ({
      value: industry,
      label: industry,
    })),
  ], [stocks])

  const stockColumns = [
    {
      key: 'code',
      title: '代码',
      sortable: true,
      width: '100px',
      render: (value: string) => (
        <span className="font-mono text-text-primary">{value}</span>
      ),
    },
    {
      key: 'name',
      title: '名称',
      sortable: true,
      width: '100px',
      render: (value: string) => (
        <span className="text-text-secondary">{value}</span>
      ),
    },
    {
      key: 'currentPrice',
      title: '最新价',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <PriceDisplay value={value} size="sm" />
      ),
    },
    {
      key: 'changePercent',
      title: '涨跌幅',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <ChangeBadge value={value} size="sm" />
      ),
    },
    {
      key: 'volume',
      title: '成交量',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-mono text-text-tertiary">{formatVolume(value)}</span>
      ),
    },
    {
      key: 'amount',
      title: '成交额',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-mono text-text-tertiary">{formatVolume(value)}</span>
      ),
    },
  ]

  const klineChartData = useMemo(() => {
    return klineData.map(d => ({
      date: d.timestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: d.volume,
    }))
  }, [klineData])

  if (loading && stocks.length === 0 && indices.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-bold text-text-primary">市场行情</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {indices.slice(0, 3).map((idx) => (
          <GlassCard key={idx.code} className="p-5" hover>
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm text-text-tertiary">{idx.name}</span>
              <Sparkline data={sparklineData[idx.code] || []} width={80} height={28} />
            </div>
            <PriceDisplay value={idx.currentPrice} change={idx.change} size="lg" />
            <div className="mt-2 flex items-center gap-2">
              <ChangeBadge value={idx.changePercent} size="sm" />
              <span className={cn('text-xs font-mono', idx.change >= 0 ? 'text-up' : 'text-down')}>
                {idx.change >= 0 ? '+' : ''}{formatNumber(idx.change)}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary">股票列表</h2>
              <div className="flex items-center gap-3">
                <GlassInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="搜索股票代码/名称"
                  icon={<Search className="w-4 h-4" />}
                  className="w-56"
                />
                <GlassSelect
                  options={exchangeOptions}
                  value={exchangeFilter}
                  onChange={setExchangeFilter}
                  className="w-32"
                />
                <GlassSelect
                  options={sectorOptions}
                  value={sectorFilter}
                  onChange={setSectorFilter}
                  className="w-32"
                />
              </div>
            </div>
            <GlassTable
              columns={stockColumns}
              data={filteredStocks}
              rowKey="code"
              onRowClick={handleStockClick}
              hover
            />
          </GlassCard>
        </div>

        <div className="space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-text-primary">热门板块</h2>
            </div>
            <div className="space-y-3">
              {hotSectors.map((sector) => (
                <div
                  key={sector.code}
                  className="p-3 rounded-glass-sm bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">{sector.name}</span>
                    <ChangeBadge value={sector.changePercent} size="sm" />
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-2">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        sector.changePercent >= 0 ? 'bg-up' : 'bg-down'
                      )}
                      style={{ width: `${Math.min(100, Math.abs(sector.changePercent) * 10 + 50)}%` }}
                    />
                  </div>
                  {sector.topStocks && sector.topStocks.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {sector.topStocks.slice(0, 3).map((s) => (
                        <GlassBadge key={s.code} variant={s.changePercent >= 0 ? 'up' : 'down'} size="sm">
                          {s.name}
                        </GlassBadge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {hotSectors.length === 0 && <p className="text-text-tertiary text-sm">暂无数据</p>}
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassDialog
        open={klineDialogOpen}
        onClose={handleCloseKlineDialog}
        title={currentStock ? `${currentStock.name} (${currentStock.code})` : ''}
        size="lg"
      >
        {klineLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="md" />
          </div>
        ) : klineChartData.length > 0 ? (
          <KlineChart data={klineChartData} height={400} showVolume showMacd />
        ) : (
          <p className="text-text-tertiary text-sm text-center py-8">暂无K线数据</p>
        )}
      </GlassDialog>
    </div>
  )
}

export default MarketPage
