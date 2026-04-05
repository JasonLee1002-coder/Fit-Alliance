'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export default function InvitePage() {
  const [group, setGroup] = useState<{ id: string; name: string; invite_token: string } | null>(null)
  const [members, setMembers] = useState<{ name: string; avatar_url: string | null; joined_at: string }[]>([])
  const [groupName, setGroupName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadGroup()
  }, [])

  const loadGroup = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('fa_groups')
      .select('*')
      .eq('creator_id', user.id)
      .single()

    if (data) {
      setGroup(data)
      const { data: memberData } = await supabase
        .from('fa_group_members')
        .select('joined_at, user:fa_users(name, avatar_url)')
        .eq('group_id', data.id)

      setMembers(memberData?.map(m => ({
        name: (m.user as unknown as { name: string })?.name || '',
        avatar_url: (m.user as unknown as { avatar_url: string | null })?.avatar_url,
        joined_at: m.joined_at,
      })) ?? [])
    }

    setLoading(false)
  }

  const handleCreate = async () => {
    if (!groupName.trim()) return
    setCreating(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('請先登入')
        setCreating(false)
        return
      }

      const { data, error } = await supabase
        .from('fa_groups')
        .insert({ name: groupName, creator_id: user.id })
        .select()
        .single()

      if (error) {
        console.error('[Group] Create failed:', error)
        alert('建立群組失敗：' + (error.message || '未知錯誤'))
        setCreating(false)
        return
      }

      if (data) {
        // Creator joins own group
        const { error: joinError } = await supabase.from('fa_group_members').insert({ group_id: data.id, user_id: user.id })
        if (joinError) console.error('[Group] Join failed:', joinError)
        setGroup(data)
        loadGroup()
      }
    } catch (err) {
      console.error('[Group] Unexpected error:', err)
      alert('建立群組發生錯誤，請重試')
    } finally {
      setCreating(false)
    }
  }

  const handleShare = async () => {
    if (!group) return
    const url = `${window.location.origin}/join?token=${group.invite_token}&type=group`
    const text = `加入「${group.name}」瘦身聯盟！一起變瘦 💪`

    if (navigator.share) {
      await navigator.share({ title: group.name, text, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('邀請連結已複製！')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">載入中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">🤝 個人邀請朋友</h1>

      {group ? (
        <>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h2>
            <p className="text-gray-500 text-sm mb-4">{members.length} 位成員</p>

            <button
              onClick={handleShare}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition active:scale-[0.98] text-lg"
            >
              📤 分享邀請連結
            </button>

            <div className="mt-4 flex gap-2 justify-center">
              <button
                onClick={() => {
                  const url = `https://line.me/R/msg/text/?${encodeURIComponent(`加入「${group.name}」瘦身聯盟！${window.location.origin}/join?token=${group.invite_token}&type=group`)}`
                  window.open(url)
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium"
              >
                LINE 分享
              </button>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(`${window.location.origin}/join?token=${group.invite_token}&type=group`)
                  alert('已複製！')
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium"
              >
                複製連結
              </button>
            </div>
          </div>

          {/* Members */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">成員列表</h3>
            <div className="space-y-3">
              {members.map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-emerald-600 font-bold">{m.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{m.name}</div>
                    <div className="text-xs text-gray-400">加入於 {m.joined_at?.split('T')[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
          <span className="text-6xl">🤝</span>
          <h2 className="text-xl font-bold text-gray-900 mt-4">建立你的瘦身群組</h2>
          <p className="text-gray-500 mt-2 mb-6">邀請朋友一起加入，互相督促！</p>

          <input
            type="text"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            placeholder="群組名稱（例：閨蜜瘦身團）"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none mb-4"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !groupName.trim()}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg disabled:opacity-50 text-lg"
          >
            {creating ? '建立中...' : '建立群組'}
          </button>
        </div>
      )}
    </div>
  )
}
