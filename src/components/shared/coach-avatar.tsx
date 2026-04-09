'use client'

import { motion } from 'framer-motion'

interface CoachAvatarProps {
  size?: number
  animate?: boolean
  className?: string
}

/**
 * AI 教練頭像 — Gemini 3.1 生成的可愛 Chibi 卡通教練
 * 帶浮動動畫效果
 */
export default function CoachAvatar({ size = 80, animate = true, className = '' }: CoachAvatarProps) {
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size, display: 'inline-block', flexShrink: 0 }}
      animate={animate ? { y: [0, -5, 0] } : undefined}
      transition={animate ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <img
        src="/char-coach-chibi.png"
        alt="AI 教練"
        width={size}
        height={size}
        style={{ objectFit: 'contain', width: size, height: size }}
      />
    </motion.div>
  )
}
