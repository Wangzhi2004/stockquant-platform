import React from 'react'
import { cn } from '@/utils/formatters'

interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  strokeWidth?: number
  className?: string
  showLabels?: boolean
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 160,
  strokeWidth = 20,
  className,
  showLabels = true,
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total === 0) return null

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  let currentOffset = 0

  const arcs = segments.map((segment) => {
    const ratio = segment.value / total
    const dashLength = circumference * ratio
    const gap = circumference - dashLength
    const offset = -currentOffset * circumference
    currentOffset += ratio
    return {
      ...segment,
      dashLength,
      gap,
      offset,
      ratio,
    }
  })

  return (
    <div className={cn('inline-flex items-center gap-4', className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={strokeWidth}
        />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc.dashLength} ${arc.gap}`}
            strokeDashoffset={arc.offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-500"
            style={{ filter: `drop-shadow(0 0 4px ${arc.color}40)` }}
          />
        ))}
      </svg>
      {showLabels && (
        <div className="space-y-1.5">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: seg.color, boxShadow: `0 0 6px ${seg.color}60` }}
              />
              <span className="text-text-secondary">{seg.label}</span>
              <span className="text-text-primary font-mono ml-auto">{((seg.value / total) * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
