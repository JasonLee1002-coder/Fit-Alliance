'use client'

import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { BroadcasterMascot, TrophyMascot } from '@/components/shared/mascots'
import { useRouter } from 'next/navigation'
import { calculateProgress } from '@/types'
import type { Challenge, ChallengeParticipant, GroupMessage, MemberRelationship } from '@/types'

interface ParticipantWithUser extends ChallengeParticipant {
  user?: { id: string; name: string; avatar_url: string | null }
  progress: number
}

interface Props {
  userId: string
  userName: string
  challenges: Challenge[]
  allParticipants: (ChallengeParticipant & { user?: { id: string; name: string; avatar_url: string | null } })[]
}

// ─── Rank Styles ───
const RANK_STYLES = [
  {
    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
    border: 'border-2 border-amber-300',
    shadow: 'shadow-[0_0_16px_rgba(251,191,36,0.45)]',
    avatarRing: 'ring-4 ring-amber-400 ring-offset-2',
    badge: '🥇', barFrom: 'from-amber-400', barTo: 'to-yellow-300', crown: true,
  },
  {
    bg: 'bg-gradient-to-r from-slate-50 to-gray-50',
    border: 'border-2 border-slate-300',
    shadow: 'shadow-[0_0_12px_rgba(148,163,184,0.4)]',
    avatarRing: 'ring-4 ring-slate-400 ring-offset-2',
    badge: '🥈', barFrom: 'from-slate-400', barTo: 'to-gray-300', crown: false,
  },
  {
    bg: 'bg-gradient-to-r from-orange-50 to-amber-50',
    border: 'border-2 border-orange-300',
    shadow: 'shadow-[0_0_12px_rgba(251,146,60,0.35)]',
    avatarRing: 'ring-4 ring-orange-400 ring-offset-2',
    badge: '🥉', barFrom: 'from-orange-400', barTo: 'to-amber-300', crown: false,
  },
]
const DEFAULT_RANK = {
  bg: 'bg-gray-50', border: 'border border-gray-200', shadow: '',
  avatarRing: 'ring-2 ring-gray-200', badge: '', barFrom: 'from-emerald-400', barTo: 'to-emerald-300', crown: false,
}

// ─── Countdown Hook ───
function useCountdown(endDate: string | null) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  if (!endDate) return null
  const [y, m, d] = endDate.split('-').map(Number)
  const end = Date.UTC(y, m - 1, d, 15, 59, 59) // 台灣 23:59:59
  const diff = end - now
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    isExpired: false,
  }
}

export default function ChallengeHub({ userId, userName, challenges, allParticipants }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'active' | 'ended'>('active')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [chatOpen, setChatOpen] = useState<Record<string, boolean>>({})
  const [messages, setMessages] = useState<Record<string, GroupMessage[]>>({})
  const [chatInput, setChatInput] = useState('')
  const [relationships, setRelationships] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '', start_date: new Date().toISOString().split('T')[0], end_date: '',
    prize_description: '', my_target_type: 'reduce_percent' as const, my_target_value: '10', my_personal_goal: '',
  })

  useEffect(() => {
    loadRelationships()
  }, [])

  const loadRelationships = async () => {
    const supabase = createClient()
    const { data } = await supabase.from('fa_member_relationships').select('to_user_id, label').eq('from_user_id', userId)
    const map: Record<string, string> = {}
    data?.forEach(r => { map[r.to_user_id] = r.label })
    setRelationships(map)
  }

  const loadMessages = async (challengeId: string) => {
    const supabase = createClient()
    const { data } = await supabase.from('fa_group_messages').select('*').eq('challenge_id', challengeId).order('created_at', { ascending: true }).limit(50)
    setMessages(prev => ({ ...prev, [challengeId]: data ?? [] }))
  }

  const toggleChat = (challengeId: string) => {
    const isOpen = !chatOpen[challengeId]
    setChatOpen(prev => ({ ...prev, [challengeId]: isOpen }))
    if (isOpen && !messages[challengeId]) loadMessages(challengeId)
  }

  const sendMessage = async (challengeId: string) => {
    if (!chatInput.trim()) return
    const supabase = createClient()
    await supabase.from('fa_group_messages').insert({
      challenge_id: challengeId, user_id: userId,
      content: chatInput.trim(), is_ai: false, sender_name: userName,
    })
    setChatInput('')
    loadMessages(challengeId)
  }

  const triggerAIBroadcast = async (challengeId: string) => {
    try {
      const res = await fetch('/api/ai/broadcaster', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      })
      if (res.ok) loadMessages(challengeId)
    } catch {}
  }

  const handleCreate = async () => {
    if (!form.name || !form.end_date || !form.my_target_value) return
    setCreating(true)
    try {
      const supabase = createClient()
      const { data: latestRecord } = await supabase.from('fa_health_records')
        .select('weight').eq('user_id', userId).order('date', { ascending: false }).limit(1).single()

      const { data: challenge } = await supabase.from('fa_challenges').insert({
        name: form.name, creator_id: userId, start_date: form.start_date,
        end_date: form.end_date, prize_description: form.prize_description || null,
      }).select().single()

      if (challenge) {
        await supabase.from('fa_challenge_participants').insert({
          challenge_id: challenge.id, user_id: userId,
          target_type: form.my_target_type, target_value: parseFloat(form.my_target_value),
          start_value: latestRecord?.weight || null, current_value: latestRecord?.weight || null,
          personal_goal: form.my_personal_goal || null,
        })
      }
      setShowCreate(false)
      router.refresh()
    } finally { setCreating(false) }
  }

  const shareChallenge = async (challenge: Challenge) => {
    const url = `${window.location.origin}/join?token=${challenge.invite_token}&type=challenge`
    if (navigator.share) {
      await navigator.share({ title: challenge.name, text: `加入「${challenge.name}」瘦身挑戰！`, url })
    } else {
      await navigator.clipboard.writeText(url)
      alert('邀請連結已複製！')
    }
  }

  const activeChallenges = challenges.filter(c => c.status === 'active')
  const endedChallenges = challenges.filter(c => c.status !== 'active')
  const displayChallenges = tab === 'active' ? activeChallenges : endedChallenges

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🏆 共同挑戰</h1>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition active:scale-[0.98]">
          ➕ 建立挑戰
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('active')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'active' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
          🔥 進行中 ({activeChallenges.length})
        </button>
        <button onClick={() => setTab('ended')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'ended' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
          ✅ 已結束 ({endedChallenges.length})
        </button>
      </div>

      {/* Create Form */}
      {showCreate && <CreateForm form={form} setForm={setForm} creating={creating} onCreate={handleCreate} onCancel={() => setShowCreate(false)} />}

      {/* Challenges */}
      {displayChallenges.map(challenge => {
        const participants = allParticipants
          .filter(p => p.challenge_id === challenge.id)
          .map(p => ({ ...p, progress: calculateProgress(p) }))
          .sort((a, b) => b.progress - a.progress) as ParticipantWithUser[]

        const myParticipant = participants.find(p => p.user_id === userId)
        const avgProgress = participants.length ? participants.reduce((s, p) => s + p.progress, 0) / participants.length : 0
        const completedCount = participants.filter(p => p.progress >= 100).length
        const chatMsgs = messages[challenge.id] ?? []

        return (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            participants={participants}
            myParticipant={myParticipant}
            avgProgress={avgProgress}
            completedCount={completedCount}
            userId={userId}
            relationships={relationships}
            chatOpen={!!chatOpen[challenge.id]}
            chatMessages={chatMsgs}
            chatInput={chatInput}
            onToggleChat={() => toggleChat(challenge.id)}
            onSendMessage={() => sendMessage(challenge.id)}
            onChatInputChange={setChatInput}
            onTriggerAI={() => triggerAIBroadcast(challenge.id)}
            onShare={() => shareChallenge(challenge)}
            onRelationshipSaved={loadRelationships}
          />
        )
      })}

      {/* Empty */}
      {displayChallenges.length === 0 && !showCreate && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="flex justify-center mb-4">{tab === 'active' ? <TrophyMascot size={80} /> : <div className="text-6xl yuzu-float">📋</div>}</div>
          <h3 className="text-lg font-bold text-gray-900">{tab === 'active' ? '還沒有進行中的挑戰' : '還沒有已結束的挑戰'}</h3>
          {tab === 'active' && (
            <button onClick={() => setShowCreate(true)}
              className="mt-4 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-medium">
              建立第一個挑戰
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Challenge Card ───
function ChallengeCard({ challenge, participants, myParticipant, avgProgress, completedCount, userId, relationships, chatOpen, chatMessages, chatInput, onToggleChat, onSendMessage, onChatInputChange, onTriggerAI, onShare, onRelationshipSaved }: {
  challenge: Challenge; participants: ParticipantWithUser[]; myParticipant?: ParticipantWithUser
  avgProgress: number; completedCount: number; userId: string; relationships: Record<string, string>
  chatOpen: boolean; chatMessages: GroupMessage[]; chatInput: string
  onToggleChat: () => void; onSendMessage: () => void; onChatInputChange: (v: string) => void
  onTriggerAI: () => void; onShare: () => void; onRelationshipSaved: () => void
}) {
  const countdown = useCountdown(challenge.end_date)
  const isActive = challenge.status === 'active'
  const [selectedMember, setSelectedMember] = useState<{ participant: ParticipantWithUser; rank: number } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const handleTriggerAI = async () => {
    setAiLoading(true)
    await onTriggerAI()
    setAiLoading(false)
  }

  // Time progress
  const startTime = new Date(challenge.start_date).getTime()
  const endTime = new Date(challenge.end_date).getTime()
  const timePercent = Math.min(100, Math.max(0, ((Date.now() - startTime) / (endTime - startTime)) * 100))

  const urgencyBg = !countdown ? 'bg-black/40 border-white/20'
    : countdown.days <= 1 ? 'bg-red-900/60 border-red-400/50'
    : countdown.days <= 3 ? 'bg-orange-900/60 border-orange-400/50'
    : countdown.days <= 7 ? 'bg-yellow-900/60 border-yellow-400/50'
    : 'bg-black/40 border-white/20'

  const urgencyTitle = !countdown ? '⏳ 倒數計時'
    : countdown.days <= 1 ? '⚠️ 最後衝刺！挑戰即將截止'
    : countdown.days <= 3 ? '🔥 危機模式！剩下最後機會'
    : countdown.days <= 7 ? '⏰ 最後倒數週，加油！'
    : '⏳ 倒數計時'

  return (
    <div className={`rounded-3xl overflow-hidden shadow-xl border ${isActive ? 'yuzu-glow-urgent' : 'border-gray-200'}`}>
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500 px-5 pt-6 pb-8 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        {isActive && <span className="absolute top-3 right-3 yuzu-pill-live z-10">LIVE</span>}

        <div className="relative z-10">
          <h2 className="text-xl font-black">{challenge.name}</h2>
          {challenge.prize_description && <p className="text-white/80 text-sm mt-1">🎁 {challenge.prize_description}</p>}
          <p className="text-white/70 text-xs mt-1">{challenge.start_date} ~ {challenge.end_date}</p>

          {/* Countdown */}
          {isActive && countdown && !countdown.isExpired && (
            <div className={`mt-4 rounded-2xl border p-3 ${urgencyBg}`}>
              <p className="text-xs text-white/80 mb-2 text-center font-medium">{urgencyTitle}</p>
              <div className="flex justify-center gap-2">
                {[
                  { v: countdown.days, l: '天' },
                  { v: countdown.hours, l: '時' },
                  { v: countdown.minutes, l: '分' },
                  { v: countdown.seconds, l: '秒' },
                ].map(({ v, l }) => (
                  <div key={l} className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black tabular-nums"
                      style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))', border: '1px solid rgba(255,255,255,0.2)' }}>
                      {String(v).padStart(2, '0')}
                    </div>
                    <span className="text-[10px] text-white/60 mt-0.5 tracking-widest">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Progress Bar */}
      {isActive && (
        <div className="px-5 py-2 bg-white border-b border-gray-100">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>已過 {timePercent.toFixed(0)}%</span>
            <span>剩餘 {(100 - timePercent).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden relative">
            <div className={`h-2 rounded-full bg-gradient-to-r transition-all duration-1000 ${
              countdown && countdown.days <= 1 ? 'from-red-400 to-red-600'
              : countdown && countdown.days <= 3 ? 'from-orange-400 to-red-500'
              : timePercent > 75 ? 'from-yellow-400 to-orange-500'
              : 'from-emerald-400 to-teal-400'
            }`} style={{ width: `${timePercent}%` }} />
            {timePercent > 2 && timePercent < 98 && (
              <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-emerald-500 ${countdown && countdown.days <= 1 ? 'animate-ping' : ''}`}
                style={{ left: `calc(${timePercent}% - 6px)` }} />
            )}
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-white">
        {[
          { icon: '👥', label: '參賽者', value: participants.length },
          { icon: '🔥', label: '平均進度', value: `${avgProgress.toFixed(0)}%` },
          { icon: '🏅', label: '已達標', value: completedCount },
        ].map(s => (
          <div key={s.label} className="py-3 text-center">
            <div className="text-lg">{s.icon}</div>
            <div className="text-lg font-bold text-gray-900">{s.value}</div>
            <div className="text-[10px] text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 py-3 bg-white border-t border-gray-50">
        <button onClick={onShare} className="flex-1 py-2.5 bg-orange-50 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-100 transition">
          🤝 邀請朋友
        </button>
      </div>

      {/* My Personal Goal */}
      {myParticipant && (
        <PersonalGoalSection participant={myParticipant} userId={userId} challengeId={challenge.id} />
      )}

      {/* Leaderboard */}
      {participants.length > 0 && (
        <div className="px-4 pb-2 bg-white">
          <h3 className="text-sm font-bold text-gray-700 mb-2 px-1">🏆 排行榜</h3>
          <div className="space-y-2">
            {participants.map((p, index) => (
              <LeaderboardRow key={p.id} participant={p} rank={index} userId={userId} relationship={relationships[p.user_id]}
                onTap={() => setSelectedMember({ participant: p, rank: index })} />
            ))}
          </div>
        </div>
      )}

      {/* Group Chat */}
      <div className="bg-white border-t border-gray-100">
        <button onClick={onToggleChat}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
              <span className="text-sm">💬</span>
            </div>
            <span className="text-sm font-bold text-gray-700">群組留言</span>
            {chatMessages.length > 0 && <span className="text-xs text-gray-400">({chatMessages.length})</span>}
          </div>
          <span className="text-gray-400">{chatOpen ? '▲' : '▼'}</span>
        </button>

        {chatOpen && (
          <div className="px-4 pb-4 space-y-3">
            {/* AI Broadcast Button */}
            <button onClick={handleTriggerAI} disabled={aiLoading}
              className={`w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition active:scale-[0.98] disabled:opacity-80 ${aiLoading ? 'yuzu-btn-loading' : ''}`}>
              {aiLoading ? (
                <span className="flex items-center justify-center gap-1.5">
                  <span className="yuzu-spinner" style={{ width: '0.875rem', height: '0.875rem' }} />
                  播報員備稿中
                  <span className="yuzu-thinking-dot inline-block w-1 h-1 rounded-full bg-white" />
                  <span className="yuzu-thinking-dot inline-block w-1 h-1 rounded-full bg-white" />
                  <span className="yuzu-thinking-dot inline-block w-1 h-1 rounded-full bg-white" />
                </span>
              ) : '🎤 請 AI 播報員說話'}
            </button>

            {/* Messages */}
            <div className="max-h-80 overflow-y-auto space-y-2" ref={(el) => { if (el) el.scrollTop = el.scrollHeight }}>
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.user_id === userId && !msg.is_ai ? 'justify-end' : 'justify-start'}`}>
                  {msg.is_ai && (
                    <img src="/mascot-broadcaster-sm.png" alt="" className="w-7 h-7 rounded-full shadow-sm mr-1 flex-shrink-0 mt-1" />
                  )}
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    msg.is_ai ? 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 text-gray-700'
                    : msg.user_id === userId ? 'bg-emerald-500 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-700 rounded-bl-md'
                  }`}>
                    {!msg.is_ai && msg.user_id !== userId && (
                      <div className="text-xs font-medium text-gray-500 mb-0.5">{msg.sender_name}</div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className="text-[10px] opacity-60 mt-0.5 text-right">
                      {new Date(msg.created_at).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-2 border-emerald-200 rounded-2xl px-3 py-2 focus-within:border-emerald-400 transition">
              <input
                type="text"
                value={chatInput}
                onChange={e => onChatInputChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSendMessage()}
                placeholder="說點什麼..."
                maxLength={500}
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button onClick={onSendMessage}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-sm hover:shadow transition active:scale-[0.95]">
                ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Member Detail Drawer */}
      {selectedMember && (
        <MemberDrawer
          participant={selectedMember.participant}
          rank={selectedMember.rank}
          userId={userId}
          relationship={relationships[selectedMember.participant.user_id]}
          onClose={() => setSelectedMember(null)}
          onRelationshipSaved={onRelationshipSaved}
        />
      )}
    </div>
  )
}

// ─── Member Detail Drawer ───
const PRESET_RELATIONSHIPS = ['老公', '老婆', '女兒', '兒子', '爸爸', '媽媽', '公公', '婆婆', '哥哥', '姐姐', '弟弟', '妹妹', '好友', '同事', '戰友', '閨蜜', '鄰居', '同學']

function MemberDrawer({ participant: p, rank, userId, relationship, onClose, onRelationshipSaved }: {
  participant: ParticipantWithUser; rank: number; userId: string; relationship?: string
  onClose: () => void; onRelationshipSaved: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [relLabel, setRelLabel] = useState(relationship || '')
  const [customLabel, setCustomLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [records, setRecords] = useState<Array<{ date: string; weight: number | null; body_fat: number | null }>>([])
  const [recordsLoading, setRecordsLoading] = useState(true)
  const [trendMetric, setTrendMetric] = useState<'weight' | 'bodyFat'>('weight')
  const isMe = p.user_id === userId
  const style = RANK_STYLES[rank] ?? DEFAULT_RANK
  const pct = Math.min(p.progress, 100)

  // Load member's health records
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('fa_health_records')
        .select('date, weight, body_fat')
        .eq('user_id', p.user_id)
        .order('date', { ascending: false })
        .limit(30)
      setRecords(data ?? [])
      setRecordsLoading(false)
    }
    load()
  }, [p.user_id])

  const handleSaveRelationship = async (label: string) => {
    if (!label.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('fa_member_relationships').upsert({
      from_user_id: userId,
      to_user_id: p.user_id,
      label: label.trim(),
    }, { onConflict: 'from_user_id,to_user_id' })
    setRelLabel(label.trim())
    setEditing(false)
    setSaving(false)
    onRelationshipSaved()
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto yuzu-slide-up">
        <div className="sticky top-0 bg-white pt-3 pb-2 px-5 border-b border-gray-100 flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">成員詳情</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Avatar + Name + Rank */}
          <div className="flex flex-col items-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden ${style.avatarRing}`}>
              {p.user?.avatar_url ? (
                <img src={p.user.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{p.user?.name?.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xl">{style.badge || `#${rank + 1}`}</span>
              <span className="text-lg font-bold text-gray-900">{p.user?.name}{isMe && ' (你)'}</span>
            </div>
            {relLabel && <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full mt-1">{relLabel}</span>}
          </div>

          {/* Progress Ring */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke={pct >= 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#6366f1'}
                  strokeWidth="10" strokeLinecap="round" strokeDasharray={`${pct * 3.14} ${314 - pct * 3.14}`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-gray-900">{pct.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Data Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-400">起始值</div>
              <div className="text-lg font-bold text-gray-700">{p.start_value || '-'} kg</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-3 text-center">
              <div className="text-xs text-gray-400">目前值</div>
              <div className="text-lg font-bold text-gray-900">{p.current_value || '-'} kg</div>
            </div>
          </div>

          {/* Change */}
          {p.start_value && p.current_value && (
            <div className={`rounded-2xl p-3 text-center ${p.current_value < p.start_value ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <span className={`text-lg font-bold ${p.current_value < p.start_value ? 'text-emerald-600' : 'text-red-500'}`}>
                {p.current_value < p.start_value ? '↓' : '↑'} {Math.abs(p.start_value - p.current_value).toFixed(1)} kg
              </span>
            </div>
          )}

          {/* Relationship Editor */}
          {!isMe && (
            <div>
              {editing ? (
                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm font-medium text-gray-700">選擇關係：</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_RELATIONSHIPS.map(r => (
                      <button key={r} onClick={() => handleSaveRelationship(r)}
                        className={`text-xs px-2.5 py-1 rounded-full transition ${relLabel === r ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'}`}>
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input type="text" value={customLabel} onChange={e => setCustomLabel(e.target.value)}
                      placeholder="自訂關係（最多20字）" maxLength={20}
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 outline-none" />
                    <button onClick={() => customLabel && handleSaveRelationship(customLabel)} disabled={!customLabel || saving}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                      {saving ? '...' : '儲存'}
                    </button>
                  </div>
                  <button onClick={() => setEditing(false)} className="w-full text-center text-sm text-gray-400">取消</button>
                </div>
              ) : relLabel ? (
                <button onClick={() => setEditing(true)}
                  className="w-full px-4 py-2.5 rounded-2xl font-semibold text-sm text-white shadow-sm text-center"
                  style={{ background: 'linear-gradient(135deg, #86efac, #4ade80)' }}>
                  ❤️ {relLabel} · 點此修改
                </button>
              ) : (
                <button onClick={() => setEditing(true)}
                  className="w-full px-4 py-2.5 rounded-2xl font-semibold text-sm text-center border-2 border-dashed"
                  style={{ borderColor: '#818cf8', color: '#6366f1', background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' }}>
                  👥 設定與我的關係（讓 AI 更親切）
                </button>
              )}
            </div>
          )}

          {/* Personal Goal */}
          {p.personal_goal && (
            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200/60">
              <p className="text-xs text-amber-600 mb-1">🎯 比賽目的</p>
              <p className="text-sm text-amber-900">「{p.personal_goal}」</p>
            </div>
          )}

          {/* Trend Charts (readonly) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-700">📈 趨勢圖</h4>
              <div className="flex gap-1.5">
                <button onClick={() => setTrendMetric('weight')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${trendMetric === 'weight' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  ⚖️ 體重
                </button>
                {records.some(r => r.body_fat !== null) && (
                  <button onClick={() => setTrendMetric('bodyFat')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${trendMetric === 'bodyFat' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    📊 體脂
                  </button>
                )}
              </div>
            </div>

            {recordsLoading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="yuzu-spinner-dark yuzu-spinner" />
                  載入中
                </div>
              </div>
            ) : (() => {
              const chartData = [...records].reverse().slice(-10).map(r => ({
                date: r.date.slice(5),
                value: trendMetric === 'weight' ? r.weight : r.body_fat,
              })).filter(d => d.value !== null)

              if (chartData.length < 2) return (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                  {trendMetric === 'bodyFat' ? '體脂數據不足' : '數據不足，至少需要 2 筆'}
                </div>
              )

              const values = chartData.map(d => d.value as number)
              const min = Math.min(...values)
              const max = Math.max(...values)
              const pad = (max - min) * 0.15 || 2
              const color = trendMetric === 'weight' ? '#10b981' : '#f59e0b'
              const unit = trendMetric === 'weight' ? 'kg' : '%'

              return (
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#999' }} />
                      <YAxis domain={[Math.floor(min - pad), Math.ceil(max + pad)]} tick={{ fontSize: 10, fill: '#999' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                        formatter={(value) => [`${value} ${unit}`, trendMetric === 'weight' ? '體重' : '體脂率']} />
                      <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ fill: color, r: 3 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )
            })()}
          </div>

          {/* Recent Records */}
          {records.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2">📋 最近紀錄</h4>
              <div className="space-y-1.5">
                {records.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-xl text-sm">
                    <span className="text-gray-500">{r.date}</span>
                    <div className="flex gap-3">
                      {r.weight && <span className="font-medium text-gray-900">{r.weight} kg</span>}
                      {r.body_fat && <span className="text-amber-600">{r.body_fat}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Leaderboard Row ───
function LeaderboardRow({ participant: p, rank, userId, relationship, onTap }: {
  participant: ParticipantWithUser; rank: number; userId: string; relationship?: string; onTap: () => void
}) {
  const style = RANK_STYLES[rank] ?? DEFAULT_RANK
  const pct = Math.min(p.progress, 100)
  const isComplete = pct >= 100
  const barClass = isComplete ? 'from-green-400 to-emerald-300'
    : pct >= 60 ? 'from-orange-400 to-amber-300'
    : `${style.barFrom} ${style.barTo}`
  const emoji = isComplete ? '🎉' : pct >= 75 ? '🔥' : pct >= 50 ? '💪' : pct >= 25 ? '🏃' : null
  const isMe = p.user_id === userId

  return (
    <button onClick={onTap} className={`relative rounded-2xl p-3 transition-all w-full text-left ${style.bg} ${style.border} ${style.shadow} ${isMe ? 'ring-2 ring-emerald-400' : ''} hover:shadow-lg active:scale-[0.98]`}>
      {style.crown && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl">👑</span>}

      <div className="flex items-center gap-3">
        {/* Rank */}
        <div className="w-8 text-center">
          {rank < 3 ? <span className="text-2xl">{style.badge}</span> : <span className="text-lg font-black text-gray-400">{rank + 1}</span>}
        </div>

        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${style.avatarRing}`}>
          {p.user?.avatar_url ? (
            <img src={p.user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">{p.user?.name?.charAt(0) || '?'}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-900 truncate">{p.user?.name}{isMe && ' (你)'}</span>
            {relationship && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex-shrink-0">{relationship}</span>
            )}
            {emoji && <span className="flex-shrink-0">{emoji}</span>}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mt-1.5">
            <div className={`h-2.5 rounded-full bg-gradient-to-r ${barClass} transition-all duration-1000`}
              style={{ width: `${pct}%` }} />
          </div>

          <div className="flex justify-between mt-0.5">
            <span className={`text-[10px] ${isComplete ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
              {isComplete ? '🎉 已達標！' : `${pct.toFixed(1)}% 完成`}
            </span>
            <span className="text-[10px] text-gray-400">
              {p.start_value && p.current_value ? `${p.current_value} kg` : ''}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <span className="text-gray-300 flex-shrink-0">›</span>
      </div>
    </button>
  )
}

// ─── Personal Goal Section ───
function PersonalGoalSection({ participant, userId, challengeId }: {
  participant: ParticipantWithUser; userId: string; challengeId: string
}) {
  const [editing, setEditing] = useState(false)
  const [goal, setGoal] = useState(participant.personal_goal || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('fa_challenge_participants')
      .update({ personal_goal: goal || null })
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="mx-3 mb-2 mt-1 rounded-2xl overflow-hidden border border-amber-200/60 p-4"
      style={{ background: 'linear-gradient(135deg, #fef9c3 0%, #fefce8 100%)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-amber-800">🎯 我的比賽目的</span>
        <button onClick={() => setEditing(!editing)}
          className="px-3 py-1 rounded-xl text-sm font-semibold text-white shadow-sm"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
          {participant.personal_goal ? '✏️ 修改' : '✨ 新增'}
        </button>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            value={goal}
            onChange={e => setGoal(e.target.value)}
            maxLength={100}
            rows={3}
            placeholder="你的動力是什麼？例如：夏天要穿比基尼"
            className="w-full rounded-xl border border-amber-200 px-3 py-2.5 text-sm bg-white/80 focus:ring-2 focus:ring-amber-300 outline-none resize-none"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-amber-600">{goal.length}/100</span>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="px-3 py-2 text-sm text-gray-500">取消</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                {saving ? '儲存中...' : '💾 儲存'}
              </button>
            </div>
          </div>
        </div>
      ) : participant.personal_goal ? (
        <div className="bg-white/60 rounded-xl px-3 py-2.5 text-sm text-amber-900">
          「{participant.personal_goal}」
        </div>
      ) : (
        <button onClick={() => setEditing(true)}
          className="w-full text-sm text-amber-700/70 italic border-2 border-dashed border-amber-300 rounded-xl px-3 py-3 text-center hover:border-amber-400 transition">
          點此輸入比賽目的，讓 AI 播報員更了解你的動力 💪
        </button>
      )}
    </div>
  )
}

// ─── Create Form ───
function CreateForm({ form, setForm, creating, onCreate, onCancel }: {
  form: any; setForm: any; creating: boolean; onCreate: () => void; onCancel: () => void
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-4 yuzu-pop-in">
      <h3 className="text-lg font-bold text-gray-900">🏆 建立新挑戰</h3>
      <input type="text" value={form.name} onChange={e => setForm((f: typeof form) => ({ ...f, name: e.target.value }))}
        placeholder="挑戰名稱（例：夏天前變瘦大作戰）"
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">開始日期</label>
          <input type="date" value={form.start_date} onChange={e => setForm((f: typeof form) => ({ ...f, start_date: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">結束日期</label>
          <input type="date" value={form.end_date} onChange={e => setForm((f: typeof form) => ({ ...f, end_date: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
        </div>
      </div>
      <input type="text" value={form.prize_description} onChange={e => setForm((f: typeof form) => ({ ...f, prize_description: e.target.value }))}
        placeholder="獎品 / 懲罰（選填，例：輸家請吃火鍋）"
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none" />

      <hr className="border-gray-100" />
      <h4 className="text-sm font-medium text-gray-700">🎯 我的個人目標</h4>
      <div className="grid grid-cols-2 gap-3">
        {(['reduce_percent', 'reduce_absolute'] as const).map(t => (
          <button key={t} onClick={() => setForm((f: typeof form) => ({ ...f, my_target_type: t }))}
            className={`py-2.5 rounded-xl text-sm font-medium transition ${form.my_target_type === t ? 'bg-emerald-500 text-white' : 'bg-gray-50 border border-gray-200 text-gray-600'}`}>
            {t === 'reduce_percent' ? '減少 %' : '減少 kg'}
          </button>
        ))}
      </div>
      <input type="number" step="0.1" value={form.my_target_value} onChange={e => setForm((f: typeof form) => ({ ...f, my_target_value: e.target.value }))}
        placeholder={form.my_target_type === 'reduce_percent' ? '目標減少幾 %（例：10）' : '目標減少幾 kg（例：5）'}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none" />
      <textarea value={form.my_personal_goal} onChange={e => setForm((f: typeof form) => ({ ...f, my_personal_goal: e.target.value }))}
        placeholder="你的動力是什麼？（選填）" maxLength={100} rows={2}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:border-emerald-400 outline-none resize-none" />

      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium">取消</button>
        <button onClick={onCreate} disabled={creating}
          className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-medium disabled:opacity-50">
          {creating ? '建立中...' : '🚀 建立挑戰'}
        </button>
      </div>
    </div>
  )
}
