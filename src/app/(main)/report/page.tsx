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
  latest_reply?: string | null
}

interface Reply {
  id: string
  content: string
  is_admin: boolean
  created_at: string
  user_name: string | null
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

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  open: { label: '待處理', color: 'text-yellow-800', bg: 'bg-yellow-100', emoji: '⏳' },
  in_progress: { label: '處理中', color: 'text-blue-800', bg: 'bg-blue-100', emoji: '🔧' },
  resolved: { label: '已解決', color: 'text-emerald-800', bg: 'bg-emerald-100', emoji: '✅' },
}

function formatDate(date: string) {
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

// ═══════════════════════════════════════════════════════════════════════
// Service Dashboard（暗色主題統計）
// ═══════════════════════════════════════════════════════════════════════

function ServiceDashboard({ reports }: { reports: Report[] }) {
  const resolved = reports.filter(r => r.status === 'resolved').length
  const inProgress = reports.filter(r => r.status === 'in_progress').length
  const pending = reports.filter(r => r.status === 'open').length
  const total = reports.length
  const resolveRate = total > 0 ? Math.round((resolved / total) * 100) : 0

  if (total === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f172a] rounded-2xl text-white overflow-hidden"
    >
      <div className="px-5 pt-5 pb-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-sm">🛡️</div>
        <div>
          <h3 className="text-sm font-bold">服務儀表板</h3>
          <p className="text-[10px] text-white/40">我們重視每一則回饋</p>
        </div>
      </div>

      <div className="px-5 pb-4 grid grid-cols-3 gap-2.5">
        {[
          { label: '已解決', value: resolved, color: 'text-emerald-400' },
          { label: '處理中', value: inProgress, color: 'text-blue-400' },
          { label: '待處理', value: pending, color: 'text-amber-400' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 + i * 0.05 }}
            className="bg-white/[0.06] rounded-xl p-3 text-center"
          >
            <div className={`text-xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] text-white/40">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] text-white/40">解決率 {resolveRate}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
          {resolved > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(resolved / total) * 100}%` }} />}
          {inProgress > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${(inProgress / total) * 100}%` }} />}
          {pending > 0 && <div className="bg-amber-500 transition-all" style={{ width: `${(pending / total) * 100}%` }} />}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// 4-Step Status Timeline
// ═══════════════════════════════════════════════════════════════════════

function StatusTimeline({ status, hasReplies }: { status: string; hasReplies: boolean }) {
  const steps = [
    { key: 'submitted', label: '已提交', icon: '📝' },
    { key: 'received', label: '已收到', icon: '👀' },
    { key: 'in_progress', label: '處理中', icon: '🔧' },
    { key: 'resolved', label: '已解決', icon: '✅' },
  ]

  const getActiveIdx = () => {
    if (status === 'resolved') return 3
    if (status === 'in_progress') return 2
    if (hasReplies) return 1
    return 0
  }
  const activeIdx = getActiveIdx()

  return (
    <div className="flex items-center gap-0.5 py-3">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: i <= activeIdx ? 1 : 0.8 }}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${
                i <= activeIdx ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {i <= activeIdx ? s.icon : i + 1}
            </motion.div>
            <span className={`mt-1 text-[9px] ${i <= activeIdx ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`mx-0.5 h-0.5 w-6 transition-colors ${i < activeIdx ? 'bg-emerald-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Reply Thread
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
      .select('id, content, is_admin, created_at, fa_users!user_id ( name )')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true })

    setReplies(
      (data ?? []).map((r: any) => ({
        id: r.id,
        content: r.content,
        is_admin: r.is_admin,
        created_at: r.created_at,
        user_name: r.fa_users?.name ?? null,
      }))
    )
    setLoading(false)
  }, [reportId])

  useEffect(() => { loadReplies() }, [loadReplies])

  const handleSend = async () => {
    if (!replyText.trim() || sending) return
    setSending(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSending(false); return }
    await supabase.from('fa_dev_report_replies').insert({
      report_id: reportId, user_id: user.id, content: replyText.trim(), is_admin: false,
    })
    setReplyText('')
    setSending(false)
    loadReplies()
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold text-gray-500">💬 對話紀錄</p>
      {loading && <div className="animate-pulse h-8 bg-gray-100 rounded-xl" />}
      {!loading && replies.length === 0 && <p className="text-xs text-gray-400">尚無回覆，團隊會盡快回應</p>}
      {replies.map(r => (
        <motion.div
          key={r.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl px-3 py-2 text-sm ${
            r.is_admin ? 'ml-0 mr-8 bg-emerald-50 border border-emerald-200' : 'ml-8 mr-0 bg-gray-100'
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            {r.is_admin && <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">團隊</span>}
            <span className="text-xs font-medium text-gray-700">{r.user_name || '用戶'}</span>
            <span className="text-[10px] text-gray-400">{formatDate(r.created_at)}</span>
          </div>
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{r.content}</p>
        </motion.div>
      ))}
      <div className="flex gap-2 pt-1">
        <input
          type="text" value={replyText} onChange={e => setReplyText(e.target.value)}
          placeholder="輸入回覆..." onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none"
        />
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!replyText.trim() || sending}
          className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow disabled:opacity-50">
          {sending ? '...' : '送出'}
        </motion.button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// My Reports Tab
// ═══════════════════════════════════════════════════════════════════════

function MyReportsTab({ reports, loading, onDelete }: { reports: Report[]; loading: boolean; onDelete: (ids: string[]) => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteMode, setDeleteMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleBatchDelete = () => {
    if (selected.size === 0) return
    if (!confirm(`確定刪除 ${selected.size} 筆回報？此操作無法復原`)) return
    onDelete(Array.from(selected))
    setDeleteMode(false)
    setSelected(new Set())
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-16">
        <motion.div
          className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="text-3xl">📭</span>
        </motion.div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">還沒有回報紀錄</h3>
        <p className="text-sm text-gray-400">使用過程遇到問題？點上方按鈕告訴我們</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <ServiceDashboard reports={reports} />

      {/* Delete mode header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700">回報紀錄</h3>
        {deleteMode ? (
          <div className="flex items-center gap-2">
            <button onClick={() => { setDeleteMode(false); setSelected(new Set()) }}
              className="px-3 py-1 rounded-lg text-[11px] font-medium text-gray-500 bg-gray-100">取消</button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleBatchDelete}
              disabled={selected.size === 0}
              className="px-3 py-1 rounded-lg text-[11px] font-bold text-white bg-red-500 disabled:opacity-40">
              🗑 刪除 ({selected.size})
            </motion.button>
          </div>
        ) : (
          <button onClick={() => setDeleteMode(true)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        )}
      </div>

      {reports.map((report, idx) => {
        const typeBadge = TYPE_BADGE[report.type] || TYPE_BADGE.other!
        const statusBadge = STATUS_BADGE[report.status] || STATUS_BADGE.open!
        const isExpanded = !deleteMode && expandedId === report.id
        const isResolved = report.status === 'resolved'
        const screenshots = report.screenshot_urls ?? []
        const isSelected = selected.has(report.id)

        return (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            layout
            className={`rounded-2xl border bg-white overflow-hidden transition-colors ${
              isResolved ? 'border-emerald-200 shadow-sm shadow-emerald-50' : 'border-gray-200'
            }`}
          >
            <button onClick={() => deleteMode ? toggleSelect(report.id) : setExpandedId(isExpanded ? null : report.id)} className="flex w-full items-start gap-3 px-4 py-3 text-left">
              {/* Delete mode checkbox */}
              {deleteMode && (
                <motion.div initial={{ scale: 0, width: 0 }} animate={{ scale: 1, width: 'auto' }} className="flex items-center pt-1">
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                </motion.div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeBadge.bg} ${typeBadge.color}`}>{typeBadge.label}</span>
                  <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge.bg} ${statusBadge.color}`}>
                    {statusBadge.emoji} {statusBadge.label}
                  </span>
                  {(report.reply_count ?? 0) > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      💬 {report.reply_count}
                    </span>
                  )}
                  {screenshots.length > 0 && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                      📷 {screenshots.length}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-800 truncate">{report.description.slice(0, 100)}</p>
                <p className="mt-0.5 text-[10px] text-gray-400">{formatDate(report.created_at)}</p>

                {/* Reply preview (visible without expanding) */}
                {!isExpanded && report.latest_reply && (
                  <div className="mt-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[9px] font-bold text-emerald-600">💬 團隊回覆</span>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2">{report.latest_reply}</p>
                  </div>
                )}
              </div>
              <svg className={`mt-1 h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

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
                      <motion.span className="text-2xl inline-block"
                        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: 2 }}>🎉</motion.span>
                      <p className="text-sm font-semibold text-emerald-700 mt-1">此問題已解決！</p>
                      <p className="text-xs text-emerald-600 mt-0.5">感謝你的回報，讓我們變得更好</p>
                    </motion.div>
                  )}

                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{report.description}</p>

                  {/* Screenshots */}
                  {screenshots.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">📷 截圖 ({screenshots.length})</p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {screenshots.map((url: string, i: number) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                            <img src={url} alt={`截圖 ${i + 1}`}
                              className="h-28 w-28 rounded-xl border border-gray-200 object-cover hover:border-emerald-400 transition shadow-sm" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 4-step timeline */}
                  <StatusTimeline status={report.status} hasReplies={(report.reply_count ?? 0) > 0} />

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
  const [uploadError, setUploadError] = useState('')
  const [reports, setReports] = useState<Report[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)

  const loadReports = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setReportsLoading(false); return }

    const { data: reportsData } = await supabase
      .from('fa_dev_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (reportsData && reportsData.length > 0) {
      // Fetch reply counts + latest admin reply
      const ids = reportsData.map(r => r.id)
      const { data: allReplies } = await supabase
        .from('fa_dev_report_replies')
        .select('report_id, content, is_admin, created_at')
        .in('report_id', ids)
        .order('created_at', { ascending: false })

      const countMap: Record<string, number> = {}
      const latestReplyMap: Record<string, string> = {}
      for (const rc of allReplies ?? []) {
        countMap[rc.report_id] = (countMap[rc.report_id] ?? 0) + 1
        if (rc.is_admin && !latestReplyMap[rc.report_id]) {
          latestReplyMap[rc.report_id] = rc.content
        }
      }

      setReports(reportsData.map(r => ({
        ...r,
        reply_count: countMap[r.id] ?? 0,
        latest_reply: latestReplyMap[r.id] ?? null,
      })))
    } else {
      setReports([])
    }
    setReportsLoading(false)
  }, [])

  useEffect(() => { loadReports() }, [loadReports])

  const handleAddScreenshots = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024)
    if (validFiles.length < files.length) setUploadError('部分檔案超過 5MB')
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
    setUploadError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSubmitting(false); return }

      // Upload screenshots via server API
      const uploadedUrls: string[] = []
      for (const file of screenshots) {
        const form = new FormData()
        form.append('file', file)
        form.append('bucket', 'report-screenshots')
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        if (res.ok) {
          const { url } = await res.json()
          uploadedUrls.push(url)
        } else {
          const err = await res.json().catch(() => ({}))
          setUploadError(err.error || '截圖上傳失敗')
        }
      }

      const { error } = await supabase.from('fa_dev_reports').insert({
        user_id: user.id,
        type: selectedType,
        description: description.trim(),
        screenshot_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
      })

      if (error) {
        setUploadError('提交失敗：' + error.message)
        setSubmitting(false)
        return
      }

      setStep('done')
      loadReports()
    } catch (err) {
      setUploadError('提交發生錯誤，請重試')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setStep('type')
    setSelectedType('')
    setDescription('')
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setScreenshots([])
    setPreviewUrls([])
    setUploadError('')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">💬 問題回報</h1>

      {/* Tab switcher */}
      <div className="flex rounded-xl bg-gray-100 p-1">
        <button onClick={() => setActiveTab('report')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${activeTab === 'report' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}>
          回報問題
        </button>
        <button onClick={() => setActiveTab('history')}
          className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}>
          我的回報 {reports.length > 0 && <span className="ml-1 text-xs text-gray-400">({reports.length})</span>}
        </button>
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
                      <motion.button key={type.value}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setSelectedType(type.value); setStep('detail') }}
                        className={`flex w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all ${type.border} ${type.bg}`}>
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

              {/* Step 2: Detail + screenshots */}
              {step === 'detail' && (
                <motion.div key="step-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setStep('type'); setSelectedType('') }} className="text-sm text-gray-500">←</button>
                    {(() => {
                      const t = REPORT_TYPES.find(t => t.value === selectedType)
                      return t ? <span className={`rounded-full px-3 py-1 text-xs font-semibold ${t.bg} ${t.color}`}>{t.icon} {t.label}</span> : null
                    })()}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">描述問題 <span className="text-red-500">*</span></label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)}
                      placeholder="請描述你遇到的問題..." autoFocus maxLength={2000} rows={4}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm leading-relaxed text-gray-900 focus:border-emerald-400 focus:outline-none resize-none" />
                    <p className="mt-1 text-right text-[10px] text-gray-400">{description.length}/2000</p>
                  </div>

                  {/* Screenshot upload — CENTERED */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">📷 截圖（選填）</label>

                    {/* Preview */}
                    {previewUrls.length > 0 && (
                      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                        {previewUrls.map((url, i) => (
                          <div key={i} className="relative shrink-0">
                            <img src={url} alt={`截圖 ${i + 1}`} className="h-24 w-24 rounded-xl border border-gray-200 object-cover shadow-sm" />
                            <button onClick={() => handleRemoveScreenshot(i)}
                              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow text-xs">✕</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload buttons — centered */}
                    <div className="flex gap-3 justify-center">
                      <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 transition">
                        🖼️ 選擇圖片
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} type="button" onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.setAttribute('capture', 'environment')
                          fileInputRef.current.click()
                          fileInputRef.current.removeAttribute('capture')
                        }
                      }}
                        className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-600 hover:border-emerald-300 hover:bg-emerald-50 transition">
                        📸 拍照
                      </motion.button>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleAddScreenshots} className="hidden" />
                    {screenshots.length > 0 && <p className="text-xs text-gray-400 mt-2 text-center">已選 {screenshots.length} 張截圖</p>}
                  </div>

                  {/* Error */}
                  {uploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{uploadError}</div>
                  )}

                  {/* Submit */}
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit}
                    disabled={submitting || !description.trim()}
                    className="relative w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 text-lg overflow-hidden">
                    {submitting ? '上傳中...' : '📤 送出回報'}
                  </motion.button>
                </motion.div>
              )}

              {/* Step 3: Done */}
              {step === 'done' && (
                <motion.div key="step-done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-16">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
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
            <MyReportsTab reports={reports} loading={reportsLoading} onDelete={async (ids) => {
              const supabase = createClient()
              await supabase.from('fa_dev_reports').delete().in('id', ids)
              loadReports()
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
