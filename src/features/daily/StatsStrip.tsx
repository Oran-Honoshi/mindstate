'use client'

import { CSSProperties } from 'react'
import { Icon } from '@/components/ui/Icon'

interface StatsStripProps {
  totalXP: number
  completedCount: number
  streak: number
}

export function StatsStrip({ totalXP, completedCount, streak }: StatsStripProps) {
  const containerStyle: CSSProperties = {
    height: 52,
    flexShrink: 0,
    background: 'var(--surf)',
    borderTop: '0.5px solid var(--border)',
    display: 'flex',
  }

  const cellStyle: CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  }

  const cellWithRightBorder: CSSProperties = {
    ...cellStyle,
    borderRight: '1px solid var(--border)',
  }

  const valueStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 15,
    color: 'var(--text)',
    lineHeight: 1,
  }

  const labelStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    color: 'var(--muted)',
  }

  return (
    <div style={containerStyle}>
      <div style={cellWithRightBorder}>
        <Icon name="Bolt" size={16} color="var(--gold)" />
        <span style={valueStyle}>{totalXP}</span>
        <span style={labelStyle}>XP today</span>
      </div>
      <div style={cellWithRightBorder}>
        <Icon name="Check" size={16} color="var(--easy)" />
        <span style={valueStyle}>{completedCount} / 8</span>
        <span style={labelStyle}>completed</span>
      </div>
      <div style={cellStyle}>
        <Icon name="Flame" size={16} color="var(--hard)" />
        <span style={valueStyle}>{streak}</span>
        <span style={labelStyle}>day streak</span>
      </div>
    </div>
  )
}
