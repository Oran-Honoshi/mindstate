'use client'

import { Micro } from '@/components/ui/Micro'

interface XPSparklineProps {
  /** Exactly 7 values — one per day, most recent last */
  dailyXP: number[]
}

export function XPSparkline({ dailyXP }: XPSparklineProps) {
  const weeklyTotal = dailyXP.reduce((s, v) => s + v, 0)
  const max = Math.max(...dailyXP, 1)
  const n = dailyXP.length

  // Normalized to viewBox "0 0 100 40", y-inverted (0=top)
  const pts = dailyXP.map((v, i) => ({
    x: n > 1 ? (i / (n - 1)) * 100 : 50,
    y: 40 - (v / max) * 36,
  }))

  const linePath = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ')

  const areaPath = `${linePath} L100,40 L0,40 Z`

  return (
    <div style={{
      background: 'var(--surf)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--r-card)',
      padding: 12,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <Micro color="var(--muted)">This Week</Micro>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--gold)',
        }}>
          +{weeklyTotal.toLocaleString()} XP
        </span>
      </div>
      <svg
        width="100%"
        height="48"
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        <path
          d={areaPath}
          fill="color-mix(in srgb, var(--accent) 20%, transparent)"
        />
        <path
          d={linePath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
