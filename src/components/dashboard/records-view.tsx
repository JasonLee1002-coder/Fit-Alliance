'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import type { HealthRecord } from '@/types'

type Tab = 'chart' | 'list'
type TimeRange = 'week' | 'month' | 'quarter' | 'all'

export default function RecordsView({ records, readOnly = false }: { records: HealthRecord[]; readOnly?: boolean }) {
  const [tab, setTab] = useState<Tab>('chart')
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

  // Summary stats
  const allWeights = records.map(r => r.weight).filter(Boolean) as number[]
  const firstWeight = allWeights[allWeights.length - 1] ?? null
  const latestWeight = allWeights[0] ?? null
  const totalLost = firstWeight && latestWeight ? +(firstWeight - latestWeight).toFixed(1) : null
  const minWeight = allWeights.length ? Math.min(...allWeights) : null
  const totalDays = records.length

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">📊 健康紀錄</h1>

      {/* Summary Stats */}
      {totalDays > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
            <div className="text-xl font-black text-emerald-600">{totalDays}</div>
            <div className="text-xs text-gray-400 mt-0.5">記錄天數</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
            <div className={`text-xl font-black ${totalLost && totalLost > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
              {totalLost !== null ? (totalLost > 0 ? `↓${totalLost}` : totalLost < 0 ? `↑${Math.abs(totalLost)}` : '0') : '—'} <span className="text-sm font-medium">kg</span>
            </div>
            <div className="text-xs text-gray-400 mt-0.5">總變化</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
            <div className="text-xl font-black text-blue-600">{minWeight ?? '—'} <span className="text-sm font-medium">kg</span></div>
            <div className="text-xs text-gray-400 mt-0.5">歷史最低</div>
          </div>
        </div>
      )}

      {/* Tabs + Time Range */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {([
            { key: 'chart' as Tab, label: '📈 圖表' },
            { key: 'list' as Tab, label: '📋 列表' },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.key ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {([
            { key: 'week' as TimeRange, label: '週' },
            { key: 'month' as TimeRange, label: '月' },
            { key: 'quarter' as TimeRange, label: '季' },
            { key: 'all' as TimeRange, label: '全部' },
          ]).map(t => (
            <button key={t.key} onClick={() => setTimeRange(t.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${timeRange === t.key ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'chart' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          {chartData.length < 2 ? (
            <div className="py-12 text-center text-gray-400">
              <div className="text-4xl mb-3">📈</div>
              <p className="text-sm">需要至少 2 筆紀錄才能顯示趨勢圖</p>
              <a href="/" className="mt-3 inline-block text-xs text-emerald-600 font-medium">去記錄第一筆 →</a>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Weight AreaChart */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800">⚖️ 體重趨勢</h3>
                  {latestWeight && <span className="text-sm font-black text-emerald-600">{latestWeight} kg</span>}
                </div>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#aaa' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#aaa' }} domain={['auto', 'auto']} />
                      <Tooltip formatter={(v: any) => [`${v} kg`, '體重']} allowEscapeViewBox={{ x: false, y: false }} wrapperStyle={{ zIndex: 10 }} />
                      <Area type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2.5}
                        fill="url(#weightGrad)" dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} name="體重" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Body Fat */}
              {chartData.some(d => d.bodyFat) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">🔥 體脂率趨勢</h3>
                    <span className="text-sm font-black text-amber-600">
                      {chartData.filter(d => d.bodyFat).at(-1)?.bodyFat}%
                    </span>
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                        <defs>
                          <linearGradient id="fatGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#aaa' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#aaa' }} domain={['auto', 'auto']} />
                        <Tooltip formatter={(v: any) => [`${v}%`, '體脂率']} allowEscapeViewBox={{ x: false, y: false }} wrapperStyle={{ zIndex: 10 }} />
                        <Area type="monotone" dataKey="bodyFat" stroke="#f59e0b" strokeWidth={2}
                          fill="url(#fatGrad)" dot={{ r: 2, fill: '#f59e0b' }} name="體脂率" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Muscle */}
              {chartData.some(d => d.muscle) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">💪 肌肉量趨勢</h3>
                    <span className="text-sm font-black text-cyan-600">
                      {chartData.filter(d => d.muscle).at(-1)?.muscle} kg
                    </span>
                  </div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                        <defs>
                          <linearGradient id="muscleGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#aaa' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#aaa' }} domain={['auto', 'auto']} />
                        <Tooltip formatter={(v: any) => [`${v} kg`, '肌肉量']} allowEscapeViewBox={{ x: false, y: false }} wrapperStyle={{ zIndex: 10 }} />
                        <Area type="monotone" dataKey="muscle" stroke="#06b6d4" strokeWidth={2}
                          fill="url(#muscleGrad)" dot={{ r: 2, fill: '#06b6d4' }} name="肌肉量" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {filteredRecords.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-5xl mb-3">⚖️</div>
              <h3 className="text-base font-bold text-gray-800">還沒有體重紀錄</h3>
              <p className="text-sm text-gray-400 mt-1 mb-4">每天記錄是進步最快的秘訣</p>
              <a href="/" className="inline-block px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow text-sm">
                ⚡ 去記錄今天體重
              </a>
              <p className="text-xs text-gray-300 mt-4">💡 支援拍量體機截圖，AI 自動填入數值</p>
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
      )}
    </div>
  )
}
