/**
 * 側邊欄導航圖示 — Gemini 3.1 AI 生成可愛卡通圖示
 */

interface IconProps {
  size?: number
  className?: string
}

export function CheckinIcon({ size = 44, className = '' }: IconProps) {
  return <img src="/nav-icon-checkin.png" alt="每日打卡" width={size} height={size} className={className} style={{ objectFit: 'contain' }} />
}

export function RecordsIcon({ size = 44, className = '' }: IconProps) {
  return <img src="/nav-icon-records.png" alt="健康紀錄" width={size} height={size} className={className} style={{ objectFit: 'contain' }} />
}

export function ChallengeIcon({ size = 44, className = '' }: IconProps) {
  return <img src="/nav-icon-challenge.png" alt="共同挑戰" width={size} height={size} className={className} style={{ objectFit: 'contain' }} />
}

export function InviteIcon({ size = 44, className = '' }: IconProps) {
  return <img src="/nav-icon-invite.png" alt="邀請朋友" width={size} height={size} className={className} style={{ objectFit: 'contain' }} />
}

export function ReportIcon({ size = 44, className = '' }: IconProps) {
  return <img src="/nav-icon-report.png" alt="問題回報" width={size} height={size} className={className} style={{ objectFit: 'contain' }} />
}
