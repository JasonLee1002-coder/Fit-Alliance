'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { HealthRecord } from '@/types'

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'
type Metric = 'weight' | 'bodyFat'

const TIME_RANGES: { key: TimeRange; label: string; days: number }[] = [
  { key: 'week',    label: '週',  days: 7 },
  { key: 'month',   label: '月',  days: 30 },
  { key: 'quarter', label: '季',  days: 90 },
  { key: 'year',    label: '年',  days: 365 },
  { key: 'all',     label: '全部', days: 99999 },
]

const METRICS: { key: Metric; label: string; unit: string; color: string; textColor: string }[] = [
  { key: 'weight',  label: '體重',  unit: 'kg', color: '#10b981', textColor: 'text-emerald-400' },
  { key: 'bodyFat', label: '體脂率', unit: '%',  color: '#f59e0b', textColor: 'text-amber-400' },
]

interface Props {
  records: HealthRecord[]
  defaultRange?: TimeRange
  showRangeSelector?: boolean
  className?: string
}

const CustomTooltip = ({ active, payload, label, unit }: {
  active?: boolean; payload?: { value: number }[]; label?: string; unit?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-700/95 border border-slate-500/60 rounded-xl px-3 py-2 text-xs shadow-2xl pointer-events-none">
      <div className="text-slate-300 font-medium mb-1">{label}</div>
      <div className="font-bold text-white text-sm">{payload[0].value}{unit}</div>
    </div>
  )
}

export default function UnifiedHealthChart({
  records,
  defaultRange = 'month',
  showRangeSelector = true,
  className,
}: Props) {
  const [timeRange, setTimeRange] = useState<TimeRange>(defaultRange)
  const [metric, setMetric] = useState<Metric>('weight')

  const cutoffDays = TIME_RANGES.find(t => t.key === timeRange)?.days ?? 30
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - cutoffDays)

  const filteredInRange = [...records]
    .filter(r => timeRange === 'all' || new Date(r.date) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date))

  // 當選取範圍內不足 2 筆時，自動退回全部資料（避免誤顯示「需要至少 2 筆」）
  const filtered = filteredInRange.length >= 2 ? filteredInRange : [...records].sort((a, b) => a.date.localeCompare(b.date))

  const chartData = filtered.map(r => ({
    date: r.date.slice(5),
    weight:  r.weight     ?? null,
    bodyFat: r.body_fat   ?? null,
  }))

  const currentMetric = METRICS.find(m => m.key === metric)!
  const hasData = chartData.some(d => d[metric] != null)

  // Auto Y-axis domain with padding
  const vals = chartData.map(d => d[metric]).filter((v): v is number => v != null)
  const min = vals.length ? Math.min(...vals) : 0
  const max = vals.length ? Math.max(...vals) : 100
  const pad = (max - min) * 0.2 || 2
  const domain: [number, number] = [
    parseFloat((min - pad).toFixed(1)),
    parseFloat((max + pad).toFixed(1)),
  ]

  return (
    <div className={`bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-5 ${className ?? ''}`}>

      {/* Metric selector — always show both tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                metric === m.key
                  ? 'text-white shadow-sm'
                  : 'bg-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
              style={metric === m.key ? { backgroundColor: m.color } : {}}
            >
              {m.label}
            </button>
          ))}
        </div>

      {/* Time range selector */}
      {showRangeSelector && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
          {TIME_RANGES.map(t => (
            <button
              key={t.key}
              onClick={() => setTimeRange(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                timeRange === t.key
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-900/50'
                  : 'bg-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Chart */}
      {!hasData || chartData.length < 2 ? (
        <div className="h-44 flex items-center justify-center text-slate-400 text-sm">
          {chartData.length < 2 ? '需要至少 2 筆紀錄' : `尚無${currentMetric.label}數據`}
        </div>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 5, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                domain={domain}
                tick={{ fontSize: 10, fill: currentMetric.color }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                width={34}
                tickFormatter={v => `${v}`}
              />
              <Tooltip
                content={<CustomTooltip unit={` ${currentMetric.unit}`} />}
                allowEscapeViewBox={{ x: false, y: true }}
                position={{ y: -70 }}
                cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 2' }}
              />
              <Line
                type="monotone"
                dataKey={metric}
                stroke={currentMetric.color}
                strokeWidth={2.5}
                dot={{ fill: currentMetric.color, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: currentMetric.color, strokeWidth: 0 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Current value display */}
      {hasData && (
        <div className="mt-3 flex items-center justify-between">
          <span className={`text-xs font-bold ${currentMetric.textColor}`}>
            {currentMetric.label}
          </span>
          <span className="text-white font-black text-base">
            {vals.at(-1)}{currentMetric.unit}
            {vals.length >= 2 && (
              <span className={`ml-2 text-xs font-bold ${
                (vals.at(-1)! - vals[0]) < 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {(vals.at(-1)! - vals[0]) > 0 ? '+' : ''}{(vals.at(-1)! - vals[0]).toFixed(1)}{currentMetric.unit}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
