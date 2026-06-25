'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usePaywallModal } from '@/store/usePaywallModal'
import { getUserStats, type UserStats } from '@/lib/persistence/getUserStats'
import { getLevelInfo } from '@/lib/xpLevels'
import { ProfileHeroCard } from './ProfileHeroCard'
import { StatCells } from './StatCells'
import { XPSparkline } from './XPSparkline'
import { QuickLinks } from './QuickLinks'
import { AchievementsCarousel } from './AchievementsCarousel'
import { MasteryRows } from './MasteryRows'
import { UpgradeBanner } from './UpgradeBanner'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Achievement } from './AchievementsCarousel'
import type { GameMastery } from './MasteryRows'

const ACHIEVEMENTS: Achievement[] = [
  { id: 'speed',        name: 'Speed Demon',    description: 'Finish a stage under 1:30',   iconName: 'Bolt',   iconColor: 'var(--gold)',   isUnlocked: true  },
  { id: 'streak30',     name: '30-Day Streak',  description: '30 consecutive days',          iconName: 'Flame',  iconColor: 'var(--hard)',   isUnlocked: false },
  { id: 'silver_q',     name: 'Silver Queens',  description: 'Silver mastery in Queens',     iconName: 'Crown',  iconColor: 'var(--silver)', isUnlocked: true  },
  { id: 'century',      name: 'Century Club',   description: 'Complete all 100 stages',      iconName: 'Trophy', iconColor: 'var(--gold)',   isUnlocked: false },
  { id: 'completionist',name: 'Completionist',  description: 'All 24 games started',         iconName: 'Grid',   iconColor: 'var(--violet)', isUnlocked: false },
  { id: 'perfect_day',  name: 'Perfect Day',    description: 'All 8 daily challenges',       iconName: 'Star',   iconColor: 'var(--easy)',   isUnlocked: false },
]

const FALLBACK_STATS: UserStats = {
  totalXP: 0, stagesCompleted: 0, currentStreak: 0, longestStreak: 0,
  gamesPlayed: 0, recentGames: [], dailyXP: [0, 0, 0, 0, 0, 0, 0], gameProgress: {},
}

export function ProfileTab() {
  const { user, profile } = useAuthStore()
  const { open: openPaywall } = usePaywallModal()
  const [stats, setStats] = useState<UserStats>(FALLBACK_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getUserStats(user.id)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const levelInfo = getLevelInfo(stats.totalXP)
  const username = profile?.username ?? user?.email?.split('@')[0] ?? 'Player'
  const isSubscribed = profile?.subscription_status !== 'free'

  const masteryGames: GameMastery[] = Object.entries(stats.gameProgress)
    .filter(([, p]) => p.stagesCompleted > 0)
    .sort(([, a], [, b]) => b.stagesCompleted - a.stagesCompleted)
    .slice(0, 6)
    .map(([slug, p]) => ({
      slug,
      name: slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
      stagesCompleted: p.stagesCompleted,
    }))

  return (
    <div style={{ padding: '12px var(--screen-pad)', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '80px', overflowY: 'auto' }}>
      {loading ? (
        <>
          <Skeleton height={100} radius="var(--r-card)" />
          <Skeleton height={60} radius="var(--r-card)" />
        </>
      ) : (
        <>
          <ProfileHeroCard
            username={username}
            level={levelInfo.levelNumber}
            levelTitle={levelInfo.rankName}
            currentXP={levelInfo.currentXP}
            nextLevelXP={levelInfo.nextLevelXP}
          />
          <StatCells
            totalXP={stats.totalXP}
            stagesCompleted={stats.stagesCompleted}
            streak={stats.currentStreak}
            gamesPlayed={stats.gamesPlayed}
          />
        </>
      )}
      <XPSparkline dailyXP={stats.dailyXP} />
      <QuickLinks isSubscribed={isSubscribed} onOpenPaywall={openPaywall} />
      <AchievementsCarousel achievements={ACHIEVEMENTS} />
      {masteryGames.length > 0 && <MasteryRows games={masteryGames} />}
      {!isSubscribed && <UpgradeBanner isSubscribed={isSubscribed} onOpenPaywall={openPaywall} />}
    </div>
  )
}
