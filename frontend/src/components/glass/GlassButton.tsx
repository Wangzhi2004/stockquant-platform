import React from 'react'
import { cn } from '@/utils/formatters'
import { Loader2 } from 'lucide-react'

interface GlassButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  className,
  onClick,
  disabled,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
}) => {
  const variants = {
    primary: 'bg-accent/20 border-accent/30 text-accent hover:bg-accent/30 hover:border-accent/50 hover:shadow-glow-accent',
    secondary: 'bg-glass-bg border-glass-border text-text-secondary hover:bg-glass-bg-hover hover:border-glass-border-highlight hover:text-text-primary',
    danger: 'bg-down/10 border-down/25 text-down hover:bg-down/20 hover:border-down/40 hover:shadow-glow-down',
    ghost: 'bg-transparent border-transparent text-text-secondary hover:bg-glass-bg hover:text-text-primary',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-glass-sm backdrop-blur-md transition-all duration-200 border font-medium',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  )
}
