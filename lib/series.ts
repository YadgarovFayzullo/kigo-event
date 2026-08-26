import "server-only"

export type SparkPoint = { label: string; value: number }

/**
 * Turns a list of creation timestamps into a cumulative daily series.
 *
 * The tiles show a running total (30 participants), so the line has to show the
 * same measure growing over time -- not a per-day count, which would tell a
 * different story than the number above it.
 *
 * Days with no registrations are filled in, otherwise a quiet week would render
 * as a straight diagonal and overstate steady growth.
 */
export function cumulativeByDay(
  timestamps: (string | null | undefined)[],
  maxPoints = 30
): SparkPoint[] {
  const days = new Map<string, number>()
  for (const raw of timestamps) {
    if (!raw) continue
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) continue
    const key = date.toISOString().slice(0, 10)
    days.set(key, (days.get(key) ?? 0) + 1)
  }
  if (days.size === 0) return []

  const sorted = [...days.keys()].sort()
  const first = new Date(`${sorted[0]}T00:00:00Z`)
  const last = new Date(`${sorted[sorted.length - 1]}T00:00:00Z`)

  const points: SparkPoint[] = []
  let running = 0
  for (
    let day = new Date(first);
    day <= last;
    day.setUTCDate(day.getUTCDate() + 1)
  ) {
    const key = day.toISOString().slice(0, 10)
    running += days.get(key) ?? 0
    points.push({
      label: `${key.slice(8, 10)}.${key.slice(5, 7)}`,
      value: running,
    })
  }

  // Long ranges get thinned rather than squashed: keep the shape and the end.
  if (points.length <= maxPoints) return points
  const step = (points.length - 1) / (maxPoints - 1)
  return Array.from({ length: maxPoints }, (_, index) =>
    points[Math.round(index * step)]
  )
}
