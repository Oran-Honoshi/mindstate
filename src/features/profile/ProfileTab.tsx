'use client'

import { usePaywallModal } from '@/store/usePaywallModal'
import { ProfileHeroCard } from './ProfileHeroCard'
import { StatCells } from './StatCells'
import { XPSparkline } from './XPSparkline'
import { QuickLinks } from './QuickLinks'
import { AchievementsCarousel } from './AchievementsCarousel'
import { MasteryRows } from './MasteryRows'
import { UpgradeBanner } from './UpgradeBanner'
import type { Achievement } from './AchievementsCarousel'
import type { GameMastery } from './MasteryRows'

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'speed',
    name: 'Speed Demon',
    description: 'Finish a stage under 1:30',
    iconName: 'Bolt',
    iconColor: 'var(--gold)',
    isUnlocked: true,
  },
  {
    id: 'streak30',
    name: '30-Day Streak',
    description: "30 consecutive days",
    iconName: 'Flame',
    iconColor: 'var(--hard)',
    isUnlocked: false,
  },
  {
    id: 'silver_q',
    name: 'Silver Queens',
    description: 'Silver mastery in Queens',
    iconName: 'Crown',
    iconColor: 'var(--silver)',
    isUnlocked: true,
  },
  {
    id: 'century',
    name: 'Century Club',
    description: 'Complete all 100 stages',
    iconName: 'Trophy',
    iconColor: 'var(--gold)',
    isUnlocked: false,
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'All 24 games started',
    iconName: 'Grid',
    iconColor: 'var(--violet)',
    isUnlocked: false,
  },
  {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'All 8 daily challenges',
    iconName: 'Star',
    iconColor: 'var(--easy)',
    isUnlocked: false,
  },
]

const MASTERY_GAMES: GameMastery[] = [
  { slug: 'tango',       name: 'Tango',       stagesCompleted: 34 },
  { slug: 'queens',      name: 'Queens',      stagesCompleted: 12 },
  { slug: 'memory',      name: 'Memory',      stagesCompleted: 8  },
  { slug: 'sudoku',      name: 'Sudoku',      stagesCompleted: 5  },
  { slug: 'bridges',     name: 'Bridges',     stagesCompleted: 2  },
  { slug: 'minesweeper', name: 'Minesweeper', stagesCompleted: 1  },
]

const DAILY_XP = [120, 340, 0, 580, 240, 420, 640]

// Toggle to false to test UpgradeBanner
const IS_SUBSCRIBED = true

export function ProfileTab() {
  const { open: openPaywall } = usePaywallModal()

  return (
    <div style={{
      padding: '12px var(--screen-pad)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      paddingBottom: '80px',
      overflowY: 'auto',
    }}>
      <ProfileHeroCard
        username="Oran"
        level={7}
        levelTitle="Tactician"
        currentXP={3240}
        nextLevelXP={5000}
      />
      <StatCells
        totalXP={3240}
        stagesCompleted={54}
        streak={14}
        gamesPlayed={6}
      />
      <XPSparkline dailyXP={DAILY_XP} />
      <QuickLinks isSubscribed={IS_SUBSCRIBED} onOpenPaywall={openPaywall} />
      <AchievementsCarousel achievements={ACHIEVEMENTS} />
      <MasteryRows games={MASTERY_GAMES} />
      {!IS_SUBSCRIBED && (
        <UpgradeBanner isSubscribed={IS_SUBSCRIBED} onOpenPaywall={openPaywall} />
      )}
    </div>
  )
}
