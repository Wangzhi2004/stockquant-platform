import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface PnLData {
  date: string
  value: number
  benchmark: number
}

interface PortfolioChartProps {
  data: PnLData[]
  height?: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload) return null
  return (
    <div className="glass-card p-3 text-xs !bg-background-tertiary/95">
      <p className="text-text-secondary mb-1">{payload[0]?.payload?.date}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-mono">
          <span style={{ color: p.color }}>{p.name}:</span>{' '}
          <span className="text-text-primary">¥{p.value?.toLocaleString()}</span>
        </p>
      ))}
    </div>
  )
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ data, height = 320 }) => {
  const startValue = data[0]?.value || 0
  const isProfit = data[data.length - 1]?.value >= startValue

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isProfit ? '#00e5a0' : '#ff4567'} stopOpacity={0.15} />
            <stop offset="95%" stopColor={isProfit ? '#00e5a0' : '#ff4567'} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#5b8def" stopOpacity={0.08} />
            <stop offset="95%" stopColor="#5b8def" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#5a5e72' }}
          tickLine={false}
          axisLine={{ stroke: 'rgba(255,255,255,0.04)' }}
          minTickGap={40}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#5a5e72', fontFamily: 'monospace' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `¥${(v / 10000).toFixed(0)}万`}
          width={70}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={startValue} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="benchmark"
          name="基准"
          stroke="#5b8def"
          strokeWidth={1}
          strokeDasharray="4 4"
          fill="url(#colorBenchmark)"
          dot={false}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="value"
          name="组合"
          stroke={isProfit ? '#00e5a0' : '#ff4567'}
          strokeWidth={2}
          fill="url(#colorValue)"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default PortfolioChart
