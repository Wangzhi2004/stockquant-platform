import { api } from './api'
import { ApiResponse, PushConfig, PushLog } from '../types'

export const pushService = {
  listConfigs() {
    return api.get<ApiResponse<PushConfig[]>>('/push/configs')
  },

  getConfig(id: string) {
    return api.get<ApiResponse<PushConfig>>(`/push/configs/${id}`)
  },

  createConfig(data: Omit<PushConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    return api.post<ApiResponse<PushConfig>>('/push/configs', data)
  },

  updateConfig(id: string, data: Partial<Omit<PushConfig, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) {
    return api.put<ApiResponse<PushConfig>>(`/push/configs/${id}`, data)
  },

  deleteConfig(id: string) {
    return api.delete<ApiResponse<null>>(`/push/configs/${id}`)
  },

  testConfig(id: string) {
    return api.post<ApiResponse<null>>(`/push/configs/${id}/test`)
  },

  listLogs(params?: { page?: number; pageSize?: number; configId?: string; status?: 'success' | 'failed' }) {
    return api.get<ApiResponse<PushLog[]>>('/push/logs', { params })
  },
}
