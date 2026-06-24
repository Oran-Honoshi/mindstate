'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { GameIcon } from '@/components/ui/GameIcon'
import { Bar } from '@/components/ui/Bar'
import { Icon } from '@/components/ui/Icon'
import { Micro } from '@/components/ui/Micro'
import { Btn } from '@/components/ui/Btn'
import type { GameId } from '@/components/ui/GameIcon'

export interface GameMastery {
  slug: string
  name: string
  stagesCompleted: number
}

interface MasteryRowsProps {
  games: GameMastery[]
}

interface TierInfo {
  label: string
  color: string
}

function getTier(stages: number): TierInfo | null {
  if (stages >= 100) return { label: 'Diamond', color: 'var(--violet)' }
  if (stages >= 60)  return { label: 'Gold',    color: 'var(--gold)'   }
  if (stages >= 30)  return { label: 'Silver',  color: 'var(--silver)' }
  if (stages >= 10)  return { label: 'Bronze',  color: 'var(--bronze)' }
  return null
}

export function MasteryRows({ games }: MasteryRowsProps) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? games : games.slice(0, 6)

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Micro color="var(--muted)">Game Mastery</Micro>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visible.map(({ slug, name, stagesCompleted }) => {
          const tier = getTier(stagesCompleted)
          return (
            <Card key={slug} variant="default" padding="12px">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <GameIcon game={slug as GameId} size={36} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      fontSize: 14,
                      color: 'var(--text)',
                    }}>
                      {name}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      color: tier?.color ?? 'var(--faint)',
                      letterSpacing: '0.06em',
                    }}>
                      {tier?.label ?? '–'}
                    </span>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Bar colorMode="accent" value={stagesCompleted / 100} height={4} />
                  </div>
                </div>

                {tier && stagesCompleted >= 10 && (
                  <Icon name="Medal" size={20} color={tier.color} strokeWidth={1.8} />
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {games.length > 6 && !showAll && (
        <div style={{ marginTop: 8 }}>
          <Btn variant="ghost" size="sm" fullWidth={false} onClick={() => setShowAll(true)}>
            Show all {games.length}
          </Btn>
        </div>
      )}
    </div>
  )
}
