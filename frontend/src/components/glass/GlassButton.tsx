import React from 'react'
import { cn } from '@/utils/formatters'

interface GlassButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className,
  onClick,
  disabled,
}) => {
  const variants = {
    primary: 'bg-accent/20 border-accent/30 text-accent hover:bg-accent/30 hover:border-accent/50',
    secondary: 'bg-glass-bg border-glass-border text-text-secondary hover:bg-glass-bg-hover hover:border-glass-border-highlight hover:text-text-primary',
    danger: 'bg-down/10 border-down/25 text-down hover:bg-down/20 hover:border-down/40',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={cn(
        'rounded-glass-sm backdrop-blur-md transition-all duration-200 border font-medium',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
