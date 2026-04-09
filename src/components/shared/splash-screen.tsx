'use client'

import { useState, useEffect } from 'react'
import CoachAvatar from './coach-avatar'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'ready' | 'exit'>('enter')
  const [loadingText, setLoadingText] = useState('載入中')

  useEffect(() => {
    // Phase timing
    const t1 = setTimeout(() => setPhase('ready'), 400)
    const t2 = setTimeout(() => setPhase('exit'), 3000)
    const t3 = setTimeout(() => onDone(), 3600)

    // Cycle loading text
    const texts = ['載入中', '準備資料', '快好了', '馬上就來']
    let idx = 0
    const textTimer = setInterval(() => {
      idx = (idx + 1) % texts.length
      setLoadingText(texts[idx])
    }, 800)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(textTimer) }
  }, [onDone])

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 transition-opacity duration-500 ${phase === 'exit' ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-white/10 animate-pulse" />
        <div className="absolute bottom-[15%] right-[10%] w-24 h-24 rounded-full bg-white/8 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[40%] right-[5%] w-16 h-16 rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Coach mascot — SVG 新教練 */}
      <div className={`transition-all duration-700 ${phase === 'enter' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
        <CoachAvatar size={140} animate={true} />
      </div>

      {/* App name */}
      <div className={`mt-5 transition-all duration-500 delay-200 ${phase === 'enter' ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <h1 className="text-4xl font-black text-white tracking-wider drop-shadow-lg text-center"
          style={{ animation: 'splash-title-glow 2s ease-in-out infinite' }}>
          瘦身減肥聯盟
        </h1>
        <p className="text-center text-white/60 text-sm mt-1.5 font-light tracking-widest">FIT ALLIANCE</p>
      </div>

      {/* Loading text with animation */}
      <div className={`mt-10 transition-all duration-500 delay-500 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-col items-center gap-3">
          {/* Spinner */}
          <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full"
            style={{ animation: 'splash-spin 0.7s linear infinite', borderWidth: '3px' }} />

          {/* Loading text - animated */}
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold text-base tracking-wide"
              style={{ animation: 'splash-text-glow 1.5s ease-in-out infinite' }}>
              {loadingText}
            </span>
            <span className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-white" style={{ animation: 'splash-dot 1.4s ease-in-out infinite 0s' }} />
              <span className="w-2 h-2 rounded-full bg-white" style={{ animation: 'splash-dot 1.4s ease-in-out infinite 0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-white" style={{ animation: 'splash-dot 1.4s ease-in-out infinite 0.4s' }} />
            </span>
          </div>
        </div>
      </div>

      {/* Floating side characters — 3D versions */}
      <div className="absolute bottom-[10%] left-[6%]" style={{ animation: 'splash-float-left 3s ease-in-out infinite' }}>
        <img src="/char-chubby.png" alt="" className="w-20 h-20 opacity-50 drop-shadow" />
      </div>
      <div className="absolute bottom-[14%] right-[6%]" style={{ animation: 'splash-float-right 2.5s ease-in-out infinite' }}>
        <img src="/char-slim.png" alt="" className="w-18 h-18 opacity-50 drop-shadow" style={{ width: '72px', height: '72px' }} />
      </div>

      <style jsx>{`
        @keyframes splash-bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-14px); }
        }
        @keyframes splash-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes splash-title-glow {
          0%, 100% { text-shadow: 0 0 10px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2); }
          50% { text-shadow: 0 0 25px rgba(255,255,255,0.7), 0 0 50px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2); }
        }
        @keyframes splash-text-glow {
          0%, 100% { text-shadow: 0 0 8px rgba(255,255,255,0.4); }
          50% { text-shadow: 0 0 20px rgba(255,255,255,0.9), 0 0 40px rgba(255,255,255,0.4); }
        }
        @keyframes splash-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.7); }
          40% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes splash-float-left {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes splash-float-right {
          0%, 100% { transform: translateY(0) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
      `}</style>
    </div>
  )
}
