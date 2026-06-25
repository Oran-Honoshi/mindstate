import { createClient } from '@/lib/supabase/client'
import { getCompletedStages } from '@/lib/games/stageProgress'

export interface GameProgress {
  stagesCompleted: number
  completedSet: Set<number>
  bestXP: number
}

export async function getGameProgress(
  userId: string,
  gameSlug: string
): Promise<GameProgress> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('scores')
      .select('stage_number, xp_earned')
      .eq('user_id', userId)
      .eq('game_slug', gameSlug)

    if (error || !data) throw error ?? new Error('no data')

    const completedSet = new Set(data.map((s) => s.stage_number as number))
    const bestXP = data.reduce((max, s) => Math.max(max, s.xp_earned as number), 0)
    return { stagesCompleted: completedSet.size, completedSet, bestXP }
  } catch (err) {
    console.error('getGameProgress: falling back to localStorage', err)
    const localSet = getCompletedStages(gameSlug)
    return { stagesCompleted: localSet.size, completedSet: localSet, bestXP: 0 }
  }
}
