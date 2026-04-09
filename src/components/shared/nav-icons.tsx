/**
 * 側邊欄導航圖示 — Disney/Pixar 3D 卡通風格 SVG
 * 使用球面漸層、高光、陰影模擬 3D 質感
 */

interface IconProps {
  size?: number
  className?: string
}

/* 每日打卡 — 3D 卡通體重計 + 愛心小人 */
export function CheckinIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* 球面背景漸層 */}
        <radialGradient id="ci-sphere" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="50%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#052e16" />
        </radialGradient>
        {/* 底部陰影 */}
        <radialGradient id="ci-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.5)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <filter id="ci-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,80,40,0.6)" />
        </filter>
      </defs>

      {/* 地面陰影 */}
      <ellipse cx="22" cy="42" rx="14" ry="3" fill="rgba(0,0,0,0.25)" />

      {/* 球形主體 */}
      <circle cx="22" cy="21" r="19" fill="url(#ci-sphere)" filter="url(#ci-drop)" />

      {/* 球面高光 */}
      <ellipse cx="16" cy="13" rx="7" ry="5" fill="rgba(255,255,255,0.35)" transform="rotate(-20,16,13)" />
      <circle cx="13" cy="11" r="2.5" fill="rgba(255,255,255,0.5)" />

      {/* 體重計底座 */}
      <rect x="11" y="28" width="22" height="5" rx="2.5" fill="#14532d" stroke="#166534" strokeWidth="0.8" />

      {/* 體重計主盤 */}
      <ellipse cx="22" cy="26" rx="9" ry="3.5" fill="#166534" stroke="#15803d" strokeWidth="1" />
      <ellipse cx="22" cy="25" rx="8" ry="3" fill="#1a6b38" />

      {/* 顯示屏 */}
      <rect x="16" y="18" width="12" height="7" rx="2" fill="#022c16" stroke="#4ade80" strokeWidth="1" />
      <text x="22" y="24" textAnchor="middle" fontSize="5.5" fontWeight="900" fill="#4ade80" fontFamily="monospace">72.5</text>

      {/* 3D 愛心 */}
      <path d="M22,15 C22,15 26,10 29.5,12.5 C33,15 31,20 22,25 C13,20 11,15 14.5,12.5 C18,10 22,15 22,15 Z"
        fill="#f43f5e" stroke="#9f1239" strokeWidth="1" />
      <path d="M22,15 C22,15 25,11.5 27.5,13 C30,14.5 28.5,18 22,22" fill="rgba(255,150,170,0.4)" />
      <circle cx="26" cy="13.5" r="1.5" fill="rgba(255,255,255,0.6)" />
    </svg>
  )
}

/* 健康紀錄 — 3D 卡通圖表 + 趨勢箭頭小精靈 */
export function RecordsIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ri-sphere" cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </radialGradient>
        <filter id="ri-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(30,50,150,0.6)" />
        </filter>
      </defs>

      <ellipse cx="22" cy="42" rx="14" ry="3" fill="rgba(0,0,0,0.25)" />
      <circle cx="22" cy="21" r="19" fill="url(#ri-sphere)" filter="url(#ri-drop)" />

      {/* 球面高光 */}
      <ellipse cx="16" cy="13" rx="7" ry="5" fill="rgba(255,255,255,0.35)" transform="rotate(-20,16,13)" />
      <circle cx="13" cy="11" r="2.5" fill="rgba(255,255,255,0.5)" />

      {/* 圖表面板 */}
      <rect x="10" y="15" width="24" height="17" rx="3" fill="rgba(0,0,30,0.45)" stroke="rgba(147,197,253,0.4)" strokeWidth="0.8" />

      {/* 網格線 */}
      <line x1="12" y1="22" x2="32" y2="22" stroke="rgba(147,197,253,0.2)" strokeWidth="0.8" />
      <line x1="12" y1="26" x2="32" y2="26" stroke="rgba(147,197,253,0.2)" strokeWidth="0.8" />
      <line x1="18" y1="16" x2="18" y2="31" stroke="rgba(147,197,253,0.2)" strokeWidth="0.8" />
      <line x1="24" y1="16" x2="24" y2="31" stroke="rgba(147,197,253,0.2)" strokeWidth="0.8" />

      {/* 折線 — 帶陰影 */}
      <polyline points="12,28 16,24 20,26 24,19 30,21"
        stroke="rgba(251,191,36,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="12,28 16,24 20,26 24,19 30,21"
        stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* 數據點 */}
      {([[12,28],[16,24],[20,26],[24,19],[30,21]] as [number,number][]).map(([x,y],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="2.5" fill="#1e3a8a" />
          <circle cx={x} cy={y} r="1.5" fill="white" />
        </g>
      ))}

      {/* 上升箭頭 */}
      <path d="M31,18 L34,13 M32.5,13 L34,13 L34,14.5" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

/* 共同挑戰 — 3D 卡通獎盃 */
export function ChallengeIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="chi-sphere" cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#451a03" />
        </radialGradient>
        <radialGradient id="chi-trophy" cx="30%" cy="20%" r="80%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>
        <filter id="chi-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(120,53,15,0.6)" />
        </filter>
        <filter id="chi-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <ellipse cx="22" cy="42" rx="14" ry="3" fill="rgba(0,0,0,0.25)" />
      <circle cx="22" cy="21" r="19" fill="url(#chi-sphere)" filter="url(#chi-drop)" />

      {/* 球面高光 */}
      <ellipse cx="16" cy="13" rx="7" ry="5" fill="rgba(255,255,255,0.35)" transform="rotate(-20,16,13)" />
      <circle cx="13" cy="11" r="2.5" fill="rgba(255,255,255,0.5)" />

      {/* 獎盃主體 */}
      <path d="M15,13 Q14,22 17,26 Q19,29 22,29 Q25,29 27,26 Q30,22 29,13 Z"
        fill="url(#chi-trophy)" stroke="#92400e" strokeWidth="1.2" />

      {/* 獎盃光澤 */}
      <path d="M17,14 Q16.5,20 18,24 Q19.5,27 21,27" stroke="rgba(255,240,200,0.7)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* 把手 */}
      <path d="M15,16 Q9,16 9,21 Q9,26 15,24" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M29,16 Q35,16 35,21 Q35,26 29,24" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
      {/* 把手高光 */}
      <path d="M10.5,17 Q9.5,20 10.5,23" stroke="rgba(255,220,100,0.5)" strokeWidth="1" strokeLinecap="round" fill="none" />

      {/* 底座 */}
      <rect x="18.5" y="29" width="7" height="2.5" rx="1" fill="#92400e" stroke="#78350f" strokeWidth="0.8" />
      <rect x="16.5" y="31.5" width="11" height="2.5" rx="1.5" fill="#a16207" stroke="#78350f" strokeWidth="0.8" />

      {/* 星星 + 閃光 */}
      <path d="M22,16 L23.2,19.4 L26.8,19.4 L23.9,21.5 L25.1,24.9 L22,22.8 L18.9,24.9 L20.1,21.5 L17.2,19.4 L20.8,19.4 Z"
        fill="#fbbf24" stroke="#92400e" strokeWidth="0.8" filter="url(#chi-glow)" />

      {/* 閃光點 */}
      <line x1="10" y1="10" x2="12" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <line x1="34" y1="10" x2="32" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      <line x1="22" y1="8" x2="22" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="9" y1="16" x2="11.5" y2="16" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <line x1="35" y1="16" x2="32.5" y2="16" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

/* 個人邀請朋友 — 3D 卡通兩個小人 + 加號 */
export function InviteIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ii-sphere" cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#2e1065" />
        </radialGradient>
        {/* 人形膚色漸層 */}
        <radialGradient id="ii-skin1" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
        <radialGradient id="ii-skin2" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fecdd3" />
          <stop offset="100%" stopColor="#f43f5e" />
        </radialGradient>
        <filter id="ii-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(60,20,120,0.6)" />
        </filter>
      </defs>

      <ellipse cx="22" cy="42" rx="14" ry="3" fill="rgba(0,0,0,0.25)" />
      <circle cx="22" cy="21" r="19" fill="url(#ii-sphere)" filter="url(#ii-drop)" />

      {/* 球面高光 */}
      <ellipse cx="16" cy="13" rx="7" ry="5" fill="rgba(255,255,255,0.35)" transform="rotate(-20,16,13)" />
      <circle cx="13" cy="11" r="2.5" fill="rgba(255,255,255,0.5)" />

      {/* ── 人物 1（主角，左） ── */}
      {/* 頭 */}
      <circle cx="16" cy="17" r="5.5" fill="url(#ii-skin1)" stroke="#b45309" strokeWidth="0.8" />
      <circle cx="14.5" cy="15.5" r="1.8" fill="rgba(255,255,255,0.45)" />
      {/* 眼睛 */}
      <circle cx="14.5" cy="17" r="1" fill="#1c1917" />
      <circle cx="17.5" cy="17" r="1" fill="#1c1917" />
      <circle cx="14.8" cy="16.7" r="0.4" fill="white" />
      <circle cx="17.8" cy="16.7" r="0.4" fill="white" />
      {/* 笑容 */}
      <path d="M14,19 Q16,21 18,19" stroke="#92400e" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* 身體 */}
      <path d="M11,31 Q11,24 16,24 Q21,24 21,31" fill="#4c1d95" stroke="#3b0764" strokeWidth="0.8" />
      {/* 身體高光 */}
      <path d="M12.5,25 Q12,28 12.5,31" stroke="rgba(196,181,253,0.5)" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* ── 人物 2（朋友，右） ── */}
      {/* 頭 */}
      <circle cx="29" cy="18" r="4.5" fill="url(#ii-skin2)" stroke="#be123c" strokeWidth="0.8" />
      <circle cx="27.8" cy="16.8" r="1.5" fill="rgba(255,255,255,0.4)" />
      {/* 眼睛 */}
      <circle cx="27.5" cy="18" r="0.9" fill="#1c1917" />
      <circle cx="30" cy="18" r="0.9" fill="#1c1917" />
      <circle cx="27.8" cy="17.7" r="0.35" fill="white" />
      <circle cx="30.3" cy="17.7" r="0.35" fill="white" />
      {/* 笑容 */}
      <path d="M27,20 Q29,22 31,20" stroke="#9f1239" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      {/* 身體 */}
      <path d="M24.5,31 Q24.5,25.5 29,25.5 Q33.5,25.5 33.5,31" fill="#be123c" stroke="#9f1239" strokeWidth="0.8" />
      <path d="M26,26.5 Q25.5,29 26,31" stroke="rgba(253,164,175,0.5)" strokeWidth="1.2" strokeLinecap="round" fill="none" />

      {/* 加號徽章 */}
      <circle cx="34" cy="11" r="6" fill="#22c55e" stroke="#14532d" strokeWidth="1.2" />
      <circle cx="32.5" cy="9.8" r="2" fill="rgba(255,255,255,0.4)" />
      <line x1="34" y1="8" x2="34" y2="14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="31" y1="11" x2="37" y2="11" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

/* 問題回報 — 3D 卡通感嘆號小精靈 */
export function ReportIcon({ size = 44, className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rpi-sphere" cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#431407" />
        </radialGradient>
        {/* 對話框漸層 */}
        <radialGradient id="rpi-bubble" cx="30%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#fff7ed" />
          <stop offset="60%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#9a3412" />
        </radialGradient>
        <filter id="rpi-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(120,40,10,0.6)" />
        </filter>
        <filter id="rpi-bubble-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="rgba(0,0,0,0.3)" />
        </filter>
      </defs>

      <ellipse cx="22" cy="42" rx="14" ry="3" fill="rgba(0,0,0,0.25)" />
      <circle cx="22" cy="21" r="19" fill="url(#rpi-sphere)" filter="url(#rpi-drop)" />

      {/* 球面高光 */}
      <ellipse cx="16" cy="13" rx="7" ry="5" fill="rgba(255,255,255,0.35)" transform="rotate(-20,16,13)" />
      <circle cx="13" cy="11" r="2.5" fill="rgba(255,255,255,0.5)" />

      {/* 對話框主體 */}
      <rect x="9" y="12" width="22" height="15" rx="4.5" fill="url(#rpi-bubble)" stroke="#c2410c" strokeWidth="1.2" filter="url(#rpi-bubble-shadow)" />

      {/* 對話框高光 */}
      <ellipse cx="16" cy="15" rx="6" ry="2.5" fill="rgba(255,255,255,0.5)" />

      {/* 對話框尾巴 */}
      <path d="M13,27 L11,34 L20,27" fill="url(#rpi-bubble)" stroke="#c2410c" strokeWidth="1.2" strokeLinejoin="round" />

      {/* 感嘆號 */}
      <rect x="19" y="15" width="4" height="7" rx="2" fill="#ea580c" stroke="#9a3412" strokeWidth="0.6" />
      <circle cx="21" cy="25" r="2.2" fill="#ea580c" stroke="#9a3412" strokeWidth="0.6" />

      {/* 感嘆號光澤 */}
      <rect x="19.5" y="15.5" width="2" height="3" rx="1" fill="rgba(255,255,255,0.55)" />
      <circle cx="20.3" cy="24.5" r="0.8" fill="rgba(255,255,255,0.55)" />

      {/* 星星裝飾 */}
      <path d="M32,12 L33,15 L36,15 L33.8,17 L34.8,20 L32,18.2 L29.2,20 L30.2,17 L28,15 L31,15 Z"
        fill="#fbbf24" stroke="#92400e" strokeWidth="0.7" />
      <circle cx="30.5" cy="14" r="1" fill="rgba(255,255,255,0.6)" />
    </svg>
  )
}
