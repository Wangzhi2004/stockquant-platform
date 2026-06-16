import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
}

export const MainLayout: React.FC = () => {
  const showSidebar = true

  const mockWatchlist: WatchlistItem[] = [
    { symbol: '600519', name: '贵州茅台', price: 1688.50, change: 0.0234 },
    { symbol: '000858', name: '五粮液', price: 156.80, change: -0.0112 },
    { symbol: '601318', name: '中国平安', price: 48.35, change: 0.0087 },
    { symbol: '000001', name: '平安银行', price: 12.15, change: -0.0245 },
  ]

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar watchlist={mockWatchlist} />}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
