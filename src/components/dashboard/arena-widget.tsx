'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AnimatedWeightPct from '@/components/shared/animated-weight-pct'

interface Participant {
  name: string
  userId: string
  progress: number
  avatar: string | null
  isMe: boolean
  weightLostKg: number | null
  weightLostPct: number | null
}

const RANK_BAR = [
  'from-yellow-400 via-amber-300 to-yellow-400',
  'from-slate-400 via-gray-300 to-slate-400',
  'from-orange-400 via-amber-300 to-orange-400',
  'from-emerald-400 to-teal-300',
  'from-blue-400 to-indigo-300',
]
const RANK_PCT = ['text-amber-600', 'text-slate-500', 'text-orange-500', 'text-emerald-600', 'text-blue-600']

export default function ArenaWidget() {
  const [ranking, setRanking] = useState<Participant[]>([])
  const [title, setTitle] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/arena/ranking')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.participants?.length) {
          if (data.challenge?.name) setTitle(data.challenge.name)
          setRanking(data.participants.slice(0, 5))
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  if (loaded && ranking.length === 0) return null
  if (!loaded) return (
    <div className="rounded-3xl overflow-hidden border border-amber-200 shadow-lg animate-pulse">
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 px-4 py-3">
        <div className="text-white font-black text-base">🏛️ 體重競技場</div>
      </div>
      <div className="bg-amber-50 px-4 py-6 space-y-3">
        {[1,2,3].map(i => <div key={i} className="h-8 bg-amber-100 rounded-xl" />)}
      </div>
    </div>
  )

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="rounded-3xl overflow-hidden border border-amber-200 shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-white font-black text-base tracking-wide">🏛️ 體重競技場</div>
          {title && <div className="text-amber-100 text-[11px] font-medium mt-0.5 truncate max-w-[180px]">⚔️ {title}</div>}
        </div>
        <Link href="/challenge" className="text-[11px] font-bold text-amber-100 bg-white/20 px-2.5 py-1 rounded-lg hover:bg-white/30 transition">
          進入競技場 →
        </Link>
      </div>

      {/* Rankings */}
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-3 space-y-2.5">
        {ranking.map((p, i) => {
          const href = `/arena/member/${p.userId}`
          return (
            <Link key={p.userId} href={href} className={`flex items-center gap-2.5 transition active:opacity-70 ${p.isMe ? 'bg-amber-100/80 rounded-xl px-2 py-1 -mx-2' : ''}`}>
              <div className="text-lg w-7 text-center flex-shrink-0">{medals[i] ?? `${i + 1}`}</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border-2 ${i === 0 ? 'border-amber-400 shadow-sm shadow-amber-300/50' : 'border-amber-300'}`}>
                {p.avatar
                  ? <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                  : <span className={`text-xs font-bold ${i === 0 ? 'text-amber-700 bg-amber-200 w-full h-full flex items-center justify-center' : 'text-amber-700'}`}>{p.name?.charAt(0) ?? '👤'}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-bold truncate ${i === 0 ? 'text-amber-800' : 'text-gray-700'}`}>
                    {p.name}{p.isMe && ' 👈'}{i === 0 && ' ✨'}
                  </span>
                  <span className={`text-[10px] font-bold ml-1 ${RANK_PCT[i] ?? RANK_PCT[4]}`}>達成{p.progress}%</span>
                </div>
                {/* 體重變化 % — 靈魂數字 */}
                {p.weightLostPct !== null && (
                  <div className="mb-1">
                    <AnimatedWeightPct pct={p.weightLostPct} kg={p.weightLostKg ?? undefined} size="compact" />
                  </div>
                )}
                <div className={`h-1.5 rounded-full overflow-hidden ${i === 0 ? 'bg-amber-200' : 'bg-amber-100'}`}>
                  <div
                    className={`h-full bg-gradient-to-r ${RANK_BAR[i] ?? RANK_BAR[4]} rounded-full transition-all duration-700 ${i === 0 ? 'shadow-sm shadow-amber-400/50' : ''}`}
                    style={{ width: `${Math.max(p.progress, 2)}%` }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* No avatar nudge */}
      {ranking.some(p => !p.avatar) && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-2 flex items-center gap-2">
          <span className="text-base">📸</span>
          <div className="flex-1">
            <p className="text-[11px] text-amber-700 font-medium">有勇者還沒上傳頭像！</p>
            <a href="/profile" className="text-[10px] text-amber-600 underline">去設定頭像，讓競技場更生動 →</a>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 px-4 py-2 text-center">
        <span className="text-amber-100 text-[11px] font-medium">🛡️ 榮耀屬於堅持到底的勇者</span>
      </div>
    </div>
  )
}
