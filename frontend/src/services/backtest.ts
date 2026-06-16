import { api } from './api'
import { ApiResponse, BacktestJob, BacktestResult, BacktestConfig } from '../types'

export const backtestService = {
  create(data: BacktestConfig) {
    return api.post<ApiResponse<BacktestJob>>('/backtest', data)
  },

  list(params?: { page?: number; pageSize?: number; status?: string }) {
    return api.get<ApiResponse<BacktestJob[]>>('/backtest', { params })
  },

  get(id: string) {
    return api.get<ApiResponse<BacktestJob>>(`/backtest/${id}`)
  },

  getResult(id: string) {
    return api.get<ApiResponse<BacktestResult>>(`/backtest/${id}/result`)
  },

  run(id: string) {
    return api.post<ApiResponse<BacktestJob>>(`/backtest/${id}/run`)
  },

  delete(id: string) {
    return api.delete<ApiResponse<null>>(`/backtest/${id}`)
  },
}
