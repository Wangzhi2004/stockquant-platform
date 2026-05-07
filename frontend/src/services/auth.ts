import { api } from './api'
import { ApiResponse, User, LoginRequest, RegisterRequest, Token } from '../types'

export const authService = {
  login(data: LoginRequest) {
    return api.post<ApiResponse<Token>>('/auth/login', data)
  },

  register(data: RegisterRequest) {
    return api.post<ApiResponse<User>>('/auth/register', data)
  },

  refresh(refreshToken: string) {
    return api.post<ApiResponse<Token>>('/auth/refresh', { refreshToken })
  },

  getMe() {
    return api.get<ApiResponse<User>>('/auth/me')
  },

  updateMe(data: Partial<Pick<User, 'username' | 'email' | 'phone' | 'avatar'>>) {
    return api.patch<ApiResponse<User>>('/auth/me', data)
  },

  changePassword(oldPassword: string, newPassword: string) {
    return api.post<ApiResponse<null>>('/auth/change-password', { oldPassword, newPassword })
  },
}
