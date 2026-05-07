import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/formatters'

interface GlassTabsProps {
  tabs: { key: string; label: string; icon?: React.ReactNode }[]
  activeKey: string
  onChange: (key: string) => void
  className?: string
  size?: 'sm' | 'md'
}

export const GlassTabs: React.FC<GlassTabsProps> = ({
  tabs,
  activeKey,
  onChange,
  className,
  size = 'md',
}) => {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.key === activeKey)
    const el = tabRefs.current[idx]
    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      })
    }
  }, [activeKey, tabs])

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  }

  return (
    <div className={cn('relative inline-flex bg-black/20 backdrop-blur-md rounded-glass-sm border border-glass-border p-1', className)}>
      <div
        className="absolute top-1 bottom-1 bg-accent/15 border border-accent/25 rounded-[8px] glass-tab-indicator"
        style={{ left: indicatorStyle.left - 4, width: indicatorStyle.width + 8 }}
      />
      {tabs.map((tab, i) => (
        <button
          key={tab.key}
          ref={(el) => { tabRefs.current[i] = el }}
          className={cn(
            'relative z-10 flex items-center gap-1.5 rounded-[8px] font-medium transition-colors duration-200',
            sizes[size],
            activeKey === tab.key
              ? 'text-accent'
              : 'text-text-tertiary hover:text-text-secondary'
          )}
          onClick={() => onChange(tab.key)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
