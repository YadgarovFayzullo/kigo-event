"use client"

import { useState } from "react"

export type SparkPoint = { label: string; value: number }

/**
 * Cumulative registrations inside a stat tile.
 *
 * One series, so no legend — the tile's own label names it, and the big number
 * is the direct label for the last point. A 2px line on a recessive baseline,
 * with a crosshair and tooltip on hover: an SVG chart on a page is interactive
 * by default, and the numbers between the endpoints are the reason to look.
 *
 * The stroke is the theme's `--chart-2`, which passes the lightness, chroma and
 * contrast checks against both the light and the dark card surface.
 */
export function Sparkline({
  points,
  ariaLabel,
}: {
  points: SparkPoint[]
  ariaLabel: string
}) {
  const [hover, setHover] = useState<number | null>(null)

  // Two points are the minimum that can describe a trend.
  if (points.length < 2) return null

  const width = 200
  const height = 40
  const padY = 4

  const max = Math.max(...points.map((p) => p.value))
  const min = Math.min(...points.map((p) => p.value))
  const span = max - min || 1

  const x = (index: number) => (index / (points.length - 1)) * width
  const y = (value: number) =>
    height - padY - ((value - min) / span) * (height - padY * 2)

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point.value)}`)
    .join(" ")
  const area = `${line} L${width},${height} L0,${height} Z`

  const active = hover === null ? null : points[hover]

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-10 w-full overflow-visible"
        role="img"
        aria-label={ariaLabel}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="spark-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={area} fill="url(#spark-fade)" />
        <path
          d={line}
          fill="none"
          stroke="var(--chart-2)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {active ? (
          <>
            <line
              x1={x(hover!)}
              y1={0}
              x2={x(hover!)}
              y2={height}
              stroke="var(--border)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={x(hover!)}
              cy={y(active.value)}
              r="4"
              fill="var(--chart-2)"
              stroke="var(--card)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </>
        ) : null}

        {/* Invisible hit areas: a 40px-tall band per point beats aiming at a line. */}
        {points.map((point, index) => (
          <rect
            key={point.label}
            x={index === 0 ? 0 : x(index) - width / (points.length - 1) / 2}
            y={0}
            width={width / (points.length - 1)}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHover(index)}
          />
        ))}
      </svg>

      {active ? (
        <div className="pointer-events-none absolute -top-7 left-0 w-full text-center">
          <span className="rounded bg-popover px-1.5 py-0.5 text-xs text-popover-foreground shadow-xs ring-1 ring-foreground/10">
            {active.label} · {active.value}
          </span>
        </div>
      ) : null}
    </div>
  )
}
