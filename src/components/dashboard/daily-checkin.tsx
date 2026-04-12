'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDateWithWeekday, calculateBMI, getStandardWeight, getBodyFatRange } from '@/lib/utils'
import type { User, HealthRecord, DailyLog } from '@/types'
import TrendChart from './trend-chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ScaleMascot, CoachMascot, TrophyMascot, CameraMascot } from '@/components/shared/mascots'

interface Props {
  user: User
  records: HealthRecord[]
  todayRecord?: HealthRecord
  dailyLog: DailyLog | null
  streak: number
}

export default function DailyCheckIn({ user, records, todayRecord, dailyLog, streak }: Props) {
  const router = useRouter()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [showMore, setShowMore] = useState(!!(todayRecord?.body_fat || todayRecord?.muscle_mass || todayRecord?.visceral_fat))
  const [encouragement, setEncouragement] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('fa_coach_msg')
      if (cached) {
        try {
          const { date, message } = JSON.parse(cached)
          if (date === new Date().toISOString().split('T')[0]) return message
        } catch { /* ignore */ }
      }
    }
    return ''
  })
  const [justCheckedIn, setJustCheckedIn] = useState(false)
  const [arenaRanking, setArenaRanking] = useState<{ name: string; progress: number; avatar: string | null; isMe: boolean }[]>([])
  const [arenaTitle, setArenaTitle] = useState('')
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [ocrDone, setOcrDone] = useState(false)

  const [form, setForm] = useState({
    weight: todayRecord?.weight?.toString() ?? '',
    body_fat: todayRecord?.body_fat?.toString() ?? '',
    muscle_mass: todayRecord?.muscle_mass?.toString() ?? '',
    visceral_fat: todayRecord?.visceral_fat?.toString() ?? '',
    bone_mass: todayRecord?.bone_mass?.toString() ?? '',
    bmr: todayRecord?.bmr?.toString() ?? '',
    bmi: todayRecord?.bmi?.toString() ?? '',
    date: new Date().toISOString().split('T')[0],
  })

  const [ocrLoading, setOcrLoading] = useState(false)
  const [compareRange, setCompareRange] = useState<'prev' | 'week' | 'month' | 'quarter' | 'year' | '3year'>('prev')
  const weightInputRef = useRef<HTMLInputElement>(null)
  const submitBtnRef = useRef<HTMLButtonElement>(null)

  // Get comparison record based on selected range
  const getCompareRecord = () => {
    const today = new Date(form.date)
    if (compareRange === 'prev') return records.find(r => r.date !== form.date) ?? records[1]
    const offsets: Record<string, number> = { week: 7, month: 30, quarter: 90, year: 365, '3year': 1095 }
    const targetDate = new Date(today)
    targetDate.setDate(targetDate.getDate() - (offsets[compareRange] || 1))
    // Find closest record to target date
    let closest: HealthRecord | undefined
    let closestDiff = Infinity
    for (const r of records) {
      const diff = Math.abs(new Date(r.date).getTime() - targetDate.getTime())
      if (diff < closestDiff) { closestDiff = diff; closest = r }
    }
    return closest?.date !== form.date ? closest : undefined
  }
  const lastRecord = getCompareRecord()

  // Persist coach message to localStorage
  useEffect(() => {
    if (encouragement) {
      localStorage.setItem('fa_coach_msg', JSON.stringify({
        date: new Date().toISOString().split('T')[0],
        message: encouragement,
      }))
    }
  }, [encouragement])

  // Auto-fetch daily greeting if no coach message exists
  useEffect(() => {
    if (encouragement) return
    const fetchGreeting = async () => {
      try {
        const now = new Date()
        const recentWeights = records.slice(0, 5).map(r => r.weight).filter(Boolean) as number[]
        const trend = recentWeights.length >= 3
          ? recentWeights[0] < recentWeights[recentWeights.length - 1] ? '下降中' : '上升中'
          : undefined
        const res = await fetch('/api/ai/greeting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: user.name,
            gender: user.gender,
            latestWeight: records[0]?.weight,
            previousWeight: records[1]?.weight,
            targetWeight: user.target_weight,
            streak,
            recentTrend: trend,
            bodyFat: records[0]?.body_fat,
            dayOfWeek: ['日', '一', '二', '三', '四', '五', '六'][now.getDay()],
            hour: now.getHours(),
          }),
        })
        if (res.ok) {
          const { message } = await res.json()
          if (message) setEncouragement(message)
        }
      } catch { /* greeting is nice-to-have */ }
    }
    fetchGreeting()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // If todayRecord exists but form was reset, sync back
  useEffect(() => {
    if (todayRecord && !form.weight) {
      setForm({
        weight: todayRecord.weight?.toString() ?? '',
        body_fat: todayRecord.body_fat?.toString() ?? '',
        muscle_mass: todayRecord.muscle_mass?.toString() ?? '',
        visceral_fat: todayRecord.visceral_fat?.toString() ?? '',
        bone_mass: todayRecord.bone_mass?.toString() ?? '',
        bmr: todayRecord.bmr?.toString() ?? '',
        bmi: todayRecord.bmi?.toString() ?? '',
        date: new Date().toISOString().split('T')[0],
      })
    }
  }, [todayRecord])

  useEffect(() => {
    const fetchArena = async () => {
      try {
        const supabase = createClient()
        const { data: challenges } = await supabase
          .from('fa_challenges')
          .select('id, name')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
        if (!challenges || challenges.length === 0) return
        const challenge = challenges[0]
        setArenaTitle(challenge.name)
        const { data: participants } = await supabase
          .from('fa_challenge_participants')
          .select('user_id, target_type, target_value, start_value, current_value, user:fa_users(name, avatar_url)')
          .eq('challenge_id', challenge.id)
        if (!participants) return
        const ranked = participants
          .map((p: any) => {
            const start = p.start_value ?? 0
            const curr = p.current_value ?? start
            const target = p.target_value ?? 1
            const reduced = start - curr
            const progress = target > 0 ? Math.min(Math.round((reduced / target) * 100), 100) : 0
            return {
              name: p.user?.name ?? '勇者',
              progress: Math.max(0, progress),
              avatar: p.user?.avatar_url ?? null,
              isMe: p.user_id === user.id,
            }
          })
          .sort((a: any, b: any) => b.progress - a.progress)
        setArenaRanking(ranked)
      } catch {}
    }
    fetchArena()
  }, [user.id])

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    setScreenshotPreview(URL.createObjectURL(file))
    setScreenshotFile(file)
    setOcrDone(false)
    setOcrLoading(true)

    // Auto-expand more fields since OCR may fill them
    setShowMore(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch('/api/ai/food-recognize', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.weight) setForm(f => ({ ...f, weight: data.weight.toString() }))
        if (data.body_fat) setForm(f => ({ ...f, body_fat: data.body_fat.toString() }))
        if (data.muscle_mass) setForm(f => ({ ...f, muscle_mass: data.muscle_mass.toString() }))
        if (data.visceral_fat) setForm(f => ({ ...f, visceral_fat: data.visceral_fat.toString() }))
        if (data.bmi) setForm(f => ({ ...f, bmi: data.bmi.toString() }))
        if (data.bmr) setForm(f => ({ ...f, bmr: data.bmr.toString() }))
        if (data.bone_mass) setForm(f => ({ ...f, bone_mass: data.bone_mass.toString() }))
        setOcrDone(true)

        // Scroll to weight field and flash it
        setTimeout(() => {
          weightInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          weightInputRef.current?.classList.add('yuzu-flash-border')
          setTimeout(() => weightInputRef.current?.classList.remove('yuzu-flash-border'), 2000)
        }, 300)
      }
    } catch {
      // OCR failed, user can input manually
    } finally {
      setOcrLoading(false)
    }

    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleSubmit = async () => {
    if (!form.weight) return
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Upload screenshot via server API (bypasses storage RLS)
      let screenshotUrl: string | null = null
      if (screenshotFile) {
        const uploadForm = new FormData()
        uploadForm.append('file', screenshotFile)
        uploadForm.append('bucket', 'weight-screenshots')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadForm })
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          screenshotUrl = url
        }
      }

      const record = {
        user_id: authUser.id,
        date: form.date,
        weight: parseFloat(form.weight),
        body_fat: form.body_fat ? parseFloat(form.body_fat) : null,
        muscle_mass: form.muscle_mass ? parseFloat(form.muscle_mass) : null,
        visceral_fat: form.visceral_fat ? parseFloat(form.visceral_fat) : null,
        bone_mass: form.bone_mass ? parseFloat(form.bone_mass) : null,
        bmr: form.bmr ? parseFloat(form.bmr) : null,
        bmi: form.bmi ? parseFloat(form.bmi) : null,
        ...(screenshotUrl ? { screenshot_url: screenshotUrl } : {}),
      }

      if (todayRecord) {
        await supabase.from('fa_health_records').update(record).eq('id', todayRecord.id)
      } else {
        await supabase.from('fa_health_records').insert(record)
      }

      // Update current_value in all active challenge participations
      await supabase
        .from('fa_challenge_participants')
        .update({ current_value: parseFloat(form.weight) })
        .eq('user_id', authUser.id)


      // Get AI encouragement
      try {
        const aiRes = await fetch('/api/ai/encourage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: user.name,
            currentWeight: parseFloat(form.weight),
            previousWeight: lastRecord?.weight,
            bodyFatChange: form.body_fat && lastRecord?.body_fat
              ? parseFloat(form.body_fat) - (lastRecord.body_fat as number)
              : null,
            streak: streak + (todayRecord ? 0 : 1),
            targetWeight: user.target_weight,
          }),
        })
        if (aiRes.ok) {
          const { message } = await aiRes.json()
          if (message) setEncouragement(message)
        }
      } catch {
        // AI encouragement is nice-to-have
      }

      setJustCheckedIn(true)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const weightDiff = lastRecord?.weight && form.weight
    ? parseFloat(form.weight) - (lastRecord.weight as number)
    : null

  const hasCheckedIn = !!todayRecord || justCheckedIn

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              嗨，{user.name} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {formatDateWithWeekday(new Date())}
              {user.target_weight && records[0]?.weight && (
                <span className="ml-2 text-emerald-600">
                  目標 {user.target_weight} kg（還差 {Math.abs(records[0].weight as number - user.target_weight).toFixed(1)} kg）
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {streak >= 2 && (
              <span className="bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full text-xs font-bold">
                🔥 {streak} 天
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              hasCheckedIn ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {hasCheckedIn ? '✅ 已打卡' : '尚未打卡'}
            </span>
          </div>
        </div>

      </div>

      {/* Check-in Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">⚡ 今日打卡</h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (galleryInputRef.current) {
                  galleryInputRef.current.removeAttribute('capture')
                  galleryInputRef.current.click()
                }
              }}
              disabled={ocrLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-emerald-300 transition active:scale-[0.98]"
            >
              🖼️ 選截圖
            </button>
            <button
              onClick={() => {
                if (cameraInputRef.current) {
                  cameraInputRef.current.setAttribute('capture', 'environment')
                  cameraInputRef.current.click()
                }
              }}
              disabled={ocrLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-emerald-300 transition active:scale-[0.98]"
            >
              📷 拍照
            </button>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
            <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </div>
        </div>

        {/* Screenshot Preview */}
        {screenshotPreview && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-gray-200">
            <img src={screenshotPreview} alt="截圖預覽" className="w-full max-h-48 object-contain bg-gray-50" />
          </div>
        )}

        {/* OCR Status */}
        {ocrLoading && (
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="yuzu-spinner-dark yuzu-spinner flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-blue-700 yuzu-text-glow">🧠 AI 正在辨識中</div>
                <div className="text-xs text-blue-500 mt-0.5 flex items-center gap-1">
                  分析圖片數值
                  <span className="yuzu-thinking-dot inline-block w-1 h-1 rounded-full bg-blue-500" />
                  <span className="yuzu-thinking-dot inline-block w-1 h-1 rounded-full bg-blue-500" />
                  <span className="yuzu-thinking-dot inline-block w-1 h-1 rounded-full bg-blue-500" />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 yuzu-shimmer pointer-events-none" />
          </div>
        )}
        {ocrDone && !ocrLoading && (
          <div className="mb-4 p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700 border border-emerald-200 yuzu-pop-in">
            ✅ AI 辨識完成，請確認數值（可手動修正）
          </div>
        )}

        {/* Weight (main field) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">體重 (kg)</label>
          <input
            ref={weightInputRef}
            type="number"
            step="0.1"
            value={form.weight}
            onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
            placeholder="例：72.5"
            className={`w-full rounded-2xl border-2 px-4 py-4 text-2xl font-bold text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition ${
              ocrDone && form.weight ? 'border-emerald-400 bg-emerald-50/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'border-gray-200'
            }`}
          />
        </div>

        {/* More fields (collapsed) */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full text-left text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          {showMore ? '▼ 收起更多數據' : '➕ 輸入更多數據（體脂率、BMI、肌肉量）'}
        </button>

        {showMore && (
          <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 rounded-2xl">
            {[
              { key: 'body_fat', label: '體脂率 (%)', placeholder: '例：25.0', color: 'text-orange-600', infoLink: '/body-fat-info' },
              { key: 'bmi', label: 'BMI', placeholder: '例：24.5', color: 'text-blue-600', infoLink: '/bmi-info' },
              { key: 'muscle_mass', label: '肌肉量 (kg)', placeholder: '例：45.0', color: 'text-cyan-600' },
              { key: 'visceral_fat', label: '內臟脂肪', placeholder: '例：8', color: 'text-rose-600', infoLink: '/visceral-fat-info' },
              { key: 'bone_mass', label: '骨質量 (kg)', placeholder: '例：3.0', color: 'text-violet-600' },
              { key: 'bmr', label: '基礎代謝率 (kcal)', placeholder: '例：1500', color: 'text-amber-600' },
            ].map(field => (
              <div key={field.key}>
                <label className={`flex items-center gap-1 text-xs font-bold mb-1 ${field.color}`}>
                  {field.label}
                  {(field as any).infoLink && (
                    <a href={(field as any).infoLink} className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold hover:bg-gray-300 transition">?</a>
                  )}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form[field.key as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-emerald-400 outline-none transition"
                />
              </div>
            ))}
          </div>
        )}

        {/* Date */}
        <div className="mb-5">
          <label className="block text-xs text-gray-400 mb-1">日期（可補登過去紀錄）</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-emerald-400 outline-none transition"
          />
        </div>

        {/* Submit */}
        <button
          ref={submitBtnRef}
          onClick={handleSubmit}
          disabled={loading || !form.weight}
          className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-30 text-lg ${loading ? 'yuzu-btn-loading' : ''} ${form.weight && !loading ? 'yuzu-glow-pulse shadow-emerald-200/50' : ''}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="yuzu-spinner" />
              記錄中
              <span className="yuzu-thinking-dot inline-block w-1 h-1 rounded-full bg-white" />
              <span className="yuzu-thinking-dot inline-block w-1 h-1 rounded-full bg-white" />
              <span className="yuzu-thinking-dot inline-block w-1 h-1 rounded-full bg-white" />
            </span>
          ) : '⚡ 立即打卡'}
        </button>
      </div>

      {/* AI Coach - always visible */}
      {encouragement && (
        <div className="bg-gradient-to-r from-emerald-50 to-orange-50 rounded-3xl border border-emerald-100 p-5 yuzu-pop-in">
          <div className="flex items-start gap-3">
            <img src="/char-coach-sm.png" alt="AI教練" className="w-11 h-11 rounded-full shadow flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-700 mb-1">AI 教練說：</p>
              <p className="text-gray-700 leading-relaxed">{encouragement}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Card (show after check-in or if today has record) */}
      {hasCheckedIn && form.weight && lastRecord && (() => {
        const today = form.date
        const prevDate = lastRecord.date
        const daysDiff = Math.round((new Date(today).getTime() - new Date(prevDate).getTime()) / 86400000)

        const rows: { label: string; prev: number | null; curr: number | null; unit: string; color: string; badgeColor: string; infoHref?: string }[] = [
          { label: '體重', prev: lastRecord.weight as number, curr: parseFloat(form.weight), unit: 'kg', color: 'text-red-400', badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30' },
          { label: '體脂率', prev: lastRecord.body_fat as number | null, curr: form.body_fat ? parseFloat(form.body_fat) : null, unit: '%', color: 'text-rose-400', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30', infoHref: '/body-fat-info' },
          { label: '內臟脂肪', prev: lastRecord.visceral_fat as number | null, curr: form.visceral_fat ? parseFloat(form.visceral_fat) : null, unit: '', color: 'text-yellow-400', badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', infoHref: '/visceral-fat-info' },
          { label: '肌肉量', prev: lastRecord.muscle_mass as number | null, curr: form.muscle_mass ? parseFloat(form.muscle_mass) : null, unit: 'kg', color: 'text-green-400', badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30', infoHref: '/muscle-info' },
          { label: 'BMI', prev: lastRecord.bmi as number | null, curr: form.bmi ? parseFloat(form.bmi) : null, unit: '', color: 'text-blue-400', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30', infoHref: '/bmi-info' },
          { label: '骨質量', prev: lastRecord.bone_mass as number | null, curr: form.bone_mass ? parseFloat(form.bone_mass) : null, unit: 'kg', color: 'text-cyan-400', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', infoHref: '/bone-mass-info' },
          { label: '基礎代謝率', prev: lastRecord.bmr as number | null, curr: form.bmr ? parseFloat(form.bmr) : null, unit: 'kcal', color: 'text-amber-400', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30', infoHref: '/bmr-info' },
        ]

        return (
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-lg p-5 overflow-hidden">
            <h3 className="text-lg font-bold text-emerald-400 mb-3">📊 核心數據比較</h3>

            {/* Time Range Selector */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
              {([
                { key: 'prev' as const, label: '前次' },
                { key: 'week' as const, label: '週' },
                { key: 'month' as const, label: '月' },
                { key: 'quarter' as const, label: '季' },
                { key: 'year' as const, label: '年' },
                { key: '3year' as const, label: '三年' },
              ]).map(t => (
                <button key={t.key} onClick={() => setCompareRange(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    compareRange === t.key ? 'bg-emerald-500 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-slate-200'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Date Header */}
            <div className="flex items-center justify-between mb-4 bg-slate-700/50 rounded-xl p-3">
              <div className="text-center flex-1">
                <div className="text-xs text-slate-400 mb-0.5">上次紀錄</div>
                <div className="text-sm font-bold text-white">{prevDate}</div>
              </div>
              <div className="px-3">
                <span className="text-xs font-medium text-slate-400 bg-slate-600/50 px-2.5 py-1 rounded-full">{daysDiff} 天</span>
              </div>
              <div className="text-center flex-1">
                <div className="text-xs text-slate-400 mb-0.5">今日</div>
                <div className="text-sm font-bold text-emerald-400">{today}</div>
              </div>
            </div>

            {/* Data Rows */}
            <div className="space-y-2">
              {rows.map(row => {
                const hasBoth = row.prev != null && row.curr != null
                const rawDiff = hasBoth ? (row.curr as number) - (row.prev as number) : 0
                const absDiff = Math.round(Math.abs(rawDiff) * 100) / 100
                const isDown = hasBoth && rawDiff < -0.001
                const isUp = hasBoth && rawDiff > 0.001
                const isLowerBetter = row.label !== '肌肉量' && row.label !== '骨質量' && row.label !== '基礎代謝率'
                const isGood = isLowerBetter ? isDown : isUp

                return (
                  <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-slate-700/50 last:border-0">
                    <div className="flex-1 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-sm font-bold border ${row.prev != null ? row.badgeColor : 'bg-slate-700/30 text-slate-500 border-slate-600/30'}`}>
                        {row.prev != null ? `${row.prev}${row.unit ? ` ${row.unit}` : ''}` : '—'}
                      </span>
                    </div>
                    <div className="flex-shrink-0 text-center px-2 min-w-[80px]">
                      <div className={`text-xs font-bold ${row.color}`}>{row.label}</div>
                      {(isUp || isDown) && (
                        <div className={`text-[10px] font-medium mt-0.5 ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isUp ? '▲' : '▼'} {absDiff}{row.unit}
                        </div>
                      )}
                      {row.infoHref && (
                        <a href={row.infoHref} className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded-md bg-slate-700/60 text-slate-400 text-[10px] font-medium hover:bg-slate-600/60 hover:text-slate-200 transition">
                          📖 知識
                        </a>
                      )}
                    </div>
                    <div className="flex-1 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-sm font-bold border ${
                        row.curr == null ? 'bg-slate-700/30 text-slate-500 border-slate-600/30' : isGood ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : (!isUp && !isDown) ? row.badgeColor : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {row.curr != null ? `${row.curr}${row.unit ? ` ${row.unit}` : ''}` : '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Integrated Trend Chart */}
            {(() => {
              const rangeOffsets: Record<string, number> = { prev: 7, week: 7, month: 30, quarter: 90, year: 365, '3year': 1095 }
              const cutoffDate = new Date()
              cutoffDate.setDate(cutoffDate.getDate() - (rangeOffsets[compareRange] || 7))
              const chartRecords = records
                .filter(r => new Date(r.date) >= cutoffDate)
                .slice()
                .sort((a, b) => a.date.localeCompare(b.date))
              const chartData = chartRecords.map(r => ({
                date: r.date.slice(5),
                weight: r.weight,
                bodyFat: r.body_fat,
              }))
              const hasBodyFat = chartData.some(d => d.bodyFat != null)
              const weights = chartData.map(d => d.weight).filter((v): v is number => v != null)
              const fats = chartData.map(d => d.bodyFat).filter((v): v is number => v != null)

              if (chartData.length < 2) return null

              const wMin = Math.min(...weights)
              const wMax = Math.max(...weights)
              const wPad = (wMax - wMin) * 0.15 || 2

              return (
                <div className="mt-5 pt-4 border-t border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-2">
                    {chartRecords[0]?.date} ~ {chartRecords[chartRecords.length - 1]?.date}
                  </div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: hasBodyFat ? 8 : 5, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} />
                        <YAxis
                          yAxisId="weight"
                          width={32}
                          domain={[Math.floor(wMin - wPad), Math.ceil(wMax + wPad)]}
                          tick={{ fontSize: 10, fill: '#34d399' }}
                          axisLine={{ stroke: '#334155' }}
                        />
                        {hasBodyFat && fats.length >= 2 && (
                          <YAxis
                            yAxisId="fat"
                            orientation="right"
                            width={32}
                            domain={[Math.floor(Math.min(...fats) - 1), Math.ceil(Math.max(...fats) + 1)]}
                            tick={{ fontSize: 10, fill: '#fbbf24' }}
                            axisLine={{ stroke: '#334155' }}
                          />
                        )}
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', color: '#e2e8f0' }}
                          formatter={(value, name) => {
                            if (name === 'weight') return [`${value} kg`, '體重']
                            return [`${value}%`, '體脂率']
                          }}
                        />
                        <Line
                          yAxisId="weight"
                          type="monotone"
                          dataKey="weight"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }}
                          connectNulls
                          name="weight"
                        />
                        {hasBodyFat && fats.length >= 2 && (
                          <Line
                            yAxisId="fat"
                            type="monotone"
                            dataKey="bodyFat"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={{ fill: '#f59e0b', strokeWidth: 0, r: 3 }}
                            strokeDasharray="5 3"
                            connectNulls
                            name="bodyFat"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-2 text-[11px]">
                    <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> <span className="text-emerald-400">體重</span></span>
                    {hasBodyFat && fats.length >= 2 && (
                      <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block rounded border-dashed" /> <span className="text-amber-400">體脂率</span></span>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )
      })()}


      {/* Trend Chart (when not checked in yet, show standalone) */}
      {!hasCheckedIn && records.length >= 2 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📈 近期趨勢</h3>
          <TrendChart records={records.slice(0, 7).reverse()} />
        </div>
      )}

      {/* Standard Weight Reference */}
      {user.height_cm && user.gender && (() => {
        const stdWeight = getStandardWeight(user.height_cm, user.gender as 'male' | 'female')
        const fatRange = getBodyFatRange(user.gender as 'male' | 'female')
        const currentWeight = form.weight ? parseFloat(form.weight) : null
        const currentBmi = form.bmi ? parseFloat(form.bmi) : null
        const currentBodyFat = form.body_fat ? parseFloat(form.body_fat) : null
        const currentVisceralFat = form.visceral_fat ? parseFloat(form.visceral_fat) : null

        const refs = [
          {
            label: '標準體重', standard: `${stdWeight} kg`, labelColor: 'text-emerald-400',
            badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            current: currentWeight, unit: 'kg',
            diff: currentWeight ? currentWeight - stdWeight : null,
            diffText: (d: number) => d > 0 ? `還需減 ${d.toFixed(1)} kg` : d < 0 ? `低於 ${Math.abs(d).toFixed(1)} kg` : null,
            isGood: (d: number) => d <= 0,
          },
          {
            label: '健康 BMI', standard: '18.5-24.9', labelColor: 'text-blue-400',
            badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            current: currentBmi, unit: '',
            diff: currentBmi ? (currentBmi > 24.9 ? currentBmi - 24.9 : currentBmi < 18.5 ? currentBmi - 18.5 : 0) : null,
            diffText: (d: number) => d > 0 ? `超過 ${d.toFixed(1)}` : d < 0 ? `偏低 ${Math.abs(d).toFixed(1)}` : null,
            isGood: (d: number) => d === 0,
          },
          {
            label: '建議體脂', standard: fatRange.label, labelColor: 'text-rose-400',
            badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            current: currentBodyFat, unit: '%',
            diff: currentBodyFat ? (currentBodyFat > fatRange.max ? currentBodyFat - fatRange.max : currentBodyFat < fatRange.min ? currentBodyFat - fatRange.min : 0) : null,
            diffText: (d: number) => d > 0 ? `超過 ${d.toFixed(1)}%` : d < 0 ? `偏低 ${Math.abs(d).toFixed(1)}%` : null,
            isGood: (d: number) => d === 0,
          },
          {
            label: '建議內臟脂肪', standard: '1-9', labelColor: 'text-yellow-400',
            badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            current: currentVisceralFat, unit: '',
            diff: currentVisceralFat ? (currentVisceralFat > 9 ? currentVisceralFat - 9 : 0) : null,
            diffText: (d: number) => d > 0 ? `超過 ${d.toFixed(1)}` : null,
            isGood: (d: number) => d === 0,
            hasInfo: true,
          },
        ]

        return (
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-lg p-5">
            <h3 className="text-lg font-bold text-emerald-400 mb-4">🎯 健康參考值</h3>
            <div className="grid grid-cols-2 gap-3">
              {refs.map(ref => (
                <div key={ref.label} className={`bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-3.5 text-center border border-slate-600/30`}>
                  <div className={`text-xs font-bold ${ref.labelColor} mb-1.5 flex items-center justify-center gap-1`}>
                    {ref.label}
                    {ref.hasInfo && (
                      <a href="/visceral-fat-info" className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-500/30 text-yellow-300 text-[10px] font-bold hover:bg-yellow-500/50 transition">?</a>
                    )}
                  </div>
                  <div className="text-xl font-bold text-white mb-1">{ref.standard}</div>
                  {ref.current != null && (
                    <div className="mt-1.5 space-y-1">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${ref.badgeColor}`}>
                        目前 {ref.current}{ref.unit}
                      </span>
                      {ref.diff !== null && ref.diff !== 0 && ref.diffText(ref.diff) && (
                        <div className={`text-[11px] font-medium ${ref.isGood(ref.diff) ? 'text-emerald-400' : 'text-red-400'}`}>
                          {ref.isGood(ref.diff) ? '✅ ' : '⚠️ '}{ref.diffText(ref.diff)}
                        </div>
                      )}
                      {ref.diff === 0 && (
                        <div className="text-[11px] font-medium text-emerald-400">✅ 已達標</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })()}


      {/* 體重競技場 迷你排名 */}
      {arenaRanking.length > 0 && (
        <div className="rounded-3xl overflow-hidden border border-amber-200 shadow-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-white font-black text-base tracking-wide">🏛️ 體重競技場</div>
              {arenaTitle && <div className="text-amber-100 text-[11px] font-medium mt-0.5 truncate max-w-[180px]">⚔️ {arenaTitle}</div>}
            </div>
            <a href="/challenge" className="text-[11px] font-bold text-amber-100 bg-white/20 px-2.5 py-1 rounded-lg hover:bg-white/30 transition">
              進入競技場 →
            </a>
          </div>
          {/* Stone texture bg */}
          <div className="bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-3 space-y-2.5">
            {arenaRanking.slice(0, 5).map((p, i) => {
              const medals = ['🥇', '🥈', '🥉']
              const medal = medals[i] ?? `${i + 1}`
              const barColors = [
                'from-amber-400 to-yellow-300',
                'from-slate-400 to-gray-300',
                'from-orange-400 to-amber-300',
                'from-emerald-400 to-teal-300',
                'from-blue-400 to-indigo-300',
              ]
              return (
                <div key={i} className={`flex items-center gap-2.5 ${p.isMe ? 'bg-amber-100/80 rounded-xl px-2 py-1 -mx-2' : ''}`}>
                  <div className="text-lg w-7 text-center flex-shrink-0">{medal}</div>
                  <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-amber-300">
                    {p.avatar
                      ? <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                      : <span className="text-amber-700 text-xs font-bold">{p.name.charAt(0)}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold truncate ${p.isMe ? 'text-amber-800' : 'text-gray-700'}`}>
                        {p.name}{p.isMe && ' 👈'}
                      </span>
                      <span className="text-[11px] font-black text-amber-700 ml-1">{p.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
                      <div
                        className={`h-full bg-gradient-to-r ${barColors[i] ?? barColors[4]} rounded-full transition-all duration-700`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Footer */}
          <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 px-4 py-2 text-center">
            <span className="text-amber-100 text-[11px] font-medium">🛡️ 榮耀屬於堅持到底的勇者</span>
          </div>
        </div>
      )}
    </div>
  )
}

