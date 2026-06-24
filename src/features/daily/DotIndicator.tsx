'use client'

import { CSSProperties } from 'react'

interface DotIndicatorProps {
  total: number
  currentIndex: number
  completedIndices: number[]
  onDotTap: (i: number) => void
}

export function DotIndicator({ total, currentIndex, completedIndices, onDotTap }: DotIndicatorProps) {
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    padding: '8px 0',
    flexShrink: 0,
  }

  function getDotStyle(i: number): CSSProperties {
    if (i === currentIndex) {
      return {
        width: 20, height: 8, borderRadius: 99,
        background: 'var(--accent)',
        transition: 'width 200ms ease',
        cursor: 'pointer',
      }
    }
    if (completedIndices.includes(i)) {
      return {
        width: 8, height: 8, borderRadius: 99,
        background: 'var(--easy)',
        transition: 'width 200ms ease',
        cursor: 'pointer',
      }
    }
    return {
      width: 8, height: 8, borderRadius: 99,
      background: 'var(--border)',
      transition: 'width 200ms ease',
      cursor: 'pointer',
    }
  }

  return (
    <div style={containerStyle}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={getDotStyle(i)}
          onClick={() => onDotTap(i)}
        />
      ))}
    </div>
  )
}
