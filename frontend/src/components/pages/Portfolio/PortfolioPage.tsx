import React, { useState } from 'react'
import { GlassCard } from '@/components/glass/GlassCard'
import { GlassButton } from '@/components/glass/GlassButton'
import { GlassInput } from '@/components/glass/GlassInput'
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit3,
  X,
} from 'lucide-react'

interface Portfolio {
  id: string
  name: string
  description: string
  initialCapital: number
  totalMarketValue: number
  totalProfitLoss: number
  totalProfitLossPct: number
  holdingsCount: number
}

interface Holding {
  id: string
  stockCode: string
  stockName: string
  costPrice: number
  quantity: number
  currentPrice: number
  marketValue: number
  profitLoss: number
  profitLossPct: number
}

interface Transaction {
  id: string
  stockCode: string
  type: 'buy' | 'sell'
  price: number
  quantity: number
  fee: number
  date: string
}

const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    name: '主账户',
    description: '长期价值投资组合',
    initialCapital: 1000000,
    totalMarketValue: 1234567,
    totalProfitLoss: 234567,
    totalProfitLossPct: 23.46,
    holdingsCount: 8,
  },
  {
    id: '2',
    name: '量化策略',
    description: '动量交易策略',
    initialCapital: 500000,
    totalMarketValue: 543210,
    totalProfitLoss: 43210,
    totalProfitLossPct: 8.64,
    holdingsCount: 5,
  },
]

const mockHoldings: Holding[] = [
  {
    id: '1',
    stockCode: '600519',
    stockName: '贵州茅台',
    costPrice: 1680.0,
    quantity: 100,
    currentPrice: 1780.5,
    marketValue: 178050,
    profitLoss: 10050,
    profitLossPct: 5.98,
  },
  {
    id: '2',
    stockCode: '000858',
    stockName: '五粮液',
    costPrice: 145.0,
    quantity: 500,
    currentPrice: 138.2,
    marketValue: 69100,
    profitLoss: -3400,
    profitLossPct: -4.69,
  },
  {
    id: '3',
    stockCode: '300750',
    stockName: '宁德时代',
    costPrice: 210.0,
    quantity: 200,
    currentPrice: 228.4,
    marketValue: 45680,
    profitLoss: 3680,
    profitLossPct: 8.76,
  },
]

const mockTransactions: Transaction[] = [
  { id: '1', stockCode: '600519', type: 'buy', price: 1680.0, quantity: 100, fee: 168, date: '2024-01-15' },
  { id: '2', stockCode: '000858', type: 'buy', price: 145.0, quantity: 500, fee: 362.5, date: '2024-02-01' },
  { id: '3', stockCode: '300750', type: 'buy', price: 210.0, quantity: 200, fee: 84, date: '2024-02-20' },
]

export const PortfolioPage: React.FC = () => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('1')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [formData, setFormData] = useState({ name: '', description: '', initialCapital: '' })
  const [activeTab, setActiveTab] = useState<'holdings' | 'transactions'>('holdings')

  const currentPortfolio = mockPortfolios.find((p) => p.id === selectedPortfolio)

  const openAddModal = () => {
    setModalMode('add')
    setFormData({ name: '', description: '', initialCapital: '' })
    setShowModal(true)
  }

  const openEditModal = (portfolio: Portfolio) => {
    setModalMode('edit')
    setFormData({
      name: portfolio.name,
      description: portfolio.description,
      initialCapital: portfolio.initialCapital.toString(),
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary">投资组合</h1>
        </div>
        <GlassButton variant="primary" size="sm" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-1" />
          新建组合
        </GlassButton>
      </div>

      {/* Portfolio List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockPortfolios.map((portfolio) => (
          <GlassCard
            key={portfolio.id}
            className={`p-6 cursor-pointer transition-all ${
              selectedPortfolio === portfolio.id ? 'ring-2 ring-accent/50' : ''
            }`}
            onClick={() => setSelectedPortfolio(portfolio.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{portfolio.name}</h3>
                <p className="text-sm text-text-tertiary">{portfolio.description}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openEditModal(portfolio)
                }}
                className="p-1.5 rounded-glass-sm text-text-tertiary hover:text-text-primary hover:bg-glass-bg-hover transition-all"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-text-tertiary mb-1">总市值</p>
                <p className="text-xl font-mono text-text-primary">
                  ¥{portfolio.totalMarketValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary mb-1">盈亏</p>
                <div
                  className={`flex items-center gap-1 text-xl font-mono ${
                    portfolio.totalProfitLoss >= 0 ? 'text-up' : 'text-down'
                  }`}
                >
                  {portfolio.totalProfitLoss >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {portfolio.totalProfitLoss >= 0 ? '+' : ''}
                    {portfolio.totalProfitLossPct.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-text-tertiary">{portfolio.holdingsCount} 只持仓</span>
              <span className="text-text-tertiary">
                初始资金 ¥{portfolio.initialCapital.toLocaleString()}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Holdings / Transactions Tabs */}
      {currentPortfolio && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-6 mb-6 border-b border-glass-border pb-4">
            <button
              onClick={() => setActiveTab('holdings')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'holdings' ? 'text-accent' : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              持仓明细
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'text-accent'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              交易记录
            </button>
          </div>

          {activeTab === 'holdings' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-text-tertiary border-b border-glass-border">
                    <th className="pb-3 font-medium">股票</th>
                    <th className="pb-3 font-medium text-right">成本价</th>
                    <th className="pb-3 font-medium text-right">现价</th>
                    <th className="pb-3 font-medium text-right">数量</th>
                    <th className="pb-3 font-medium text-right">市值</th>
                    <th className="pb-3 font-medium text-right">盈亏</th>
                    <th className="pb-3 font-medium text-right">盈亏率</th>
                  </tr>
                </thead>
                <tbody>
                  {mockHoldings.map((holding) => (
                    <tr
                      key={holding.id}
                      className="border-b border-glass-border/50 hover:bg-glass-bg-hover/30 transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-text-primary">
                            {holding.stockCode}
                          </span>
                          <span className="text-sm text-text-secondary">{holding.stockName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-text-primary">
                        ¥{holding.costPrice.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-text-primary">
                        ¥{holding.currentPrice.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-text-primary">
                        {holding.quantity}
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-text-primary">
                        ¥{holding.marketValue.toLocaleString()}
                      </td>
                      <td
                        className={`py-3 text-right font-mono text-sm ${
                          holding.profitLoss >= 0 ? 'text-up' : 'text-down'
                        }`}
                      >
                        {holding.profitLoss >= 0 ? '+' : ''}¥{holding.profitLoss.toLocaleString()}
                      </td>
                      <td
                        className={`py-3 text-right font-mono text-sm ${
                          holding.profitLossPct >= 0 ? 'text-up' : 'text-down'
                        }`}
                      >
                        {holding.profitLossPct >= 0 ? '+' : ''}
                        {holding.profitLossPct.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-text-tertiary border-b border-glass-border">
                    <th className="pb-3 font-medium">日期</th>
                    <th className="pb-3 font-medium">股票</th>
                    <th className="pb-3 font-medium">类型</th>
                    <th className="pb-3 font-medium text-right">价格</th>
                    <th className="pb-3 font-medium text-right">数量</th>
                    <th className="pb-3 font-medium text-right">手续费</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-glass-border/50 hover:bg-glass-bg-hover/30 transition-colors"
                    >
                      <td className="py-3 text-sm text-text-secondary">{tx.date}</td>
                      <td className="py-3 font-mono text-sm text-text-primary">{tx.stockCode}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            tx.type === 'buy'
                              ? 'bg-up/10 text-up'
                              : 'bg-down/10 text-down'
                          }`}
                        >
                          {tx.type === 'buy' ? '买入' : '卖出'}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-text-primary">
                        ¥{tx.price.toFixed(2)}
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-text-primary">
                        {tx.quantity}
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-text-tertiary">
                        ¥{tx.fee.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">
                {modalMode === 'add' ? '新建组合' : '编辑组合'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-glass-sm text-text-tertiary hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">组合名称</label>
                <GlassInput
                  value={formData.name}
                  onChange={(v) => setFormData({ ...formData, name: v })}
                  placeholder="输入组合名称"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">描述</label>
                <GlassInput
                  value={formData.description}
                  onChange={(v) => setFormData({ ...formData, description: v })}
                  placeholder="输入组合描述"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">初始资金</label>
                <GlassInput
                  type="number"
                  value={formData.initialCapital}
                  onChange={(v) => setFormData({ ...formData, initialCapital: v })}
                  placeholder="1000000"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <GlassButton variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
                取消
              </GlassButton>
              <GlassButton variant="primary" className="flex-1" onClick={() => setShowModal(false)}>
                {modalMode === 'add' ? '创建' : '保存'}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  )
}

export default PortfolioPage
