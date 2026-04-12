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
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#e8f5e9]"
      style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.6s ease-out' }}
    >
      <img
        src="/splash-screen.png"
        alt=""
        className="w-full h-full object-contain"
        style={{ objectPosition: 'center center' }}
      />
      <div className="absolute bottom-12 left-0 right-0 text-center px-8">
        <p className="text-emerald-800 text-2xl font-black drop-shadow">瘦身減肥聯盟</p>
        <p className="text-emerald-600 text-sm mt-1">一起變瘦，一起變強 💪</p>
      </div>
    </div>
  )
}
