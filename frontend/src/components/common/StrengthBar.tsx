import React from 'react'
import { cn } from '@/utils/formatters'

interface StrengthBarProps {
  value: number
  size?: 'sm' | 'md'
  className?: string
}

export const StrengthBar: React.FC<StrengthBarProps> = ({
  value,
  size = 'md',
  className,
}) => {
  const clamped = Math.max(0, Math.min(100, value))
  const filled = Math.round((clamped / 100) * 5)

  const getColor = (index: number) => {
    if (index >= filled) return 'bg-white/[0.06]'
    if (filled <= 2) return 'bg-down'
    if (filled <= 3) return 'bg-warning'
    return 'bg-up'
  }

  const getGlow = (index: number) => {
    if (index >= filled) return ''
    if (filled <= 2) return 'shadow-[0_0_6px_rgba(255,69,103,0.3)]'
    if (filled <= 3) return 'shadow-[0_0_6px_rgba(255,179,71,0.3)]'
    return 'shadow-[0_0_6px_rgba(0,229,160,0.3)]'
  }

  const sizes = {
    sm: { width: 'w-3', height: 'h-1.5', gap: 'gap-0.5' },
    md: { width: 'w-5', height: 'h-2', gap: 'gap-1' },
  }

  const s = sizes[size]

  return (
    <div className={cn('inline-flex items-center', s.gap, className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-[2px] transition-all duration-300',
            s.width,
            s.height,
            getColor(i),
            getGlow(i)
          )}
        />
      ))}
    </div>
  )
}
