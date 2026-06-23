'use client'

import { CSSProperties } from 'react'

type ColorMode = 'accent' | 'xp' | 'difficulty'

interface BarProps {
  value: number
  height?: number
  colorMode?: ColorMode
  animated?: boolean
  radius?: number
}

function fillStyle(mode: ColorMode, value: number): CSSProperties {
  const clamped = Math.max(0, Math.min(1, value))
  if (mode === 'accent') {
    return { background: 'var(--accent)' }
  }
  if (mode === 'xp') {
    if (clamped < 0.3) {
      return { background: 'linear-gradient(90deg, var(--medium), var(--hard))' }
    }
    return { background: 'linear-gradient(90deg, var(--accent), var(--gold))' }
  }
  // difficulty
  if (clamped > 0.66) return { background: 'var(--easy)' }
  if (clamped > 0.33) return { background: 'var(--medium)' }
  return { background: 'var(--hard)' }
}

export function Bar({
  value,
  height = 6,
  colorMode = 'accent',
  animated = true,
  radius = 99,
}: BarProps) {
  const clamped = Math.max(0, Math.min(1, value))
  const pct = `${clamped * 100}%`

  const trackStyle: CSSProperties = {
    height,
    background: 'var(--surf2)',
    borderRadius: radius,
    overflow: 'hidden',
  }

  const fillCss: CSSProperties = {
    height: '100%',
    width: pct,
    borderRadius: radius,
    transition: animated ? 'width 1s linear' : undefined,
    ...fillStyle(colorMode, clamped),
  }

  return (
    <div style={trackStyle}>
      <div style={fillCss} />
    </div>
  )
}
