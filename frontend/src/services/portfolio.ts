import { api } from './api'
import {
  ApiResponse,
  Portfolio,
  Holding,
  Transaction,
  PortfolioStats,
} from '../types'

export const portfolioService = {
  list() {
    return api.get<ApiResponse<Portfolio[]>>('/portfolios')
  },

  get(id: string) {
    return api.get<ApiResponse<Portfolio>>(`/portfolios/${id}`)
  },

  create(data: Pick<Portfolio, 'name' | 'description'>) {
    return api.post<ApiResponse<Portfolio>>('/portfolios', data)
  },

  update(id: string, data: Partial<Pick<Portfolio, 'name' | 'description'>>) {
    return api.put<ApiResponse<Portfolio>>(`/portfolios/${id}`, data)
  },

  delete(id: string) {
    return api.delete<ApiResponse<null>>(`/portfolios/${id}`)
  },

  listHoldings(portfolioId: string) {
    return api.get<ApiResponse<Holding[]>>(`/portfolios/${portfolioId}/holdings`)
  },

  addHolding(portfolioId: string, data: Omit<Holding, 'id' | 'portfolioId' | 'currentPrice' | 'marketValue' | 'profitLoss' | 'profitLossPercent' | 'updatedAt'>) {
    return api.post<ApiResponse<Holding>>(`/portfolios/${portfolioId}/holdings`, data)
  },

  updateHolding(portfolioId: string, holdingId: string, data: Partial<Pick<Holding, 'quantity' | 'avgCost'>>) {
    return api.put<ApiResponse<Holding>>(`/portfolios/${portfolioId}/holdings/${holdingId}`, data)
  },

  deleteHolding(portfolioId: string, holdingId: string) {
    return api.delete<ApiResponse<null>>(`/portfolios/${portfolioId}/holdings/${holdingId}`)
  },

  listTransactions(portfolioId: string, params?: { page?: number; pageSize?: number; type?: 'buy' | 'sell' }) {
    return api.get<ApiResponse<Transaction[]>>(`/portfolios/${portfolioId}/transactions`, { params })
  },

  addTransaction(portfolioId: string, data: Omit<Transaction, 'id' | 'portfolioId' | 'createdAt'>) {
    return api.post<ApiResponse<Transaction>>(`/portfolios/${portfolioId}/transactions`, data)
  },

  getStats(portfolioId: string) {
    return api.get<ApiResponse<PortfolioStats>>(`/portfolios/${portfolioId}/stats`)
  },
}
