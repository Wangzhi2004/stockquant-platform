import React from 'react'
import { cn } from '@/utils/formatters'

interface GlassBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'up' | 'down' | 'accent' | 'warning'
  glow?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'default',
  glow = false,
  size = 'sm',
  className,
}) => {
  const variants = {
    default: 'bg-white/[0.06] border-white/[0.08] text-text-secondary',
    up: 'bg-up/10 border-up/20 text-up',
    down: 'bg-down/10 border-down/20 text-down',
    accent: 'bg-accent/10 border-accent/20 text-accent',
    warning: 'bg-warning/10 border-warning/20 text-warning',
  }

  const glowVariants = {
    default: '',
    up: 'shadow-glow-up',
    down: 'shadow-glow-down',
    accent: 'shadow-glow-accent',
    warning: 'shadow-[0_0_20px_rgba(255,179,71,0.15)]',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border backdrop-blur-sm',
        variants[variant],
        sizes[size],
        glow && glowVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
