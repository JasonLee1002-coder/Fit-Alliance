'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ═══════════════════════════════════════════════════════════════════════
// Types & Constants
// ═══════════════════════════════════════════════════════════════════════

type Tab = 'report' | 'history'
type Step = 'type' | 'detail' | 'done'

interface Report {
  id: string
  type: string
  description: string
  status: string
  created_at: string
  screenshot_urls: string[] | null
  reply_count?: number
}

interface Reply {
  id: string
  content: string
  is_admin: boolean
  created_at: string
  user_name: string | null
  user_avatar: string | null
}

const REPORT_TYPES = [
  { value: 'bug', icon: '🐛', label: '功能異常', desc: '按鈕點不動、頁面白屏', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200 hover:border-red-400' },
  { value: 'ux', icon: '😤', label: '操作不順', desc: '步驟太多、找不到功能', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200 hover:border-orange-400' },
  { value: 'display', icon: '📱', label: '顯示問題', desc: '版面跑版、文字看不清', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200 hover:border-purple-400' },
  { value: 'feature', icon: '💡', label: '功能建議', desc: '希望新增功能', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200 hover:border-blue-400' },
  { value: 'other', icon: '📝', label: '其他', desc: '不在以上分類', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200 hover:border-gray-400' },
]

const TYPE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  bug: { label: 'Bug', color: 'text-red-700', bg: 'bg-red-100' },
  ux: { label: '操作不順', color: 'text-orange-700', bg: 'bg-orange-100' },
  display: { label: '顯示', color: 'text-purple-700', bg: 'bg-purple-100' },
  feature: { label: '建議', color: 'text-blue-700', bg: 'bg-blue-100' },
  other: { label: '其他', color: 'text-gray-700', bg: 'bg-gray-100' },
}

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: '待處理', color: 'text-yellow-800', bg: 'bg-yellow-100' },
  in_progress: { label: '處理中', color: 'text-blue-800', bg: 'bg-blue-100' },
  resolved: { label: '已解決', color: 'text-emerald-800', bg: 'bg-emerald-100' },
}

function formatDate(date: string) {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

// ═══════════════════════════════════════════════════════════════════════
// Status Timeline
// ═══════════════════════════════════════════════════════════════════════

function StatusTimeline({ status }: { status: string }) {
  const steps = [
    { key: 'open', label: '已提交' },
    { key: 'in_progress', label: '處理中' },
    { key: 'resolved', label: '已解決' },
  ]
  const currentIdx = steps.findIndex(s => s.key === status)
  const activeIdx = currentIdx === -1 ? 0 : currentIdx

  return (
    <div className="flex items-center gap-1 py-3">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              i <= activeIdx ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {i <= activeIdx ? '✓' : i + 1}
            </div>
            <span className={`mt-1 text-[10px] ${i <= activeIdx ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`mx-1 h-0.5 w-8 transition-colors ${i < activeIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Reply Thread — 雙向對話
// ═══════════════════════════════════════════════════════════════════════

function ReplyThread({ reportId }: { reportId: string }) {
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  const loadReplies = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('fa_dev_report_replies')
      .select(`
        id, content, is_admin, created_at,
        fa_users!user_id ( name, avatar_url )
      `)
      .eq('report_id', reportId)
      .order('created_at', { ascending: true })

    setReplies(
      (data ?? []).map((r: any) => ({
        id: r.id,
        content: r.content,
        is_admin: r.is_admin,
        created_at: r.created_at,
        user_name: r.fa_users?.name ?? null,
        user_avatar: r.fa_users?.avatar_url ?? null,
      }))
    )
    setLoading(false)
  }, [reportId])

  useEffect(() => {
    loadReplies()
  }, [loadReplies])

  const handleSendReply = async () => {
    if (!replyText.trim() || sending) return
    setSending(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSending(false); return }

    await supabase.from('fa_dev_report_replies').insert({
      report_id: reportId,
      user_id: user.id,
      content: replyText.trim(),
      is_admin: false,
    })

    setReplyText('')
    setSending(false)
    loadReplies()
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold text-gray-500">💬 對話紀錄</p>

      {loading && <p className="text-xs text-gray-400">載入中...</p>}
      {!loading && replies.length === 0 && <p className="text-xs text-gray-400">尚無回覆，團隊會盡快回應你</p>}

      {replies.map(r => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl px-3 py-2 text-sm ${
            r.is_admin
              ? 'ml-0 mr-8 bg-emerald-50 border border-emerald-200'
              : 'ml-8 mr-0 bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            {r.is_admin && (
              <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">團隊</span>
            )}
            <span className="text-xs font-medium text-gray-700">{r.user_name || '用戶'}</span>
            <span className="text-[10px] text-gray-400">{formatDate(r.created_at)}</span>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap">{r.content}</p>
        </motion.div>
      ))}

      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          placeholder="輸入回覆..."
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
          onKeyDown={e => {
            if (e.key === 'Enter' && replyText.trim() && !sending) handleSendReply()
          }}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSendReply}
          disabled={!replyText.trim() || sending}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow disabled:opacity-50"
        >
          {sending ? '...' : '送出'}
        </motion.button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// My Reports Tab — 回報歷史 + 展開詳情/截圖/時間軸/對話
// ═══════════════════════════════════════════════════════════════════════

function MyReportsTab({ reports, loading }: { reports: Report[]; loading: boolean }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-gray-400">
        <div className="text-4xl mb-2 yuzu-float">📭</div>
        <p className="text-sm">還沒有回報紀錄</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reports.map(report => {
        const typeBadge = TYPE_BADGE[report.type] || TYPE_BADGE.other!
        const statusBadge = STATUS_BADGE[report.status] || STATUS_BADGE.open!
        const isExpanded = expandedId === report.id
        const isResolved = report.status === 'resolved'

        return (
          <motion.div
            key={report.id}
            layout
            className={`rounded-2xl border bg-white overflow-hidden transition-colors ${
              isResolved ? 'border-emerald-200' : 'border-gray-200'
            }`}
          >
            {/* Summary row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : report.id)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeBadge.bg} ${typeBadge.color}`}>
                    {typeBadge.label}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge.bg} ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                  {(report.reply_count ?? 0) > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      {report.reply_count} 則回覆
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-800 truncate">{report.description.slice(0, 100)}</p>
                <p className="mt-0.5 text-[10px] text-gray-400">{formatDate(report.created_at)}</p>
              </div>
              <svg
                className={`mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Expanded detail */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-100 px-4 py-3"
                >
                  {/* Resolved celebration */}
                  {isResolved && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center"
                    >
                      <span className="text-lg">🎉</span>
                      <p className="text-sm font-semibold text-emerald-700 mt-1">此問題已解決！</p>
                      <p className="text-xs text-emerald-600 mt-0.5">感謝你的回報，讓我們變得更好</p>
                    </motion.div>
                  )}

                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {report.description}
                  </p>

                  {/* Screenshots */}
                  {report.screenshot_urls && report.screenshot_urls.length > 0 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {report.screenshot_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                          <img src={url} alt={`截圖 ${i + 1}`}
                            className="h-24 w-24 rounded-xl border border-gray-200 object-cover hover:border-emerald-400 transition" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Status timeline */}
                  <StatusTimeline status={report.status} />

                  {/* Reply thread */}
                  <ReplyThread reportId={report.id} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════

export default function ReportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<Tab>('report')
  const [step, setStep] = useState<Step>('type')
  const [selectedType, setSelectedType] = useState('')
  const [description, setDescription] = useState('')
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)

  const loadReports = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setReportsLoading(false); return }

    // Get reports with reply counts via a separate query
    const { data: reportsData } = await supabase
      .from('fa_dev_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (reportsData && reportsData.length > 0) {
      // Fetch reply counts
      const { data: replyCounts } = await supabase
        .from('fa_dev_report_replies')
        .select('report_id')
        .in('report_id', reportsData.map(r => r.id))

      const countMap: Record<string, number> = {}
      for (const rc of replyCounts ?? []) {
        countMap[rc.report_id] = (countMap[rc.report_id] ?? 0) + 1
      }

      setReports(reportsData.map(r => ({
        ...r,
        reply_count: countMap[r.id] ?? 0,
      })))
    } else {
      setReports([])
    }

    setReportsLoading(false)
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const handleAddScreenshots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024)
    if (validFiles.length < files.length) {
      alert('部分檔案超過 5MB 已被忽略')
    }
    setScreenshots(prev => [...prev, ...validFiles])
    setPreviewUrls(prev => [...prev, ...validFiles.map(f => URL.createObjectURL(f))])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveScreenshot = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]!)
    setScreenshots(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!selectedType || !description.trim()) return
    setSubmitting(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSubmitting(false); return }

    const uploadedUrls: string[] = []
    for (const file of screenshots) {
      const uploadForm = new FormData()
      uploadForm.append('file', file)
      uploadForm.append('bucket', 'report-screenshots')
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadForm })
      if (uploadRes.ok) {
        const { url } = await uploadRes.json()
        uploadedUrls.push(url)
      }
    }

    await supabase.from('fa_dev_reports').insert({
      user_id: user.id,
      type: selectedType,
      description: description.trim(),
      screenshot_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
    })

    setStep('done')
    setSubmitting(false)
    loadReports()
  }

  const reset = () => {
    setStep('type')
    setSelectedType('')
    setDescription('')
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setScreenshots([])
    setPreviewUrls([])
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">💬 問題回報</h1>

      {/* Tab switcher */}
      <div className="flex rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
            activeTab === 'report' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
          }`}
        >回報問題</button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
            activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
          }`}
        >我的回報</button>
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ Tab 1: Report Form ═══ */}
        {activeTab === 'report' && (
          <motion.div key="tab-report" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <AnimatePresence mode="wait">

              {/* Step 1: Select type */}
              {step === 'type' && (
                <motion.div key="step-type" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <p className="text-center text-sm text-gray-500">遇到什麼問題了嗎？</p>
                  <div className="space-y-2">
                    {REPORT_TYPES.map((type, i) => (
                      <motion.button
                        key={type.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setSelectedType(type.value); setStep('detail') }}
                        className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all ${type.border} ${type.bg}`}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${type.color}`}>{type.label}</p>
                          <p className="text-xs text-gray-400">{type.desc}</p>
                        </div>
                        <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Description + screenshots */}
              {step === 'detail' && (
                <motion.div key="step-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setStep('type'); setSelectedType('') }} className="text-sm text-gray-500">←</button>
                    <span className="text-sm text-gray-400">類型：</span>
                    {(() => {
                      const t = REPORT_TYPES.find(t => t.value === selectedType)
                      return t ? <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.bg} ${t.color}`}>{t.icon} {t.label}</span> : null
                    })()}
                  </div>

                  {/* Screenshot upload */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">📷 截圖（選填，每張限 5MB）</label>

                    {previewUrls.length > 0 && (
                      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
                        {previewUrls.map((url, i) => (
                          <div key={i} className="relative shrink-0">
                            <img src={url} alt={`截圖 ${i + 1}`} className="h-20 w-20 rounded-xl border border-gray-200 object-cover" />
                            <button
                              onClick={() => handleRemoveScreenshot(i)}
                              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow text-xs"
                            >✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition">
                        🖼️ 選擇圖片
                      </button>
                      <button type="button" onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.setAttribute('capture', 'environment')
                          fileInputRef.current.click()
                          fileInputRef.current.removeAttribute('capture')
                        }
                      }}
                        className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition">
                        📸 拍照
                      </button>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleAddScreenshots} className="hidden" />

                    {screenshots.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">已選 {screenshots.length} 張截圖</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">描述問題 <span className="text-red-500">*</span></label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="請描述你遇到的問題..."
                      autoFocus
                      maxLength={2000}
                      rows={5}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-900 focus:border-emerald-400 focus:outline-none resize-none"
                    />
                    <p className="mt-1 text-right text-[10px] text-gray-400">{description.length}/2000</p>
                  </div>

                  {/* Buttons */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={submitting || !description.trim()}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 text-lg"
                  >
                    {submitting ? '上傳中...' : '📤 送出回報'}
                  </motion.button>
                </motion.div>
              )}

              {/* Step 3: Done */}
              {step === 'done' && (
                <motion.div key="step-done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-16"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
                  >
                    <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </motion.div>
                  <h2 className="mt-4 text-lg font-bold text-gray-900">感謝你的回報！</h2>
                  <p className="mt-1 text-sm text-gray-500">我們會盡快處理，有進度會通知你</p>
                  <div className="mt-6 flex gap-3">
                    <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                      className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-md">繼續回報</motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => { reset(); setActiveTab('history') }}
                      className="rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-bold text-gray-600">查看紀錄</motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ═══ Tab 2: History ═══ */}
        {activeTab === 'history' && (
          <motion.div key="tab-history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <MyReportsTab reports={reports} loading={reportsLoading} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
