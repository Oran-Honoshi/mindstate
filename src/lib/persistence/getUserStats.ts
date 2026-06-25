import { createClient } from '@/lib/supabase/client'

export interface RecentGame {
  slug: string
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  stagesCompleted: number
  currentStage: number
}

export interface GameProgressEntry {
  stagesCompleted: number
  latestStage: number
}

export interface UserStats {
  totalXP: number
  stagesCompleted: number
  currentStreak: number
  longestStreak: number
  gamesPlayed: number
  recentGames: RecentGame[]
  dailyXP: number[]
  gameProgress: Record<string, GameProgressEntry>
}

const GAME_NAMES: Record<string, string> = {
  tango: 'Tango', memory: 'Memory', queens: 'Queens', sudoku: 'Mini Sudoku',
  zip: 'Zip', flow: 'Flow', bridges: 'Bridges', kakuro: 'Kakuro',
  'logic-path': 'Logic Path', lightup: 'Light Up', nonogram: 'Nonogram',
  'pattern-match': 'Pattern Match', patches: 'Patches', '2048-pro': '2048 Pro',
  'gravity-sort': 'Gravity Sort', 'hex-merge': 'Hex Merge', minesweeper: 'Minesweeper',
  'word-sling': 'Word Sling', 'word-climb': 'Word Climb',
  'name-country': 'Name the Country', 'name-city': 'Name the City',
}

const FALLBACK: UserStats = {
  totalXP: 0, stagesCompleted: 0, currentStreak: 0, longestStreak: 0,
  gamesPlayed: 0, recentGames: [], dailyXP: [0, 0, 0, 0, 0, 0, 0], gameProgress: {},
}

export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const supabase = createClient()
    const [profileRes, scoresRes] = await Promise.all([
      supabase.from('profiles')
        .select('current_streak, longest_streak, total_stages_completed')
        .eq('id', userId).single(),
      supabase.from('scores')
        .select('game_slug, stage_number, xp_earned, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false }),
    ])

    const profile = profileRes.data
    const scores = scoresRes.data ?? []
    const totalXP = scores.reduce((s, r) => s + (r.xp_earned ?? 0), 0)

    // Daily XP for last 7 days
    const today = new Date()
    const dailyXP = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      const dateStr = d.toISOString().split('T')[0]
      return scores
        .filter((s) => (s.completed_at ?? '').startsWith(dateStr))
        .reduce((sum, s) => sum + (s.xp_earned ?? 0), 0)
    })

    // Per-game progress
    const gameProgress: Record<string, GameProgressEntry> = {}
    const gameLastDate: Record<string, string> = {}
    scores.forEach((s) => {
      const ex = gameProgress[s.game_slug]
      const date = s.completed_at ?? ''
      if (!ex) {
        gameProgress[s.game_slug] = { stagesCompleted: 1, latestStage: s.stage_number }
        gameLastDate[s.game_slug] = date
      } else {
        ex.stagesCompleted++
        ex.latestStage = Math.max(ex.latestStage, s.stage_number)
        if (date > (gameLastDate[s.game_slug] ?? '')) gameLastDate[s.game_slug] = date
      }
    })

    // Recent games (last 3 played)
    const recentGames: RecentGame[] = Object.entries(gameLastDate)
      .sort(([, a], [, b]) => b.localeCompare(a))
      .slice(0, 3)
      .map(([slug]) => {
        const prog = gameProgress[slug]
        const stagesCompleted = prog?.stagesCompleted ?? 0
        return {
          slug,
          name: GAME_NAMES[slug] ?? slug,
          difficulty: stagesCompleted < 30 ? 'easy' : stagesCompleted < 70 ? 'medium' : 'hard',
          stagesCompleted,
          currentStage: Math.min(prog?.latestStage ?? 0, 99) + 1,
        }
      })

    return {
      totalXP,
      stagesCompleted: profile?.total_stages_completed ?? scores.length,
      currentStreak: profile?.current_streak ?? 0,
      longestStreak: profile?.longest_streak ?? 0,
      gamesPlayed: Object.keys(gameProgress).length,
      recentGames,
      dailyXP,
      gameProgress,
    }
  } catch (err) {
    console.error('getUserStats failed:', err)
    return FALLBACK
  }
}
