'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDateWithWeekday, calculateBMI, getStandardWeight, getBodyFatRange } from '@/lib/utils'
import type { User, HealthRecord, DailyLog } from '@/types'
import ChallengeHub from '@/components/challenge/challenge-hub'
import UnifiedHealthChart from '@/components/shared/unified-health-chart'
import AnimatedWeightPct from '@/components/shared/animated-weight-pct'
import { ScaleMascot, CoachMascot, TrophyMascot, CameraMascot } from '@/components/shared/mascots'

// ── 紀錄清單（收合式）──
function RecordsList({ records }: { records: HealthRecord[] }) {
  const [open, setOpen] = useState(false)
  if (records.length === 0) return null
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-bold text-gray-800">📋 所有紀錄（{records.length} 筆）</span>
        <span className="text-gray-400 text-xs">{open ? '收起 ▲' : '展開 ▼'}</span>
      </button>
      {open && (
        <div className="divide-y divide-gray-50 border-t border-gray-100">
          {records.map(r => (
            <div key={r.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">{r.date}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {r.body_fat ? `體脂 ${r.body_fat}%` : ''}
                  {r.muscle_mass ? ` · 肌肉 ${r.muscle_mass}kg` : ''}
                  {r.visceral_fat ? ` · 內臟脂肪 ${r.visceral_fat}` : ''}
                </div>
              </div>
              <div className="text-xl font-bold text-gray-900">{r.weight} kg</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
  const [arenaRefreshKey, setArenaRefreshKey] = useState(0)
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

  const [localRecordOverride, setLocalRecordOverride] = useState<HealthRecord | null>(null)

  // Merge local override into records for immediate display after check-in
  const effectiveRecords = (() => {
    if (!localRecordOverride) return records
    const filtered = records.filter(r => r.date !== localRecordOverride.date)
    return [localRecordOverride, ...filtered]
  })()

  // Get comparison record based on selected range
  const getCompareRecord = () => {
    const today = new Date(form.date)
    if (compareRange === 'prev') return effectiveRecords.find(r => r.date !== form.date) ?? effectiveRecords[1]
    const offsets: Record<string, number> = { week: 7, month: 30, quarter: 90, year: 365, '3year': 1095 }
    const targetDate = new Date(today)
    targetDate.setDate(targetDate.getDate() - (offsets[compareRange] || 1))
    let closest: HealthRecord | undefined
    let closestDiff = Infinity
    for (const r of effectiveRecords) {
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

  // Helper: find closest record to N days ago (excluding today)
  const getWeightDaysAgo = (days: number): number | undefined => {
    const target = new Date()
    target.setDate(target.getDate() - days)
    const today = new Date().toISOString().split('T')[0]
    let closest: HealthRecord | undefined
    let closestDiff = Infinity
    for (const r of records) {
      if (r.date === today) continue
      const diff = Math.abs(new Date(r.date).getTime() - target.getTime())
      if (diff < closestDiff) { closestDiff = diff; closest = r }
    }
    // Only return if within reasonable range (days ± 3)
    return closestDiff < (days + 3) * 86400000 ? closest?.weight ?? undefined : undefined
  }

  // Auto-fetch daily greeting if no coach message exists
  useEffect(() => {
    if (encouragement) return
    const fetchGreeting = async () => {
      try {
        const now = new Date()
        const res = await fetch('/api/ai/greeting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: user.name,
            gender: user.gender,
            latestWeight: records[0]?.weight,
            prevWeight: records[1]?.weight,
            weekAgoWeight: getWeightDaysAgo(7),
            monthAgoWeight: getWeightDaysAgo(30),
            targetWeight: user.target_weight,
            streak,
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

      // Immediately update local records for instant comparison display
      setLocalRecordOverride({
        id: todayRecord?.id ?? 'temp',
        user_id: authUser.id,
        date: form.date,
        weight: parseFloat(form.weight),
        body_fat: form.body_fat ? parseFloat(form.body_fat) : null,
        muscle_mass: form.muscle_mass ? parseFloat(form.muscle_mass) : null,
        visceral_fat: form.visceral_fat ? parseFloat(form.visceral_fat) : null,
        bone_mass: form.bone_mass ? parseFloat(form.bone_mass) : null,
        bmr: form.bmr ? parseFloat(form.bmr) : null,
        bmi: form.bmi ? parseFloat(form.bmi) : null,
        screenshot_url: screenshotUrl,
        ai_ocr_result: null,
        created_at: new Date().toISOString(),
      } as HealthRecord)

      // Get AI encouragement
      try {
        const aiRes = await fetch('/api/ai/encourage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: user.name,
            currentWeight: parseFloat(form.weight),
            prevWeight: lastRecord?.weight,
            weekAgoWeight: getWeightDaysAgo(7),
            monthAgoWeight: getWeightDaysAgo(30),
            currentBodyFat: form.body_fat ? parseFloat(form.body_fat) : null,
            prevBodyFat: lastRecord?.body_fat ?? null,
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
      setArenaRefreshKey(k => k + 1)
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
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br from-sky-400 via-emerald-400 to-teal-500 min-h-[140px] flex items-end">
        {/* 問候文字 */}
        <div className="flex-1 p-5 pb-6 z-10">
          <p className="text-emerald-100 text-xs font-medium mb-1 tracking-wide">{formatDateWithWeekday(new Date())}</p>
          <h1 className="text-2xl font-black text-white drop-shadow-lg leading-tight">嗨，{user.name} 👋</h1>
          <p className="text-white/80 text-sm mt-1.5">今天也要加油！💪</p>
        </div>
        {/* 親子圖 + 皮克敏 — 上下輕飄動畫 */}
        <motion.div
          className="absolute right-0 bottom-0 w-44 h-44 pointer-events-none"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src="/hero-family.png"
            alt=""
            className="w-full h-full object-contain object-bottom drop-shadow-2xl"
          />
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between">
        {user.target_weight && records[0]?.weight ? (
          <p className="text-sm text-emerald-600 font-medium">
            🎯 目標 {user.target_weight} kg · 還差 {Math.abs(records[0].weight as number - user.target_weight).toFixed(1)} kg
          </p>
        ) : <div />}
        <div className="flex items-center gap-2">
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

      {/* Check-in Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">⚡ 今日打卡</h2>

        {/* 主要入口：大按鈕區 */}
        {!screenshotPreview && !ocrDone && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* 選截圖 */}
            <button
              onClick={() => {
                if (galleryInputRef.current) {
                  galleryInputRef.current.removeAttribute('capture')
                  galleryInputRef.current.click()
                }
              }}
              disabled={ocrLoading}
              className="yuzu-cta-glow-violet group relative flex flex-col items-center justify-center gap-1 pt-3 pb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-200 active:scale-[0.94] active:shadow-md transition-all duration-150 disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
              <div className="absolute inset-0 bg-white/0 group-active:bg-white/10 transition-colors duration-100" />
              <motion.img
                src="/pikmin-gallery.png"
                alt=""
                className="w-20 h-20 object-contain drop-shadow-lg relative pointer-events-none"
                style={{ mixBlendMode: 'multiply' }}
                animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="text-center relative">
                <div className="text-base font-black tracking-wide">選截圖</div>
                <div className="text-xs text-violet-200 mt-0.5">從相簿選體重截圖</div>
              </div>
            </button>

            {/* 拍照 */}
            <button
              onClick={() => {
                if (cameraInputRef.current) {
                  cameraInputRef.current.setAttribute('capture', 'environment')
                  cameraInputRef.current.click()
                }
              }}
              disabled={ocrLoading}
              className="yuzu-cta-glow-emerald group relative flex flex-col items-center justify-center gap-1 pt-3 pb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200 active:scale-[0.94] active:shadow-md transition-all duration-150 disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite_0.6s]" />
              <div className="absolute inset-0 bg-white/0 group-active:bg-white/10 transition-colors duration-100" />
              <motion.img
                src="/pikmin-camera.png"
                alt=""
                className="w-20 h-20 object-contain drop-shadow-lg relative pointer-events-none"
                style={{ mixBlendMode: 'multiply' }}
                animate={{ y: [0, -5, 0], rotate: [3, -3, 3] }}
                transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="text-center relative">
                <div className="text-base font-black tracking-wide">拍照</div>
                <div className="text-xs text-emerald-200 mt-0.5">直接拍體重計畫面</div>
              </div>
            </button>
          </div>
        )}

        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
        <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

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
          <div className="mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 yuzu-pop-in flex items-center justify-between">
            <span className="text-sm text-emerald-700">✅ AI 辨識完成，請確認數值</span>
            <button
              onClick={() => {
                setOcrDone(false)
                setScreenshotPreview(null)
                setScreenshotFile(null)
              }}
              className="text-xs text-emerald-600 font-medium underline"
            >
              重拍
            </button>
          </div>
        )}

        {/* Weight (main field) */}
        <div className="mb-4">
          <label className="block text-base font-black text-emerald-700 mb-2 tracking-wide">⚖️ 體重 <span className="text-sm font-medium text-gray-400">(kg)</span></label>
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
              { key: 'body_fat', label: '🔥 體脂率', unit: '%', placeholder: '例：25.0', color: 'text-orange-600', infoLink: '/body-fat-info' },
              { key: 'bmi', label: '📊 BMI', unit: '', placeholder: '例：24.5', color: 'text-blue-600', infoLink: '/bmi-info' },
              { key: 'muscle_mass', label: '💪 肌肉量', unit: 'kg', placeholder: '例：45.0', color: 'text-cyan-600', infoLink: '/muscle-info' },
              { key: 'visceral_fat', label: '🫀 內臟脂肪', unit: '', placeholder: '例：8', color: 'text-rose-600', infoLink: '/visceral-fat-info' },
              { key: 'bone_mass', label: '🦴 骨質量', unit: 'kg', placeholder: '例：3.0', color: 'text-violet-600', infoLink: '/bone-mass-info' },
              { key: 'bmr', label: '⚡ 代謝率', unit: 'kcal', placeholder: '例：1500', color: 'text-amber-600', infoLink: '/bmr-info' },
            ].map(field => (
              <div key={field.key}>
                <div className="flex items-center justify-between mb-1">
                  <label className={`text-sm font-black ${field.color}`}>{field.label}{field.unit ? <span className="text-xs font-medium text-gray-400 ml-1">({field.unit})</span> : null}</label>
                  {(field as any).infoLink && (
                    <a
                      href={(field as any).infoLink}
                      className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-gray-200 text-gray-600 text-[10px] font-bold hover:bg-gray-300 active:scale-95 transition"
                    >
                      說明 →
                    </a>
                  )}
                </div>
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
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(30)
            handleSubmit()
          }}
          disabled={loading || !form.weight}
          className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black py-5 rounded-2xl shadow-xl transition-all duration-150 active:scale-[0.95] active:shadow-md disabled:opacity-30 text-xl tracking-wide ${loading ? 'yuzu-btn-loading' : ''} ${form.weight && !loading ? 'yuzu-glow-pulse shadow-emerald-300/60' : ''}`}
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

      {/* 皮克敏歡呼 — 打卡成功瞬間 */}
      {justCheckedIn && (
        <motion.div
          className="flex flex-col items-center py-2"
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <motion.img
            src="/pikmin-cheer.png"
            alt="皮克敏慶祝"
            className="w-28 h-28 object-contain drop-shadow-lg"
            animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="text-sm font-bold text-emerald-600 mt-1">皮克敏們為你歡呼！🎉</p>
        </motion.div>
      )}

      {/* AI Coach - always visible */}
      {encouragement && (
        <div className="bg-gradient-to-r from-emerald-50 to-orange-50 rounded-3xl border border-emerald-100 p-5 yuzu-pop-in">
          <div className="flex items-start gap-3">
            <motion.img
              src="/char-coaches.png"
              alt="AI教練"
              className="w-11 h-11 rounded-full shadow flex-shrink-0"
              animate={{ rotate: [-3, 3, -3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
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

        const stdWeight = user.height_cm && user.gender ? getStandardWeight(user.height_cm, user.gender as 'male' | 'female') : null
        const fatRange = user.gender ? getBodyFatRange(user.gender as 'male' | 'female') : null
        const cBmi = form.bmi ? parseFloat(form.bmi) : null
        const cFat = form.body_fat ? parseFloat(form.body_fat) : null
        const cVisc = form.visceral_fat ? parseFloat(form.visceral_fat) : null
        const cWeight = parseFloat(form.weight)

        const rows: { label: string; prev: number | null; curr: number | null; unit: string; color: string; badgeColor: string; infoHref?: string; refText?: string; refOk?: boolean | null }[] = [
          {
            label: '體重', prev: lastRecord.weight as number, curr: cWeight, unit: 'kg',
            color: 'text-red-400', badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
            refText: stdWeight ? `標準 ${stdWeight} kg` : undefined,
            refOk: stdWeight ? cWeight <= stdWeight : null,
          },
          {
            label: '體脂率', prev: lastRecord.body_fat as number | null, curr: cFat, unit: '%',
            color: 'text-rose-400', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            infoHref: '/body-fat-info',
            refText: fatRange ? `建議 ${fatRange.label}` : undefined,
            refOk: fatRange && cFat != null ? (cFat >= fatRange.min && cFat <= fatRange.max) : null,
          },
          {
            label: '內臟脂肪', prev: lastRecord.visceral_fat as number | null, curr: cVisc, unit: '',
            color: 'text-yellow-400', badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            infoHref: '/visceral-fat-info',
            refText: '建議 1–9',
            refOk: cVisc != null ? cVisc <= 9 : null,
          },
          {
            label: '肌肉量', prev: lastRecord.muscle_mass as number | null, curr: form.muscle_mass ? parseFloat(form.muscle_mass) : null, unit: 'kg',
            color: 'text-green-400', badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30',
            infoHref: '/muscle-info',
          },
          {
            label: 'BMI', prev: lastRecord.bmi as number | null, curr: cBmi, unit: '',
            color: 'text-blue-400', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            infoHref: '/bmi-info',
            refText: '健康 18.5–24.9',
            refOk: cBmi != null ? (cBmi >= 18.5 && cBmi <= 24.9) : null,
          },
          {
            label: '骨質量', prev: lastRecord.bone_mass as number | null, curr: form.bone_mass ? parseFloat(form.bone_mass) : null, unit: 'kg',
            color: 'text-cyan-400', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
            infoHref: '/bone-mass-info',
          },
          {
            label: '基礎代謝率', prev: lastRecord.bmr as number | null, curr: form.bmr ? parseFloat(form.bmr) : null, unit: 'kcal',
            color: 'text-amber-400', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            infoHref: '/bmr-info',
          },
        ]

        return (
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-lg p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-emerald-400">📊 核心數據比較</h3>
              <motion.img
                src="/pikmin-chart.png"
                alt=""
                className="w-16 h-16 object-contain pointer-events-none drop-shadow-lg"
                animate={{ y: [0, -5, 0], rotate: [-3, 3, -3] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

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
                  <div key={row.label} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                    <div className="flex-1 text-center">
                      <span className={`inline-block px-3 py-1.5 rounded-xl text-base font-black border ${row.prev != null ? row.badgeColor : 'bg-slate-700/30 text-slate-500 border-slate-600/30'}`}>
                        {row.prev != null ? `${row.prev}${row.unit ? ` ${row.unit}` : ''}` : '—'}
                      </span>
                    </div>
                    <div className="flex-shrink-0 text-center px-1 min-w-[88px]">
                      <div className={`text-sm font-black ${row.color} drop-shadow-sm`}>{row.label}</div>
                      {(isUp || isDown) && (
                        <div className={`text-xs font-bold mt-0.5 px-2 py-0.5 rounded-full inline-block ${isGood ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                          {isUp ? '▲' : '▼'} {absDiff}{row.unit}
                        </div>
                      )}
                      {row.refText && (
                        <div className={`text-[10px] font-medium mt-0.5 ${row.refOk === true ? 'text-emerald-400' : row.refOk === false ? 'text-red-400' : 'text-slate-400'}`}>
                          {row.refOk === true ? '✅' : row.refOk === false ? '⚠️' : '📊'} {row.refText}
                        </div>
                      )}
                      {row.infoHref && (
                        <a href={row.infoHref} className="inline-flex items-center gap-0.5 mt-1 px-2 py-0.5 rounded-md bg-slate-600/50 text-slate-300 text-[10px] font-medium hover:bg-slate-500/60 hover:text-white transition">
                          說明 →
                        </a>
                      )}
                    </div>
                    <div className="flex-1 text-center">
                      <span className={`inline-block px-3 py-1.5 rounded-xl text-base font-black border ${
                        row.curr == null ? 'bg-slate-700/30 text-slate-500 border-slate-600/30' : isGood ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : (!isUp && !isDown) ? row.badgeColor : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {row.curr != null ? `${row.curr}${row.unit ? ` ${row.unit}` : ''}` : '—'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        )
      })()}


      {/* 新用戶引導 — 完全沒有紀錄時顯示 */}
      {records.length === 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100 p-6">
          <div className="text-center mb-4">
            <span className="text-4xl">🎉</span>
            <h2 className="text-lg font-black text-gray-900 mt-2">歡迎加入 Fit Alliance！</h2>
            <p className="text-sm text-gray-500 mt-1">3 個步驟開始你的健康旅程</p>
          </div>
          <div className="space-y-3">
            {[
              { step: 1, icon: '⚖️', title: '記錄第一筆體重', desc: '在上方打卡區輸入今天的體重', done: false, href: null },
              { step: 2, icon: '🎯', title: '設定目標體重', desc: '讓 AI 教練幫你規劃減脂進度', done: !!user.target_weight, href: '/profile' },
              { step: 3, icon: '🤝', title: '邀請朋友一起', desc: '在競技場互相督促，效果更好', done: false, href: '/invite' },
            ].map(({ step, icon, title, desc, done, href }) => (
              <div key={step} className={`flex items-center gap-3 p-3 rounded-2xl ${done ? 'bg-emerald-100/60' : 'bg-white border border-gray-100'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${done ? 'bg-emerald-500' : 'bg-gray-100'}`}>
                  {done ? '✅' : icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                {href && !done && (
                  <a href={href} className="text-xs text-emerald-600 font-medium shrink-0">去設定 →</a>
                )}
                {!href && !done && (
                  <span className="text-xs text-gray-400 shrink-0">↑ 上方</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 健康紀錄區（原健康紀錄頁，合併至此）── */}
      {records.length >= 2 && (() => {
        const allWeights = records.map(r => r.weight).filter(Boolean) as number[]
        const firstWeight = allWeights[allWeights.length - 1] ?? null
        const latestWeight = allWeights[0] ?? null
        const totalLost = firstWeight && latestWeight ? +(firstWeight - latestWeight).toFixed(1) : null
        const weightChangePct = firstWeight && latestWeight && firstWeight > 0
          ? +((firstWeight - latestWeight) / firstWeight * 100).toFixed(1)
          : null
        const minWeight = allWeights.length ? Math.min(...allWeights) : null

        return (
          <>
            {/* 大指標卡 */}
            <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-3xl border border-emerald-100 shadow-sm p-6">
              <AnimatedWeightPct pct={weightChangePct ?? 0} kg={totalLost ?? undefined} size="hero" />
            </div>

            {/* 摘要統計 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-sm">
                <div className="text-xl font-black text-emerald-600">{records.length}</div>
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

            {/* 統一暗黑圖表 */}
            <UnifiedHealthChart records={effectiveRecords} defaultRange={hasCheckedIn ? 'month' : 'week'} showRangeSelector />

            {/* 紀錄清單（收合） */}
            <RecordsList records={effectiveRecords} />
          </>
        )
      })()}

      {/* 體重競技場 — 完整畫面直接嵌入 */}
      <ChallengeHub refreshKey={arenaRefreshKey} />
    </div>
  )
}

