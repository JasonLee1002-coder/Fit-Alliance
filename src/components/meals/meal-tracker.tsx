'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { MealRecord, FoodItem } from '@/types'
import { playPikminCelebration } from '@/lib/pikmin-sounds'

const cameraInputId = 'meal-camera-input'
const galleryInputId = 'meal-gallery-input'

const MEAL_TYPES = [
  { value: 'breakfast', label: '🌅 早餐', color: 'bg-orange-50 border-orange-200' },
  { value: 'lunch', label: '☀️ 午餐', color: 'bg-yellow-50 border-yellow-200' },
  { value: 'dinner', label: '🌙 晚餐', color: 'bg-indigo-50 border-indigo-200' },
  { value: 'snack', label: '🍪 點心', color: 'bg-pink-50 border-pink-200' },
] as const

interface Props {
  userId: string
  todayMeals: MealRecord[]
  recentMeals: MealRecord[]
}

export default function MealTracker({ userId, todayMeals, recentMeals }: Props) {
  const router = useRouter()
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [selectedMealType, setSelectedMealType] = useState<string>('lunch')
  const [uploading, setUploading] = useState(false)
  const [recognizedItems, setRecognizedItems] = useState<FoodItem[]>([])
  const [overallAssessment, setOverallAssessment] = useState('')
  const [editingItems, setEditingItems] = useState<FoodItem[]>([])
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [celebrate, setCelebrate] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setShowResult(false)

    try {
      // Upload via server API (bypasses storage RLS)
      const uploadForm = new FormData()
      uploadForm.append('file', file)
      uploadForm.append('bucket', 'meal-photos')
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadForm })
      if (uploadRes.ok) {
        const { url } = await uploadRes.json()
        setPhotoUrl(url)
      }

      // AI food recognition
      const formData = new FormData()
      formData.append('image', file)
      formData.append('mode', 'food')

      const res = await fetch('/api/ai/food-recognize', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        const items = data.items || []
        setRecognizedItems(items)
        setEditingItems(items.map((item: FoodItem) => ({ ...item })))
        setOverallAssessment(data.overall_assessment || '')
        setShowResult(true)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleItemChange = (index: number, field: keyof FoodItem, value: string) => {
    setEditingItems(items => {
      const updated = [...items]
      if (field === 'name') {
        updated[index] = { ...updated[index], name: value }
      } else {
        updated[index] = { ...updated[index], [field]: value ? parseFloat(value) : null }
      }
      return updated
    })
  }

  const handleRemoveItem = (index: number) => {
    setEditingItems(items => items.filter((_, i) => i !== index))
  }

  const handleAddItem = () => {
    setEditingItems(items => [...items, {
      name: '',
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      confidence: null,
    }])
  }

  const handleSave = async () => {
    if (editingItems.length === 0) return
    setSaving(true)

    try {
      const supabase = createClient()

      // Get AI feedback on the meal
      let aiFeedback = ''
      try {
        const res = await fetch('/api/ai/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'meal_feedback',
            mealType: selectedMealType,
            items: editingItems,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          aiFeedback = data.message || ''
        }
      } catch {}

      await supabase.from('fa_meal_records').insert({
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        meal_type: selectedMealType,
        photo_url: photoUrl,
        ai_recognized_items: recognizedItems,
        user_corrected_items: editingItems,
        ai_feedback: aiFeedback,
      })

      // 慶祝！
      setCelebrate(true)
      playPikminCelebration()
      setTimeout(() => setCelebrate(false), 2800)

      // Reset
      setRecognizedItems([])
      setEditingItems([])
      setPhotoUrl(null)
      setShowResult(false)
      setOverallAssessment('')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const totalCalories = (items: FoodItem[]) =>
    items.reduce((sum, i) => sum + (i.calories ?? 0), 0)

  // 煙火粒子資料
  const FIREWORKS = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    emoji: ['🎉','✨','🎊','⭐','💥','🌟','🎈'][i % 7],
    x: 10 + Math.random() * 80,
    delay: Math.random() * 0.4,
    dur: 0.9 + Math.random() * 0.6,
  }))

  return (
    <>
    {/* 慶祝 Overlay */}
    <AnimatePresence>
      {celebrate && (
        <motion.div
          className="fixed inset-0 z-[9990] pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          {/* 煙火粒子 */}
          {FIREWORKS.map(p => (
            <motion.span
              key={p.id}
              className="absolute text-2xl"
              style={{ left: `${p.x}%`, bottom: '20%' }}
              initial={{ y: 0, opacity: 1, scale: 0.5 }}
              animate={{ y: -320 - Math.random() * 160, opacity: 0, scale: 1.6 }}
              transition={{ duration: p.dur, delay: p.delay, ease: 'easeOut' }}
            >
              {p.emoji}
            </motion.span>
          ))}
          {/* 皮克敏歡呼 */}
          <motion.div
            className="flex flex-col items-center"
            initial={{ scale: 0, y: 60 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
          >
            <motion.img
              src="/pikmin-cheer.png"
              alt="皮克敏歡呼"
              className="w-36 h-36 object-contain drop-shadow-2xl"
              animate={{ y: [0, -12, 0], rotate: [-4, 4, -4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.p
              className="mt-2 text-white font-black text-lg drop-shadow-lg"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            >
              記錄成功！🎉
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <a href="/" className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition active:scale-[0.95]">
          ←
        </a>
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-purple-100 flex items-center gap-3 flex-1">
          <img src="/char-food-hero.png" alt="" className="w-14 h-14 drop-shadow-lg yuzu-float" />
          <div>
            <h1 className="text-xl font-black text-gray-900">飲食紀錄</h1>
            <p className="text-xs text-gray-500">拍照或上傳，AI 自動辨識</p>
          </div>
        </div>
      </div>

      {/* Tab: 記錄 / 歷史 */}
      <div className="flex gap-2">
        <button onClick={() => setShowHistory(false)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${!showHistory ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
          📸 記錄飲食
        </button>
        <button onClick={() => setShowHistory(true)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${showHistory ? 'bg-violet-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
          📋 歷史查詢
        </button>
      </div>

      {!showHistory ? (<>
      {/* Meal Type Selector */}
      <div className="grid grid-cols-4 gap-2">
        {MEAL_TYPES.map(type => (
          <button
            key={type.value}
            onClick={() => setSelectedMealType(type.value)}
            className={`py-3 rounded-2xl text-sm font-medium transition active:scale-[0.98] ${
              selectedMealType === type.value
                ? 'bg-emerald-500 text-white shadow-md'
                : `${type.color} border text-gray-600`
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="text-center">
          {photoUrl ? (
            <div className="mb-4">
              <img src={photoUrl} alt="食物照片" className="w-full max-h-64 object-cover rounded-2xl" />
            </div>
          ) : (
            <div className="mb-4 p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <img src="/illust-foods-sm.png" alt="" className="w-20 h-20 mx-auto mb-3 drop-shadow yuzu-float" />
              <p className="text-gray-600 font-medium">拍攝或上傳食物照片</p>
              <p className="text-gray-400 text-xs mt-1">AI 自動辨識食物名稱與營養成分</p>
            </div>
          )}

          {/* Separate Camera + Gallery buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                if (cameraInputRef.current) {
                  cameraInputRef.current.setAttribute('capture', 'environment')
                  cameraInputRef.current.click()
                }
              }}
              disabled={uploading}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-2xl shadow hover:shadow-md transition active:scale-[0.98] disabled:opacity-50"
            >
              📷 拍照
            </button>
            <button
              onClick={() => {
                if (galleryInputRef.current) {
                  galleryInputRef.current.removeAttribute('capture')
                  galleryInputRef.current.click()
                }
              }}
              disabled={uploading}
              className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-2xl shadow hover:shadow-md transition active:scale-[0.98] disabled:opacity-50"
            >
              🖼️ 上傳照片
            </button>
          </div>

          {/* Loading state */}
          {uploading && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50 relative overflow-hidden">
              <div className="flex items-center justify-center gap-3">
                <div className="yuzu-spinner yuzu-spinner-dark" />
                <span className="text-sm font-medium text-blue-700 yuzu-text-glow">AI 辨識中</span>
                <span className="flex gap-0.5">
                  <span className="yuzu-thinking-dot inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="yuzu-thinking-dot inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="yuzu-thinking-dot inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
                </span>
              </div>
              <div className="absolute inset-0 yuzu-shimmer pointer-events-none" />
            </div>
          )}

          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
          <input ref={galleryInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>
      </div>

      {/* Illustration: calorie guide */}
      {!showResult && todayMeals.length === 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-4">
            <img src="/char-calorie-sm.png" alt="" className="w-16 h-16 drop-shadow" />
            <div>
              <h3 className="text-sm font-bold text-gray-800">💡 你知道嗎？</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                蛋白質每克 4 大卡，但消化蛋白質就要消耗 30% 能量。
                多吃蛋白質不但飽足感強，還能加速代謝！
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-center">
            <img src="/illust-transform-sm.png" alt="" className="w-48 h-auto opacity-70 rounded-xl" />
          </div>
        </div>
      )}

      {/* AI Recognition Results (editable) */}
      {showResult && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">🧠 AI 辨識結果</h3>
            <span className="text-sm text-gray-400">可修正錯誤</span>
          </div>

          {overallAssessment && (
            <div className="mb-4 p-3 bg-emerald-50 rounded-xl text-sm text-emerald-700">
              {overallAssessment}
            </div>
          )}

          <div className="space-y-3">
            {editingItems.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={e => handleItemChange(index, 'name', e.target.value)}
                    placeholder="食物名稱"
                    className="text-base font-medium text-gray-900 bg-transparent border-b border-gray-300 focus:border-emerald-500 outline-none pb-1 flex-1"
                  />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="ml-2 text-red-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: 'calories', label: '熱量', unit: 'kcal' },
                    { key: 'protein', label: '蛋白質', unit: 'g' },
                    { key: 'carbs', label: '碳水', unit: 'g' },
                    { key: 'fat', label: '脂肪', unit: 'g' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-[10px] text-gray-400 mb-0.5">{field.label}</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={item[field.key as keyof FoodItem]?.toString() ?? ''}
                          onChange={e => handleItemChange(index, field.key as keyof FoodItem, e.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-900 focus:border-emerald-400 outline-none"
                        />
                        <span className="text-[10px] text-gray-400">{field.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {item.confidence !== null && item.confidence < 0.7 && (
                  <div className="mt-1 text-[10px] text-orange-500">⚠️ 辨識信心度較低，請確認</div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddItem}
            className="w-full mt-3 py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition"
          >
            ➕ 手動新增食物
          </button>

          {/* Totals */}
          {editingItems.length > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-700">本餐合計</span>
              <span className="text-lg font-bold text-emerald-700">
                {totalCalories(editingItems)} kcal
              </span>
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || editingItems.length === 0}
            className={`w-full mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 text-lg ${saving ? 'yuzu-btn-loading' : ''}`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="yuzu-spinner" />
                AI 教練分析中
                <span className="yuzu-thinking-dot inline-block w-1 h-1 rounded-full bg-white" />
                <span className="yuzu-thinking-dot inline-block w-1 h-1 rounded-full bg-white" />
                <span className="yuzu-thinking-dot inline-block w-1 h-1 rounded-full bg-white" />
              </span>
            ) : '💾 儲存飲食紀錄'}
          </button>
        </div>
      )}

      </>) : (<>
      {/* ═══ History Tab ═══ */}
      {/* Today's Meals */}
      {todayMeals.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">今日飲食</h3>
          <div className="space-y-3">
            {todayMeals.map(meal => {
              const items = (meal.user_corrected_items || meal.ai_recognized_items || []) as FoodItem[]
              const mealLabel = MEAL_TYPES.find(t => t.value === meal.meal_type)?.label || meal.meal_type
              return (
                <div key={meal.id} className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{mealLabel}</span>
                    <span className="text-sm text-emerald-600 font-bold">{totalCalories(items)} kcal</span>
                  </div>
                  {meal.photo_url && (
                    <img src={meal.photo_url} alt="" className="w-full h-32 object-cover rounded-xl mb-2" />
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((item, i) => (
                      <span key={i} className="text-xs bg-white px-2 py-1 rounded-lg border border-gray-100">
                        {item.name} {item.calories ? `(${item.calories}kcal)` : ''}
                      </span>
                    ))}
                  </div>
                  {meal.ai_feedback && (
                    <div className="mt-2 text-sm text-gray-600 bg-emerald-50 p-2 rounded-lg">
                      🤖 {meal.ai_feedback}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-3 p-3 bg-orange-50 rounded-xl text-center">
            <span className="text-sm text-orange-700 font-medium">
              今日總計：{todayMeals.reduce((sum, meal) => {
                const items = (meal.user_corrected_items || meal.ai_recognized_items || []) as FoodItem[]
                return sum + totalCalories(items)
              }, 0)} kcal
            </span>
          </div>
        </div>
      )}

      {/* Recent History */}
      {recentMeals.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📅 歷史紀錄</h3>
          <div className="space-y-2">
            {recentMeals.filter(m => m.date !== new Date().toISOString().split('T')[0]).slice(0, 20).map(meal => {
              const items = (meal.user_corrected_items || meal.ai_recognized_items || []) as FoodItem[]
              return (
                <div key={meal.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  {meal.photo_url ? (
                    <img src={meal.photo_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">{MEAL_TYPES.find(t => t.value === meal.meal_type)?.label.charAt(0) || '🍽️'}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-gray-900">{meal.date}</span>
                      <span className="text-xs text-gray-400">{MEAL_TYPES.find(t => t.value === meal.meal_type)?.label}</span>
                    </div>
                    <div className="text-xs text-gray-500 truncate">{items.map(i => i.name).join('、')}</div>
                  </div>
                  <span className="text-sm font-bold text-purple-600">{totalCalories(items)} kcal</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {todayMeals.length === 0 && recentMeals.length === 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
          <img src="/illust-foods-sm.png" alt="" className="w-20 h-20 mx-auto mb-3 yuzu-float" />
          <p className="text-gray-500">還沒有飲食紀錄</p>
          <button onClick={() => setShowHistory(false)} className="mt-3 text-sm text-violet-600 font-medium">去記錄第一餐 →</button>
        </div>
      )}
      </>)}
    </div>
    </>
  )
}
