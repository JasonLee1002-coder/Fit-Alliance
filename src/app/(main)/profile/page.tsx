'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    gender: '',
    birthday: '',
    height_cm: '',
    target_weight: '',
    target_date: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('fa_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setForm({
        name: data.name || '',
        gender: data.gender || '',
        birthday: data.birthday || '',
        height_cm: data.height_cm?.toString() || '',
        target_weight: data.target_weight?.toString() || '',
        target_date: data.target_date || '',
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('fa_users').update({
      name: form.name,
      gender: form.gender || null,
      birthday: form.birthday || null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      target_weight: form.target_weight ? parseFloat(form.target_weight) : null,
      target_date: form.target_date || null,
    }).eq('id', user.id)

    setSaving(false)
    router.refresh()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="text-center text-gray-400 py-20">載入中...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">⚙️ 個人設定</h1>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">暱稱</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
          <div className="grid grid-cols-2 gap-3">
            {(['male', 'female'] as const).map(g => (
              <button key={g} type="button" onClick={() => setForm(f => ({ ...f, gender: g }))}
                className={`rounded-xl py-3 text-center font-medium transition ${form.gender === g ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                {g === 'male' ? '👨 男性' : '👩 女性'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">生日</label>
          <input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">身高 (cm)</label>
          <input type="number" step="0.1" value={form.height_cm} onChange={e => setForm(f => ({ ...f, height_cm: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none" />
        </div>

        <hr className="border-gray-100" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">🎯 目標體重 (kg)</label>
          <input type="number" step="0.1" value={form.target_weight} onChange={e => setForm(f => ({ ...f, target_weight: e.target.value }))} placeholder="例：65" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">🗓️ 目標日期</label>
          <input type="date" value={form.target_date} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none" />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 text-lg active:scale-[0.98] transition">
          {saving ? '儲存中...' : '💾 儲存設定'}
        </button>
      </div>

      <button onClick={handleLogout}
        className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-medium hover:bg-red-100 transition">
        登出
      </button>
    </div>
  )
}
