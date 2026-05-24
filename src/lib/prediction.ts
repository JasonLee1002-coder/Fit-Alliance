export interface WeightPoint {
  date: string
  weight: number
}

export function predictWeight(
  records: WeightPoint[],
  targetWeight: number | null,
  daysAhead = 30
): { predictedPoints: { date: string; weight: number }[]; targetDate: string | null; slopePerDay: number } | null {
  if (records.length < 3) return null

  const pts = records.slice(-14)
  const n = pts.length
  const base = new Date(pts[0].date).getTime()
  const xs = pts.map(p => (new Date(p.date).getTime() - base) / 86400000)
  const ys = pts.map(p => p.weight)

  const sumX = xs.reduce((a, b) => a + b, 0)
  const sumY = ys.reduce((a, b) => a + b, 0)
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0)
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const todayX = (Date.now() - base) / 86400000
  const predictedPoints = Array.from({ length: daysAhead }, (_, i) => {
    const dayX = todayX + i
    const date = new Date(base + dayX * 86400000).toISOString().split('T')[0]
    const weight = +Math.max(30, slope * dayX + intercept).toFixed(1)
    return { date, weight }
  })

  let targetDate: string | null = null
  if (targetWeight && slope < 0) {
    const daysToTarget = (targetWeight - intercept) / slope
    if (daysToTarget > todayX && daysToTarget < todayX + 365) {
      targetDate = new Date(base + daysToTarget * 86400000).toISOString().split('T')[0]
    }
  }

  return { predictedPoints, targetDate, slopePerDay: +slope.toFixed(3) }
}
