import React from 'react'
import { cn } from '@/utils/formatters'

interface PriceDisplayProps {
  value: number
  change?: number
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  value,
  change,
  currency = '¥',
  size = 'md',
  className,
}) => {
  const isUp = change !== undefined ? change >= 0 : value >= 0
  const colorClass = change !== undefined
    ? isUp ? 'text-up' : 'text-down'
    : 'text-text-primary'

  const str = Math.abs(value).toFixed(2)
  const parts = str.split('.')
  const integer = parts[0]
  const decimal = parts[1]

  const sizes = {
    sm: { integer: 'text-base', decimal: 'text-xs', currency: 'text-xs' },
    md: { integer: 'text-2xl', decimal: 'text-sm', currency: 'text-sm' },
    lg: { integer: 'text-3xl', decimal: 'text-base', currency: 'text-base' },
    xl: { integer: 'text-4xl', decimal: 'text-lg', currency: 'text-lg' },
  }

  const s = sizes[size]

  return (
    <span className={cn('inline-flex items-baseline font-mono font-semibold', colorClass, className)}>
      <span className={cn('mr-0.5', s.currency, 'opacity-60')}>{currency}</span>
      <span className={s.integer}>{integer}</span>
      <span className={cn(s.decimal, 'opacity-50')}>.{decimal}</span>
    </span>
  )
}
