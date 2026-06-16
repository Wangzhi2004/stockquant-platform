import { api } from './api'
import { ApiResponse, StrategySignal, SignalStats, SignalScanRequest } from '../types'

export const signalsService = {
  list(params?: SignalScanRequest) {
    return api.get<ApiResponse<StrategySignal[]>>('/signals', { params })
  },

  get(id: string) {
    return api.get<ApiResponse<StrategySignal>>(`/signals/${id}`)
  },

  scan(data: SignalScanRequest) {
    return api.post<ApiResponse<StrategySignal[]>>('/signals/scan', data)
  },

  getStats(params?: { strategyId?: string; startDate?: string; endDate?: string }) {
    return api.get<ApiResponse<SignalStats>>('/signals/stats', { params })
  },
}
