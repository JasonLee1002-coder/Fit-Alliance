'use client'

import { useEffect, useRef, useState } from 'react'

const DISPLAY_MS = 3200  // 圖片載入後顯示時長
const FADE_MS    = 700   // 淡出時長

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const shown = sessionStorage.getItem('fa_splash_shown')
    if (shown) return
    sessionStorage.setItem('fa_splash_shown', '1')
    setVisible(true)
    // 若圖片未能觸發 onLoad，這裡保底 5 秒後也會淡出
    const guard = setTimeout(startFade, 5000)
    timers.current.push(guard)
    return () => timers.current.forEach(clearTimeout)
  }, [])

  function startFade() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    const t1 = setTimeout(() => setFading(true), DISPLAY_MS)
    const t2 = setTimeout(() => setVisible(false), DISPLAY_MS + FADE_MS)
    timers.current = [t1, t2]
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#d4edda]"
      style={{ opacity: fading ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-out` }}
    >
      <img
        src="/splash-screen.png"
        alt=""
        className="w-full h-full object-contain"
        onLoad={startFade}
      />
      <div className="absolute bottom-12 left-0 right-0 text-center px-8">
        <p className="text-emerald-800 text-2xl font-black drop-shadow">瘦身減肥聯盟</p>
        <p className="text-emerald-600 text-sm mt-1">一起變瘦，一起變強 💪</p>
      </div>
    </div>
  )
}
