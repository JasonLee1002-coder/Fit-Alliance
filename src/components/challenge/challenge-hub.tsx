'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { calculateProgress } from '@/types'
import type { Challenge, ChallengeParticipant } from '@/types'

interface Props {
  userId: string
  userName: string
  challenges: Challenge[]
  allParticipants: (ChallengeParticipant & { user?: { id: string; name: string; avatar_url: string | null } })[]
}

export default function ChallengeHub({ userId, userName, challenges, allParticipants }: Props) {
  const router = useRouter()
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    name: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    prize_description: '',
    my_target_type: 'reduce_absolute' as 'reduce_percent' | 'reduce_absolute',
    my_target_value: '',
    my_personal_goal: '',
  })

  const handleCreate = async () => {
    if (!form.name || !form.end_date || !form.my_target_value) return
    setCreating(true)

    try {
      const supabase = createClient()

      // Get current weight
      const { data: latestRecord } = await supabase
        .from('fa_health_records')
        .select('weight')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single()

      const { data: challenge } = await supabase
        .from('fa_challenges')
        .insert({
          name: form.name,
          creator_id: userId,
          start_date: form.start_date,
          end_date: form.end_date,
          prize_description: form.prize_description || null,
        })
        .select()
        .single()

      if (challenge) {
        await supabase.from('fa_challenge_participants').insert({
          challenge_id: challenge.id,
          user_id: userId,
          target_type: form.my_target_type,
          target_value: parseFloat(form.my_target_value),
          start_value: latestRecord?.weight || null,
          current_value: latestRecord?.weight || null,
          personal_goal: form.my_personal_goal || null,
        })
      }

      setShowCreate(false)
      router.refresh()
    } finally {
      setCreating(false)
    }
  }

  const activeChallenges = challenges.filter(c => c.status === 'active')
  const endedChallenges = challenges.filter(c => c.status === 'ended')

  const shareChallenge = async (challenge: Challenge) => {
    const url = `${window.location.origin}/join?token=${challenge.invite_token}&type=challenge`
    if (navigator.share) {
      await navigator.share({ title: challenge.name, text: `加入「${challenge.name}」瘦身挑戰！`, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('邀請連結已複製！')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🏆 共同挑戰</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition active:scale-[0.98]"
        >
          ➕ 建立挑戰
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">建立新挑戰</h3>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="挑戰名稱（例：夏天前變瘦大作戰）"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">開始日期</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">結束日期</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            </div>
          </div>
          <input
            type="text"
            value={form.prize_description}
            onChange={e => setForm(f => ({ ...f, prize_description: e.target.value }))}
            placeholder="獎品（選填，例：輸家請吃火鍋）"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none"
          />

          <hr className="border-gray-100" />
          <h4 className="text-sm font-medium text-gray-700">🎯 我的個人目標</h4>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setForm(f => ({ ...f, my_target_type: 'reduce_absolute' }))}
              className={`py-2.5 rounded-xl text-sm font-medium transition ${form.my_target_type === 'reduce_absolute' ? 'bg-emerald-500 text-white' : 'bg-gray-50 border border-gray-200 text-gray-600'}`}
            >
              減少 kg
            </button>
            <button
              onClick={() => setForm(f => ({ ...f, my_target_type: 'reduce_percent' }))}
              className={`py-2.5 rounded-xl text-sm font-medium transition ${form.my_target_type === 'reduce_percent' ? 'bg-emerald-500 text-white' : 'bg-gray-50 border border-gray-200 text-gray-600'}`}
            >
              減少 %
            </button>
          </div>

          <input
            type="number"
            step="0.1"
            value={form.my_target_value}
            onChange={e => setForm(f => ({ ...f, my_target_value: e.target.value }))}
            placeholder={form.my_target_type === 'reduce_absolute' ? '目標減少幾 kg（例：5）' : '目標減少幾 %（例：5）'}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none"
          />

          <textarea
            value={form.my_personal_goal}
            onChange={e => setForm(f => ({ ...f, my_personal_goal: e.target.value }))}
            placeholder="你的動力是什麼？（選填，例：夏天要穿比基尼）"
            maxLength={100}
            rows={2}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none resize-none"
          />

          <div className="flex gap-3">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium">取消</button>
            <button onClick={handleCreate} disabled={creating} className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-medium disabled:opacity-50">{creating ? '建立中...' : '建立挑戰'}</button>
          </div>
        </div>
      )}

      {/* Active Challenges */}
      {activeChallenges.map(challenge => {
        const participants = allParticipants
          .filter(p => p.challenge_id === challenge.id)
          .map(p => ({ ...p, progress: calculateProgress(p) }))
          .sort((a, b) => b.progress - a.progress)

        const daysLeft = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / 86400000))
        const urgencyColor = daysLeft > 7 ? 'text-emerald-600' : daysLeft > 3 ? 'text-yellow-600' : 'text-red-600'

        return (
          <div key={challenge.id} className="relative yuzu-glow-urgent">
          <div className="bg-white rounded-3xl shadow-sm border-2 border-orange-200 p-6 relative overflow-hidden">
            <span className="absolute top-3 right-3 yuzu-pill-live z-10">LIVE</span>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">🔥 {challenge.name}</h3>
                {challenge.prize_description && <p className="text-xs text-gray-400 mt-0.5">🎁 {challenge.prize_description}</p>}
              </div>
              <div className={`text-right ${urgencyColor}`}>
                <div className="text-2xl font-bold">{daysLeft}</div>
                <div className="text-xs">天剩餘</div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="space-y-2">
              {participants.map((p, index) => {
                const medals = ['🥇', '🥈', '🥉']
                const emoji = p.progress >= 100 ? '🎉' : p.progress >= 75 ? '🔥' : p.progress >= 50 ? '💪' : '🏃'

                return (
                  <div key={p.id} className={`flex items-center gap-3 p-3 rounded-xl ${p.user_id === userId ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'}`}>
                    <span className="text-lg w-6 text-center">{medals[index] || `${index + 1}`}</span>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {p.user?.avatar_url ? (
                        <img src={p.user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-gray-500">{p.user?.name?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {p.user?.name} {p.user_id === userId && '(你)'}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full transition-all ${p.progress >= 75 ? 'bg-emerald-500' : p.progress >= 50 ? 'bg-yellow-500' : 'bg-orange-400'}`}
                          style={{ width: `${Math.min(100, p.progress)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-gray-900">{Math.round(p.progress)}%</div>
                      <div className="text-xs">{emoji}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={() => shareChallenge(challenge)}
              className="w-full mt-4 py-2.5 bg-orange-50 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-100 transition"
            >
              🤝 邀請朋友加入
            </button>
          </div>
          </div>
        )
      })}

      {/* Empty State */}
      {challenges.length === 0 && !showCreate && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
          <span className="text-6xl">🏆</span>
          <h3 className="text-lg font-bold text-gray-900 mt-4">還沒有挑戰</h3>
          <p className="text-gray-500 mt-1">建立一個挑戰，邀請朋友一起瘦！</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-medium"
          >
            建立第一個挑戰
          </button>
        </div>
      )}

      {/* Ended */}
      {endedChallenges.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">已結束的挑戰</h2>
          {endedChallenges.map(c => (
            <div key={c.id} className="bg-gray-50 rounded-2xl p-4 mb-2">
              <span className="text-sm text-gray-600">✅ {c.name}</span>
              <span className="text-xs text-gray-400 ml-2">{c.start_date} ~ {c.end_date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
