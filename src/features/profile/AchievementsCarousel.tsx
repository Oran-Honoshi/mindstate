'use client'

import { Icon } from '@/components/ui/Icon'
import { Micro } from '@/components/ui/Micro'
import type { IconName } from '@/components/ui/Icon'

export interface Achievement {
  id: string
  name: string
  description: string
  iconName: IconName
  iconColor: string
  isUnlocked: boolean
}

interface AchievementsCarouselProps {
  achievements: Achievement[]
}

export function AchievementsCarousel({ achievements }: AchievementsCarouselProps) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Micro color="var(--muted)">Achievements</Micro>
      </div>

      {/* Horizontal-only scroll. Page scroll is vertical around this strip. */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: 10,
          paddingBottom: 4,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {achievements.map((a) => (
          <div
            key={a.id}
            style={{
              flexShrink: 0,
              width: 90,
              minHeight: 110,
              scrollSnapAlign: 'start',
              background: a.isUnlocked
                ? `color-mix(in srgb, ${a.iconColor} 8%, var(--surf))`
                : 'var(--surf)',
              border: `0.5px solid ${a.isUnlocked ? a.iconColor + '55' : 'var(--border)'}`,
              borderRadius: 'var(--r-card)',
              padding: '10px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 4,
            }}
          >
            <Icon
              name={a.iconName}
              size={22}
              color={a.isUnlocked ? a.iconColor : 'var(--faint)'}
              strokeWidth={1.8}
              style={{ opacity: a.isUnlocked ? 1 : 0.45 }}
            />
            <div style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 11,
              color: a.isUnlocked ? 'var(--text)' : 'var(--muted)',
            }}>
              {a.name}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: a.isUnlocked ? 'var(--muted)' : 'var(--faint)',
              lineHeight: 1.3,
            }}>
              {a.description}
            </div>
            {a.isUnlocked ? (
              <Micro size={7} color="var(--easy)">Unlocked</Micro>
            ) : (
              <Micro size={7} color="var(--faint)">???</Micro>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
