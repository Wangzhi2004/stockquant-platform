import React, { useState, useMemo, useCallback } from 'react'
import {
  GlassCard,
  GlassTable,
  GlassDialog,
  GlassBadge,
  GlassButton,
  GlassInput,
  GlassTabs,
} from '@/components/glass'
import { PriceDisplay, ChangeBadge } from '@/components/common'
import { DonutChart, PortfolioChart } from '@/components/charts'
import { usePortfolio } from '@/hooks/usePortfolio'
import { formatCurrency, formatPercent, formatDate, formatNumber } from '@/utils/formatters'
import type { Holding, Transaction } from '@/types'
import {
  Briefcase,
  Plus,
  TrendingUp,
  Wallet,
  PieChart,
  BarChart3,
  Loader2,
} from 'lucide-react'

const ALLOCATION_COLORS = [
  '#5b8def',
  '#00e5a0',
  '#ff4567',
  '#ffb347',
  '#a78bfa',
  '#f472b6',
  '#34d399',
  '#fbbf24',
]

const generateMockChartData = (totalValue: number) => {
  const data = []
  const baseValue = totalValue * 0.85
  const benchmarkBase = totalValue * 0.85
  for (let i = 90; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const progress = (90 - i) / 90
    const noise = Math.sin(i * 0.3) * 0.03 + Math.cos(i * 0.7) * 0.02
    const benchmarkNoise = Math.sin(i * 0.2) * 0.02 + Math.cos(i * 0.5) * 0.015
    data.push({
      date: `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`,
      value: Math.round(baseValue * (1 + progress * 0.18 + noise)),
      benchmark: Math.round(benchmarkBase * (1 + progress * 0.08 + benchmarkNoise)),
    })
  }
  return data
}

export const PortfolioPage: React.FC = () => {
  const {
    portfolios,
    currentPortfolio,
    holdings,
    transactions,
    stats,
    loading,
    error,
    createPortfolio,
    setCurrentPortfolio,
    addHolding,
    clearError,
  } = usePortfolio()

  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions' | 'performance'>('holdings')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [addHoldingDialogOpen, setAddHoldingDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '', initialCapital: '' })
  const [holdingForm, setHoldingForm] = useState({ stockCode: '', stockName: '', quantity: '', avgCost: '' })

  const allocationSegments = useMemo(() => {
    if (!holdings.length) return []
    return holdings.map((h, i) => ({
      label: h.stockName || h.stockCode,
      value: h.marketValue || h.avgCost * h.quantity,
      color: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
    }))
  }, [holdings])

  const chartData = useMemo(() => {
    if (!stats) return []
    return generateMockChartData(stats.totalValue)
  }, [stats])

  const totalMarketValue = useMemo(() => {
    return holdings.reduce((sum, h) => sum + (h.marketValue || h.avgCost * h.quantity), 0)
  }, [holdings])

  const holdingColumns = useMemo(() => [
    {
      key: 'stockCode',
      title: '股票代码',
      sortable: true,
      width: '100px',
      render: (_: string, row: Holding) => (
        <span className="font-mono text-text-primary">{row.stockCode}</span>
      ),
    },
    {
      key: 'stockName',
      title: '名称',
      sortable: true,
      width: '90px',
      render: (_: string, row: Holding) => (
        <span className="text-text-secondary">{row.stockName}</span>
      ),
    },
    {
      key: 'quantity',
      title: '持仓数量',
      sortable: true,
      align: 'right' as const,
      render: (val: number) => <span className="font-mono">{formatNumber(val, 0)}</span>,
    },
    {
      key: 'avgCost',
      title: '成本价',
      sortable: true,
      align: 'right' as const,
      render: (val: number) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      key: 'currentPrice',
      title: '现价',
      sortable: true,
      align: 'right' as const,
      render: (val: number) => (
        <span className="font-mono">{val ? formatCurrency(val) : '-'}</span>
      ),
    },
    {
      key: 'profitLoss',
      title: '盈亏',
      sortable: true,
      align: 'right' as const,
      render: (val: number) => (
        <span className={`font-mono ${val != null && val >= 0 ? 'text-up' : val != null ? 'text-down' : 'text-text-tertiary'}`}>
          {val != null ? formatCurrency(val) : '-'}
        </span>
      ),
    },
    {
      key: 'profitLossPercent',
      title: '盈亏%',
      sortable: true,
      align: 'right' as const,
      render: (val: number) =>
        val != null ? (
          <ChangeBadge value={val} size="sm" />
        ) : (
          <span className="text-text-tertiary">-</span>
        ),
    },
    {
      key: 'marketValue',
      title: '仓位占比',
      sortable: true,
      align: 'right' as const,
      render: (val: number) => {
        const pct = totalMarketValue > 0 ? (val || 0) / totalMarketValue : 0
        return <span className="font-mono text-text-secondary">{formatPercent(pct)}</span>
      },
    },
  ], [totalMarketValue])

  const transactionColumns = useMemo(() => [
    {
      key: 'transactionDate',
      title: '日期',
      sortable: true,
      width: '100px',
      render: (val: string) => <span className="text-text-secondary">{formatDate(val)}</span>,
    },
    {
      key: 'stockCode',
      title: '股票',
      sortable: true,
      render: (_: string, row: Transaction) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-text-primary">{row.stockCode}</span>
          <span className="text-text-secondary text-xs">{row.stockName}</span>
        </div>
      ),
    },
    {
      key: 'type',
      title: '方向',
      sortable: true,
      width: '70px',
      align: 'center' as const,
      render: (val: 'buy' | 'sell') => (
        <GlassBadge variant={val === 'buy' ? 'up' : 'down'} size="sm">
          {val === 'buy' ? '买入' : '卖出'}
        </GlassBadge>
      ),
    },
    {
      key: 'price',
      title: '价格',
      sortable: true,
      align: 'right' as const,
      render: (val: number) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      key: 'quantity',
      title: '数量',
      sortable: true,
      align: 'right' as const,
      render: (val: number) => <span className="font-mono">{formatNumber(val, 0)}</span>,
    },
    {
      key: 'amount',
      title: '金额',
      sortable: true,
      align: 'right' as const,
      render: (val: number) => <span className="font-mono">{formatCurrency(val)}</span>,
    },
    {
      key: 'fee',
      title: '手续费',
      sortable: true,
      align: 'right' as const,
      render: (val: number) => (
        <span className="font-mono text-text-tertiary">{formatCurrency(val)}</span>
      ),
    },
  ], [])

  const handleCreatePortfolio = useCallback(async () => {
    if (!createForm.name.trim()) return
    await createPortfolio({
      name: createForm.name.trim(),
      description: createForm.description.trim(),
    })
    setCreateDialogOpen(false)
    setCreateForm({ name: '', description: '', initialCapital: '' })
  }, [createForm, createPortfolio])

  const handleAddHolding = useCallback(async () => {
    if (!currentPortfolio || !holdingForm.stockCode.trim() || !holdingForm.quantity || !holdingForm.avgCost) return
    await addHolding(currentPortfolio.id, {
      stockCode: holdingForm.stockCode.trim(),
      stockName: holdingForm.stockName.trim(),
      quantity: Number(holdingForm.quantity),
      avgCost: Number(holdingForm.avgCost),
    })
    setAddHoldingDialogOpen(false)
    setHoldingForm({ stockCode: '', stockName: '', quantity: '', avgCost: '' })
  }, [currentPortfolio, holdingForm, addHolding])

  const tabs = [
    { key: 'holdings', label: '持仓明细', icon: <PieChart className="w-3.5 h-3.5" /> },
    { key: 'transactions', label: '交易记录', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { key: 'performance', label: '收益曲线', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  ]

  if (loading && portfolios.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary">投资组合</h1>
        </div>
        <GlassButton
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateDialogOpen(true)}
        >
          新建组合
        </GlassButton>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-glass-sm bg-down/10 border border-down/20 text-down text-sm">
          <span>{error}</span>
          <button onClick={clearError} className="ml-auto text-down/60 hover:text-down">
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolios.map((portfolio) => {
          const isSelected = currentPortfolio?.id === portfolio.id
          return (
            <GlassCard
              key={portfolio.id}
              className={isSelected ? 'ring-1 ring-accent/40' : ''}
              highlight={isSelected}
              onClick={() => setCurrentPortfolio(portfolio)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-semibold text-text-primary">{portfolio.name}</h3>
                  {portfolio.description && (
                    <p className="text-xs text-text-tertiary mt-0.5">{portfolio.description}</p>
                  )}
                </div>
                {isSelected && <GlassBadge variant="accent" size="sm">当前</GlassBadge>}
              </div>
              {isSelected && stats && (
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/[0.04]">
                  <div>
                    <p className="text-[10px] text-text-tertiary mb-1">总市值</p>
                    <PriceDisplay value={stats.totalValue} size="sm" />
                  </div>
                  <div>
                    <p className="text-[10px] text-text-tertiary mb-1">日涨跌</p>
                    <ChangeBadge value={stats.dailyProfitLossPercent} size="md" glow />
                  </div>
                  <div>
                    <p className="text-[10px] text-text-tertiary mb-1">总收益</p>
                    <span
                      className={`font-mono text-sm font-semibold ${
                        stats.totalProfitLoss >= 0 ? 'text-up' : 'text-down'
                      }`}
                    >
                      {formatCurrency(stats.totalProfitLoss)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-text-tertiary mb-1">持仓数</p>
                    <span className="font-mono text-sm text-text-primary">{stats.holdingsCount}</span>
                  </div>
                </div>
              )}
            </GlassCard>
          )
        })}
      </div>

      {currentPortfolio && stats && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <GlassCard className="lg:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-text-tertiary mb-2 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    总市值
                  </p>
                  <PriceDisplay value={stats.totalValue} change={stats.dailyProfitLoss} size="lg" />
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-2">日涨跌</p>
                  <ChangeBadge value={stats.dailyProfitLossPercent} size="md" glow />
                  <p
                    className={`font-mono text-sm mt-1 ${
                      stats.dailyProfitLoss >= 0 ? 'text-up' : 'text-down'
                    }`}
                  >
                    {formatCurrency(stats.dailyProfitLoss)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-2">总收益率</p>
                  <ChangeBadge value={stats.totalProfitLossPercent} size="md" />
                  <p
                    className={`font-mono text-sm mt-1 ${
                      stats.totalProfitLoss >= 0 ? 'text-up' : 'text-down'
                    }`}
                  >
                    {formatCurrency(stats.totalProfitLoss)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary mb-2 flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5" />
                    持仓概况
                  </p>
                  <span className="text-2xl font-mono font-semibold text-text-primary">
                    {stats.holdingsCount}
                  </span>
                  <span className="text-xs text-text-tertiary ml-1">只</span>
                  {stats.topGainer && (
                    <p className="text-[10px] text-up mt-1.5">
                      最赚 {stats.topGainer.stockName}{' '}
                      {formatPercent(stats.topGainer.profitLossPercent || 0)}
                    </p>
                  )}
                  {stats.topLoser && (
                    <p className="text-[10px] text-down mt-0.5">
                      最亏 {stats.topLoser.stockName}{' '}
                      {formatPercent(stats.topLoser.profitLossPercent || 0)}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <p className="text-xs text-text-tertiary mb-3">仓位配置</p>
              {allocationSegments.length > 0 ? (
                <DonutChart segments={allocationSegments} size={120} strokeWidth={16} showLabels />
              ) : (
                <div className="flex items-center justify-center h-[120px] text-text-tertiary text-sm">
                  暂无持仓
                </div>
              )}
            </GlassCard>
          </div>

          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <GlassTabs
                tabs={tabs}
                activeKey={activeTab}
                onChange={(k) => setActiveTab(k as typeof activeTab)}
                size="sm"
              />
              {activeTab === 'holdings' && (
                <GlassButton
                  variant="ghost"
                  size="sm"
                  icon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setAddHoldingDialogOpen(true)}
                >
                  添加持仓
                </GlassButton>
              )}
            </div>

            {activeTab === 'holdings' &&
              (holdings.length > 0 ? (
                <GlassTable columns={holdingColumns} data={holdings} rowKey="id" compact />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
                  <PieChart className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">暂无持仓</p>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={() => setAddHoldingDialogOpen(true)}
                  >
                    添加持仓
                  </GlassButton>
                </div>
              ))}

            {activeTab === 'transactions' &&
              (transactions.length > 0 ? (
                <GlassTable columns={transactionColumns} data={transactions} rowKey="id" compact />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
                  <BarChart3 className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">暂无交易记录</p>
                </div>
              ))}

            {activeTab === 'performance' &&
              (chartData.length > 0 ? (
                <PortfolioChart data={chartData} height={360} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
                  <TrendingUp className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">暂无收益数据</p>
                </div>
              ))}
          </GlassCard>
        </>
      )}

      {!currentPortfolio && portfolios.length > 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <Briefcase className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">请选择一个投资组合</p>
        </div>
      )}

      {portfolios.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
          <Briefcase className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm mb-3">还没有投资组合</p>
          <GlassButton
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setCreateDialogOpen(true)}
          >
            新建组合
          </GlassButton>
        </div>
      )}

      <GlassDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        title="新建组合"
        size="sm"
        footer={
          <>
            <GlassButton variant="secondary" onClick={() => setCreateDialogOpen(false)}>
              取消
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handleCreatePortfolio}
              loading={loading}
              disabled={!createForm.name.trim()}
            >
              创建
            </GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <GlassInput
            label="组合名称"
            value={createForm.name}
            onChange={(v) => setCreateForm({ ...createForm, name: v })}
            placeholder="输入组合名称"
          />
          <GlassInput
            label="描述"
            value={createForm.description}
            onChange={(v) => setCreateForm({ ...createForm, description: v })}
            placeholder="输入组合描述"
          />
          <GlassInput
            label="初始资金"
            type="number"
            value={createForm.initialCapital}
            onChange={(v) => setCreateForm({ ...createForm, initialCapital: v })}
            placeholder="1000000"
            icon={<Wallet className="w-4 h-4" />}
          />
        </div>
      </GlassDialog>

      <GlassDialog
        open={addHoldingDialogOpen}
        onClose={() => setAddHoldingDialogOpen(false)}
        title="添加持仓"
        size="sm"
        footer={
          <>
            <GlassButton variant="secondary" onClick={() => setAddHoldingDialogOpen(false)}>
              取消
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handleAddHolding}
              loading={loading}
              disabled={!holdingForm.stockCode.trim() || !holdingForm.quantity || !holdingForm.avgCost}
            >
              添加
            </GlassButton>
          </>
        }
      >
        <div className="space-y-4">
          <GlassInput
            label="股票代码"
            value={holdingForm.stockCode}
            onChange={(v) => setHoldingForm({ ...holdingForm, stockCode: v })}
            placeholder="如 600519"
          />
          <GlassInput
            label="股票名称"
            value={holdingForm.stockName}
            onChange={(v) => setHoldingForm({ ...holdingForm, stockName: v })}
            placeholder="如 贵州茅台"
          />
          <GlassInput
            label="持仓数量"
            type="number"
            value={holdingForm.quantity}
            onChange={(v) => setHoldingForm({ ...holdingForm, quantity: v })}
            placeholder="100"
          />
          <GlassInput
            label="成本价"
            type="number"
            value={holdingForm.avgCost}
            onChange={(v) => setHoldingForm({ ...holdingForm, avgCost: v })}
            placeholder="0.00"
            icon={<Wallet className="w-4 h-4" />}
          />
        </div>
      </GlassDialog>
    </div>
  )
}

export default PortfolioPage
