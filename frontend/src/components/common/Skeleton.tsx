import React from 'react'
import { cn } from '@/utils/formatters'

interface SkeletonProps {
  width?: string
  height?: string
  className?: string
  rounded?: 'sm' | 'md' | 'full'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height = '16px',
  className,
  rounded = 'sm',
}) => {
  const roundedClasses = {
    sm: 'rounded-[4px]',
    md: 'rounded-glass-sm',
    full: 'rounded-full',
  }

  return (
    <div
      className={cn('glass-skeleton', roundedClasses[rounded], className)}
      style={{ width, height }}
    />
  )
}

interface SkeletonGroupProps {
  rows?: number
  className?: string
}

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  rows = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          height="14px"
          width={i === rows - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  )
}
