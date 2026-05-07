import { useEffect } from 'react'
import { useMarketStore } from '../store/marketStore'
import type { Stock } from '../types'

export function useMarket() {
  const store = useMarketStore()

  useEffect(() => {
    if (store.indices.length === 0 && !store.loading) {
      store.fetchIndices()
    }
  }, [])

  return {
    stocks: store.stocks,
    indices: store.indices,
    hotSectors: store.hotSectors,
    currentStock: store.currentStock,
    klineData: store.klineData,
    loading: store.loading,
    error: store.error,
    fetchStocks: (params?: { page?: number; pageSize?: number; keyword?: string; industry?: string }) => store.fetchStocks(params),
    fetchIndices: () => store.fetchIndices(),
    fetchHotSectors: () => store.fetchHotSectors(),
    fetchKline: (code: string, params?: { period?: '1m' | '5m' | '15m' | '30m' | '60m' | '1d' | '1w' | '1M'; startDate?: string; endDate?: string; limit?: number }) => store.fetchKline(code, params),
    searchStocks: (keyword: string) => store.searchStocks(keyword),
    setCurrentStock: (stock: Stock | null) => store.setCurrentStock(stock),
    clearError: () => store.clearError(),
  }
}
