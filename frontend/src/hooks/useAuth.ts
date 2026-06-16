import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import type { LoginRequest, RegisterRequest } from '../types'

export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    if (!store.isAuthenticated && !store.loading) {
      store.loadFromStorage()
    }
  }, [])

  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    loading: store.loading,
    error: store.error,
    login: (data: LoginRequest) => store.login(data),
    register: (data: RegisterRequest) => store.register(data),
    logout: () => store.logout(),
    clearError: () => store.clearError(),
  }
}
