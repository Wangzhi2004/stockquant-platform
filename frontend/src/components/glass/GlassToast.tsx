import React, { useState, useEffect, useCallback } from 'react'
import { cn } from '@/utils/formatters'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface GlassToastProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

const toastConfig: Record<ToastType, { icon: React.ElementType; color: string; border: string; glow: string }> = {
  success: { icon: CheckCircle, color: 'text-up', border: 'border-up/20', glow: 'shadow-glow-up' },
  error: { icon: AlertCircle, color: 'text-down', border: 'border-down/20', glow: 'shadow-glow-down' },
  info: { icon: Info, color: 'text-accent', border: 'border-accent/20', glow: 'shadow-glow-accent' },
  warning: { icon: AlertTriangle, color: 'text-warning', border: 'border-warning/20', glow: 'shadow-[0_0_20px_rgba(255,179,71,0.15)]' },
}

const ToastItem: React.FC<{ toast: Toast; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const [exiting, setExiting] = useState(false)
  const config = toastConfig[toast.type]
  const Icon = config.icon

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }, [toast.id, onDismiss])

  useEffect(() => {
    const timer = setTimeout(dismiss, toast.duration ?? 4000)
    return () => clearTimeout(timer)
  }, [dismiss, toast.duration])

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-glass-sm border backdrop-blur-md bg-glass-bg min-w-[320px] max-w-[420px]',
        config.border,
        config.glow,
        exiting ? 'glass-toast-exit' : 'glass-toast-enter'
      )}
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', config.color)} />
      <p className="text-sm text-text-primary flex-1">{toast.message}</p>
      <button
        className="shrink-0 p-0.5 text-text-tertiary hover:text-text-primary transition-colors"
        onClick={dismiss}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export const GlassToast: React.FC<GlassToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

let toastId = 0
export function createToast(type: ToastType, message: string, duration?: number): Toast {
  return { id: `toast-${++toastId}`, type, message, duration }
}
