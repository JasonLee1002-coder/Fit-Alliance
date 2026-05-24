'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { predictWeight } from '@/lib/prediction'
import type { HealthRecord } from '@/types'

interface Props {
  records: HealthRecord[]
  targetWeight: number | null
}

export default function WeightTrendChart({ records, targetWeight }: Props) {
  const weightRecords = records
    .filter(r => r.weight != null)
    .map(r => ({ date: r.date, weight: r.weight as number }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (weightRecords.length < 2) return null

  const prediction = predictWeight(weightRecords, targetWeight)

  const actualMap = new Map(weightRecords.map(r => [r.date, r.weight]))
  const predMap = new Map((prediction?.predictedPoints ?? []).map(p => [p.date, p.weight]))
  const allDates = Array.from(new Set([...actualMap.keys(), ...predMap.keys()])).sort()

  const data = allDates.map(date => {
    const mo = date.slice(5, 7)
    const dy = date.slice(8, 10)
    return {
      date,
      label: `${+mo}/${+dy}`,
      actual: actualMap.get(date) ?? null,
      predicted: predMap.get(date) ?? null,
    }
  })

  const targetDateLabel = prediction?.targetDate
    ? `${+(prediction.targetDate.slice(5,7))}/${+(prediction.targetDate.slice(8,10))}`
    : null

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">📈 體重趨勢</h3>
        {targetWeight && prediction?.targetDate && (
          <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
            預計 {targetDateLabel} 達到 {targetWeight}kg 🎯
          </div>
        )}
      </div>
      {weightRecords.length < 3 && (
        <p className="text-xs text-gray-400 mb-2">再打卡 {3 - weightRecords.length} 次後開啟 AI 預測線</p>
      )}
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9CA3AF' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value: unknown, name: unknown) => [
              `${value} kg`,
              name === 'actual' ? '實際' : 'AI預測',
            ]}
          />
          <Line
            type="monotone" dataKey="actual" name="actual"
            stroke="#00C6AD" strokeWidth={2.5}
            dot={{ r: 3, fill: '#00C6AD' }}
            connectNulls={false}
            activeDot={{ r: 5 }}
          />
          {prediction && weightRecords.length >= 3 && (
            <Line
              type="monotone" dataKey="predicted" name="predicted"
              stroke="#9CA3AF" strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
              connectNulls={false}
            />
          )}
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
        {prediction && weightRecords.length >= 3 && (
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0 border-t-2 border-dashed border-gray-300 inline-block" />AI 預測
          </span>
        )}
      </div>
    </div>
  )
}
