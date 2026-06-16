import { api } from './api'
import { ApiResponse, StrategyConfig, StrategyInfo } from '../types'

export const strategiesService = {
  list() {
    return api.get<ApiResponse<StrategyInfo[]>>('/strategies')
  },

  get(id: string) {
    return api.get<ApiResponse<StrategyInfo>>(`/strategies/${id}`)
  },

  create(data: StrategyConfig) {
    return api.post<ApiResponse<StrategyInfo>>('/strategies', data)
  },

  update(id: string, data: Partial<StrategyConfig>) {
    return api.put<ApiResponse<StrategyInfo>>(`/strategies/${id}`, data)
  },

  delete(id: string) {
    return api.delete<ApiResponse<null>>(`/strategies/${id}`)
  },

  run(id: string) {
    return api.post<ApiResponse<null>>(`/strategies/${id}/run`)
  },
}
