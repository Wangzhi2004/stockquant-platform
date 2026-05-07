import React from 'react'
import { cn } from '@/utils/formatters'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface ChangeBadgeProps {
  value: number
  size?: 'sm' | 'md'
  showIcon?: boolean
  glow?: boolean
  className?: string
}

export const ChangeBadge: React.FC<ChangeBadgeProps> = ({
  value,
  size = 'sm',
  showIcon = true,
  glow = false,
  className,
}) => {
  const isUp = value >= 0
  const sign = isUp ? '+' : ''
  const display = `${sign}${(value * 100).toFixed(2)}%`

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 font-mono font-medium rounded-full border',
        isUp
          ? cn('bg-up/10 border-up/20 text-up', glow && 'shadow-glow-up')
          : cn('bg-down/10 border-down/20 text-down', glow && 'shadow-glow-down'),
        sizes[size],
        className
      )}
    >
      {showIcon && (
        isUp
          ? <TrendingUp className="w-3 h-3" />
          : <TrendingDown className="w-3 h-3" />
      )}
      {display}
    </span>
  )
}
