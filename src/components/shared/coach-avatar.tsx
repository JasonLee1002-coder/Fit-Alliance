'use client'

import { motion } from 'framer-motion'

interface CoachAvatarProps {
  size?: number
  animate?: boolean
  className?: string
}

/**
 * AI 教練頭像：親切男性，漫畫風格 SVG
 * 綠色運動 polo 衫、短黑髮、友善笑容、哨子
 */
export default function CoachAvatar({ size = 80, animate = true, className = '' }: CoachAvatarProps) {
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size, display: 'inline-block' }}
      animate={animate ? { y: [0, -4, 0] } : undefined}
      transition={animate ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <svg viewBox="0 0 100 110" width={size} height={size * 1.1} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="coachGlow" cx="50%" cy="80%" r="50%">
            <stop offset="0%" stopColor="rgba(16,185,129,0.3)" />
            <stop offset="100%" stopColor="rgba(16,185,129,0)" />
          </radialGradient>
          <filter id="coachShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.3)" />
          </filter>
        </defs>

        {/* 光暈底部 */}
        <ellipse cx="50" cy="105" rx="32" ry="7" fill="url(#coachGlow)" />

        {/* === 身體 / 制服 === */}
        {/* 身體主體（emerald polo） */}
        <ellipse cx="50" cy="82" rx="26" ry="24" fill="#059669" stroke="#065f46" strokeWidth="2.5" filter="url(#coachShadow)" />

        {/* polo 衫條紋 */}
        <line x1="44" y1="64" x2="44" y2="90" stroke="#10b981" strokeWidth="1.5" opacity="0.7" />
        <line x1="50" y1="62" x2="50" y2="92" stroke="#10b981" strokeWidth="1.5" opacity="0.7" />
        <line x1="56" y1="64" x2="56" y2="90" stroke="#10b981" strokeWidth="1.5" opacity="0.7" />

        {/* 衣領 V型 */}
        <path d="M41,66 L50,75 L59,66" stroke="#065f46" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M41,66 L50,75 L59,66" stroke="#34d399" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* 左臂 */}
        <path d="M26,75 Q16,80 14,88" stroke="#059669" strokeWidth="14" strokeLinecap="round" fill="none" />
        {/* 右臂 */}
        <path d="M74,75 Q84,80 86,88" stroke="#059669" strokeWidth="14" strokeLinecap="round" fill="none" />
        {/* 手掌 */}
        <circle cx="14" cy="88" r="9" fill="#fde68a" stroke="#065f46" strokeWidth="2" />
        <circle cx="86" cy="88" r="9" fill="#fde68a" stroke="#065f46" strokeWidth="2" />

        {/* 哨子（右手） */}
        <rect x="88" y="86" width="10" height="6" rx="3" fill="#fbbf24" stroke="#92400e" strokeWidth="1.5" />
        <line x1="93" y1="92" x2="93" y2="98" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
        <circle cx="93" cy="99" r="3" fill="#92400e" />

        {/* 臂章 */}
        <rect x="18" y="78" width="14" height="9" rx="3" fill="#065f46" stroke="#34d399" strokeWidth="1" />
        <text x="25" y="86" textAnchor="middle" fontSize="4.5" fill="#34d399" fontWeight="700">COACH</text>

        {/* 胸前標誌 */}
        <circle cx="63" cy="72" r="5" fill="#065f46" stroke="#34d399" strokeWidth="1" />
        <text x="63" y="75" textAnchor="middle" fontSize="5" fill="#34d399" fontWeight="900">FA</text>

        {/* === 脖子 === */}
        <rect x="43" y="56" width="14" height="12" rx="6" fill="#fde68a" stroke="#065f46" strokeWidth="1.5" />

        {/* === 頭部 === */}
        <circle cx="50" cy="40" r="30" fill="#fde68a" stroke="#065f46" strokeWidth="2.5" filter="url(#coachShadow)" />

        {/* === 頭髮（短髮，帥氣） === */}
        {/* 後腦 */}
        <path d="M22,34 Q24,12 50,12 Q76,12 78,34" fill="#1c1917" stroke="none" />
        <ellipse cx="50" cy="12" rx="26" ry="12" fill="#1c1917" />
        {/* 瀏海 */}
        <path d="M24,30 Q28,20 38,22 Q44,18 50,20 Q56,18 62,22 Q72,20 76,30" fill="#1c1917" stroke="none" />
        {/* 髮絲質感 */}
        <path d="M32,18 Q36,14 40,16" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M42,14 Q46,10 52,12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M56,14 Q60,12 64,16" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* 耳朵 */}
        <ellipse cx="21" cy="42" rx="6" ry="7" fill="#fde68a" stroke="#065f46" strokeWidth="2" />
        <ellipse cx="79" cy="42" rx="6" ry="7" fill="#fde68a" stroke="#065f46" strokeWidth="2" />
        {/* 耳朵內 */}
        <ellipse cx="21" cy="42" rx="3" ry="4" fill="#fca5a5" />
        <ellipse cx="79" cy="42" rx="3" ry="4" fill="#fca5a5" />

        {/* === 眼睛（親切，微笑眼） === */}
        {/* 眼白 */}
        <ellipse cx="37" cy="38" rx="8" ry="8.5" fill="white" stroke="#1c1917" strokeWidth="2" />
        <ellipse cx="63" cy="38" rx="8" ry="8.5" fill="white" stroke="#1c1917" strokeWidth="2" />
        {/* 瞳孔 */}
        <circle cx="38" cy="39" r="5" fill="#1c1917" />
        <circle cx="64" cy="39" r="5" fill="#1c1917" />
        {/* 高光 */}
        <circle cx="40" cy="36" r="2" fill="white" />
        <circle cx="66" cy="36" r="2" fill="white" />
        {/* 小亮點 */}
        <circle cx="36" cy="41" r="0.8" fill="rgba(255,255,255,0.6)" />
        <circle cx="62" cy="41" r="0.8" fill="rgba(255,255,255,0.6)" />
        {/* 眉毛（友善弧形） */}
        <path d="M29,27 Q37,22 45,27" stroke="#1c1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M55,27 Q63,22 71,27" stroke="#1c1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* 睫毛 */}
        <line x1="30" y1="30" x2="28" y2="27" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="70" y1="30" x2="72" y2="27" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />

        {/* 臉頰紅暈 */}
        <ellipse cx="24" cy="46" rx="7" ry="4.5" fill="rgba(251,113,133,0.4)" />
        <ellipse cx="76" cy="46" rx="7" ry="4.5" fill="rgba(251,113,133,0.4)" />

        {/* === 鼻子 === */}
        <ellipse cx="50" cy="44" rx="3" ry="2" fill="rgba(180,100,80,0.3)" />

        {/* === 嘴巴（燦爛笑容） === */}
        <path d="M35,52 Q50,65 65,52" stroke="#065f46" strokeWidth="2.5" fill="#fca5a5" strokeLinecap="round" />
        {/* 牙齒 */}
        <path d="M37,53 Q50,63 63,53 L63,57 Q50,66 37,57 Z" fill="white" />
        <line x1="50" y1="53" x2="50" y2="63" stroke="#e5e7eb" strokeWidth="1" />

        {/* 微笑紋（酒窩） */}
        <path d="M30,50 Q27,54 30,56" stroke="rgba(180,80,60,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M70,50 Q73,54 70,56" stroke="rgba(180,80,60,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      </svg>
    </motion.div>
  )
}
