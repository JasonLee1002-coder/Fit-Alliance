'use client'

import { useEffect, useState } from 'react'

interface Participant {
  name: string
  progress: number
  avatar: string | null
  isMe: boolean
}

const BAR_COLORS = [
  'from-amber-400 to-yellow-300',
  'from-slate-400 to-gray-300',
  'from-orange-400 to-amber-300',
  'from-emerald-400 to-teal-300',
  'from-blue-400 to-indigo-300',
]

export default function ArenaWidget() {
  const [ranking, setRanking] = useState<Participant[]>([])
  const [title, setTitle] = useState('')

  useEffect(() => {
    fetch('/api/arena/ranking')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.participants?.length) return
        if (data.challenge?.name) setTitle(data.challenge.name)
        setRanking(data.participants.slice(0, 5))
      })
      .catch(() => {})
  }, [])

  if (ranking.length === 0) return null

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="rounded-3xl overflow-hidden border border-amber-200 shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-white font-black text-base tracking-wide">🏛️ 體重競技場</div>
          {title && <div className="text-amber-100 text-[11px] font-medium mt-0.5 truncate max-w-[180px]">⚔️ {title}</div>}
        </div>
        <a href="/challenge" className="text-[11px] font-bold text-amber-100 bg-white/20 px-2.5 py-1 rounded-lg hover:bg-white/30 transition">
          進入競技場 →
        </a>
      </div>

      {/* Rankings */}
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-3 space-y-2.5">
        {ranking.map((p, i) => (
          <div key={i} className={`flex items-center gap-2.5 ${p.isMe ? 'bg-amber-100/80 rounded-xl px-2 py-1 -mx-2' : ''}`}>
            <div className="text-lg w-7 text-center flex-shrink-0">{medals[i] ?? `${i + 1}`}</div>
            <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-amber-300">
              {p.avatar
                ? <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                : <span className="text-amber-700 text-xs font-bold">{p.name?.charAt(0) ?? '👤'}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold truncate ${p.isMe ? 'text-amber-800' : 'text-gray-700'}`}>
                  {p.name}{p.isMe && ' 👈'}
                </span>
                <span className="text-[11px] font-black text-amber-700 ml-1">{p.progress}%</span>
              </div>
              <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden border border-amber-200">
                <div
                  className={`h-full bg-gradient-to-r ${BAR_COLORS[i] ?? BAR_COLORS[4]} rounded-full transition-all duration-700`}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
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
