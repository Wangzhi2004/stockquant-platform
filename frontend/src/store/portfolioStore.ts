import { create } from 'zustand'
import { Portfolio, Holding, Transaction, PortfolioStats } from '../types'
import { portfolioService } from '../services/portfolio'

interface PortfolioState {
  portfolios: Portfolio[]
  currentPortfolio: Portfolio | null
  holdings: Holding[]
  transactions: Transaction[]
  stats: PortfolioStats | null
  loading: boolean
  error: string | null
}

interface PortfolioActions {
  fetchPortfolios: () => Promise<void>
  createPortfolio: (data: Pick<Portfolio, 'name' | 'description'>) => Promise<void>
  setCurrentPortfolio: (portfolio: Portfolio | null) => void
  addHolding: (portfolioId: string, data: Omit<Holding, 'id' | 'portfolioId' | 'currentPrice' | 'marketValue' | 'profitLoss' | 'profitLossPercent' | 'updatedAt'>) => Promise<void>
  updateHolding: (portfolioId: string, holdingId: string, data: Partial<Pick<Holding, 'quantity' | 'avgCost'>>) => Promise<void>
  deleteHolding: (portfolioId: string, holdingId: string) => Promise<void>
  addTransaction: (portfolioId: string, data: Omit<Transaction, 'id' | 'portfolioId' | 'createdAt'>) => Promise<void>
  calculateStats: (portfolioId: string) => Promise<void>
  clearError: () => void
}

type PortfolioStore = PortfolioState & PortfolioActions

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  portfolios: [],
  currentPortfolio: null,
  holdings: [],
  transactions: [],
  stats: null,
  loading: false,
  error: null,

  fetchPortfolios: async () => {
    set({ loading: true, error: null })
    try {
      const res = await portfolioService.list()
      const portfolios = res.data
      set({
        portfolios,
        currentPortfolio: portfolios.length > 0 ? portfolios[0] : null,
        loading: false,
      })
      if (portfolios.length > 0) {
        const portfolioId = portfolios[0].id
        const [holdingsRes, statsRes] = await Promise.all([
          portfolioService.listHoldings(portfolioId),
          portfolioService.getStats(portfolioId),
        ])
        set({
          holdings: holdingsRes.data,
          stats: statsRes.data,
        })
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取投资组合失败'
      set({ error: message, loading: false })
    }
  },

  createPortfolio: async (data) => {
    set({ loading: true, error: null })
    try {
      const res = await portfolioService.create(data)
      set((state) => ({
        portfolios: [...state.portfolios, res.data],
        loading: false,
      }))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '创建投资组合失败'
      set({ error: message, loading: false })
    }
  },

  setCurrentPortfolio: (portfolio) => {
    set({ currentPortfolio: portfolio })
    if (portfolio) {
      get().fetchPortfolios()
    }
  },

  addHolding: async (portfolioId, data) => {
    set({ loading: true, error: null })
    try {
      const res = await portfolioService.addHolding(portfolioId, data)
      set((state) => ({
        holdings: [...state.holdings, res.data],
        loading: false,
      }))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '添加持仓失败'
      set({ error: message, loading: false })
    }
  },

  updateHolding: async (portfolioId, holdingId, data) => {
    set({ loading: true, error: null })
    try {
      const res = await portfolioService.updateHolding(portfolioId, holdingId, data)
      set((state) => ({
        holdings: state.holdings.map((h) => (h.id === holdingId ? res.data : h)),
        loading: false,
      }))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '更新持仓失败'
      set({ error: message, loading: false })
    }
  },

  deleteHolding: async (portfolioId, holdingId) => {
    set({ loading: true, error: null })
    try {
      await portfolioService.deleteHolding(portfolioId, holdingId)
      set((state) => ({
        holdings: state.holdings.filter((h) => h.id !== holdingId),
        loading: false,
      }))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '删除持仓失败'
      set({ error: message, loading: false })
    }
  },

  addTransaction: async (portfolioId, data) => {
    set({ loading: true, error: null })
    try {
      const res = await portfolioService.addTransaction(portfolioId, data)
      set((state) => ({
        transactions: [res.data, ...state.transactions],
        loading: false,
      }))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '添加交易失败'
      set({ error: message, loading: false })
    }
  },

  calculateStats: async (portfolioId) => {
    try {
      const res = await portfolioService.getStats(portfolioId)
      set({ stats: res.data })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '计算统计失败'
      set({ error: message })
    }
  },

  clearError: () => set({ error: null }),
}))
