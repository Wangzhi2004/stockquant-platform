import React from 'react'
import { cn } from '@/utils/formatters'

interface GlassInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: string
  className?: string
  label?: string
  error?: string
  icon?: React.ReactNode
  disabled?: boolean
}

export const GlassInput: React.FC<GlassInputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  className,
  label,
  error,
  icon,
  disabled,
}) => {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm text-text-secondary mb-1.5 font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full bg-black/20 backdrop-blur-md border border-glass-border rounded-glass-sm',
            'px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none glass-input-focus',
            'transition-all duration-200',
            icon ? 'pl-10' : undefined,
            error && 'glass-input-error',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-down">{error}</p>
      )}
    </div>
  )
}
