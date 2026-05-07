import { useEffect } from 'react'
import { usePortfolioStore } from '../store/portfolioStore'
import type { Portfolio, Holding, Transaction } from '../types'

export function usePortfolio() {
  const store = usePortfolioStore()

  useEffect(() => {
    if (store.portfolios.length === 0 && !store.loading) {
      store.fetchPortfolios()
    }
  }, [])

  return {
    portfolios: store.portfolios,
    currentPortfolio: store.currentPortfolio,
    holdings: store.holdings,
    transactions: store.transactions,
    stats: store.stats,
    loading: store.loading,
    error: store.error,
    fetchPortfolios: () => store.fetchPortfolios(),
    createPortfolio: (data: Pick<Portfolio, 'name' | 'description'>) => store.createPortfolio(data),
    setCurrentPortfolio: (portfolio: Portfolio | null) => store.setCurrentPortfolio(portfolio),
    addHolding: (portfolioId: string, data: Omit<Holding, 'id' | 'portfolioId' | 'currentPrice' | 'marketValue' | 'profitLoss' | 'profitLossPercent' | 'updatedAt'>) => store.addHolding(portfolioId, data),
    updateHolding: (portfolioId: string, holdingId: string, data: Partial<Pick<Holding, 'quantity' | 'avgCost'>>) => store.updateHolding(portfolioId, holdingId, data),
    deleteHolding: (portfolioId: string, holdingId: string) => store.deleteHolding(portfolioId, holdingId),
    addTransaction: (portfolioId: string, data: Omit<Transaction, 'id' | 'portfolioId' | 'createdAt'>) => store.addTransaction(portfolioId, data),
    calculateStats: (portfolioId: string) => store.calculateStats(portfolioId),
    clearError: () => store.clearError(),
  }
}
