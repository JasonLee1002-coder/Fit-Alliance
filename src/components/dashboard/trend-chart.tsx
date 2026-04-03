'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { HealthRecord } from '@/types'

type Metric = 'weight' | 'bodyFat'

export default function TrendChart({ records }: { records: HealthRecord[] }) {
  const [metric, setMetric] = useState<Metric>('weight')

  const hasBodyFat = records.some(r => r.body_fat !== null)

  const data = records.map(r => ({
    date: r.date.slice(5),
    weight: r.weight,
    bodyFat: r.body_fat,
  }))

  const values = data
    .map(d => metric === 'weight' ? d.weight : d.bodyFat)
    .filter((v): v is number => v !== null)

  if (values.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        {metric === 'bodyFat' ? '體脂率數據不足，至少需要 2 筆' : '數據不足'}
      </div>
    )
  }

  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const padding = (maxVal - minVal) * 0.15 || 2

  const config = {
    weight: { color: '#10b981', label: '體重', unit: 'kg' },
    bodyFat: { color: '#f59e0b', label: '體脂率', unit: '%' },
  }[metric]

  return (
    <div>
      {/* Metric Selector */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setMetric('weight')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
            metric === 'weight'
              ? 'bg-emerald-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          ⚖️ 體重
        </button>
        {hasBodyFat && (
          <button
            onClick={() => setMetric('bodyFat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              metric === 'bodyFat'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            📊 體脂率
          </button>
        )}
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} axisLine={{ stroke: '#eee' }} />
            <YAxis
              domain={[Math.floor(minVal - padding), Math.ceil(maxVal + padding)]}
              tick={{ fontSize: 11, fill: '#999' }}
              axisLine={{ stroke: '#eee' }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value) => [`${value} ${config.unit}`, config.label]}
            />
            <Line
              type="monotone"
              dataKey={metric}
              stroke={config.color}
              strokeWidth={2.5}
              dot={{ fill: config.color, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: config.color }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
