import { create } from 'zustand'
import { User, LoginRequest, RegisterRequest } from '../types'
import { authService } from '../services/auth'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

interface AuthActions {
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  loadFromStorage: () => Promise<void>
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (data: LoginRequest) => {
    set({ loading: true, error: null })
    try {
      const res = await authService.login(data)
      const { accessToken, refreshToken } = res.data
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      const userRes = await authService.getMe()
      set({
        token: accessToken,
        user: userRes.data,
        isAuthenticated: true,
        loading: false,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '登录失败'
      set({ error: message, loading: false })
      throw err
    }
  },

  register: async (data: RegisterRequest) => {
    set({ loading: true, error: null })
    try {
      await authService.register(data)
      set({ loading: false })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '注册失败'
      set({ error: message, loading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    })
  },

  loadFromStorage: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ isAuthenticated: false })
      return
    }
    set({ loading: true })
    try {
      const res = await authService.getMe()
      set({
        token,
        user: res.data,
        isAuthenticated: true,
        loading: false,
      })
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
}))
