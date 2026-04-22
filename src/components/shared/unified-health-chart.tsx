'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { HealthRecord } from '@/types'

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

const TIME_RANGES: { key: TimeRange; label: string; days: number }[] = [
  { key: 'week', label: '週', days: 7 },
  { key: 'month', label: '月', days: 30 },
  { key: 'quarter', label: '季', days: 90 },
  { key: 'year', label: '年', days: 365 },
  { key: 'all', label: '全部', days: 99999 },
]

interface Props {
  records: HealthRecord[]
  defaultRange?: TimeRange
  showRangeSelector?: boolean
  className?: string
}

interface TooltipPayload {
  dataKey: string
  color: string
  value: number
  name: string
  unit: string
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-700/95 border border-slate-500/60 rounded-xl px-3 py-2 text-xs shadow-2xl backdrop-blur-sm pointer-events-none">
      <div className="text-slate-300 font-medium mb-1.5 border-b border-slate-600 pb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5 mt-1">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400">{p.name}</span>
          <span className="font-bold text-white ml-auto pl-3">{p.value}{p.unit}</span>
        </div>
      ))}
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

  const cutoffDays = TIME_RANGES.find(t => t.key === timeRange)?.days ?? 30
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - cutoffDays)

  const filtered = [...records]
    .filter(r => timeRange === 'all' || new Date(r.date) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date))

  const chartData = filtered.map(r => ({
    date: r.date.slice(5),
    weight: r.weight ?? null,
    bodyFat: r.body_fat ?? null,
    muscle: r.muscle_mass ?? null,
  }))

  const hasBodyFat = chartData.some(d => d.bodyFat != null)
  const hasMuscle = chartData.some(d => d.muscle != null)

  const weights = chartData.map(d => d.weight).filter((v): v is number => v != null)
  const muscles = chartData.map(d => d.muscle).filter((v): v is number => v != null)
  const fats = chartData.map(d => d.bodyFat).filter((v): v is number => v != null)

  // Left axis: weight + muscle (both in kg, unified scale)
  const leftVals = [...weights, ...muscles]
  const leftMin = leftVals.length ? Math.min(...leftVals) : 0
  const leftMax = leftVals.length ? Math.max(...leftVals) : 100
  const leftPad = (leftMax - leftMin) * 0.18 || 3

  // Right axis: body fat (%)
  const fatMin = fats.length ? Math.min(...fats) : 0
  const fatMax = fats.length ? Math.max(...fats) : 50
  const fatPad = (fatMax - fatMin) * 0.18 || 3

  if (chartData.length < 2) {
    return (
      <div className={`bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-5 ${className ?? ''}`}>
        <div className="h-40 flex items-center justify-center text-slate-400 text-sm">需要至少 2 筆紀錄</div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-5 ${className ?? ''}`}>
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
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: hasBodyFat ? 34 : 8, bottom: 5, left: -8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            {/* Left Y-axis: weight & muscle (kg) */}
            <YAxis
              yAxisId="left"
              domain={[Math.floor(leftMin - leftPad), Math.ceil(leftMax + leftPad)]}
              tick={{ fontSize: 10, fill: '#34d399' }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
              width={30}
            />
            {/* Right Y-axis: body fat (%) */}
            {hasBodyFat && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[Math.floor(fatMin - fatPad), Math.ceil(fatMax + fatPad)]}
                tick={{ fontSize: 10, fill: '#fbbf24' }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                width={30}
              />
            )}
            {/* Tooltip: pinned above chart so it never blocks curves */}
            <Tooltip
              content={<CustomTooltip />}
              allowEscapeViewBox={{ x: false, y: true }}
              position={{ y: -90 }}
              cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 2' }}
            />
            {/* Weight — solid emerald */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="weight"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
              connectNulls
              name="體重"
              unit=" kg"
            />
            {/* Muscle — dashed cyan, left axis */}
            {hasMuscle && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="muscle"
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ fill: '#06b6d4', strokeWidth: 0, r: 2 }}
                activeDot={{ r: 4, fill: '#06b6d4', strokeWidth: 0 }}
                connectNulls
                name="肌肉量"
                unit=" kg"
              />
            )}
            {/* Body fat — dashed amber, right axis */}
            {hasBodyFat && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bodyFat"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={{ fill: '#f59e0b', strokeWidth: 0, r: 2 }}
                activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
                connectNulls
                name="體脂率"
                unit="%"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center flex-wrap gap-x-5 gap-y-1.5 mt-3">
        <span className="flex items-center gap-1.5 text-[11px]">
          <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke="#10b981" strokeWidth="2.5" /></svg>
          <span className="text-emerald-400">體重</span>
        </span>
        {hasMuscle && (
          <span className="flex items-center gap-1.5 text-[11px]">
            <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke="#06b6d4" strokeWidth="2" strokeDasharray="5 2" /></svg>
            <span className="text-cyan-400">肌肉量</span>
          </span>
        )}
        {hasBodyFat && (
          <span className="flex items-center gap-1.5 text-[11px]">
            <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5 2" /></svg>
            <span className="text-amber-400">體脂率</span>
          </span>
        )}
        {hasBodyFat && (
          <span className="text-[10px] text-slate-500">｜ 左軸: kg　右軸: %</span>
        )}
      </div>
    </div>
  )
}
