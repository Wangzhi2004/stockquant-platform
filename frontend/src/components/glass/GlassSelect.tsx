import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/formatters'
import { ChevronDown } from 'lucide-react'

interface GlassSelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface GlassSelectProps {
  options: GlassSelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  label?: string
  disabled?: boolean
}

export const GlassSelect: React.FC<GlassSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = '请选择',
  className,
  label,
  disabled,
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div className={cn('w-full', className)} ref={ref}>
      {label && (
        <label className="block text-sm text-text-secondary mb-1.5 font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          className={cn(
            'w-full flex items-center justify-between bg-black/20 backdrop-blur-md border border-glass-border rounded-glass-sm',
            'px-4 py-3 text-sm text-text-primary transition-all duration-200',
            'focus:outline-none glass-input-focus',
            open && 'border-accent/50 shadow-[0_0_0_2px_rgba(91,141,239,0.1)]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
        >
          <span className={cn(!selected && 'text-text-tertiary')}>
            {selected ? (
              <span className="inline-flex items-center gap-2">
                {selected.icon}
                {selected.label}
              </span>
            ) : placeholder}
          </span>
          <ChevronDown className={cn('w-4 h-4 text-text-tertiary transition-transform duration-200', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 glass-dropdown p-1 z-50 animate-slide-down">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'glass-dropdown-item text-sm',
                  option.value === value && 'glass-dropdown-item-active'
                )}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                <span className="inline-flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
