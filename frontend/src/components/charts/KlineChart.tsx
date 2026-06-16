import React, { useState } from 'react'
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
  Line,
} from 'recharts'
import { GlassTabs } from '@/components/glass/GlassTabs'

interface KlineData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  macd?: number
  signal?: number
  hist?: number
}

interface KlineChartProps {
  data: KlineData[]
  height?: number
  showVolume?: boolean
  showMacd?: boolean
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  const isUp = d.close >= d.open
  return (
    <div className="glass-card p-3 text-xs !bg-background-tertiary/95">
      <p className="text-text-secondary mb-1">{d.date}</p>
      <div className="space-y-0.5 font-mono">
        <p>开: <span className={isUp ? 'text-up' : 'text-down'}>{d.open.toFixed(2)}</span></p>
        <p>高: <span className="text-text-primary">{d.high.toFixed(2)}</span></p>
        <p>低: <span className="text-text-primary">{d.low.toFixed(2)}</span></p>
        <p>收: <span className={isUp ? 'text-up' : 'text-down'}>{d.close.toFixed(2)}</span></p>
        <p>量: <span className="text-text-tertiary">{(d.volume / 10000).toFixed(0)}万</span></p>
        {d.macd !== undefined && (
          <>
            <p className="border-t border-white/[0.04] pt-1 mt-1">MACD: <span className="text-accent">{d.macd.toFixed(3)}</span></p>
            <p>信号: <span className="text-warning">{d.signal?.toFixed(3)}</span></p>
            <p>柱: <span className={d.hist >= 0 ? 'text-up' : 'text-down'}>{d.hist?.toFixed(3)}</span></p>
          </>
        )}
      </div>
    </div>
  )
}

export const KlineChart: React.FC<KlineChartProps> = ({
  data,
  height = 400,
  showVolume = true,
  showMacd = false,
}) => {
  const [overlay, setOverlay] = useState<string>(showMacd ? 'macd' : 'none')

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

  const chartHeight = overlay === 'macd' ? height + 100 : height

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <GlassTabs
          tabs={[
            { key: 'none', label: 'K线' },
            { key: 'macd', label: 'MACD' },
          ]}
          activeKey={overlay}
          onChange={setOverlay}
          size="sm"
        />
      </div>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <ComposedChart data={processed} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeGradientUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e5a0" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#00e5a0" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="volumeGradientDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff4567" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ff4567" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#5a5e72' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.04)' }}
            minTickGap={30}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 10, fill: '#5a5e72', fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v.toFixed(2)}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={data[data.length - 1]?.close} stroke="rgba(91,141,239,0.2)" strokeDasharray="4 4" />

          {showVolume && (
            <Bar
              dataKey="volume"
              barSize={8}
              yAxisId="volume-y"
              fill="transparent"
              isAnimationActive={false}
            >
              {processed.map((d, i) => (
                <Cell key={`vol-${i}`} fill={d.isUp ? 'url(#volumeGradientUp)' : 'url(#volumeGradientDown)'} />
              ))}
            </Bar>
          )}

          {overlay === 'macd' && (
            <>
              <Line
                type="monotone"
                dataKey="macd"
                stroke="#5b8def"
                strokeWidth={1.5}
                dot={false}
                yAxisId="macd-y"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="signal"
                stroke="#ffb347"
                strokeWidth={1.5}
                dot={false}
                yAxisId="macd-y"
                isAnimationActive={false}
              />
              <Bar
                dataKey="hist"
                barSize={4}
                yAxisId="macd-y"
                fill="transparent"
                isAnimationActive={false}
              >
                {processed.map((d, i) => (
                  <Cell key={`hist-${i}`} fill={(d.hist ?? 0) >= 0 ? '#00e5a0' : '#ff4567'} fillOpacity={0.6} />
                ))}
              </Bar>
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default KlineChart
