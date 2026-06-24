'use client'

import { CSSProperties } from 'react'
import { SparkyImg, SparkyExpr } from '@/components/ui/SparkyImg'
import { Icon } from '@/components/ui/Icon'

interface SparkyCoachingStripProps {
  completedCount: number
  totalXPEarned: number
}

function getExprAndMessage(n: number): { expr: SparkyExpr; message: string } {
  if (n === 0) return { expr: 'idle',      message: "Let's go! 8 challenges today." }
  if (n <= 3)  return { expr: 'happy',     message: `${n} done — keep it up!` }
  if (n <= 7)  return { expr: 'focused',   message: `${n}/8 — you're on fire!` }
  return             { expr: 'celebrate',  message: 'All 8 done! Perfect day!' }
}

export function SparkyCoachingStrip({ completedCount, totalXPEarned }: SparkyCoachingStripProps) {
  const { expr, message } = getExprAndMessage(completedCount)

  const containerStyle: CSSProperties = {
    margin: '8px var(--screen-pad) 0',
    flexShrink: 0,
    background: 'var(--surf)',
    borderRadius: 'var(--r-card)',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const leftStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  }

  const sparkyWrapStyle: CSSProperties = {
    animation: 'sparkyfade 300ms ease-out',
  }

  const messageStyle: CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: 13,
    color: 'var(--text)',
  }

  const rightStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  }

  const xpStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 13,
    color: 'var(--gold)',
  }

  return (
    <div style={containerStyle}>
      <div style={leftStyle}>
        <div key={expr} style={sparkyWrapStyle}>
          <SparkyImg expr={expr} size={32} />
        </div>
        <span style={messageStyle}>{message}</span>
      </div>
      <div style={rightStyle}>
        <Icon name="Bolt" size={14} color="var(--gold)" />
        <span style={xpStyle}>+{totalXPEarned}</span>
      </div>
    </div>
  )
}
