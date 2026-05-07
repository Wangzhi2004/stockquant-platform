import { api } from './api'
import { ApiResponse, Stock, KlineData, IndexQuote, HotSector } from '../types'

export const marketService = {
  fetchStocks(params?: { page?: number; pageSize?: number; keyword?: string; industry?: string }) {
    return api.get<ApiResponse<Stock[]>>('/market/stocks', { params })
  },

  getStock(code: string) {
    return api.get<ApiResponse<Stock>>(`/market/stocks/${code}`)
  },

  fetchKline(code: string, params?: { period?: '1m' | '5m' | '15m' | '30m' | '60m' | '1d' | '1w' | '1M'; startDate?: string; endDate?: string; limit?: number }) {
    return api.get<ApiResponse<KlineData[]>>(`/market/stocks/${code}/kline`, { params })
  },

  fetchIndices() {
    return api.get<ApiResponse<IndexQuote[]>>('/market/indices')
  },

  fetchHotSectors() {
    return api.get<ApiResponse<HotSector[]>>('/market/hot-sectors')
  },

  searchStocks(keyword: string) {
    return api.get<ApiResponse<Stock[]>>('/market/search', { params: { keyword } })
  },
}
