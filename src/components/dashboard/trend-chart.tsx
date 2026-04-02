'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { HealthRecord } from '@/types'

export default function TrendChart({ records }: { records: HealthRecord[] }) {
  const data = records.map(r => ({
    date: r.date.slice(5), // MM-DD
    weight: r.weight,
    bodyFat: r.body_fat,
  }))

  const weights = data.map(d => d.weight).filter((w): w is number => w !== null)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const padding = (maxWeight - minWeight) * 0.15 || 2

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#999' }}
            axisLine={{ stroke: '#eee' }}
          />
          <YAxis
            domain={[Math.floor(minWeight - padding), Math.ceil(maxWeight + padding)]}
            tick={{ fontSize: 11, fill: '#999' }}
            axisLine={{ stroke: '#eee' }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            formatter={(value) => [`${value} kg`, '體重']}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ fill: '#10b981', strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
