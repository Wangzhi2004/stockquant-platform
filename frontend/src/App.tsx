import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import DashboardPage from './components/pages/Dashboard/DashboardPage'
import PortfolioPage from './components/pages/Portfolio/PortfolioPage'
import MarketPage from './components/pages/Market/MarketPage'
import NewsPage from './components/pages/News/NewsPage'
import SignalsPage from './components/pages/Signals/SignalsPage'
import StrategiesPage from './components/pages/Strategies/StrategiesPage'
import BacktestPage from './components/pages/Backtest/BacktestPage'
import SettingsPage from './components/pages/Settings/SettingsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="signals" element={<SignalsPage />} />
        <Route path="strategies" element={<StrategiesPage />} />
        <Route path="backtest" element={<BacktestPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
