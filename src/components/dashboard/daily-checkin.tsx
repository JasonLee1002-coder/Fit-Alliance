'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDateWithWeekday, calculateBMI, getStandardWeight, getBodyFatRange } from '@/lib/utils'
import type { User, HealthRecord, DailyLog } from '@/types'
import TrendChart from './trend-chart'
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
  const [encouragement, setEncouragement] = useState('')
  const [justCheckedIn, setJustCheckedIn] = useState(false)
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
          setEncouragement(message)
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

      {/* Comparison Card (show after check-in or if today has record) */}
      {hasCheckedIn && form.weight && lastRecord && (() => {
        const today = form.date
        const prevDate = lastRecord.date
        const daysDiff = Math.round((new Date(today).getTime() - new Date(prevDate).getTime()) / 86400000)

        const rows: { label: string; prev: number | null; curr: number | null; unit: string; color: string; badgeColor: string }[] = [
          { label: '體重', prev: lastRecord.weight as number, curr: parseFloat(form.weight), unit: 'kg', color: 'text-red-400', badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30' },
          { label: '體脂率', prev: lastRecord.body_fat as number | null, curr: form.body_fat ? parseFloat(form.body_fat) : null, unit: '%', color: 'text-rose-400', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
          { label: '內臟脂肪', prev: lastRecord.visceral_fat as number | null, curr: form.visceral_fat ? parseFloat(form.visceral_fat) : null, unit: '', color: 'text-yellow-400', badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
          { label: '肌肉量', prev: lastRecord.muscle_mass as number | null, curr: form.muscle_mass ? parseFloat(form.muscle_mass) : null, unit: 'kg', color: 'text-green-400', badgeColor: 'bg-green-500/20 text-green-300 border-green-500/30' },
          { label: 'BMI', prev: lastRecord.bmi as number | null, curr: form.bmi ? parseFloat(form.bmi) : null, unit: '', color: 'text-blue-400', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
          { label: '骨質量', prev: lastRecord.bone_mass as number | null, curr: form.bone_mass ? parseFloat(form.bone_mass) : null, unit: 'kg', color: 'text-cyan-400', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
          { label: '基礎代謝率', prev: lastRecord.bmr as number | null, curr: form.bmr ? parseFloat(form.bmr) : null, unit: 'kcal', color: 'text-amber-400', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
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
          </div>
        )
      })()}

      {/* Today's Body Data Summary */}
      {hasCheckedIn && form.weight && (
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl shadow-lg p-5">
          <h3 className="text-lg font-bold text-emerald-400 mb-4">🏋️ 今日基本資料</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '體重', value: form.weight ? `${form.weight} kg` : null, color: 'from-red-500/20 to-red-600/10', borderColor: 'border-red-500/30', textColor: 'text-red-300', labelColor: 'text-red-400' },
              { label: '體脂率', value: form.body_fat ? `${form.body_fat}%` : null, color: 'from-rose-500/20 to-rose-600/10', borderColor: 'border-rose-500/30', textColor: 'text-rose-300', labelColor: 'text-rose-400', hasInfo: true, infoLink: '/body-fat-info', infoBg: 'bg-rose-500/30 text-rose-300' },
              { label: 'BMI', value: form.bmi || null, color: 'from-blue-500/20 to-blue-600/10', borderColor: 'border-blue-500/30', textColor: 'text-blue-300', labelColor: 'text-blue-400', hasInfo: true, infoLink: '/bmi-info', infoBg: 'bg-blue-500/30 text-blue-300' },
              { label: '肌肉量', value: form.muscle_mass ? `${form.muscle_mass} kg` : null, color: 'from-green-500/20 to-green-600/10', borderColor: 'border-green-500/30', textColor: 'text-green-300', labelColor: 'text-green-400' },
              { label: '內臟脂肪', value: form.visceral_fat || null, color: 'from-yellow-500/20 to-yellow-600/10', borderColor: 'border-yellow-500/30', textColor: 'text-yellow-300', labelColor: 'text-yellow-400', hasInfo: true },
              { label: '基礎代謝率', value: form.bmr ? `${form.bmr} kcal` : null, color: 'from-amber-500/20 to-amber-600/10', borderColor: 'border-amber-500/30', textColor: 'text-amber-300', labelColor: 'text-amber-400' },
              { label: '骨質量', value: form.bone_mass ? `${form.bone_mass} kg` : null, color: 'from-cyan-500/20 to-cyan-600/10', borderColor: 'border-cyan-500/30', textColor: 'text-cyan-300', labelColor: 'text-cyan-400' },
            ].map(item => (
              <div key={item.label} className={`bg-gradient-to-br ${item.color} rounded-2xl p-3.5 text-center border ${item.borderColor}`}>
                <div className={`text-xs font-bold ${item.labelColor} mb-1.5 flex items-center justify-center gap-1`}>
                  {item.label}
                  {(item as any).hasInfo && (
                    <a href={(item as any).infoLink || '/visceral-fat-info'} className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold hover:opacity-80 transition ${(item as any).infoBg || 'bg-yellow-500/30 text-yellow-300'}`}>?</a>
                  )}
                </div>
                <div className={`text-xl font-bold ${item.value ? item.textColor : 'text-slate-500'}`}>
                  {item.value || '—'}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <a
              href="/visceral-fat-info"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 rounded-xl text-sm font-bold hover:bg-yellow-500/25 transition"
            >
              📖 什麼是內臟脂肪？點我了解
            </a>
          </div>
        </div>
      )}

      {/* AI Encouragement */}
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

      {/* Trend Chart */}
      {records.length >= 2 && (
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

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <a href="/challenge" className="bg-gradient-to-br from-amber-50 to-orange-50 text-orange-700 rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg transition active:scale-[0.98] yuzu-glow-urgent relative overflow-visible border border-orange-100">
          <img src="/nav3d-challenge-sm.png" alt="" className="w-14 h-14 drop-shadow" />
          <span className="font-bold text-sm">共同挑戰</span>
        </a>
        <a href="/coach" className="bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg transition active:scale-[0.98] border border-emerald-100">
          <img src="/char-coach-sm.png" alt="" className="w-14 h-14 drop-shadow" />
          <span className="font-bold text-sm">AI 教練</span>
        </a>
        <a href="/invite" className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg transition active:scale-[0.98] border border-blue-100">
          <img src="/nav3d-invite-sm.png" alt="" className="w-14 h-14 drop-shadow" />
          <span className="font-bold text-sm">個人邀請朋友</span>
        </a>
        <a href="/records" className="bg-gradient-to-br from-cyan-50 to-blue-50 text-blue-700 rounded-2xl p-4 flex items-center gap-3 hover:shadow-lg transition active:scale-[0.98] border border-blue-100">
          <img src="/nav3d-records-sm.png" alt="" className="w-14 h-14 drop-shadow" />
          <span className="font-bold text-sm">健康紀錄</span>
        </a>
      </div>
    </div>
  )
}

