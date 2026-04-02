'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

const REPORT_TYPES = [
  { value: 'bug', label: '🐛 功能異常', desc: '按鈕點不動、頁面白屏' },
  { value: 'ux', label: '😤 操作不順', desc: '步驟太多、找不到功能' },
  { value: 'display', label: '📱 顯示問題', desc: '版面跑版、文字看不清' },
  { value: 'feature', label: '💡 功能建議', desc: '希望新增功能' },
  { value: 'other', label: '📝 其他', desc: '不在以上分類' },
]

export default function ReportPage() {
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [reports, setReports] = useState<Array<{
    id: string; type: string; description: string; status: string; created_at: string
  }>>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('fa_dev_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setReports(data ?? [])
  }

  const handleSubmit = async () => {
    if (!selectedType || !description.trim()) return
    setSubmitting(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('fa_dev_reports').insert({
      user_id: user.id,
      type: selectedType,
      description: description.trim(),
    })

    setSubmitted(true)
    setSubmitting(false)
    loadReports()
  }

  const reset = () => {
    setStep(1)
    setSelectedType('')
    setDescription('')
    setSubmitted(false)
  }

  const statusLabel = (s: string) => {
    const map: Record<string, { label: string; color: string }> = {
      open: { label: '待處理', color: 'bg-yellow-100 text-yellow-700' },
      in_progress: { label: '處理中', color: 'bg-blue-100 text-blue-700' },
      resolved: { label: '已解決', color: 'bg-emerald-100 text-emerald-700' },
    }
    return map[s] || { label: s, color: 'bg-gray-100 text-gray-600' }
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-900">感謝你的回報！</h2>
          <p className="text-gray-500 mt-2">我們會盡快處理</p>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={() => { reset(); window.location.href = '/' }} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-medium">回首頁</button>
            <button onClick={reset} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-medium">繼續回報</button>
            <button onClick={() => { reset(); setShowHistory(true) }} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-medium">查看紀錄</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">💬 問題回報</h1>
        <button onClick={() => setShowHistory(!showHistory)} className="text-sm text-emerald-600 font-medium">
          {showHistory ? '新回報' : '查看紀錄'}
        </button>
      </div>

      {showHistory ? (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400">還沒有回報紀錄</div>
          ) : (
            reports.map(r => {
              const st = statusLabel(r.status)
              return (
                <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${st.color}`}>{st.label}</span>
                    <span className="text-xs text-gray-400">{r.created_at.split('T')[0]}</span>
                  </div>
                  <p className="text-sm text-gray-700">{r.description}</p>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <>
          {/* Step 1 */}
          {step === 1 && (
            <div className="grid gap-3">
              {REPORT_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => { setSelectedType(type.value); setStep(2) }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-left hover:border-emerald-300 transition active:scale-[0.98]"
                >
                  <div className="text-lg font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{type.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
              <button onClick={() => setStep(1)} className="text-sm text-gray-500">← 返回選擇類型</button>
              <h3 className="text-lg font-bold text-gray-900">描述問題</h3>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="請描述你遇到的問題..."
                rows={5}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none resize-none"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting || !description.trim()}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 text-lg"
              >
                {submitting ? '送出中...' : '📤 送出回報'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
