import React from 'react'
import { cn } from '@/utils/formatters'

interface HeatmapData {
  month: number
  year: number
  value: number
}

interface HeatmapChartProps {
  data: HeatmapData[]
  className?: string
  cellSize?: number
}

export const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  className,
  cellSize = 28,
}) => {
  const years = [...new Set(data.map((d) => d.year))].sort()
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 1)

  const getColor = (value: number) => {
    if (value === 0) return 'rgba(255,255,255,0.03)'
    const intensity = Math.abs(value) / maxAbs
    if (value > 0) {
      return `rgba(0, 229, 160, ${0.1 + intensity * 0.5})`
    }
    return `rgba(255, 69, 103, ${0.1 + intensity * 0.5})`
  }

  const getGlow = (value: number) => {
    const intensity = Math.abs(value) / maxAbs
    if (intensity > 0.7) {
      return value > 0
        ? '0 0 8px rgba(0,229,160,0.3)'
        : '0 0 8px rgba(255,69,103,0.3)'
    }
    return 'none'
  }

  const dataMap = new Map(data.map((d) => [`${d.year}-${d.month}`, d.value]))

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="inline-flex flex-col gap-1">
        <div className="flex items-center gap-1 mb-1">
          <div style={{ width: cellSize + 8 }} />
          {months.map((m) => (
            <div
              key={m}
              className="text-[10px] text-text-tertiary text-center"
              style={{ width: cellSize }}
            >
              {m}
            </div>
          ))}
        </div>
        {years.map((year) => (
          <div key={year} className="flex items-center gap-1">
            <div
              className="text-[10px] text-text-tertiary text-right pr-1"
              style={{ width: cellSize + 8 }}
            >
              {year}
            </div>
            {Array.from({ length: 12 }).map((_, m) => {
              const val = dataMap.get(`${year}-${m + 1}`) ?? 0
              return (
                <div
                  key={m}
                  className="rounded-[4px] flex items-center justify-center text-[9px] font-mono transition-all duration-200 cursor-default"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: getColor(val),
                    boxShadow: getGlow(val),
                    color: Math.abs(val) / maxAbs > 0.4 ? (val > 0 ? '#00e5a0' : '#ff4567') : '#5a5e72',
                  }}
                  title={`${year}年${m + 1}月: ${val >= 0 ? '+' : ''}${(val * 100).toFixed(1)}%`}
                >
                  {val !== 0 ? `${(val * 100).toFixed(0)}` : ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
