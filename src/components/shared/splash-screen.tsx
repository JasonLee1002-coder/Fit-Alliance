'use client'

import { useEffect, useRef, useState } from 'react'

const DISPLAY_MS = 3800  // 圖片載入後顯示時長
const FADE_MS    = 700   // 淡出時長

const PHRASES = [
  { text: 'AI 教練每天陪你訓練', emoji: '🤖' },
  { text: '食物辨識，輕鬆記錄飲食', emoji: '🥗' },
  { text: '聯盟夥伴一起督促加油', emoji: '🏆' },
  { text: '今天也要堅持，你做得到', emoji: '💪' },
]

export default function SplashScreen({ onDone }: { onDone?: () => void } = {}) {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [phraseVisible, setPhraseVisible] = useState(true)
  const [dots, setDots] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const shown = sessionStorage.getItem('fa_splash_shown')
    if (shown) { onDone?.(); return }
    sessionStorage.setItem('fa_splash_shown', '1')
    setVisible(true)
    const guard = setTimeout(startFade, 5000)
    timers.current.push(guard)
    return () => timers.current.forEach(clearTimeout)
  }, [])

  // 切換輪播句子
  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => {
      setPhraseVisible(false)
      setTimeout(() => {
        setPhraseIdx(i => (i + 1) % PHRASES.length)
        setPhraseVisible(true)
      }, 350)
    }, 1200)
    return () => clearInterval(interval)
  }, [visible])

  // 跑點點動畫
  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => setDots(d => (d + 1) % 4), 400)
    return () => clearInterval(interval)
  }, [visible])

  function startFade() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    const t1 = setTimeout(() => setFading(true), DISPLAY_MS)
    const t2 = setTimeout(() => { setVisible(false); onDone?.() }, DISPLAY_MS + FADE_MS)
    timers.current = [t1, t2]
  }

  if (!visible) return null

  const phrase = PHRASES[phraseIdx]

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-[#d4edda]"
      style={{ opacity: fading ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-out` }}
    >
      {/* 主圖 */}
      <img
        src="/splash-screen.png"
        alt=""
        className="flex-1 w-full object-contain min-h-0"
        onLoad={startFade}
      />

      {/* 底部資訊區 */}
      <div className="shrink-0 pb-10 pt-4 px-8 flex flex-col items-center gap-3">
        {/* App 標題 */}
        <div className="text-center">
          <p className="text-emerald-900 text-2xl font-black tracking-tight">瘦身減肥聯盟</p>
          <p className="text-emerald-700 text-sm mt-0.5">一起變瘦，一起變強</p>
        </div>

        {/* 輪播提示句 */}
        <div className="h-8 flex items-center justify-center">
          <p
            className="text-emerald-800 text-sm font-medium text-center"
            style={{
              opacity: phraseVisible ? 1 : 0,
              transform: phraseVisible ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease',
            }}
          >
            {phrase.emoji} {phrase.text}
          </p>
        </div>

        {/* 載入點點 */}
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="rounded-full bg-emerald-500"
              style={{
                width: 6,
                height: 6,
                opacity: dots === i ? 1 : 0.25,
                transform: dots === i ? 'scale(1.4)' : 'scale(1)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
