'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProfileSetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    gender: '' as 'male' | 'female' | '',
    birthday: '',
    height_cm: '',
    target_weight: '',
    target_date: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.gender || !form.birthday || !form.height_cm) return

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    await supabase.from('fa_users').update({
      name: form.name || user.user_metadata?.full_name || '',
      gender: form.gender,
      birthday: form.birthday,
      height_cm: parseFloat(form.height_cm),
      target_weight: form.target_weight ? parseFloat(form.target_weight) : null,
      target_date: form.target_date || null,
      profile_completed: true,
    }).eq('id', user.id)

    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎯</div>
          <h1 className="text-2xl font-bold text-gray-900">設定你的目標</h1>
          <p className="text-gray-500 mt-1">讓 AI 教練更了解你</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">暱稱</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="輸入你的暱稱"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">性別 <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {(['male', 'female'] as const).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, gender: g }))}
                  className={`rounded-xl py-3 text-center font-medium transition-all active:scale-[0.98] ${
                    form.gender === g
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  {g === 'male' ? '👨 男性' : '👩 女性'}
                </button>
              ))}
            </div>
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">生日 <span className="text-red-400">*</span></label>
            <input
              type="date"
              value={form.birthday}
              onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">身高 (cm) <span className="text-red-400">*</span></label>
            <input
              type="number"
              step="0.1"
              value={form.height_cm}
              onChange={e => setForm(f => ({ ...f, height_cm: e.target.value }))}
              placeholder="例：165"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            />
          </div>

          <hr className="border-gray-100" />

          <div className="text-center">
            <span className="text-sm text-gray-400">以下為選填，之後可修改</span>
          </div>

          {/* Target Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目標體重 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={form.target_weight}
              onChange={e => setForm(f => ({ ...f, target_weight: e.target.value }))}
              placeholder="例：65"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            />
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">目標日期</label>
            <input
              type="date"
              value={form.target_date}
              onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !form.gender || !form.birthday || !form.height_cm}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? '儲存中...' : '🚀 開始我的瘦身之旅'}
          </button>
        </form>
      </div>
    </div>
  )
}
