'use client'

import { useState, useEffect, CSSProperties } from 'react'
import { Bar } from '@/components/ui/Bar'
import { Icon } from '@/components/ui/Icon'

interface DailyHeaderProps {
  completedCount: number
  resetsAt: Date
}

function formatCountdown(resetsAt: Date): string {
  const diff = Math.max(0, resetsAt.getTime() - Date.now())
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

export function DailyHeader({ completedCount, resetsAt }: DailyHeaderProps) {
  const [countdown, setCountdown] = useState(() => formatCountdown(resetsAt))

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(formatCountdown(resetsAt))
    }, 1000)
    return () => clearInterval(id)
  }, [resetsAt])

  const containerStyle: CSSProperties = {
    flexShrink: 0,
    borderBottom: '0.5px solid var(--border)',
    padding: '0 var(--screen-pad)',
  }

  const row1Style: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
  }

  const titleStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 17,
    color: 'var(--text)',
  }

  const chipStyle: CSSProperties = {
    background: 'var(--surf2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-card-sm)',
    padding: '4px 9px',
    display: 'flex',
    gap: 5,
    alignItems: 'center',
  }

  const countdownStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    color: 'var(--accent)',
    fontWeight: 700,
  }

  const row2Style: CSSProperties = {
    marginTop: 8,
    paddingBottom: 10,
  }

  return (
    <div style={containerStyle}>
      <div style={row1Style}>
        <span style={titleStyle}>Daily Challenges</span>
        <div style={chipStyle}>
          <Icon name="Calendar" size={11} color="var(--muted)" />
          <span style={countdownStyle}>{countdown}</span>
        </div>
      </div>
      <div style={row2Style}>
        <Bar value={completedCount / 8} colorMode="xp" height={6} />
      </div>
    </div>
  )
}
