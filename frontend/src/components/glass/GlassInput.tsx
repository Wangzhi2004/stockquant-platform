import React from 'react'
import { cn } from '@/utils/formatters'

interface GlassInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: string
  className?: string
}

export const GlassInput: React.FC<GlassInputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full bg-black/20 backdrop-blur-md border border-glass-border rounded-glass-sm',
        'px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary',
        'focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10',
        'transition-all duration-200',
        className
      )}
    />
  )
}
