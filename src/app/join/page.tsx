'use client'

import { createClient } from '@/lib/supabase/client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

function JoinContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const type = searchParams.get('type') || 'group'
  const [status, setStatus] = useState<'loading' | 'joining' | 'success' | 'error'>('loading')
  const [name, setName] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      return
    }
    loadInfo()
  }, [token])

  const loadInfo = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Save token, redirect to login, then come back
      router.push(`/login?next=${encodeURIComponent(`/join?token=${token}&type=${type}`)}`)
      return
    }

    if (type === 'challenge') {
      const { data } = await supabase
        .from('fa_challenges')
        .select('name')
        .eq('invite_token', token)
        .single()
      setName(data?.name || '未知挑戰')
    } else {
      const { data } = await supabase
        .from('fa_groups')
        .select('name')
        .eq('invite_token', token)
        .single()
      setName(data?.name || '未知群組')
    }
    setStatus('joining')
  }

  const handleJoin = async () => {
    setStatus('loading')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (type === 'challenge') {
      const { data: challenge } = await supabase
        .from('fa_challenges')
        .select('id')
        .eq('invite_token', token)
        .single()

      if (challenge) {
        // Get latest weight
        const { data: record } = await supabase
          .from('fa_health_records')
          .select('weight')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(1)
          .single()

        await supabase.from('fa_challenge_participants').upsert({
          challenge_id: challenge.id,
          user_id: user.id,
          target_type: 'reduce_absolute',
          target_value: 5,
          start_value: record?.weight || null,
          current_value: record?.weight || null,
        }, { onConflict: 'challenge_id,user_id' })

        setStatus('success')
      } else {
        setStatus('error')
      }
    } else {
      const { data: group } = await supabase
        .from('fa_groups')
        .select('id')
        .eq('invite_token', token)
        .single()

      if (group) {
        await supabase.from('fa_group_members').upsert({
          group_id: group.id,
          user_id: user.id,
        }, { onConflict: 'group_id,user_id' })

        setStatus('success')
      } else {
        setStatus('error')
      }
    }
  }

  if (status === 'loading') return <div className="text-center text-gray-400 py-20">載入中...</div>

  if (status === 'error') {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">😢</span>
        <h2 className="text-xl font-bold text-gray-900 mt-4">邀請連結無效</h2>
        <a href="/" className="mt-4 inline-block text-emerald-600 font-medium">回首頁</a>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">🎉</span>
        <h2 className="text-xl font-bold text-gray-900 mt-4">已加入「{name}」！</h2>
        <a href={type === 'challenge' ? '/challenge' : '/'} className="mt-4 inline-block px-6 py-3 bg-emerald-500 text-white rounded-2xl font-medium">
          {type === 'challenge' ? '查看挑戰' : '回首頁'}
        </a>
      </div>
    )
  }

  return (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-100 mb-4">
        <span className="text-4xl">{type === 'challenge' ? '🏆' : '🤝'}</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900">你被邀請加入</h2>
      <h1 className="text-2xl font-bold text-emerald-600 mt-2">「{name}」</h1>
      <button
        onClick={handleJoin}
        className="mt-6 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg text-lg active:scale-[0.98] transition"
      >
        💪 加入{type === 'challenge' ? '挑戰' : '群組'}
      </button>
    </div>
  )
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <Suspense fallback={<div className="text-center text-gray-400 py-20">載入中...</div>}>
          <JoinContent />
        </Suspense>
      </div>
    </div>
  )
}
