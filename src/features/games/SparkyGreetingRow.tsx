'use client'

import { SparkyImg } from '@/components/ui/SparkyImg'
import { Icon } from '@/components/ui/Icon'

interface SparkyGreetingRowProps {
  username: string
  streak: number
  level: number
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function SparkyGreetingRow({ username, streak, level }: SparkyGreetingRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, minHeight: 46 }}>
      <SparkyImg expr="happy" size={46} />
      <div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--text)',
          lineHeight: 1.2,
        }}>
          {getGreeting()}, {username}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginTop: 3,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--muted)',
        }}>
          <Icon name="Flame" size={12} color="var(--medium)" strokeWidth={2} />
          {streak} day streak · Level {level}
        </div>
      </div>
    </div>
  )
}
