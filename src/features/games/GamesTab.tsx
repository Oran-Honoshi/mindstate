'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SparkyGreetingRow } from './SparkyGreetingRow'
import { StatCards } from './StatCards'
import { DailyBanner } from './DailyBanner'
import { ContinueStrip } from './ContinueStrip'
import { GameGridTab, GridGame } from './GameGridTab'
import { GAMES } from '@/features/games/GameGrid'

const MOCK_PROGRESS: Record<string, [number, number]> = {
  tango:          [34, 34], memory:     [40, 40], queens:      [12, 12],
  sudoku:         [8,  8],  zip:        [14, 14], flow:        [33, 33],
  bridges:        [5,  5],  kakuro:     [0,  0],  'logic-path':[7,   7],
  lightup:        [19, 19], nonogram:   [2,  2],  'pattern-match':[11, 11],
}

const RECENT_GAMES = [
  { slug: 'tango',  name: 'Tango',  difficulty: 'easy'   as const, stagesCompleted: 34, currentStage: 34 },
  { slug: 'queens', name: 'Queens', difficulty: 'easy'   as const, stagesCompleted: 12, currentStage: 12 },
  { slug: 'memory', name: 'Memory', difficulty: 'easy'   as const, stagesCompleted: 40, currentStage: 40 },
]

export function GamesTab() {
  const router = useRouter()

  const resetsAt = useMemo(() => {
    const d = new Date()
    d.setHours(24, 0, 0, 0)
    return d
  }, [])

  const allGames: GridGame[] = useMemo(() =>
    GAMES.map((g, i) => {
      const [currentStage, stagesCompleted] = MOCK_PROGRESS[g.slug] ?? [0, 0]
      const isUnlocked = i < 12
      return {
        slug: g.slug,
        name: g.name,
        difficulty: g.difficulty,
        currentStage: isUnlocked ? currentStage : 0,
        stagesCompleted: isUnlocked ? stagesCompleted : 0,
        isUnlocked,
        unlockLevel: isUnlocked ? undefined : Math.ceil((i - 11) * 2),
      }
    }), []
  )

  return (
    <div style={{
      padding: '12px var(--screen-pad) 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      paddingBottom: 80,
    }}>
      <SparkyGreetingRow username="Oran" streak={7} level={3} />

      <StatCards
        streak={7}
        level={3}
        levelTitle="Spark"
        currentXP={1840}
        nextLevelXP={2500}
      />

      <DailyBanner
        gameSlug="tango"
        gameName="Tango"
        difficulty="medium"
        resetsAt={resetsAt}
        isCompleted={false}
        onPlay={() => router.push('/daily')}
      />

      {RECENT_GAMES.length > 0 && (
        <ContinueStrip
          recentGames={RECENT_GAMES}
          onSelect={(slug) => router.push(`/lobby/${slug}`)}
        />
      )}

      <GameGridTab
        games={allGames}
        onSelect={(slug) => router.push(`/lobby/${slug}`)}
      />
    </div>
  )
}
