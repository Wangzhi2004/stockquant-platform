import React from 'react'
import { cn } from '@/utils/formatters'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: 'up' | 'down' | 'accent' | null
  animate?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
  highlight?: boolean
  onClick?: () => void
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = true,
  glow = null,
  animate = false,
  header,
  footer,
  highlight = false,
  onClick,
}) => {
  const glowClasses = {
    up: 'glass-glow-up glass-border-glow-up',
    down: 'glass-glow-down glass-border-glow-down',
    accent: 'glass-glow-accent glass-border-glow-accent',
  }

  return (
    <div
      className={cn(
        'glass-card',
        hover && 'glass-card-hover',
        glow && glowClasses[glow],
        animate && 'animate-card-enter',
        highlight && 'glass-highlight-line',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {header && (
        <div className="px-5 pt-5 pb-3 border-b border-white/[0.04] relative z-[1]">
          {header}
        </div>
      )}
      <div className="p-5 relative z-[1]">
        {children}
      </div>
      {footer && (
        <div className="px-5 pb-5 pt-3 border-t border-white/[0.04] relative z-[1]">
          {footer}
        </div>
      )}
    </div>
  )
}
