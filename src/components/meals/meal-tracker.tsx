'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { MealRecord, FoodItem } from '@/types'

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedMealType, setSelectedMealType] = useState<string>('lunch')
  const [uploading, setUploading] = useState(false)
  const [recognizedItems, setRecognizedItems] = useState<FoodItem[]>([])
  const [overallAssessment, setOverallAssessment] = useState('')
  const [editingItems, setEditingItems] = useState<FoodItem[]>([])
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [showResult, setShowResult] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setShowResult(false)

    try {
      // Upload to Supabase Storage
      const supabase = createClient()
      const fileName = `${userId}/${Date.now()}_${file.name}`
      const { data: uploadData } = await supabase.storage
        .from('meal-photos')
        .upload(fileName, file)

      if (uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('meal-photos')
          .getPublicUrl(fileName)
        setPhotoUrl(publicUrl)
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">📸 飲食紀錄</h1>

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
            <div className="mb-4 p-8 border-2 border-dashed border-gray-200 rounded-2xl">
              <span className="text-5xl">📷</span>
              <p className="text-gray-500 mt-2">拍攝或上傳食物照片</p>
              <p className="text-gray-400 text-sm">AI 將自動辨識食物並估算營養</p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-2xl shadow hover:shadow-md transition active:scale-[0.98] disabled:opacity-50"
            >
              {uploading ? '🧠 AI 辨識中...' : '📸 拍照 / 上傳'}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>

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
            className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 text-lg"
          >
            {saving ? '儲存中...' : '💾 儲存飲食紀錄'}
          </button>
        </div>
      )}

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
    </div>
  )
}
