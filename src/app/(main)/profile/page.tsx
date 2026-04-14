'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Share, Plus, MoreVertical, Smartphone, Download } from 'lucide-react'

function PwaInstallSection() {
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as any).standalone === true)
    setIsStandalone(standalone)
    if (standalone) return

    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua)) setPlatform('ios')
    else if (/Android/.test(ua)) setPlatform('android')

    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isStandalone || !platform) return null

  const handleInstall = async () => {
    if (platform === 'android' && deferredPrompt) {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
    } else {
      setShowGuide(v => !v)
    }
  }

  return (
    <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">加到手機主畫面</p>
            <p className="text-xs text-gray-500">像 App 一樣快速開啟</p>
          </div>
        </div>
        <button
          onClick={handleInstall}
          className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl shadow active:scale-95 transition"
        >
          {platform === 'android' && deferredPrompt ? '立即安裝' : '查看步驟'}
        </button>
      </div>

      {showGuide && (
        <div className="mt-4 space-y-2.5">
          {platform === 'ios' && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-700">⚠️ 必須用 <strong>Safari</strong> 開啟本頁才能安裝。如果是從 LINE 進來，請先複製網址，再用 Safari 貼上開啟。</p>
            </div>
          )}
          {platform === 'ios' ? (
            <>
              <GuideStep n={1} icon={<Share className="w-4 h-4" />} title="點底部「分享」⬆️" desc="Safari 底部中間的按鈕" />
              <GuideStep n={2} icon={<Plus className="w-4 h-4" />} title='找「加入主畫面」' desc="往下滑，有 ＋ 號的選項" />
              <GuideStep n={3} icon={<Download className="w-4 h-4" />} title='點「新增」完成 🎉' desc="桌面就會出現圖示" />
            </>
          ) : (
            <>
              <GuideStep n={1} icon={<MoreVertical className="w-4 h-4" />} title='點右上角「⋮」' desc="Chrome 右上角三個點" />
              <GuideStep n={2} icon={<Smartphone className="w-4 h-4" />} title='選「加到主畫面」' desc="完成！桌面就會出現圖示 🎉" />
            </>
          )}
        </div>
      )}
    </div>
  )
}

function GuideStep({ n, icon, title, desc }: { n: number; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</div>
      <div className="flex-1 bg-white rounded-xl px-3 py-2 border border-gray-100">
        <div className="flex items-center gap-1.5 text-emerald-600 mb-0.5">{icon}<span className="text-sm font-bold text-gray-800">{title}</span></div>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showInArena, setShowInArena] = useState(true)
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
      setAvatarUrl(data.avatar_url || null)
      setShowInArena(data.show_in_arena ?? true)
    }
    setLoading(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploadingAvatar(false); return }

    const fileName = `avatars/${user.id}/${Date.now()}_${file.name}`
    const { data: uploadData } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      await supabase.from('fa_users').update({ avatar_url: publicUrl }).eq('id', user.id)
      setAvatarUrl(publicUrl)
    }

    setUploadingAvatar(false)
    e.target.value = ''
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    await supabase.from('fa_users').update({
      name: form.name,
      gender: form.gender || null,
      birthday: form.birthday || null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      target_weight: form.target_weight ? parseFloat(form.target_weight) : null,
      target_date: form.target_date || null,
      show_in_arena: showInArena,
    }).eq('id', user.id)

    setSaving(false)
    router.refresh()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="yuzu-skeleton h-8 w-40" />
      <div className="bg-white rounded-3xl p-6 space-y-4">
        <div className="flex justify-center"><div className="yuzu-skeleton w-24 h-24 rounded-full" /></div>
        {[1,2,3,4].map(i => <div key={i} className="yuzu-skeleton h-12 w-full" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">⚙️ 個人設定</h1>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploadingAvatar}
            className="relative group"
          >
            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg ${uploadingAvatar ? 'opacity-50' : ''}`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="頭像" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">{form.name.charAt(0) || '?'}</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition">
              <span className="text-white opacity-0 group-hover:opacity-100 transition text-sm font-medium">
                {uploadingAvatar ? '上傳中...' : '📷 換照片'}
              </span>
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full flex items-center justify-center">
                <span className="yuzu-spinner-dark yuzu-spinner" />
              </div>
            )}
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          <p className="text-xs text-gray-400 mt-2">點擊頭像更換照片</p>
        </div>

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

        {/* 競技場顯示開關 */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
          <div>
            <p className="text-sm font-medium text-gray-800">顯示在競技場</p>
            <p className="text-xs text-gray-400 mt-0.5">關閉後朋友看不到你的排名</p>
          </div>
          <button
            type="button"
            onClick={() => setShowInArena(v => !v)}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${showInArena ? 'bg-emerald-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showInArena ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <button onClick={handleSave} disabled={saving}
          className={`w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 text-lg active:scale-[0.98] transition ${saving ? 'yuzu-btn-loading' : ''}`}>
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="yuzu-spinner" />
              儲存中...
            </span>
          ) : '💾 儲存設定'}
        </button>
      </div>

      {/* 加到主畫面 */}
      <PwaInstallSection />

      {/* App 圖示更新提示 */}
      <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
        <p className="text-xs text-amber-800 font-medium">📱 桌面圖示顯示舊版？</p>
        <p className="text-xs text-amber-700 mt-1">長按桌面的 App 圖示 → 移除 → 重新從瀏覽器安裝，即可更新為最新圖示。</p>
      </div>

      <button onClick={handleLogout}
        className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-medium hover:bg-red-100 transition">
        登出
      </button>
    </div>
  )
}
