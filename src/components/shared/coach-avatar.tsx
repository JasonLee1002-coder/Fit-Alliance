'use client'

import { motion } from 'framer-motion'

interface CoachAvatarProps {
  size?: number
  animate?: boolean
  className?: string
}

/**
 * AI 教練頭像：溫馨可愛 Chibi 風格（頭身比 2:1）
 * 亮綠運動衫、大眼圓臉、友善笑容、加油手勢
 */
export default function CoachAvatar({ size = 80, animate = true, className = '' }: CoachAvatarProps) {
  return (
    <motion.div
      className={className}
      style={{ width: size, height: size, display: 'inline-block' }}
      animate={animate ? { y: [0, -5, 0] } : undefined}
      transition={animate ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ca-face" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff3cd" />
            <stop offset="100%" stopColor="#fde68a" />
          </radialGradient>
          <radialGradient id="ca-body" cx="35%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="60%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </radialGradient>
          <radialGradient id="ca-hair" cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#44403c" />
            <stop offset="100%" stopColor="#1c1917" />
          </radialGradient>
          <filter id="ca-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(0,100,50,0.3)" />
          </filter>
        </defs>

        {/* ── 身體（chibi：小而圓） ── */}
        <ellipse cx="50" cy="82" rx="24" ry="18" fill="url(#ca-body)" stroke="#15803d" strokeWidth="1.5" filter="url(#ca-shadow)" />
        {/* 身體高光 */}
        <ellipse cx="43" cy="72" rx="8" ry="5" fill="rgba(255,255,255,0.25)" transform="rotate(-20,43,72)" />
        {/* V領 */}
        <path d="M42,70 L50,78 L58,70" stroke="#15803d" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M42,70 L50,78 L58,70" stroke="#86efac" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* FA 徽章 */}
        <circle cx="62" cy="74" r="6" fill="#15803d" stroke="#86efac" strokeWidth="1.2" />
        <text x="62" y="77" textAnchor="middle" fontSize="5.5" fill="#86efac" fontWeight="900">FA</text>

        {/* ── 手臂 ── */}
        {/* 左臂 */}
        <path d="M28,76 Q18,74 15,82" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" fill="none" />
        {/* 右臂（舉起加油） */}
        <path d="M72,76 Q82,68 80,58" stroke="#22c55e" strokeWidth="12" strokeLinecap="round" fill="none" />
        {/* 手掌 */}
        <circle cx="15" cy="82" r="8" fill="url(#ca-face)" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="80" cy="57" r="8" fill="url(#ca-face)" stroke="#f59e0b" strokeWidth="1.5" />
        {/* 右手拳頭加油 */}
        <circle cx="80" cy="57" r="5" fill="#fde68a" stroke="#f59e0b" strokeWidth="1" />
        {/* 拇指朝上 */}
        <path d="M80,52 Q83,48 84,50 Q86,52 83,54" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.2" />

        {/* ── 脖子 ── */}
        <rect x="44" y="55" width="12" height="10" rx="5" fill="url(#ca-face)" stroke="#f59e0b" strokeWidth="1" />

        {/* ── 大圓頭 ── */}
        <circle cx="50" cy="38" r="30" fill="url(#ca-face)" stroke="#f59e0b" strokeWidth="1.8" filter="url(#ca-shadow)" />

        {/* ── 頭髮（短髮帥氣） ── */}
        <path d="M21,33 Q22,10 50,10 Q78,10 79,33" fill="url(#ca-hair)" />
        <ellipse cx="50" cy="10" rx="28" ry="11" fill="url(#ca-hair)" />
        {/* 瀏海 */}
        <path d="M23,28 Q28,18 38,21 Q44,17 50,19 Q56,17 62,21 Q72,18 77,28" fill="url(#ca-hair)" />
        {/* 髮絲光澤 */}
        <path d="M32,16 Q36,12 42,14" stroke="#57534e" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M44,12 Q50,8 56,12" stroke="#57534e" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* ── 耳朵 ── */}
        <ellipse cx="21" cy="40" rx="7" ry="8" fill="url(#ca-face)" stroke="#f59e0b" strokeWidth="1.5" />
        <ellipse cx="79" cy="40" rx="7" ry="8" fill="url(#ca-face)" stroke="#f59e0b" strokeWidth="1.5" />
        <ellipse cx="21" cy="40" rx="3.5" ry="4.5" fill="#fca5a5" />
        <ellipse cx="79" cy="40" rx="3.5" ry="4.5" fill="#fca5a5" />

        {/* ── 大眼睛（Chibi 特色：超大！） ── */}
        {/* 眼白 */}
        <ellipse cx="36" cy="37" rx="10" ry="11" fill="white" stroke="#1c1917" strokeWidth="1.5" />
        <ellipse cx="64" cy="37" rx="10" ry="11" fill="white" stroke="#1c1917" strokeWidth="1.5" />
        {/* 虹膜 */}
        <circle cx="37" cy="38" r="7" fill="#2563eb" />
        <circle cx="65" cy="38" r="7" fill="#2563eb" />
        {/* 瞳孔 */}
        <circle cx="37.5" cy="38.5" r="4.5" fill="#1c1917" />
        <circle cx="65.5" cy="38.5" r="4.5" fill="#1c1917" />
        {/* 眼睛主高光 */}
        <circle cx="40" cy="34" r="2.8" fill="white" />
        <circle cx="68" cy="34" r="2.8" fill="white" />
        {/* 小高光 */}
        <circle cx="35" cy="40" r="1.2" fill="rgba(255,255,255,0.7)" />
        <circle cx="63" cy="40" r="1.2" fill="rgba(255,255,255,0.7)" />
        {/* 睫毛 */}
        <line x1="27" y1="29" x2="25" y2="26" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="29" y1="27" x2="28" y2="24" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="71" y1="29" x2="73" y2="26" stroke="#1c1917" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="69" y1="27" x2="70" y2="24" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
        {/* 眉毛 */}
        <path d="M26,25 Q36,20 44,25" stroke="#1c1917" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M56,25 Q64,20 74,25" stroke="#1c1917" strokeWidth="2.8" fill="none" strokeLinecap="round" />

        {/* ── 臉頰紅暈 ── */}
        <ellipse cx="22" cy="46" rx="8" ry="5" fill="rgba(251,113,133,0.45)" />
        <ellipse cx="78" cy="46" rx="8" ry="5" fill="rgba(251,113,133,0.45)" />

        {/* ── 鼻子（小點） ── */}
        <ellipse cx="50" cy="44" rx="3" ry="2" fill="rgba(180,100,80,0.3)" />

        {/* ── 嘴巴（大燦笑） ── */}
        <path d="M33,51 Q50,66 67,51" stroke="#d97706" strokeWidth="2.5" fill="#fca5a5" strokeLinecap="round" />
        {/* 牙齒 */}
        <path d="M35,52 Q50,64 65,52 L65,57 Q50,67 35,57 Z" fill="white" />
        <line x1="50" y1="52" x2="50" y2="63" stroke="#f3f4f6" strokeWidth="1.2" />
        {/* 酒窩 */}
        <circle cx="30" cy="54" r="2" fill="rgba(251,113,133,0.35)" />
        <circle cx="70" cy="54" r="2" fill="rgba(251,113,133,0.35)" />

        {/* ── 哨子（右手） ── */}
        {/* 頭頂加油感嘆號 */}
        <circle cx="72" cy="8" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
        <rect x="69.5" y="4" width="5" height="6" rx="2.5" fill="white" />
        <circle cx="72" cy="12" r="2" fill="white" />

        {/* COACH 臂章 */}
        <rect x="16" y="77" width="16" height="8" rx="3" fill="#15803d" stroke="#86efac" strokeWidth="1" />
        <text x="24" y="84" textAnchor="middle" fontSize="4" fill="#86efac" fontWeight="700">COACH</text>
      </svg>
    </motion.div>
  )
}
