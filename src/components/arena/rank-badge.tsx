interface RankBadgeProps {
  rankChange: number
}

export function RankBadge({ rankChange }: RankBadgeProps) {
  if (rankChange === 0) return null
  const isUp = rankChange > 0
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ml-1 ${
      isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
    }`}>
      {isUp ? '▲' : '▼'}{Math.abs(rankChange)}
    </span>
  )
}
