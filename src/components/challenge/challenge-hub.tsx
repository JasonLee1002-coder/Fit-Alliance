'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Participant {
  userId: string
  name: string
  avatar: string | null
  progress: number
  isMe: boolean
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function ChallengeHub() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/arena/ranking')
      .then(r => r.json())
      .then(data => {
        setParticipants(data.participants ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      {/* Arena Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl">
        <img src="/arena-banner.png" alt="" className="w-full h-48 object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-5">
          <div>
            <h1 className="text-2xl font-black text-white drop-shadow-lg">🏛️ 體重競技場</h1>
            <p className="text-white/80 text-sm mt-0.5 drop-shadow">以個人目標達成率競技，公平出發</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">載入中...</div>
        ) : participants.length === 0 ? (
          <div className="text-center py-12 px-6">
            <span className="text-5xl">🏟️</span>
            <h2 className="text-lg font-bold text-gray-800 mt-3">還沒有競技夥伴</h2>
            <p className="text-gray-400 text-sm mt-2">邀請朋友加入，一起在競技場上比拼！</p>
            <Link
              href="/invite"
              className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow text-sm"
            >
              📤 邀請朋友
            </Link>
          </div>
        ) : (
          <>
            {participants.map((p, i) => (
              <div
                key={p.userId}
                className={`flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 ${p.isMe ? 'bg-emerald-50/60' : ''}`}
              >
                <div className="text-xl w-8 text-center shrink-0">
                  {i < 3
                    ? MEDALS[i]
                    : <span className="text-gray-400 font-bold text-sm">{i + 1}</span>
                  }
                </div>

                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden shrink-0">
                  {p.avatar ? (
                    <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-emerald-600 font-bold text-sm">{(p.name || '?').charAt(0)}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {p.name}{p.isMe ? ' (我)' : ''}
                    </span>
                    <span className="text-sm font-black text-emerald-600 ml-2 shrink-0">
                      {p.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="px-5 py-4 text-center border-t border-gray-50">
              <Link
                href="/invite"
                className="inline-block px-5 py-2.5 bg-emerald-50 text-emerald-700 font-semibold rounded-2xl text-sm hover:bg-emerald-100 transition"
              >
                📤 邀請更多朋友加入
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
        <p className="text-xs text-amber-700 font-medium">⚔️ 競技規則</p>
        <p className="text-xs text-amber-600 mt-1">
          排名依據「個人目標達成率」— 每個人從自己的起始體重出發，達成自己設定的目標越多，排名越高。公平競技，各憑努力！
        </p>
      </div>
    </div>
  )
}
