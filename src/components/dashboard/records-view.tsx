'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { HealthRecord } from '@/types'

type Tab = 'list' | 'chart'
type TimeRange = 'week' | 'month' | 'quarter' | 'all'

export default function RecordsView({ records }: { records: HealthRecord[] }) {
  const [tab, setTab] = useState<Tab>('list')
  const [timeRange, setTimeRange] = useState<TimeRange>('month')

  const filteredRecords = (() => {
    const now = new Date()
    const cutoff = new Date()
    switch (timeRange) {
      case 'week': cutoff.setDate(now.getDate() - 7); break
      case 'month': cutoff.setMonth(now.getMonth() - 1); break
      case 'quarter': cutoff.setMonth(now.getMonth() - 3); break
      default: cutoff.setFullYear(2000)
    }
    return records.filter(r => new Date(r.date) >= cutoff)
  })()

  const chartData = [...filteredRecords].reverse().map(r => ({
    date: r.date.slice(5),
    weight: r.weight,
    bodyFat: r.body_fat,
    muscle: r.muscle_mass,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">📊 健康紀錄</h1>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'list' as Tab, label: '📋 列表' },
          { key: 'chart' as Tab, label: '📈 圖表' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === t.key ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Time Range */}
      <div className="flex gap-2">
        {[
          { key: 'week' as TimeRange, label: '週' },
          { key: 'month' as TimeRange, label: '月' },
          { key: 'quarter' as TimeRange, label: '季' },
          { key: 'all' as TimeRange, label: '全部' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTimeRange(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              timeRange === t.key ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'list' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-5xl">📊</span>
              <p className="text-gray-500 mt-3">還沒有紀錄</p>
              <a href="/" className="mt-3 inline-block text-sm text-emerald-600 font-medium">去打卡</a>
            </div>
          ) : (
            filteredRecords.map(record => (
              <div key={record.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{record.date}</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {record.body_fat && `體脂 ${record.body_fat}%`}
                    {record.muscle_mass && ` · 肌肉 ${record.muscle_mass}kg`}
                    {record.visceral_fat && ` · 內臟脂肪 ${record.visceral_fat}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">{record.weight} kg</div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          {chartData.length < 2 ? (
            <div className="p-12 text-center text-gray-400">需要至少 2 筆紀錄才能顯示圖表</div>
          ) : (
            <div className="space-y-6">
              {/* Weight Chart */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">體重趨勢</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#999' }} domain={['auto', 'auto']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="體重 (kg)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Body Fat Chart (if data exists) */}
              {chartData.some(d => d.bodyFat) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">體脂率趨勢</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#999' }} domain={['auto', 'auto']} />
                        <Tooltip />
                        <Line type="monotone" dataKey="bodyFat" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="體脂率 (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
