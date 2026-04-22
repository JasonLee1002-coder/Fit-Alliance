'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { HealthRecord } from '@/types'
import AnimatedWeightPct from '@/components/shared/animated-weight-pct'
import UnifiedHealthChart from '@/components/shared/unified-health-chart'

type Tab = 'chart' | 'list'

export default function RecordsView({ records, readOnly = false }: { records: HealthRecord[]; readOnly?: boolean }) {
  // 不足 2 筆時直接顯示列表（圖表無意義）
  const [tab, setTab] = useState<Tab>(records.length >= 2 ? 'chart' : 'list')

  // Summary stats
  const allWeights = records.map(r => r.weight).filter(Boolean) as number[]
  const firstWeight = allWeights[allWeights.length - 1] ?? null
  const latestWeight = allWeights[0] ?? null
  const totalLost = firstWeight && latestWeight ? +(firstWeight - latestWeight).toFixed(1) : null
  const weightChangePct = firstWeight && latestWeight && firstWeight > 0
    ? +((firstWeight - latestWeight) / firstWeight * 100).toFixed(1)
    : null
  const minWeight = allWeights.length ? Math.min(...allWeights) : null
  const totalDays = records.length

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">📊 健康紀錄</h1>

      {/* Hero 體重變化百分比 */}
      {weightChangePct !== null && totalDays >= 2 && (
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-3xl border border-emerald-100 shadow-sm p-6">
          <AnimatedWeightPct pct={weightChangePct} kg={totalLost ?? undefined} size="hero" />
        </div>
      )}

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

      {/* Tabs */}
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

      {tab === 'chart' ? (
        records.length < 2 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">📈</div>
            <p className="text-sm">需要至少 2 筆紀錄才能顯示趨勢圖</p>
            <a href="/" className="mt-3 inline-block text-xs text-emerald-600 font-medium">去記錄第一筆 →</a>
          </div>
        ) : (
          <UnifiedHealthChart records={records} defaultRange="month" showRangeSelector />
        )
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {records.length === 0 ? (
            <div className="p-8 text-center">
              <motion.img
                src="/pikmin-scale.png"
                alt="皮克敏量體重"
                className="w-28 h-28 object-contain mx-auto mb-3"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <h3 className="text-base font-bold text-gray-800">還沒有體重紀錄</h3>
              <p className="text-sm text-gray-400 mt-1 mb-4">皮克敏在等你！每天記錄是進步最快的秘訣</p>
              <a href="/" className="inline-block px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow text-sm">
                ⚡ 去記錄今天體重
              </a>
              <p className="text-xs text-gray-300 mt-4">💡 支援拍量體機截圖，AI 自動填入數值</p>
            </div>
          ) : (
            records.map(record => (
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
