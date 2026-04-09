/**
 * 側邊欄導航圖示 — 溫馨可愛卡通風格（LINE 貼圖 / Duolingo 風）
 * 亮色圓形背景 + 大眼圓臉卡通角色
 */

interface IconProps {
  size?: number
  className?: string
}

/* 每日打卡 — 可愛小胖人站上體重計，開心撒花 */
export function CheckinIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ci-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#d1fae5" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </radialGradient>
        <filter id="ci-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(16,185,129,0.35)" />
        </filter>
      </defs>

      {/* 圓形背景 */}
      <circle cx="40" cy="40" r="38" fill="url(#ci-bg)" filter="url(#ci-shadow)" />
      <circle cx="40" cy="40" r="38" fill="none" stroke="#a7f3d0" strokeWidth="2" />

      {/* 體重計 */}
      <rect x="18" y="48" width="44" height="18" rx="9" fill="#fff" stroke="#10b981" strokeWidth="2" />
      <rect x="18" y="48" width="44" height="18" rx="9" fill="none" stroke="#a7f3d0" strokeWidth="1" opacity="0.6" />
      <text x="40" y="62" textAnchor="middle" fontSize="10" fontWeight="900" fill="#059669" fontFamily="monospace">72.5</text>
      {/* 體重計上的指針 */}
      <ellipse cx="40" cy="49" rx="14" ry="3" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" />
      <line x1="40" y1="44" x2="40" y2="50" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

      {/* 可愛小人 */}
      {/* 身體 */}
      <ellipse cx="40" cy="40" rx="11" ry="10" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
      {/* 手臂（歡呼） */}
      <path d="M30,36 Q22,28 19,23" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M50,36 Q58,28 61,23" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* 手掌 */}
      <circle cx="19" cy="22" r="4" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx="61" cy="22" r="4" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
      {/* 頭 */}
      <circle cx="40" cy="26" r="13" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
      {/* 臉頰紅暈 */}
      <ellipse cx="30" cy="29" rx="4" ry="3" fill="rgba(251,113,133,0.4)" />
      <ellipse cx="50" cy="29" rx="4" ry="3" fill="rgba(251,113,133,0.4)" />
      {/* 眼睛（彎彎開心眼） */}
      <path d="M33,24 Q36,21 39,24" stroke="#1c1917" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M41,24 Q44,21 47,24" stroke="#1c1917" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* 嘴巴 */}
      <path d="M34,30 Q40,36 46,30" stroke="#d97706" strokeWidth="2" fill="rgba(253,186,116,0.5)" strokeLinecap="round" />

      {/* 星星撒花 */}
      <text x="10" y="18" fontSize="10">⭐</text>
      <text x="58" y="16" fontSize="8">✨</text>
      <text x="14" y="42" fontSize="7">🌟</text>
    </svg>
  )
}

/* 健康紀錄 — 可愛圖表精靈，折線像微笑 */
export function RecordsIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ri-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#93c5fd" />
        </radialGradient>
        <filter id="ri-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(59,130,246,0.35)" />
        </filter>
      </defs>

      <circle cx="40" cy="40" r="38" fill="url(#ri-bg)" filter="url(#ri-shadow)" />
      <circle cx="40" cy="40" r="38" fill="none" stroke="#bfdbfe" strokeWidth="2" />

      {/* 可愛圖表卡片 */}
      <rect x="14" y="20" width="52" height="40" rx="8" fill="white" stroke="#93c5fd" strokeWidth="1.5" />

      {/* 柱狀圖（像小人腿） */}
      <rect x="21" y="42" width="7" height="12" rx="3" fill="#60a5fa" />
      <rect x="32" y="35" width="7" height="19" rx="3" fill="#3b82f6" />
      <rect x="43" y="28" width="7" height="26" rx="3" fill="#2563eb" />
      <rect x="54" y="33" width="7" height="21" rx="3" fill="#1d4ed8" />

      {/* 柱頂可愛小臉 */}
      <circle cx="24.5" cy="39" r="5" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.2" />
      <path d="M22,39 Q24.5,41.5 27,39" stroke="#d97706" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="23" cy="37.5" r="1" fill="#1c1917" />
      <circle cx="26" cy="37.5" r="1" fill="#1c1917" />

      {/* 上升箭頭 */}
      <path d="M54,18 L62,10 M59,10 L62,10 L62,13" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* 小星星 */}
      <text x="12" y="20" fontSize="9">⭐</text>
      <text x="60" y="22" fontSize="7">✨</text>
    </svg>
  )
}

/* 共同挑戰 — 可愛獎盃，有眼睛有笑容 */
export function ChallengeIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="chi-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="100%" stopColor="#fcd34d" />
        </radialGradient>
        <radialGradient id="chi-trophy" cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <filter id="chi-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(245,158,11,0.4)" />
        </filter>
      </defs>

      <circle cx="40" cy="40" r="38" fill="url(#chi-bg)" filter="url(#chi-shadow)" />
      <circle cx="40" cy="40" r="38" fill="none" stroke="#fde68a" strokeWidth="2" />

      {/* 獎盃主體 */}
      <path d="M25,18 Q23,32 27,40 Q32,50 40,50 Q48,50 53,40 Q57,32 55,18 Z"
        fill="url(#chi-trophy)" stroke="#d97706" strokeWidth="2" />
      {/* 獎盃高光 */}
      <path d="M29,20 Q28,30 30,38" stroke="rgba(255,253,230,0.7)" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* 獎盃把手 */}
      <path d="M25,22 Q14,22 14,30 Q14,38 25,36" fill="none" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M55,22 Q66,22 66,30 Q66,38 55,36" fill="none" stroke="#d97706" strokeWidth="3.5" strokeLinecap="round" />
      {/* 把手高光 */}
      <path d="M16,23 Q15,28 16,35" stroke="rgba(254,243,199,0.6)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* 可愛臉 */}
      {/* 眼睛 */}
      <circle cx="34" cy="30" r="4" fill="white" stroke="#d97706" strokeWidth="1" />
      <circle cx="46" cy="30" r="4" fill="white" stroke="#d97706" strokeWidth="1" />
      <circle cx="35" cy="31" r="2.5" fill="#1c1917" />
      <circle cx="47" cy="31" r="2.5" fill="#1c1917" />
      <circle cx="36" cy="29.5" r="1" fill="white" />
      <circle cx="48" cy="29.5" r="1" fill="white" />
      {/* 臉頰 */}
      <ellipse cx="29" cy="36" rx="4.5" ry="3" fill="rgba(251,113,133,0.4)" />
      <ellipse cx="51" cy="36" rx="4.5" ry="3" fill="rgba(251,113,133,0.4)" />
      {/* 嘴巴 */}
      <path d="M33,38 Q40,45 47,38" stroke="#d97706" strokeWidth="2.2" fill="rgba(253,186,116,0.5)" strokeLinecap="round" />

      {/* 底座 */}
      <rect x="32" y="50" width="16" height="5" rx="2.5" fill="#b45309" stroke="#92400e" strokeWidth="1" />
      <rect x="28" y="55" width="24" height="5" rx="3" fill="#d97706" stroke="#92400e" strokeWidth="1" />

      {/* 皇冠 */}
      <path d="M28,18 L31,10 L40,16 L49,10 L52,18" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="28" cy="18" r="2.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
      <circle cx="40" cy="16" r="2.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
      <circle cx="52" cy="18" r="2.5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />

      {/* 閃光 */}
      <text x="8" y="22" fontSize="9">✨</text>
      <text x="60" y="16" fontSize="8">⭐</text>
      <text x="62" y="36" fontSize="7">🌟</text>
    </svg>
  )
}

/* 個人邀請朋友 — 兩個可愛小人手牽手，中間有愛心 */
export function InviteIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ii-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ede9fe" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </radialGradient>
        <filter id="ii-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(139,92,246,0.35)" />
        </filter>
      </defs>

      <circle cx="40" cy="40" r="38" fill="url(#ii-bg)" filter="url(#ii-shadow)" />
      <circle cx="40" cy="40" r="38" fill="none" stroke="#ddd6fe" strokeWidth="2" />

      {/* ─── 小人1（左，男生，黃色） ─── */}
      {/* 頭 */}
      <circle cx="24" cy="28" r="11" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
      {/* 頭髮 */}
      <path d="M14,24 Q14,13 24,13 Q34,13 34,24" fill="#1c1917" />
      {/* 臉頰 */}
      <ellipse cx="17" cy="31" rx="3.5" ry="2.5" fill="rgba(251,113,133,0.4)" />
      <ellipse cx="31" cy="31" rx="3.5" ry="2.5" fill="rgba(251,113,133,0.4)" />
      {/* 眼睛 */}
      <circle cx="20.5" cy="27" r="2.5" fill="white" stroke="#f59e0b" strokeWidth="0.8" />
      <circle cx="27.5" cy="27" r="2.5" fill="white" stroke="#f59e0b" strokeWidth="0.8" />
      <circle cx="21" cy="27.5" r="1.5" fill="#1c1917" />
      <circle cx="28" cy="27.5" r="1.5" fill="#1c1917" />
      <circle cx="21.5" cy="27" r="0.6" fill="white" />
      <circle cx="28.5" cy="27" r="0.6" fill="white" />
      {/* 嘴巴 */}
      <path d="M20,33 Q24,37 28,33" stroke="#d97706" strokeWidth="1.8" fill="rgba(253,186,116,0.5)" strokeLinecap="round" />
      {/* 身體 */}
      <rect x="17" y="39" width="14" height="18" rx="7" fill="#7c3aed" stroke="#5b21b6" strokeWidth="1.2" />
      {/* 手（伸向右邊） */}
      <path d="M31,46 Q37,44 40,44" stroke="#fde68a" strokeWidth="4.5" strokeLinecap="round" fill="none" />

      {/* ─── 小人2（右，女生，粉色） ─── */}
      {/* 頭 */}
      <circle cx="56" cy="28" r="11" fill="#fecdd3" stroke="#f43f5e" strokeWidth="1.5" />
      {/* 頭髮（長髮） */}
      <path d="M45,22 Q44,12 56,12 Q68,12 67,22" fill="#dc2626" />
      <path d="M45,22 Q43,32 45,42" fill="#dc2626" />
      <path d="M67,22 Q68,32 66,42" fill="#dc2626" />
      {/* 臉頰 */}
      <ellipse cx="49" cy="31" rx="3.5" ry="2.5" fill="rgba(251,113,133,0.5)" />
      <ellipse cx="63" cy="31" rx="3.5" ry="2.5" fill="rgba(251,113,133,0.5)" />
      {/* 眼睛 */}
      <circle cx="52.5" cy="27" r="2.5" fill="white" stroke="#f43f5e" strokeWidth="0.8" />
      <circle cx="59.5" cy="27" r="2.5" fill="white" stroke="#f43f5e" strokeWidth="0.8" />
      <circle cx="53" cy="27.5" r="1.5" fill="#1c1917" />
      <circle cx="60" cy="27.5" r="1.5" fill="#1c1917" />
      <circle cx="53.5" cy="27" r="0.6" fill="white" />
      <circle cx="60.5" cy="27" r="0.6" fill="white" />
      {/* 睫毛 */}
      <line x1="51" y1="25" x2="50" y2="23.5" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="53" y1="24.5" x2="53" y2="22.8" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="58" y1="24.5" x2="58" y2="22.8" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="60" y1="25" x2="61" y2="23.5" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
      {/* 嘴巴 */}
      <path d="M52,33 Q56,37 60,33" stroke="#e11d48" strokeWidth="1.8" fill="rgba(253,164,175,0.5)" strokeLinecap="round" />
      {/* 身體 */}
      <rect x="49" y="39" width="14" height="18" rx="7" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
      {/* 手（伸向左邊） */}
      <path d="M49,46 Q43,44 40,44" stroke="#fecdd3" strokeWidth="4.5" strokeLinecap="round" fill="none" />

      {/* 中間愛心 */}
      <path d="M40,40 C40,40 43,36 46,38 C49,40 48,44 40,48 C32,44 31,40 34,38 C37,36 40,40 40,40 Z"
        fill="#fb7185" stroke="#e11d48" strokeWidth="1" />
      <path d="M40,40 C40,40 42,37.5 44,39" stroke="rgba(255,220,220,0.7)" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* 小星星 */}
      <text x="5" y="16" fontSize="8">💕</text>
      <text x="63" y="14" fontSize="7">✨</text>
    </svg>
  )
}

/* 問題回報 — 可愛感嘆號精靈，圓臉大眼 */
export function ReportIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rpi-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffedd5" />
          <stop offset="100%" stopColor="#fdba74" />
        </radialGradient>
        <filter id="rpi-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="rgba(234,88,12,0.35)" />
        </filter>
      </defs>

      <circle cx="40" cy="40" r="38" fill="url(#rpi-bg)" filter="url(#rpi-shadow)" />
      <circle cx="40" cy="40" r="38" fill="none" stroke="#fed7aa" strokeWidth="2" />

      {/* 感嘆號精靈主體 */}
      <ellipse cx="40" cy="38" rx="20" ry="24" fill="#fff7ed" stroke="#fb923c" strokeWidth="2" />
      {/* 高光 */}
      <ellipse cx="33" cy="27" rx="7" ry="5" fill="rgba(255,255,255,0.6)" />

      {/* 可愛臉 */}
      {/* 眼睛（大圓眼） */}
      <circle cx="33" cy="32" r="5.5" fill="white" stroke="#fb923c" strokeWidth="1.2" />
      <circle cx="47" cy="32" r="5.5" fill="white" stroke="#fb923c" strokeWidth="1.2" />
      <circle cx="34" cy="33" r="3.5" fill="#1c1917" />
      <circle cx="48" cy="33" r="3.5" fill="#1c1917" />
      {/* 眼睛高光 */}
      <circle cx="35" cy="31.5" r="1.5" fill="white" />
      <circle cx="49" cy="31.5" r="1.5" fill="white" />
      {/* 小星星眼 */}
      <circle cx="33.5" cy="34" r="0.7" fill="white" opacity="0.7" />
      <circle cx="47.5" cy="34" r="0.7" fill="white" opacity="0.7" />

      {/* 眉毛（擔心彎） */}
      <path d="M29,26 Q33,23 37,26" stroke="#c2410c" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M43,26 Q47,23 51,26" stroke="#c2410c" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* 臉頰 */}
      <ellipse cx="26" cy="37" rx="5" ry="3.5" fill="rgba(251,113,133,0.4)" />
      <ellipse cx="54" cy="37" rx="5" ry="3.5" fill="rgba(251,113,133,0.4)" />

      {/* 嘴巴（驚訝O形） */}
      <ellipse cx="40" cy="44" rx="5" ry="4" fill="#f97316" stroke="#c2410c" strokeWidth="1.2" />
      <ellipse cx="40" cy="44" rx="3" ry="2.5" fill="#7c2d12" />

      {/* 感嘆號符號（在精靈頭頂） */}
      <circle cx="40" cy="12" r="9" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
      <rect x="37.5" y="7" width="5" height="7" rx="2.5" fill="white" />
      <circle cx="40" cy="17" r="2.5" fill="white" />

      {/* 小手 */}
      <circle cx="20" cy="47" r="5" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
      <circle cx="60" cy="47" r="5" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />

      {/* 底部腳 */}
      <ellipse cx="35" cy="64" rx="5" ry="7" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
      <ellipse cx="45" cy="64" rx="5" ry="7" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
    </svg>
  )
}
