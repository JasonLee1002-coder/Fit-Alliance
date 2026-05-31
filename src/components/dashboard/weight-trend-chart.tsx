'use client'

import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import type { HealthRecord } from '@/types'

interface Props {
  records: HealthRecord[]
  targetWeight: number | null
}

export default function WeightTrendChart({ records, targetWeight }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const weightRecords = records
    .filter(r => r.weight != null)
    .map(r => ({ date: r.date, weight: r.weight as number }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (weightRecords.length < 2) return null
  if (!mounted) return <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 h-[240px] animate-pulse" />

  const data = weightRecords.map(r => {
    const mo = r.date.slice(5, 7)
    const dy = r.date.slice(8, 10)
    return {
      label: `${+mo}/${+dy}`,
      actual: r.weight,
    }
  })

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">📈 體重趨勢</h3>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={['auto', 'auto']} />
          <Tooltip formatter={(value: unknown) => [`${value} kg`, '體重']} />
          <Line
            type="monotone" dataKey="actual"
            stroke="#00C6AD" strokeWidth={2.5}
            dot={{ r: 3, fill: '#00C6AD' }}
            connectNulls={false}
            activeDot={{ r: 5 }}
          />
          {targetWeight && (
            <ReferenceLine
              y={targetWeight} stroke="#F5A623" strokeDasharray="4 4"
              label={{ value: `目標${targetWeight}`, position: 'insideTopRight', fontSize: 10, fill: '#F5A623' }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 rounded bg-teal-400 inline-block" />實際體重
        </span>
      </div>
    </div>
  )
}
