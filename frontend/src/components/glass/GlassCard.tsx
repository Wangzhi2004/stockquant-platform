import React from 'react'
import { cn } from '@/utils/formatters'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: 'up' | 'down' | 'accent' | null
  onClick?: () => void
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = true,
  glow = null,
}) => {
  const glowClasses = {
    up: 'shadow-glow-up',
    down: 'shadow-glow-down',
    accent: 'shadow-glow-accent',
  }

  return (
    <div
      className={cn(
        'glass-card',
        hover && 'hover:translate-y-[-2px]',
        glow && glowClasses[glow],
        className
      )}
    >
      {children}
    </div>
  )
}
