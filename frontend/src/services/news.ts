import { api } from './api'
import { ApiResponse, NewsArticle, NewsAnalysis, OpportunityScore } from '../types'

export const newsService = {
  list(params?: { page?: number; pageSize?: number; keyword?: string; sentiment?: 'positive' | 'negative' | 'neutral'; stockCode?: string }) {
    return api.get<ApiResponse<NewsArticle[]>>('/news', { params })
  },

  get(id: string) {
    return api.get<ApiResponse<NewsArticle>>(`/news/${id}`)
  },

  analyze(id: string) {
    return api.post<ApiResponse<NewsAnalysis>>(`/news/${id}/analyze`)
  },

  getOpportunities(params?: { page?: number; pageSize?: number; minScore?: number; recommendation?: string }) {
    return api.get<ApiResponse<OpportunityScore[]>>('/news/opportunities', { params })
  },
}
