import React from 'react'
import { cn } from '@/utils/formatters'

interface StatusDotProps {
  status: 'online' | 'offline' | 'warning' | 'error'
  size?: 'sm' | 'md'
  pulse?: boolean
  className?: string
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'sm',
  pulse = true,
  className,
}) => {
  const colors = {
    online: 'bg-up shadow-[0_0_6px_rgba(0,229,160,0.5)]',
    offline: 'bg-text-tertiary',
    warning: 'bg-warning shadow-[0_0_6px_rgba(255,179,71,0.5)]',
    error: 'bg-down shadow-[0_0_6px_rgba(255,69,103,0.5)]',
  }

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
  }

  return (
    <span className={cn('relative inline-flex', className)}>
      <span
        className={cn(
          'rounded-full',
          sizes[size],
          colors[status]
        )}
      />
      {pulse && status === 'online' && (
        <span
          className={cn(
            'absolute inset-0 rounded-full bg-up animate-status-pulse',
            sizes[size]
          )}
        />
      )}
    </span>
  )
}
