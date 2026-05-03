'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import AnimatedWeightPct from '@/components/shared/animated-weight-pct'

interface Participant {
  userId: string
  name: string
  avatar: string | null
  progress: number
  isMe: boolean
  weightLostKg: number | null
  weightLostPct: number | null
}

const RANK_STYLES = [
  {
    medal: '🥇',
    bar: 'from-yellow-400 via-amber-300 to-yellow-400',
    glow: 'shadow-amber-400/60 shadow-md',
    bg: 'bg-amber-50/80',
    ring: 'ring-2 ring-amber-300',
    pct: 'text-amber-600',
    animate: 'animate-pulse',
    pikmin: '/pikmin-rank1.png',  // 黃色皮克敏 + 金冠
  },
  {
    medal: '🥈',
    bar: 'from-slate-400 via-gray-300 to-slate-400',
    glow: '',
    bg: '',
    ring: 'ring-1 ring-slate-200',
    pct: 'text-slate-500',
    animate: '',
    pikmin: '/pikmin-rank2.png',  // 紅色皮克敏 + 銀牌
  },
  {
    medal: '🥉',
    bar: 'from-orange-400 via-amber-300 to-orange-400',
    glow: '',
    bg: '',
    ring: 'ring-1 ring-orange-200',
    pct: 'text-orange-500',
    animate: '',
    pikmin: '/pikmin-rank3.png',  // 藍色皮克敏 + 銅牌
  },
]
const DEFAULT_STYLE = {
  medal: '',
  bar: 'from-emerald-400 to-teal-400',
  glow: '',
  bg: '',
  ring: '',
  pct: 'text-emerald-600',
  animate: '',
}

const CACHE_KEY = 'fa_arena_ranking_v2'  // v2: 含 weightLostPct 欄位
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 分鐘才強制重算

export default function ChallengeHub({ refreshKey }: { refreshKey?: number }) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // refreshKey 變化時（打卡後）強制清快取重 fetch
    if (refreshKey) {
      try { sessionStorage.removeItem(CACHE_KEY) } catch { /* ignore */ }
    }

    // 先讀快取，有就立即顯示（不用等）
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (raw) {
        const { data, ts } = JSON.parse(raw)
        if (data?.length) {
          setParticipants(data)
          setLoading(false)
          if (Date.now() - ts < CACHE_TTL_MS) return // 快取還新鮮就不重 fetch
        }
      }
    } catch { /* ignore */ }

    // 無快取或快取過期 → fetch
    fetch('/api/arena/ranking')
      .then(r => r.json())
      .then(data => {
        const list = data.participants ?? []
        setParticipants(list)
        setLoading(false)
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, ts: Date.now() }))
        } catch { /* ignore */ }
      })
      .catch(() => setLoading(false))
  }, [refreshKey])

  return (
    <div className="space-y-5">
      {/* Arena Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl h-44 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-yellow-300/40 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-rose-400/40 blur-3xl" />
        {/* 3D 教練＋皮克敏 — 右側大圖浮出 */}
        <motion.img
          src="/nav3d-challenge-sm.png"
          alt=""
          className="absolute right-0 bottom-0 w-48 h-48 object-contain object-bottom drop-shadow-2xl pointer-events-none"
          animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative h-full flex items-end p-5">
          <div>
            <h1 className="text-2xl font-black text-white drop-shadow-lg">🏛️ 體重競技場</h1>
            <p className="text-white/90 text-sm mt-1 drop-shadow">以個人目標達成率競技，公平出發</p>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400">載入中...</div>
        ) : participants.length === 0 ? (
          <div className="text-center py-10 px-6">
            <motion.img
              src="/pikmin-empty.png"
              alt="皮克敏探頭"
              className="w-24 h-24 object-contain mx-auto mb-3"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <h2 className="text-lg font-bold text-gray-800">還沒有競技夥伴</h2>
            <p className="text-gray-400 text-sm mt-2">邀請朋友加入，一起在競技場上比拼！</p>
            <Link href="/invite" className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow text-sm">
              📤 邀請朋友
            </Link>
          </div>
        ) : (
          <>
            {participants.map((p, i) => {
              const style = RANK_STYLES[i] ?? DEFAULT_STYLE
              const href = `/arena/member/${p.userId}`

              return (
                <Link
                  key={p.userId}
                  href={href}
                  className={`flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 transition active:opacity-70 ${style.bg} ${i === 0 ? 'relative overflow-hidden' : ''}`}
                >
                  {/* Gold shimmer for 1st */}
                  {i === 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  )}

                  <div className="text-xl w-8 text-center shrink-0">
                    {style.medal || <span className="text-gray-400 font-bold text-sm">{i + 1}</span>}
                  </div>

                  <div className="relative shrink-0">
                    <div className={`yuzu-tap-ring w-11 h-11 rounded-full flex items-center justify-center overflow-hidden ${style.ring} ${i === 0 ? 'shadow-md shadow-amber-300/50' : ''}`}>
                      {p.avatar ? (
                        <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {(p.name || '?').charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 text-[10px] bg-white rounded-full w-4 h-4 flex items-center justify-center shadow border border-amber-300">👆</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-bold truncate ${i === 0 ? 'text-amber-800' : 'text-gray-800'}`}>
                        {p.name}{p.isMe ? ' 👈' : ''}
                        {i === 0 && <span className="ml-1 text-xs">✨</span>}
                      </span>
                      {/* 目標達成率 */}
                      <span className={`text-xs font-bold ml-2 shrink-0 px-1.5 py-0.5 rounded-lg bg-gray-50 ${style.pct}`}>
                        達成 {p.progress}%
                      </span>
                    </div>

                    {/* 體重變化百分比 — 靈魂數字 */}
                    {p.weightLostPct !== null && (
                      <div className="mb-1.5">
                        <AnimatedWeightPct pct={p.weightLostPct} kg={p.weightLostKg ?? undefined} size="compact" />
                      </div>
                    )}

                    {/* 進度條 + 排名皮克敏站在條棒右端 */}
                    <div className="relative pb-1">
                      <div className={`h-2.5 bg-gray-100 rounded-full overflow-hidden ${i === 0 ? style.glow : ''}`}>
                        <div
                          className={`h-full bg-gradient-to-r ${style.bar} rounded-full transition-all duration-700`}
                          style={{ width: `${Math.max(p.progress, 2)}%` }}
                        />
                      </div>
                      {style.pikmin && p.progress > 0 && (
                        <motion.img
                          src={style.pikmin}
                          alt=""
                          className="absolute -top-4 pointer-events-none w-7 h-7 object-contain"
                          style={{ left: `calc(${Math.max(p.progress, 2)}% - 14px)`, mixBlendMode: 'multiply' }}
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                    </div>
                    {i === 0 && p.progress > 0 && (
                      <p className="text-[10px] text-amber-600 mt-1 font-medium">👑 目前領先！點擊查看紀錄</p>
                    )}
                    {!p.isMe && i !== 0 && (
                      <p className="text-[10px] text-gray-400 mt-1">點擊查看 TA 的健康紀錄 →</p>
                    )}
                  </div>

                </Link>
              )
            })}

            <div className="px-5 py-4 text-center border-t border-gray-50">
              <Link href="/invite" className="inline-block px-5 py-2.5 bg-emerald-50 text-emerald-700 font-semibold rounded-2xl text-sm hover:bg-emerald-100 transition">
                📤 邀請更多朋友加入
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
        <p className="text-xs text-amber-700 font-medium">⚔️ 競技規則</p>
        <p className="text-xs text-amber-600 mt-1">
          排名依據「挑戰目標達成率」— 每人從挑戰起始體重出發，實際減重 ÷ 目標減重 = 達成率。公平競技，各憑努力！
        </p>
      </div>
    </div>
  )
}
