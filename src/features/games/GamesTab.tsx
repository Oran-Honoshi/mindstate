'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { getUserStats, type UserStats } from '@/lib/persistence/getUserStats'
import { getLevelInfo } from '@/lib/xpLevels'
import { Skeleton } from '@/components/ui/Skeleton'
import { Card } from '@/components/ui/Card'
import { SparkyGreetingRow } from './SparkyGreetingRow'
import { StatCards } from './StatCards'
import { DailyBanner } from './DailyBanner'
import { ContinueStrip } from './ContinueStrip'
import { GameGridTab, GridGame } from './GameGridTab'
import { GAMES } from '@/features/games/GameGrid'

export function GamesTab() {
  const router = useRouter()
  const { user, profile } = useAuthStore()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getUserStats(user.id)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const resetsAt = useMemo(() => {
    const d = new Date()
    d.setHours(24, 0, 0, 0)
    return d
  }, [])

  const totalXP = stats?.totalXP ?? 0
  const levelInfo = getLevelInfo(totalXP)
  const streak = stats?.currentStreak ?? 0
  const username = profile?.username ?? user?.email?.split('@')[0] ?? 'Player'
  const recentGames = stats?.recentGames ?? []

  const allGames: GridGame[] = useMemo(() =>
    GAMES.map((g, i) => {
      const progress = stats?.gameProgress?.[g.slug]
      const isUnlocked = i < 12
      return {
        slug: g.slug,
        name: g.name,
        difficulty: g.difficulty,
        currentStage: isUnlocked ? Math.min((progress?.latestStage ?? 0) + 1, 100) : 0,
        stagesCompleted: isUnlocked ? (progress?.stagesCompleted ?? 0) : 0,
        isUnlocked,
        unlockLevel: isUnlocked ? undefined : Math.ceil((i - 11) * 2),
      }
    }), [stats])

  return (
    <div style={{ padding: '12px var(--screen-pad) 0', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 80 }}>
      <SparkyGreetingRow username={username} streak={streak} level={levelInfo.levelNumber} />

      {loading ? (
        <div style={{ display: 'flex', gap: 'var(--grid-gap)' }}>
          <div style={{ flex: 1 }}><Card padding="12px"><Skeleton height={60} /></Card></div>
          <div style={{ flex: 1 }}><Card padding="12px"><Skeleton height={60} /></Card></div>
        </div>
      ) : (
        <StatCards
          streak={streak}
          level={levelInfo.levelNumber}
          levelTitle={levelInfo.rankName}
          currentXP={levelInfo.currentXP}
          nextLevelXP={levelInfo.nextLevelXP}
        />
      )}

      <DailyBanner
        gameSlug="tango"
        gameName="Tango"
        difficulty="medium"
        resetsAt={resetsAt}
        isCompleted={false}
        onPlay={() => router.push('/daily')}
      />

      {recentGames.length > 0 && (
        <ContinueStrip
          recentGames={recentGames}
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
