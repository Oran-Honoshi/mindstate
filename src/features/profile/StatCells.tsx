'use client'

import { Icon } from '@/components/ui/Icon'
import { Micro } from '@/components/ui/Micro'

interface StatCellsProps {
  totalXP: number
  stagesCompleted: number
  streak: number
  gamesPlayed: number
}

interface CellDef {
  iconName: 'Bolt' | 'Star' | 'Flame' | 'Grid'
  iconColor: string
  value: string
  label: string
  borderRight: boolean
}

export function StatCells({ totalXP, stagesCompleted, streak, gamesPlayed }: StatCellsProps) {
  const cells: CellDef[] = [
    {
      iconName: 'Bolt',
      iconColor: 'var(--gold)',
      value: totalXP.toLocaleString(),
      label: 'total xp',
      borderRight: true,
    },
    {
      iconName: 'Star',
      iconColor: 'var(--accent)',
      value: String(stagesCompleted),
      label: 'stages',
      borderRight: true,
    },
    {
      iconName: 'Flame',
      iconColor: 'var(--hard)',
      value: String(streak),
      label: 'day streak',
      borderRight: true,
    },
    {
      iconName: 'Grid',
      iconColor: 'var(--violet)',
      value: `${gamesPlayed} / 24`,
      label: 'games',
      borderRight: false,
    },
  ]

  return (
    <div style={{
      background: 'var(--surf)',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--r-card)',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      overflow: 'hidden',
    }}>
      {cells.map(({ iconName, iconColor, value, label, borderRight }) => (
        <div
          key={label}
          style={{
            padding: '12px 4px',
            textAlign: 'center',
            borderRight: borderRight ? '0.5px solid var(--border)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <Icon name={iconName} size={14} color={iconColor} strokeWidth={2} />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 18,
            color: 'var(--text)',
          }}>
            {value}
          </div>
          <div style={{ marginTop: 2 }}>
            <Micro size={9} color="var(--muted)">{label}</Micro>
          </div>
        </div>
      ))}
    </div>
  )
}
