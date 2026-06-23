'use client'

import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'
import { Bar } from '@/components/ui/Bar'
import { Micro } from '@/components/ui/Micro'

interface StatCardsProps {
  streak: number
  level: number
  levelTitle: string
  currentXP: number
  nextLevelXP: number
}

export function StatCards({ streak, level, levelTitle, currentXP, nextLevelXP }: StatCardsProps) {
  const xpProgress = nextLevelXP > 0 ? currentXP / nextLevelXP : 0

  return (
    <div style={{ display: 'flex', gap: 'var(--grid-gap)' }}>
      <div style={{ flex: 1 }}>
        <Card padding="12px">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="Flame" size={16} color="var(--hard)" strokeWidth={2} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 22,
              color: 'var(--text)',
              lineHeight: 1,
            }}>
              {streak}
            </span>
          </div>
          <div style={{ marginTop: 6 }}>
            <Micro color="var(--muted)" size={10}>day streak</Micro>
          </div>
        </Card>
      </div>

      <div style={{ flex: 1 }}>
        <Card padding="12px">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name="Crown" size={16} color="var(--gold)" strokeWidth={2} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--text)',
              lineHeight: 1,
            }}>
              Level {level}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>
            {levelTitle}
          </div>
          <div style={{ marginTop: 7 }}>
            <Bar colorMode="xp" value={xpProgress} height={5} />
          </div>
          <div style={{ marginTop: 4 }}>
            <Micro color="var(--muted)" size={10}>{currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP</Micro>
          </div>
        </Card>
      </div>
    </div>
  )
}
