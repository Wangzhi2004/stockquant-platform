import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/formatters'
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Newspaper,
  Settings,
  Bell,
  Zap,
  Layers,
  History,
} from 'lucide-react'

const navItems = [
  { path: '/', label: '首页', icon: LayoutDashboard },
  { path: '/portfolio', label: '持仓', icon: Briefcase },
  { path: '/market', label: '行情', icon: BarChart3 },
  { path: '/signals', label: '信号', icon: Zap },
  { path: '/strategies', label: '策略', icon: Layers },
  { path: '/backtest', label: '回测', icon: History },
  { path: '/news', label: '资讯', icon: Newspaper },
  { path: '/settings', label: '设置', icon: Settings },
]

export const Navbar: React.FC = () => {
  const location = useLocation()

  return (
    <nav className="h-16 glass-card rounded-none border-x-0 border-t-0 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-accent" />
          </div>
          <span className="text-lg font-semibold text-text-primary">StockQuant</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-glass-sm text-sm transition-all duration-200',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-glass-bg-hover'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-glass-sm text-text-secondary hover:text-text-primary hover:bg-glass-bg-hover transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-down rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-medium">
          U
        </div>
      </div>
    </nav>
  )
}
