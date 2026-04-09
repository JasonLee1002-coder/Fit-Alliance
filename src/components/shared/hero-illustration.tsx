'use client'

import { motion } from 'framer-motion'

/**
 * 首頁漫畫風格插圖：家人朋友一起量體重比賽的歡樂場景
 * 全部 SVG 手繪，不依賴外部圖片
 */
export default function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <svg
        viewBox="0 0 420 260"
        className="w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 8px 32px rgba(16,185,129,0.2))' }}
      >
        {/* === 背景光暈 === */}
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor="rgba(16,185,129,0.18)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <radialGradient id="scaleGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(16,185,129,0.35)" />
            <stop offset="100%" stopColor="rgba(16,185,129,0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <ellipse cx="210" cy="220" rx="180" ry="30" fill="url(#bgGlow)" />

        {/* === 地板線 === */}
        <line x1="30" y1="222" x2="390" y2="222" stroke="rgba(16,185,129,0.3)" strokeWidth="1.5" strokeDasharray="6 4" />

        {/* ===================== 體重計 (中央) ===================== */}
        <g transform="translate(175, 170)">
          {/* 光暈 */}
          <ellipse cx="45" cy="52" rx="45" ry="8" fill="url(#scaleGlow)" />
          {/* 主體 */}
          <rect x="0" y="10" width="90" height="44" rx="12" fill="#0f2c1a" stroke="#22c55e" strokeWidth="2.5" />
          {/* 螢幕 */}
          <rect x="8" y="16" width="74" height="24" rx="6" fill="#022c16" stroke="#16a34a" strokeWidth="1.5" />
          {/* 數字顯示 */}
          <text x="45" y="32" textAnchor="middle" fontSize="13" fontWeight="900" fill="#4ade80" fontFamily="monospace" filter="url(#glow)">66.6</text>
          <text x="45" y="43" textAnchor="middle" fontSize="7" fill="#16a34a" fontFamily="monospace">kg</text>
          {/* 腳 */}
          <rect x="10" y="52" width="70" height="7" rx="3" fill="#166534" />
          {/* 標誌 */}
          <text x="45" y="63" textAnchor="middle" fontSize="5.5" fill="#15803d" letterSpacing="1">FIT ALLIANCE</text>
        </g>

        {/* === 星星/confetti === */}
        {[
          { x: 130, y: 80, r: 4, color: '#fbbf24', delay: 0 },
          { x: 290, y: 70, r: 3, color: '#f472b6', delay: 0.3 },
          { x: 165, y: 55, r: 3.5, color: '#60a5fa', delay: 0.15 },
          { x: 255, y: 58, r: 3, color: '#a78bfa', delay: 0.45 },
          { x: 310, y: 100, r: 2.5, color: '#34d399', delay: 0.2 },
          { x: 95, y: 110, r: 2, color: '#fcd34d', delay: 0.5 },
        ].map((s, i) => (
          <motion.circle
            key={i} cx={s.x} cy={s.y} r={s.r} fill={s.color}
            animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.5, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* ===================== 角色 1：胖胖朋友 (左) — 舉起雙手歡呼 ===================== */}
        <g transform="translate(42, 90)">
          {/* 陰影 */}
          <ellipse cx="38" cy="128" rx="28" ry="7" fill="rgba(0,0,0,0.25)" />
          {/* 左手臂 */}
          <path d="M18,60 Q4,45 8,32" stroke="#fbbf24" strokeWidth="12" strokeLinecap="round" fill="none" />
          {/* 右手臂 */}
          <path d="M58,60 Q72,45 68,32" stroke="#fbbf24" strokeWidth="12" strokeLinecap="round" fill="none" />
          {/* 身體 */}
          <ellipse cx="38" cy="82" rx="28" ry="32" fill="#fbbf24" stroke="#92400e" strokeWidth="2.5" />
          {/* 肚子 */}
          <ellipse cx="38" cy="90" rx="18" ry="18" fill="#fde68a" />
          {/* 腿 */}
          <rect x="22" y="108" width="13" height="22" rx="6" fill="#92400e" />
          <rect x="38" y="108" width="13" height="22" rx="6" fill="#92400e" />
          {/* 鞋子 */}
          <ellipse cx="28" cy="130" rx="10" ry="5" fill="#1c1917" />
          <ellipse cx="44" cy="130" rx="10" ry="5" fill="#1c1917" />
          {/* 脖子 */}
          <rect x="31" y="46" width="14" height="12" rx="5" fill="#fbbf24" />
          {/* 頭 */}
          <circle cx="38" cy="32" r="26" fill="#fde68a" stroke="#92400e" strokeWidth="2.5" />
          {/* 頭髮 */}
          <path d="M14,24 Q18,6 38,6 Q58,6 62,24" fill="#78350f" stroke="none" />
          <ellipse cx="38" cy="6" rx="22" ry="10" fill="#78350f" />
          {/* 眼睛 (開心大笑) */}
          <path d="M25,28 Q28,24 31,28" stroke="#1c1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M45,28 Q48,24 51,28" stroke="#1c1917" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* 臉頰紅暈 */}
          <ellipse cx="20" cy="34" rx="6" ry="4" fill="rgba(251,113,133,0.4)" />
          <ellipse cx="56" cy="34" rx="6" ry="4" fill="rgba(251,113,133,0.4)" />
          {/* 嘴巴 */}
          <path d="M27,39 Q38,50 49,39" stroke="#92400e" strokeWidth="2" fill="#fca5a5" strokeLinecap="round" />
          {/* 左手掌 */}
          <circle cx="8" cy="30" r="8" fill="#fde68a" stroke="#92400e" strokeWidth="2" />
          {/* 右手掌 */}
          <circle cx="68" cy="30" r="8" fill="#fde68a" stroke="#92400e" strokeWidth="2" />
          {/* 汗水 */}
          <path d="M65,15 Q67,10 65,6" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* 角色1 對話框 */}
        <g transform="translate(14, 50)">
          <rect x="0" y="0" width="72" height="22" rx="11" fill="#fef9c3" stroke="#eab308" strokeWidth="2" />
          <polygon points="28,22 22,32 38,22" fill="#fef9c3" stroke="#eab308" strokeWidth="2" strokeLinejoin="round" />
          <polygon points="28,23 24,31 38,23" fill="#fef9c3" />
          <text x="36" y="15" textAnchor="middle" fontSize="9" fontWeight="700" fill="#92400e">我瘦了！🎉</text>
        </g>

        {/* ===================== 角色 2：媽媽 (右) — 跑步姿 ===================== */}
        <g transform="translate(288, 95)">
          {/* 陰影 */}
          <ellipse cx="38" cy="124" rx="24" ry="6" fill="rgba(0,0,0,0.25)" />
          {/* 跑步左腿 */}
          <path d="M28,108 Q18,118 14,130" stroke="#9d174d" strokeWidth="11" strokeLinecap="round" fill="none" />
          {/* 跑步右腿 */}
          <path d="M48,108 Q55,115 58,126" stroke="#9d174d" strokeWidth="11" strokeLinecap="round" fill="none" />
          {/* 鞋子 */}
          <ellipse cx="14" cy="130" rx="10" ry="5" fill="#e11d48" />
          <ellipse cx="58" cy="126" rx="10" ry="5" fill="#e11d48" />
          {/* 身體 */}
          <ellipse cx="38" cy="78" rx="22" ry="28" fill="#fb7185" stroke="#9d174d" strokeWidth="2.5" />
          {/* 運動衣細節 */}
          <path d="M26,68 L26,88" stroke="#fda4af" strokeWidth="2" />
          <path d="M38,65 L38,90" stroke="#fda4af" strokeWidth="2" />
          <path d="M50,68 L50,88" stroke="#fda4af" strokeWidth="2" />
          {/* 左手臂 (後擺) */}
          <path d="M18,72 Q6,80 4,90" stroke="#fb7185" strokeWidth="10" strokeLinecap="round" fill="none" />
          {/* 右手臂 (前擺) */}
          <path d="M58,72 Q68,60 66,48" stroke="#fb7185" strokeWidth="10" strokeLinecap="round" fill="none" />
          {/* 手掌 */}
          <circle cx="4" cy="90" r="7" fill="#fde68a" stroke="#9d174d" strokeWidth="2" />
          <circle cx="66" cy="48" r="7" fill="#fde68a" stroke="#9d174d" strokeWidth="2" />
          {/* 脖子 */}
          <rect x="31" y="44" width="14" height="10" rx="5" fill="#fde68a" />
          {/* 頭 */}
          <circle cx="38" cy="30" r="24" fill="#fde68a" stroke="#9d174d" strokeWidth="2.5" />
          {/* 馬尾 */}
          <ellipse cx="38" cy="8" rx="16" ry="8" fill="#7c3aed" />
          <path d="M52,12 Q65,5 62,22 Q60,30 52,28" fill="#7c3aed" stroke="none" />
          {/* 眼睛 (集中/努力) */}
          <ellipse cx="28" cy="28" rx="5" ry="5.5" fill="white" stroke="#1c1917" strokeWidth="1.5" />
          <circle cx="29" cy="29" r="3" fill="#1c1917" />
          <circle cx="30" cy="27" r="1" fill="white" />
          <ellipse cx="48" cy="28" rx="5" ry="5.5" fill="white" stroke="#1c1917" strokeWidth="1.5" />
          <circle cx="49" cy="29" r="3" fill="#1c1917" />
          <circle cx="50" cy="27" r="1" fill="white" />
          {/* 臉頰 */}
          <ellipse cx="18" cy="34" rx="5" ry="3.5" fill="rgba(251,113,133,0.45)" />
          <ellipse cx="58" cy="34" rx="5" ry="3.5" fill="rgba(251,113,133,0.45)" />
          {/* 嘴 */}
          <path d="M30,38 Q38,44 46,38" stroke="#9d174d" strokeWidth="2" fill="#fca5a5" strokeLinecap="round" />
          {/* 速度線 */}
          <line x1="-2" y1="90" x2="10" y2="90" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="98" x2="10" y2="96" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* 角色2 對話框 */}
        <g transform="translate(282, 45)">
          <rect x="0" y="0" width="80" height="22" rx="11" fill="#fce7f3" stroke="#db2777" strokeWidth="2" />
          <polygon points="52,22 46,32 62,22" fill="#fce7f3" stroke="#db2777" strokeWidth="2" strokeLinejoin="round" />
          <polygon points="52,23 48,31 62,23" fill="#fce7f3" />
          <text x="40" y="15" textAnchor="middle" fontSize="9" fontWeight="700" fill="#9d174d">再跑一圈！💪</text>
        </g>

        {/* ===================== 角色 3：爸爸 (中左) — 指著體重計 ===================== */}
        <g transform="translate(140, 112)">
          {/* 陰影 */}
          <ellipse cx="30" cy="106" rx="24" ry="6" fill="rgba(0,0,0,0.2)" />
          {/* 腿 */}
          <rect x="16" y="86" width="11" height="22" rx="5" fill="#1e3a5f" />
          <rect x="32" y="86" width="11" height="22" rx="5" fill="#1e3a5f" />
          {/* 鞋 */}
          <ellipse cx="21" cy="108" rx="9" ry="4.5" fill="#1c1917" />
          <ellipse cx="37" cy="108" rx="9" ry="4.5" fill="#1c1917" />
          {/* 身體 */}
          <ellipse cx="30" cy="62" rx="22" ry="26" fill="#3b82f6" stroke="#1e3a5f" strokeWidth="2.5" />
          {/* 衣領 */}
          <path d="M18,42 L30,52 L42,42" stroke="white" strokeWidth="2" fill="none" />
          {/* 右手臂 (指向) */}
          <path d="M50,60 Q64,56 78,52" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round" fill="none" />
          {/* 左手臂 */}
          <path d="M10,60 Q2,70 4,82" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round" fill="none" />
          {/* 手掌 */}
          <circle cx="78" cy="52" r="7" fill="#fde68a" stroke="#1e3a5f" strokeWidth="2" />
          <circle cx="4" cy="82" r="7" fill="#fde68a" stroke="#1e3a5f" strokeWidth="2" />
          {/* 脖子 */}
          <rect x="23" y="32" width="14" height="10" rx="5" fill="#fde68a" />
          {/* 頭 */}
          <circle cx="30" cy="20" r="22" fill="#fde68a" stroke="#1e3a5f" strokeWidth="2.5" />
          {/* 頭髮 */}
          <path d="M10,14 Q14,2 30,2 Q46,2 50,14" fill="#374151" />
          <ellipse cx="30" cy="2" rx="18" ry="8" fill="#374151" />
          {/* 眼鏡 */}
          <circle cx="22" cy="18" r="7" fill="none" stroke="#374151" strokeWidth="2" />
          <circle cx="38" cy="18" r="7" fill="none" stroke="#374151" strokeWidth="2" />
          <line x1="29" y1="18" x2="31" y2="18" stroke="#374151" strokeWidth="2" />
          <line x1="8" y1="16" x2="15" y2="16" stroke="#374151" strokeWidth="2" />
          <line x1="45" y1="16" x2="52" y2="16" stroke="#374151" strokeWidth="2" />
          {/* 眼睛 */}
          <circle cx="22" cy="19" r="3.5" fill="#1c1917" />
          <circle cx="23" cy="18" r="1" fill="white" />
          <circle cx="38" cy="19" r="3.5" fill="#1c1917" />
          <circle cx="39" cy="18" r="1" fill="white" />
          {/* 臉頰 */}
          <ellipse cx="14" cy="24" rx="5" ry="3.5" fill="rgba(251,113,133,0.35)" />
          <ellipse cx="46" cy="24" rx="5" ry="3.5" fill="rgba(251,113,133,0.35)" />
          {/* 鬍子微笑 */}
          <path d="M20,28 Q30,36 40,28" stroke="#374151" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* 嘴 */}
          <path d="M21,29 Q30,37 39,29" fill="#fca5a5" stroke="none" />
        </g>

        {/* 爸爸 對話框 */}
        <g transform="translate(108, 78)">
          <rect x="0" y="0" width="74" height="22" rx="11" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
          <polygon points="36,22 30,32 46,22" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
          <polygon points="36,23 32,31 46,23" fill="#dbeafe" />
          <text x="37" y="15" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#1e3a5f">看！我贏了！😎</text>
        </g>

        {/* ===================== 角色 4：小孩 (右中) — 跳躍歡呼 ===================== */}
        <g transform="translate(252, 130)">
          {/* 腿 (空中跳躍) */}
          <path d="M22,82 Q14,92 10,100" stroke="#16a34a" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M36,82 Q44,90 48,98" stroke="#16a34a" strokeWidth="9" strokeLinecap="round" fill="none" />
          {/* 鞋 */}
          <ellipse cx="10" cy="100" rx="8" ry="4" fill="#1c1917" />
          <ellipse cx="48" cy="98" rx="8" ry="4" fill="#1c1917" />
          {/* 身體 */}
          <ellipse cx="30" cy="58" rx="18" ry="22" fill="#34d399" stroke="#166534" strokeWidth="2.5" />
          {/* 手臂 */}
          <path d="M14,56 Q4,42 6,30" stroke="#34d399" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M46,56 Q56,42 54,30" stroke="#34d399" strokeWidth="9" strokeLinecap="round" fill="none" />
          {/* 手掌 */}
          <circle cx="6" cy="28" r="6.5" fill="#fde68a" stroke="#166534" strokeWidth="1.5" />
          <circle cx="54" cy="28" r="6.5" fill="#fde68a" stroke="#166534" strokeWidth="1.5" />
          {/* 脖子 */}
          <rect x="24" y="32" width="12" height="8" rx="4" fill="#fde68a" />
          {/* 大頭 */}
          <circle cx="30" cy="20" r="20" fill="#fde68a" stroke="#166534" strokeWidth="2.5" />
          {/* 頭髮 */}
          <path d="M12,14 Q14,2 30,2 Q46,2 48,14" fill="#1c1917" />
          {/* 耳朵 */}
          <ellipse cx="10" cy="20" rx="5" ry="6" fill="#fde68a" stroke="#166534" strokeWidth="2" />
          <ellipse cx="50" cy="20" rx="5" ry="6" fill="#fde68a" stroke="#166534" strokeWidth="2" />
          {/* 眼睛 (星形/興奮) */}
          <circle cx="22" cy="18" r="6" fill="white" stroke="#1c1917" strokeWidth="1.5" />
          <circle cx="22" cy="19" r="3.5" fill="#1c1917" />
          <circle cx="24" cy="17" r="1.2" fill="white" />
          <circle cx="38" cy="18" r="6" fill="white" stroke="#1c1917" strokeWidth="1.5" />
          <circle cx="38" cy="19" r="3.5" fill="#1c1917" />
          <circle cx="40" cy="17" r="1.2" fill="white" />
          {/* 臉頰 */}
          <ellipse cx="13" cy="25" rx="5" ry="3.5" fill="rgba(251,113,133,0.5)" />
          <ellipse cx="47" cy="25" rx="5" ry="3.5" fill="rgba(251,113,133,0.5)" />
          {/* 嘴 (大笑) */}
          <path d="M20,28 Q30,38 40,28" stroke="#166534" strokeWidth="2" fill="#fca5a5" strokeLinecap="round" />
          {/* 汗珠 */}
          <path d="M52,8 Q54,4 52,1" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" fill="none" />
        </g>

        {/* 小孩 對話框 */}
        <g transform="translate(268, 98)">
          <rect x="0" y="0" width="72" height="22" rx="11" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
          <polygon points="22,22 16,32 32,22" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" strokeLinejoin="round" />
          <polygon points="22,23 18,31 32,23" fill="#dcfce7" />
          <text x="36" y="15" textAnchor="middle" fontSize="9" fontWeight="700" fill="#166534">我最輕！🏆</text>
        </g>

        {/* === VS 標誌 === */}
        <g transform="translate(193, 140)">
          <circle cx="14" cy="14" r="14" fill="#1e1b4b" stroke="#818cf8" strokeWidth="2.5" />
          <text x="14" y="19" textAnchor="middle" fontSize="11" fontWeight="900" fill="#818cf8">VS</text>
        </g>

        {/* === 標題文字 === */}
        <g transform="translate(0, 8)">
          <text x="210" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill="rgba(74,222,128,0.6)" letterSpacing="2">FIT ALLIANCE</text>
        </g>

      </svg>
    </motion.div>
  )
}
