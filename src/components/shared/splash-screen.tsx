'use client'

import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const shown = sessionStorage.getItem('fa_splash_shown')
    if (shown) return
    sessionStorage.setItem('fa_splash_shown', '1')
    setVisible(true)
    const fadeTimer = setTimeout(() => setFading(true), 2000)
    const hideTimer = setTimeout(() => setVisible(false), 2600)
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer) }
  }, [])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.6s ease-out' }}
    >
      <img src="/splash-screen.png" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-16 left-0 right-0 text-center px-8">
        <p className="text-white text-2xl font-black drop-shadow-lg">瘦身減肥聯盟</p>
        <p className="text-emerald-200 text-sm mt-1 drop-shadow">一起變瘦，一起變強 💪</p>
      </div>
    </div>
  )
}
