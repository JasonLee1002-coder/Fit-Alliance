'use client'

import { useEffect, useState, useRef } from 'react'

interface Props {
  pct: number        // 正數 = 減輕，負數 = 增重
  kg?: number        // 絕對變化 kg
  size?: 'hero' | 'compact'
}

export default function AnimatedWeightPct({ pct, kg, size = 'hero' }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const [visible, setVisible] = useState(false)
  const rafRef = useRef<number | null>(null)

  const isLoss = pct >= 0
  const absPct = Math.abs(pct)
  const absKg = kg !== undefined ? Math.abs(kg) : undefined

  useEffect(() => {
    // 入場動畫延遲
    const delay = setTimeout(() => setVisible(true), 80)

    // 數字滾動：0 → absPct，約 900ms
    const duration = 900
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(+(absPct * eased).toFixed(1))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      clearTimeout(delay)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [absPct])

  if (size === 'hero') {
    return (
      <div
        className="text-center transition-all duration-500"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(16px)',
        }}
      >
        {/* 大數字 */}
        <div className={`text-6xl font-black leading-none tracking-tight ${isLoss ? 'text-emerald-500' : 'text-red-500'}`}
          style={{ textShadow: isLoss ? '0 0 30px rgba(16,185,129,0.4)' : '0 0 30px rgba(239,68,68,0.4)' }}
        >
          {isLoss ? '↓' : '↑'} {displayed}%
        </div>

        {/* Kg 小字 */}
        {absKg !== undefined && (
          <div className={`text-lg font-bold mt-1 ${isLoss ? 'text-emerald-600' : 'text-red-500'}`}>
            {isLoss ? '已減' : '增加'} {absKg.toFixed(1)} kg
          </div>
        )}

        {/* 光暈底部提示 */}
        <div className={`text-xs mt-2 font-medium ${isLoss ? 'text-emerald-400' : 'text-red-400'}`}>
          {isLoss ? '🔥 體重變化百分比' : '📈 體重變化百分比'}
        </div>

        {/* 底部光條 */}
        <div className={`mt-3 h-1 rounded-full mx-auto transition-all duration-700 ${isLoss ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent' : 'bg-gradient-to-r from-transparent via-red-400 to-transparent'}`}
          style={{ width: visible ? `${Math.min(absPct * 4, 100)}%` : '0%' }}
        />
      </div>
    )
  }

  // compact 模式（競技場用）
  return (
    <div
      className="flex items-center gap-1 transition-all duration-400"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.7)' }}
    >
      <span className={`text-xl font-black ${isLoss ? 'text-emerald-600' : 'text-red-500'}`}
        style={{ textShadow: isLoss ? '0 0 8px rgba(16,185,129,0.5)' : undefined }}
      >
        {isLoss ? '↓' : '↑'}{displayed}%
      </span>
      {absKg !== undefined && (
        <span className="text-xs text-gray-400 font-medium">({absKg.toFixed(1)}kg)</span>
      )}
    </div>
  )
}
