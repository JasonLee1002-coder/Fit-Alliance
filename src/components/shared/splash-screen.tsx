'use client'

import { useState, useEffect } from 'react'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'text' | 'exit'>('enter')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 300)
    const t2 = setTimeout(() => setPhase('exit'), 2200)
    const t3 = setTimeout(() => onDone(), 2800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 transition-opacity duration-500 ${phase === 'exit' ? 'opacity-0' : 'opacity-100'}`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full bg-white/10 animate-pulse" />
        <div className="absolute bottom-[15%] right-[10%] w-24 h-24 rounded-full bg-white/8 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[40%] right-[5%] w-16 h-16 rounded-full bg-white/5 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Coach mascot with bounce animation */}
      <div className={`transition-all duration-700 ${phase === 'enter' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
        <img
          src="/char-coach.png"
          alt="AI 教練"
          className="w-36 h-36 drop-shadow-2xl"
          style={{ animation: 'splash-bounce 1s ease-in-out infinite alternate' }}
        />
      </div>

      {/* App name */}
      <div className={`mt-4 transition-all duration-500 delay-200 ${phase === 'enter' ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <h1 className="text-3xl font-black text-white tracking-wider drop-shadow-lg">
          瘦身減肥聯盟
        </h1>
        <p className="text-center text-white/70 text-sm mt-1 font-light">Fit Alliance</p>
      </div>

      {/* Loading text with glow */}
      <div className={`mt-8 transition-all duration-500 delay-500 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'splash-spin 0.7s linear infinite' }} />
          <span className="text-white font-bold text-sm" style={{ animation: 'splash-text-glow 1.5s ease-in-out infinite' }}>
            執行中請稍候
          </span>
          <span className="flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white" style={{ animation: 'splash-dot 1.4s ease-in-out infinite 0s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-white" style={{ animation: 'splash-dot 1.4s ease-in-out infinite 0.2s' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-white" style={{ animation: 'splash-dot 1.4s ease-in-out infinite 0.4s' }} />
          </span>
        </div>
      </div>

      {/* Floating side characters */}
      <div className="absolute bottom-[12%] left-[8%]" style={{ animation: 'splash-float-left 3s ease-in-out infinite' }}>
        <img src="/char-chubby.png" alt="" className="w-16 h-16 opacity-60 drop-shadow" />
      </div>
      <div className="absolute bottom-[18%] right-[8%]" style={{ animation: 'splash-float-right 2.5s ease-in-out infinite' }}>
        <img src="/char-slim.png" alt="" className="w-14 h-14 opacity-60 drop-shadow" />
      </div>

      <style jsx>{`
        @keyframes splash-bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-12px); }
        }
        @keyframes splash-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes splash-text-glow {
          0%, 100% { text-shadow: 0 0 8px rgba(255,255,255,0.4); }
          50% { text-shadow: 0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4); }
        }
        @keyframes splash-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes splash-float-left {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes splash-float-right {
          0%, 100% { transform: translateY(0) rotate(5deg); }
          50% { transform: translateY(-8px) rotate(-5deg); }
        }
      `}</style>
    </div>
  )
}
