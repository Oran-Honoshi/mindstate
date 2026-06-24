'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

interface Piece {
  id: number
  left: number
  top: number
  rot: number
  color: string
  w: number
  h: number
  delay: number
}

interface ConfettiStyle extends CSSProperties {
  '--rot'?: string
}

const COLORS = ['var(--accent)', 'var(--gold)', 'var(--violet)', 'var(--easy)']

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

export function ConfettiBurst() {
  const hasRun = useRef(false)
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    const generated: Piece[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: rand(5, 95),
      top:  rand(0, 40),
      rot:  rand(-30, 30),
      color: COLORS[i % COLORS.length],
      w: rand(3, 6),
      h: rand(8, 14),
      delay: rand(0, 0.4),
    }))
    setPieces(generated)
    const t = setTimeout(() => setPieces([]), 2500)
    return () => clearTimeout(t)
  }, [])

  if (!pieces.length) return null

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="ob-confetti"
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.w,
            height: p.h,
            background: p.color,
            borderRadius: 1,
            animationDelay: `${p.delay}s`,
            '--rot': `${p.rot}deg`,
          } as ConfettiStyle}
        />
      ))}
    </div>
  )
}
