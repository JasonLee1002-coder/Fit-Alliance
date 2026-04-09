/**
 * 側邊欄導航圖示 — SVG 漫畫風格
 * 全部 inline SVG，不依賴 PNG
 */

interface IconProps {
  size?: number
  className?: string
}

/* 每日打卡 — 體重計 + 愛心 */
export function CheckinIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ci-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </radialGradient>
      </defs>
      {/* 圓形背景 */}
      <circle cx="22" cy="22" r="20" fill="url(#ci-bg)" />
      <circle cx="22" cy="22" r="20" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.5" />
      {/* 體重計 */}
      <rect x="11" y="16" width="22" height="15" rx="4" fill="#022c16" stroke="#34d399" strokeWidth="1.5" />
      <rect x="13" y="18" width="18" height="8" rx="2.5" fill="#033d22" stroke="#16a34a" strokeWidth="1" />
      {/* 數字 */}
      <text x="22" y="25" textAnchor="middle" fontSize="6" fontWeight="900" fill="#4ade80" fontFamily="monospace">72.5</text>
      {/* 底部腳 */}
      <rect x="13" y="30" width="18" height="4" rx="2" fill="#065f46" />
      {/* 愛心 */}
      <path d="M22,14 C22,14 25,10 28,12 C31,14 30,18 22,22 C14,18 13,14 16,12 C19,10 22,14 22,14 Z" fill="#fb7185" stroke="#9d174d" strokeWidth="1" />
    </svg>
  )
}

/* 健康紀錄 — 折線圖 */
export function RecordsIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ri-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="20" fill="url(#ri-bg)" />
      <circle cx="22" cy="22" r="20" fill="none" stroke="#93c5fd" strokeWidth="1.5" opacity="0.5" />
      {/* 圖表背景 */}
      <rect x="10" y="13" width="24" height="18" rx="3" fill="rgba(0,0,0,0.3)" />
      {/* 橫軸 */}
      <line x1="13" y1="28" x2="31" y2="28" stroke="#93c5fd" strokeWidth="1" />
      {/* 折線 */}
      <polyline points="13,26 17,22 21,24 25,18 29,20" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* 數據點 */}
      {[[13,26],[17,22],[21,24],[25,18],[29,20]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="white" />
      ))}
      {/* 趨勢箭頭 */}
      <path d="M29,17 L33,13 M31,13 L33,13 L33,15" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

/* 共同挑戰 — 獎盃 */
export function ChallengeIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="chi-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="20" fill="url(#chi-bg)" />
      <circle cx="22" cy="22" r="20" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
      {/* 獎盃主體 */}
      <path d="M15,14 L15,24 Q15,31 22,31 Q29,31 29,24 L29,14 Z" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
      {/* 光澤 */}
      <path d="M17,14 L17,26 Q17,29 20,30" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
      {/* 把手 */}
      <path d="M15,17 Q10,17 10,21 Q10,25 15,24" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M29,17 Q34,17 34,21 Q34,25 29,24" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
      {/* 底座 */}
      <rect x="18" y="31" width="8" height="3" rx="1" fill="#78350f" />
      <rect x="16" y="34" width="12" height="3" rx="1.5" fill="#92400e" />
      {/* 星星 */}
      <path d="M22,17 L23,20 L26,20 L24,22 L25,25 L22,23 L19,25 L20,22 L18,20 L21,20 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" />
      {/* 閃光 */}
      <line x1="11" y1="11" x2="13" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="33" y1="11" x2="31" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="22" y1="9" x2="22" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

/* 個人邀請朋友 — 兩個人形 + 加號 */
export function InviteIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ii-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="20" fill="url(#ii-bg)" />
      <circle cx="22" cy="22" r="20" fill="none" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.5" />
      {/* 人形 1 (主角) */}
      <circle cx="16" cy="17" r="5" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1.5" />
      <path d="M9,31 Q9,24 16,24 Q23,24 23,31" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="1.5" />
      {/* 人形 2 (被邀請) */}
      <circle cx="28" cy="17" r="4" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="1.5" />
      <path d="M22,31 Q22,25 28,25 Q34,25 34,31" fill="#c4b5fd" stroke="#7c3aed" strokeWidth="1.5" />
      {/* 加號 */}
      <circle cx="33" cy="12" r="6" fill="#4ade80" stroke="#166534" strokeWidth="1.5" />
      <line x1="33" y1="9" x2="33" y2="15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="30" y1="12" x2="36" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* 愛心小裝飾 */}
      <path d="M16,13 C16,13 17.5,11 19,12 C20.5,13 20,15 16,17 C12,15 11.5,13 13,12 C14.5,11 16,13 16,13 Z" fill="#fb7185" opacity="0.8" />
    </svg>
  )
}

/* 問題回報 — 對話框 + 感嘆號 */
export function ReportIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rpi-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#c2410c" />
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="20" fill="url(#rpi-bg)" />
      <circle cx="22" cy="22" r="20" fill="none" stroke="#fdba74" strokeWidth="1.5" opacity="0.5" />
      {/* 主對話框 */}
      <rect x="10" y="13" width="20" height="14" rx="4" fill="#7c2d12" stroke="#fdba74" strokeWidth="1.5" />
      {/* 尾巴 */}
      <path d="M14,27 L12,33 L20,27" fill="#7c2d12" stroke="#fdba74" strokeWidth="1.5" strokeLinejoin="round" />
      {/* 感嘆號 */}
      <rect x="19" y="16" width="3.5" height="7" rx="1.5" fill="#fde68a" />
      <circle cx="20.75" cy="25.5" r="2" fill="#fde68a" />
      {/* 小星星裝飾 */}
      <path d="M32,13 L33,16 L36,16 L34,18 L35,21 L32,19 L29,21 L30,18 L28,16 L31,16 Z" fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" />
    </svg>
  )
}
