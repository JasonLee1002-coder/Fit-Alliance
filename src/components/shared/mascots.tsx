'use client'

// ─── AI 播報員 角色 ───
export function BroadcasterMascot({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      {/* Body */}
      <circle cx="50" cy="55" r="32" fill="url(#broadcaster-grad)" />
      {/* Face */}
      <circle cx="50" cy="48" r="26" fill="#fef3c7" />
      {/* Eyes */}
      <circle cx="40" cy="44" r="4" fill="#1e293b" />
      <circle cx="60" cy="44" r="4" fill="#1e293b" />
      <circle cx="41.5" cy="42.5" r="1.5" fill="white" />
      <circle cx="61.5" cy="42.5" r="1.5" fill="white" />
      {/* Blush */}
      <ellipse cx="34" cy="52" rx="5" ry="3" fill="#fda4af" opacity="0.5" />
      <ellipse cx="66" cy="52" rx="5" ry="3" fill="#fda4af" opacity="0.5" />
      {/* Smile */}
      <path d="M42 54 Q50 62 58 54" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      {/* Microphone */}
      <rect x="68" y="30" width="8" height="20" rx="4" fill="#a855f7" />
      <circle cx="72" cy="28" r="8" fill="#c084fc" />
      <circle cx="72" cy="28" r="5" fill="#a855f7" />
      {/* Headphones */}
      <path d="M26 42 Q26 22 50 22 Q74 22 74 42" fill="none" stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" />
      <rect x="20" y="38" width="10" height="14" rx="5" fill="#7c3aed" />
      <rect x="70" y="38" width="10" height="14" rx="5" fill="#7c3aed" />
      {/* Stars */}
      <text x="15" y="25" fontSize="12" className="animate-pulse">✨</text>
      <text x="80" y="20" fontSize="10" style={{ animationDelay: '0.5s' }} className="animate-pulse">⭐</text>
      <defs>
        <linearGradient id="broadcaster-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── AI 教練 角色 ───
export function CoachMascot({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      {/* Body */}
      <circle cx="50" cy="55" r="32" fill="url(#coach-grad)" />
      {/* Face */}
      <circle cx="50" cy="48" r="26" fill="#fef3c7" />
      {/* Eyes - determined */}
      <path d="M36 42 L44 42" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
      <path d="M56 42 L64 42" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
      <circle cx="40" cy="44" r="3" fill="#1e293b" />
      <circle cx="60" cy="44" r="3" fill="#1e293b" />
      <circle cx="41" cy="43" r="1" fill="white" />
      <circle cx="61" cy="43" r="1" fill="white" />
      {/* Blush */}
      <ellipse cx="34" cy="52" rx="5" ry="3" fill="#fda4af" opacity="0.4" />
      <ellipse cx="66" cy="52" rx="5" ry="3" fill="#fda4af" opacity="0.4" />
      {/* Big smile */}
      <path d="M38 54 Q50 66 62 54" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      {/* Whistle */}
      <circle cx="72" cy="58" r="5" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      <rect x="68" y="56" width="6" height="3" rx="1" fill="#f59e0b" />
      {/* Headband */}
      <path d="M24 36 Q50 28 76 36" fill="none" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
      <text x="46" y="36" fontSize="10" fill="white" fontWeight="bold">💪</text>
      {/* Sweat drop */}
      <path d="M78 35 Q80 40 78 42 Q76 40 78 35Z" fill="#93c5fd" opacity="0.7" />
      <defs>
        <linearGradient id="coach-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── 獎盃角色（挑戰賽） ───
export function TrophyMascot({ size = 60, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`yuzu-float ${className}`}>
      {/* Trophy body */}
      <path d="M30 30 L30 55 Q50 75 70 55 L70 30 Z" fill="url(#trophy-grad)" />
      {/* Trophy handles */}
      <path d="M30 35 Q15 35 15 50 Q15 58 25 58" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
      <path d="M70 35 Q85 35 85 50 Q85 58 75 58" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
      {/* Trophy base */}
      <rect x="40" y="72" width="20" height="6" rx="3" fill="#d97706" />
      <rect x="35" y="78" width="30" height="5" rx="2" fill="#b45309" />
      {/* Trophy face */}
      <circle cx="43" cy="46" r="3" fill="#92400e" />
      <circle cx="57" cy="46" r="3" fill="#92400e" />
      <circle cx="44" cy="45" r="1" fill="white" />
      <circle cx="58" cy="45" r="1" fill="white" />
      <path d="M44 54 Q50 60 56 54" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="37" cy="52" rx="4" ry="2.5" fill="#fda4af" opacity="0.4" />
      <ellipse cx="63" cy="52" rx="4" ry="2.5" fill="#fda4af" opacity="0.4" />
      {/* Star */}
      <text x="44" y="40" fontSize="14">⭐</text>
      {/* Sparkles */}
      <text x="10" y="25" fontSize="12" className="animate-pulse">✨</text>
      <text x="78" y="22" fontSize="10" className="animate-pulse" style={{ animationDelay: '0.7s' }}>✨</text>
      <defs>
        <linearGradient id="trophy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── 體重計角色（打卡） ───
export function ScaleMascot({ size = 60, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`yuzu-float ${className}`}>
      {/* Scale body */}
      <rect x="20" y="35" width="60" height="45" rx="12" fill="url(#scale-grad)" />
      {/* Screen */}
      <rect x="30" y="42" width="40" height="18" rx="6" fill="#ecfdf5" />
      <text x="50" y="56" textAnchor="middle" fontSize="12" fill="#059669" fontWeight="bold">OK!</text>
      {/* Face */}
      <circle cx="38" cy="70" r="2.5" fill="#065f46" />
      <circle cx="62" cy="70" r="2.5" fill="#065f46" />
      <path d="M44 76 Q50 80 56 76" fill="none" stroke="#065f46" strokeWidth="2" strokeLinecap="round" />
      {/* Blush */}
      <ellipse cx="32" cy="74" rx="4" ry="2" fill="#fda4af" opacity="0.4" />
      <ellipse cx="68" cy="74" rx="4" ry="2" fill="#fda4af" opacity="0.4" />
      {/* Feet */}
      <ellipse cx="32" cy="82" rx="8" ry="4" fill="#047857" />
      <ellipse cx="68" cy="82" rx="8" ry="4" fill="#047857" />
      {/* Stars */}
      <text x="72" y="35" fontSize="14" className="animate-pulse">⭐</text>
      <text x="12" y="40" fontSize="10" className="animate-pulse" style={{ animationDelay: '0.3s' }}>✨</text>
      <defs>
        <linearGradient id="scale-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── 相機角色（飲食紀錄） ───
export function CameraMascot({ size = 60, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`yuzu-float ${className}`}>
      {/* Camera body */}
      <rect x="18" y="35" width="64" height="42" rx="10" fill="url(#camera-grad)" />
      {/* Flash */}
      <rect x="35" y="28" width="20" height="10" rx="4" fill="#f59e0b" />
      {/* Lens */}
      <circle cx="50" cy="52" r="14" fill="#1e293b" />
      <circle cx="50" cy="52" r="10" fill="#334155" />
      <circle cx="50" cy="52" r="6" fill="#475569" />
      <circle cx="46" cy="48" r="2" fill="white" opacity="0.6" />
      {/* Face (on body) */}
      <circle cx="26" cy="62" r="2" fill="white" />
      <circle cx="74" cy="62" r="2" fill="white" />
      <path d="M30 68 Q50 74 70 68" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      {/* Shutter button */}
      <circle cx="72" cy="36" r="5" fill="#ef4444" />
      <circle cx="72" cy="36" r="3" fill="#fca5a5" />
      {/* Stars */}
      <text x="80" y="30" fontSize="10" className="animate-pulse">📸</text>
      <defs>
        <linearGradient id="camera-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── 空狀態圖示 ───
export function EmptyMascot({ type, size = 80 }: { type: 'no-data' | 'no-challenge' | 'no-meals' | 'success'; size?: number }) {
  const config = {
    'no-data': { emoji: '📊', text: '等你來記錄', bg: '#ecfdf5' },
    'no-challenge': { emoji: '🏆', text: '建立第一個挑戰', bg: '#fef3c7' },
    'no-meals': { emoji: '🍽️', text: '拍張食物照吧', bg: '#faf5ff' },
    'success': { emoji: '🎉', text: '太棒了！', bg: '#ecfdf5' },
  }[type]

  return (
    <div className="flex flex-col items-center yuzu-pop-in">
      <div className="yuzu-float rounded-full p-4" style={{ background: config.bg, width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.5 }}>{config.emoji}</span>
      </div>
    </div>
  )
}
