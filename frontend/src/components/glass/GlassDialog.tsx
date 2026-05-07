import React, { useEffect } from 'react'
import { cn } from '@/utils/formatters'
import { X } from 'lucide-react'

interface GlassDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  footer?: React.ReactNode
}

export const GlassDialog: React.FC<GlassDialogProps> = ({
  open,
  onClose,
  title,
  children,
  className,
  size = 'md',
  footer,
}) => {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="glass-overlay animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'glass-card relative z-[101] w-full animate-scale-in',
          sizes[size],
          className
        )}
      >
        {(title) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/[0.04]">
            {title && (
              <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            )}
            <button
              className="p-1.5 rounded-glass-sm text-text-tertiary hover:text-text-primary hover:bg-white/[0.05] transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">
          {children}
        </div>
        {footer && (
          <div className="px-6 pb-5 pt-3 border-t border-white/[0.04] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
