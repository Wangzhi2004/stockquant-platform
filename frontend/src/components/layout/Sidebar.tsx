import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/formatters'
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  Zap,
  Layers,
  History,
  ChevronLeft,
  ChevronRight,
  Star,
  Plus,
  Eye,
} from 'lucide-react'

interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
}

interface SidebarProps {
  watchlist?: WatchlistItem[]
  className?: string
}

const quickActions = [
  { label: '新建策略', icon: Plus, path: '/strategies/new' },
  { label: '扫描信号', icon: Zap, path: '/signals' },
  { label: '回测', icon: History, path: '/backtest' },
]

export const Sidebar: React.FC<SidebarProps> = ({
  watchlist = [],
  className,
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      className={cn(
        'h-full flex flex-col bg-background-secondary/50 border-r border-white/[0.04] overflow-hidden',
        collapsed ? 'glass-sidebar-collapsed' : 'glass-sidebar-expanded',
        className
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-white/[0.04]">
        {!collapsed && (
          <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">导航</span>
        )}
        <button
          className={cn(
            'p-1.5 rounded-glass-sm text-text-tertiary hover:text-text-primary hover:bg-white/[0.05] transition-all',
            collapsed && 'mx-auto'
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <div className={cn('space-y-0.5 px-2', collapsed && 'px-1.5')}>
          {[
            { path: '/', label: '首页', icon: LayoutDashboard },
            { path: '/portfolio', label: '持仓', icon: Briefcase },
            { path: '/market', label: '行情', icon: BarChart3 },
            { path: '/signals', label: '信号', icon: Zap },
            { path: '/strategies', label: '策略', icon: Layers },
            { path: '/backtest', label: '回测', icon: History },
          ].map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-glass-sm transition-all duration-200',
                  collapsed ? 'p-2 justify-center' : 'px-3 py-2',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03]'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            )
          })}
        </div>

        {!collapsed && (
          <>
            <div className="mt-4 mb-2 px-4">
              <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">快捷操作</span>
            </div>
            <div className="space-y-0.5 px-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.path}
                    to={action.path}
                    className="flex items-center gap-3 px-3 py-2 rounded-glass-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.03] transition-all duration-200"
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm">{action.label}</span>
                  </Link>
                )
              })}
            </div>

            {watchlist.length > 0 && (
              <>
                <div className="mt-4 mb-2 px-4 flex items-center gap-1.5">
                  <Star className="w-3 h-3 text-warning" />
                  <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">自选</span>
                </div>
                <div className="space-y-0.5 px-2">
                  {watchlist.map((item) => (
                    <Link
                      key={item.symbol}
                      to={`/market/${item.symbol}`}
                      className="flex items-center justify-between px-3 py-2 rounded-glass-sm hover:bg-white/[0.03] transition-all duration-200"
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-3 h-3 text-text-tertiary" />
                        <div>
                          <p className="text-xs text-text-primary font-medium">{item.symbol}</p>
                          <p className="text-[10px] text-text-tertiary">{item.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-text-primary">{item.price.toFixed(2)}</p>
                        <p className={cn('text-[10px] font-mono', item.change >= 0 ? 'text-up' : 'text-down')}>
                          {item.change >= 0 ? '+' : ''}{(item.change * 100).toFixed(2)}%
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </nav>
    </aside>
  )
}
