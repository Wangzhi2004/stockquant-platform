import React, { useState } from 'react'
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
  Search,
  ChevronDown,
  User,
  LogOut,
  Moon,
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
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-glass-sm text-text-tertiary hover:text-text-primary hover:bg-glass-bg-hover transition-all">
          <Search className="w-4 h-4" />
        </button>

        <button className="relative p-2 rounded-glass-sm text-text-tertiary hover:text-text-primary hover:bg-glass-bg-hover transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-down rounded-full shadow-[0_0_6px_rgba(255,69,103,0.5)]" />
        </button>

        <div className="relative">
          <button
            className={cn(
              'flex items-center gap-2 p-1.5 pr-2 rounded-glass-sm transition-all',
              userMenuOpen ? 'bg-glass-bg-hover' : 'hover:bg-glass-bg-hover'
            )}
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-medium">
              U
            </div>
            <ChevronDown className={cn('w-3 h-3 text-text-tertiary transition-transform', userMenuOpen && 'rotate-180')} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 glass-dropdown p-1 min-w-[160px] z-50 animate-slide-down">
              <div className="glass-dropdown-item flex items-center gap-2 text-sm text-text-primary">
                <User className="w-4 h-4 text-text-tertiary" />
                个人中心
              </div>
              <div className="glass-dropdown-item flex items-center gap-2 text-sm text-text-primary">
                <Moon className="w-4 h-4 text-text-tertiary" />
                深色模式
              </div>
              <div className="glass-dropdown-item flex items-center gap-2 text-sm text-text-primary">
                <Settings className="w-4 h-4 text-text-tertiary" />
                设置
              </div>
              <div className="my-1 border-t border-white/[0.04]" />
              <div className="glass-dropdown-item flex items-center gap-2 text-sm text-down">
                <LogOut className="w-4 h-4" />
                退出登录
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
