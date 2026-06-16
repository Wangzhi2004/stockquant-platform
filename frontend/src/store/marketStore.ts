import { create } from 'zustand'
import { Stock, IndexQuote, HotSector, KlineData } from '../types'
import { marketService } from '../services/market'

interface MarketState {
  stocks: Stock[]
  indices: IndexQuote[]
  hotSectors: HotSector[]
  currentStock: Stock | null
  klineData: KlineData[]
  loading: boolean
  error: string | null
}

interface MarketActions {
  fetchStocks: (params?: { page?: number; pageSize?: number; keyword?: string; industry?: string }) => Promise<void>
  fetchIndices: () => Promise<void>
  fetchHotSectors: () => Promise<void>
  fetchKline: (code: string, params?: { period?: '1m' | '5m' | '15m' | '30m' | '60m' | '1d' | '1w' | '1M'; startDate?: string; endDate?: string; limit?: number }) => Promise<void>
  searchStocks: (keyword: string) => Promise<Stock[]>
  setCurrentStock: (stock: Stock | null) => void
  clearError: () => void
}

type MarketStore = MarketState & MarketActions

export const useMarketStore = create<MarketStore>((set) => ({
  stocks: [],
  indices: [],
  hotSectors: [],
  currentStock: null,
  klineData: [],
  loading: false,
  error: null,

  fetchStocks: async (params) => {
    set({ loading: true, error: null })
    try {
      const res = await marketService.fetchStocks(params)
      set({ stocks: res.data, loading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取股票列表失败'
      set({ error: message, loading: false })
    }
  },

  fetchIndices: async () => {
    set({ loading: true, error: null })
    try {
      const res = await marketService.fetchIndices()
      set({ indices: res.data, loading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取指数行情失败'
      set({ error: message, loading: false })
    }
  },

  fetchHotSectors: async () => {
    set({ loading: true, error: null })
    try {
      const res = await marketService.fetchHotSectors()
      set({ hotSectors: res.data, loading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取热门板块失败'
      set({ error: message, loading: false })
    }
  },

  fetchKline: async (code, params) => {
    set({ loading: true, error: null })
    try {
      const res = await marketService.fetchKline(code, params)
      set({ klineData: res.data, loading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '获取K线数据失败'
      set({ error: message, loading: false })
    }
  },

  searchStocks: async (keyword) => {
    try {
      const res = await marketService.searchStocks(keyword)
      return res.data
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '搜索股票失败'
      set({ error: message })
      return []
    }
  },

  setCurrentStock: (stock) => set({ currentStock: stock }),

  clearError: () => set({ error: null }),
}))
