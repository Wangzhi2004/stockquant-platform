import React from 'react'
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'

interface KlineData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface KlineChartProps {
  data: KlineData[]
  height?: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  const isUp = d.close >= d.open
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-text-secondary mb-1">{d.date}</p>
      <div className="space-y-0.5 font-mono">
        <p>开: <span className={isUp ? 'text-up' : 'text-down'}>{d.open.toFixed(2)}</span></p>
        <p>高: <span className="text-text-primary">{d.high.toFixed(2)}</span></p>
        <p>低: <span className="text-text-primary">{d.low.toFixed(2)}</span></p>
        <p>收: <span className={isUp ? 'text-up' : 'text-down'}>{d.close.toFixed(2)}</span></p>
        <p>量: <span className="text-text-tertiary">{(d.volume / 10000).toFixed(0)}万</span></p>
      </div>
    </div>
  )
}

export const KlineChart: React.FC<KlineChartProps> = ({ data, height = 400 }) => {
  const processed = data.map((d) => {
    const isUp = d.close >= d.open
    const bodyTop = Math.max(d.open, d.close)
    const bodyBottom = Math.min(d.open, d.close)
    return {
      ...d,
      isUp,
      bodyTop,
      bodyBottom,
      bodyHeight: bodyTop - bodyBottom,
      upperShadow: d.high - bodyTop,
      lowerShadow: bodyBottom - d.low,
    }
  })

  const yDomain = [
    Math.min(...data.map((d) => d.low)) * 0.998,
    Math.max(...data.map((d) => d.high)) * 1.002,
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={processed} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#86868b' }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
          minTickGap={30}
        />
        <YAxis
          domain={yDomain}
          tick={{ fontSize: 11, fill: '#86868b', fontFamily: 'monospace' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => v.toFixed(2)}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={data[data.length - 1]?.close} stroke="rgba(0,113,227,0.3)" strokeDasharray="4 4" />

        {processed.map((d, i) => (
          <React.Fragment key={i}>
            <Bar
              dataKey="high"
              fill={d.isUp ? '#00c805' : '#ff5000'}
              barSize={1}
              stackId={`shadow-${i}`}
              isAnimationActive={false}
            />
            <Cell fill={d.isUp ? '#00c805' : '#ff5000'} />
          </React.Fragment>
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default KlineChart
