'use client'

import { GameIcon, GameId } from '@/components/ui/GameIcon'
import { Bar } from '@/components/ui/Bar'
import { Micro } from '@/components/ui/Micro'

const SLUG_MAP: Record<string, string> = {
  'logic-path': 'logicpath', 'pattern-match': 'patternmatch', '2048-pro': '2048',
  'gravity-sort': 'gravity', 'hex-merge': 'hexmerge', 'word-sling': 'wordsling',
  'word-climb': 'wordclimb', 'name-country': 'namecountry', 'name-city': 'namecity',
}

const DIFF_COLOR: Record<string, string> = {
  easy: 'var(--easy)',
  medium: 'var(--medium)',
  hard: 'var(--hard)',
}

interface RecentGame {
  slug: string
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  stagesCompleted: number
  currentStage: number
}

interface ContinueStripProps {
  recentGames: RecentGame[]
  onSelect: (slug: string) => void
}

export function ContinueStrip({ recentGames, onSelect }: ContinueStripProps) {
  const games = recentGames.slice(0, 3)

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Micro color="var(--muted)">Continue playing</Micro>
      </div>
      <div style={{
        display: 'flex',
        gap: 10,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 8,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      } as React.CSSProperties}>
        {games.map((g) => {
          const gameId = (SLUG_MAP[g.slug] ?? g.slug) as GameId
          const stageProgress = g.stagesCompleted / 100

          return (
            <div
              key={g.slug}
              onClick={() => onSelect(g.slug)}
              style={{
                scrollSnapAlign: 'start',
                flexShrink: 0,
                width: 110,
                background: 'var(--surf)',
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--r-card)',
                padding: '10px 10px 8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <GameIcon game={gameId} size={28} />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: 12,
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {g.name}
                  </div>
                  <Micro color={DIFF_COLOR[g.difficulty]} size={9}>{g.difficulty}</Micro>
                </div>
              </div>
              <Bar colorMode="accent" value={stageProgress} height={3} />
              <Micro color="var(--muted)" size={9}>Stage {g.currentStage}</Micro>
            </div>
          )
        })}
      </div>
    </div>
  )
}
