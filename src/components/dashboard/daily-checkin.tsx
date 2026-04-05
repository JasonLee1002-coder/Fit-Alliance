'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatDateWithWeekday, calculateBMI, getStandardWeight, getBodyFatRange, getWeightChangeColor } from '@/lib/utils'
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
  const [showMore, setShowMore] = useState(false)
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
  const [greeting, setGreeting] = useState('')
  const [greetingLoading, setGreetingLoading] = useState(true)
  const weightInputRef = useRef<HTMLInputElement>(null)
  const submitBtnRef = useRef<HTMLButtonElement>(null)

  const lastRecord = records.find(r => r.date !== form.date) ?? records[1]

  // Fetch AI greeting on mount
  useEffect(() => {
    async function fetchGreeting() {
      try {
        const weekdays = ['日', '一', '二', '三', '四', '五', '六']
        const recentWeights = records.slice(0, 5).map(r => r.weight).filter(Boolean)
        const trend = recentWeights.length >= 3
          ? recentWeights[0]! < recentWeights[2]! ? '持續下降中' : recentWeights[0]! > recentWeights[2]! ? '略有上升' : '持平穩定'
          : ''

        const res = await fetch('/api/ai/greeting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: user.name,
            gender: user.gender,
            hour: new Date().getHours(),
            latestWeight: records[0]?.weight,
            previousWeight: records[1]?.weight,
            targetWeight: user.target_weight,
            streak,
            bodyFat: records[0]?.body_fat,
            recentTrend: trend,
            dayOfWeek: weekdays[new Date().getDay()],
          }),
        })
        if (res.ok) {
          const { message } = await res.json()
          if (message) setGreeting(message)
        }
      } catch {}
      setGreetingLoading(false)
    }
    fetchGreeting()
  }, [])

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

      // Upload screenshot if exists
      let screenshotUrl: string | null = null
      if (screenshotFile) {
        const fileName = `weight-screenshots/${authUser.id}/${Date.now()}_${screenshotFile.name}`
        const { data: uploadData } = await supabase.storage
          .from('weight-screenshots')
          .upload(fileName, screenshotFile)
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('weight-screenshots')
            .getPublicUrl(fileName)
          screenshotUrl = publicUrl
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

        {/* AI Smart Greeting */}
        {greetingLoading ? (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
            <div className="flex items-center gap-3">
              <img src="/char-coach-sm.png" alt="" className="w-10 h-10 rounded-full yuzu-glow-pulse" />
              <div className="flex-1 space-y-2">
                <div className="yuzu-skeleton h-4 w-3/4 rounded-lg" />
                <div className="yuzu-skeleton h-3 w-1/2 rounded-lg" />
              </div>
            </div>
          </div>
        ) : greeting && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100 yuzu-pop-in">
            <div className="flex items-start gap-3">
              <img src="/char-coach-sm.png" alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
              <p className="text-sm text-gray-700 leading-relaxed">{greeting}</p>
            </div>
          </div>
        )}
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
              { key: 'body_fat', label: '體脂率 (%)', placeholder: '例：25.0' },
              { key: 'bmi', label: 'BMI', placeholder: '例：24.5' },
              { key: 'muscle_mass', label: '肌肉量 (kg)', placeholder: '例：45.0' },
              { key: 'visceral_fat', label: '內臟脂肪', placeholder: '例：8' },
              { key: 'bone_mass', label: '骨質量 (kg)', placeholder: '例：3.0' },
              { key: 'bmr', label: '基礎代謝率 (kcal)', placeholder: '例：1500' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
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
      {hasCheckedIn && form.weight && lastRecord && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📊 前後對比</h3>
          <div className="space-y-3">
            {/* Weight comparison */}
            <ComparisonRow
              label="體重"
              unit="kg"
              previous={lastRecord.weight as number}
              current={parseFloat(form.weight)}
              previousDate={lastRecord.date}
              metric="weight"
            />
            {form.body_fat && lastRecord.body_fat && (
              <ComparisonRow
                label="體脂率"
                unit="%"
                previous={lastRecord.body_fat as number}
                current={parseFloat(form.body_fat)}
                previousDate={lastRecord.date}
                metric="bodyFat"
              />
            )}
            {form.muscle_mass && lastRecord.muscle_mass && (
              <ComparisonRow
                label="肌肉量"
                unit="kg"
                previous={lastRecord.muscle_mass as number}
                current={parseFloat(form.muscle_mass)}
                previousDate={lastRecord.date}
                metric="muscle"
              />
            )}
            {form.visceral_fat && lastRecord.visceral_fat && (
              <ComparisonRow
                label="內臟脂肪"
                unit=""
                previous={lastRecord.visceral_fat as number}
                current={parseFloat(form.visceral_fat)}
                previousDate={lastRecord.date}
                metric="weight"
              />
            )}
          </div>
        </div>
      )}

      {/* Today's Body Data Summary */}
      {hasCheckedIn && form.weight && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">🏋️ 今日基本資料</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">體重</div>
              <div className="text-xl font-bold text-emerald-700">{form.weight} kg</div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">體脂率</div>
              <div className="text-xl font-bold text-blue-700">{form.body_fat ? `${form.body_fat}%` : '—'}</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">BMI</div>
              <div className="text-xl font-bold text-purple-700">{form.bmi || '—'}</div>
            </div>
            <div className="bg-cyan-50 rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">肌肉量</div>
              <div className="text-xl font-bold text-cyan-700">{form.muscle_mass ? `${form.muscle_mass} kg` : '—'}</div>
            </div>
            <div className="bg-rose-50 rounded-2xl p-3 text-center relative">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-xs text-gray-500">內臟脂肪</span>
                <a
                  href="/visceral-fat-info"
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-rose-200 text-rose-600 text-[10px] font-bold hover:bg-rose-300 transition"
                  title="了解內臟脂肪"
                >
                  ?
                </a>
              </div>
              <div className="text-xl font-bold text-rose-700">{form.visceral_fat || '—'}</div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">基礎代謝率</div>
              <div className="text-xl font-bold text-amber-700">{form.bmr ? `${form.bmr} kcal` : '—'}</div>
            </div>
          </div>
          <div className="mt-3 flex justify-center">
            <a
              href="/visceral-fat-info"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium hover:bg-rose-100 transition"
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
      {user.height_cm && user.gender && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">🎯 健康參考值</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-emerald-50 rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">標準體重</div>
              <div className="text-xl font-bold text-emerald-700">
                {getStandardWeight(user.height_cm, user.gender as 'male' | 'female')} kg
              </div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">健康 BMI</div>
              <div className="text-xl font-bold text-blue-700">18.5-24.9</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-500 mb-1">建議體脂</div>
              <div className="text-xl font-bold text-orange-700">
                {getBodyFatRange(user.gender as 'male' | 'female').label}
              </div>
            </div>
          </div>
        </div>
      )}

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

function ComparisonRow({
  label, unit, previous, current, previousDate, metric
}: {
  label: string; unit: string; previous: number; current: number; previousDate: string; metric: 'weight' | 'bodyFat' | 'muscle'
}) {
  const diff = current - previous
  const colorClass = getWeightChangeColor(diff, metric)

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
      <div className="text-center">
        <div className="text-xs text-gray-400">{previousDate}</div>
        <div className="text-lg text-gray-600">{previous} {unit}</div>
      </div>
      <div className="text-center px-4">
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`text-lg font-bold ${colorClass}`}>
          {diff > 0 ? '+' : ''}{diff.toFixed(1)} {unit}
        </div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-400">今日</div>
        <div className="text-xl font-bold text-gray-900">{current} {unit}</div>
      </div>
    </div>
  )
}
