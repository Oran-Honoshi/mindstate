import { saveScore } from '@/lib/supabase/scores'
import { updateStreak } from '@/lib/supabase/streaks'
import { createClient } from '@/lib/supabase/client'

export interface SaveStageResultParams {
  userId: string
  gameSlug: string
  stageNumber: number
  xpEarned: number
  timeSeconds: number
  hintsUsed: number
  difficulty: string
}

export async function saveStageResult({
  userId,
  gameSlug,
  stageNumber,
  xpEarned,
  timeSeconds,
  hintsUsed,
  difficulty,
}: SaveStageResultParams): Promise<void> {
  const [scoreResult] = await Promise.allSettled([
    saveScore({
      user_id: userId,
      game_slug: gameSlug,
      stage_number: stageNumber,
      difficulty,
      xp_earned: xpEarned,
      time_taken: timeSeconds,
      hints_used: hintsUsed,
    }),
    updateStreak(userId),
  ])

  // Increment total_stages_completed only on first completion of this stage
  const wasNew = scoreResult.status === 'fulfilled' && scoreResult.value.data !== null
  if (!wasNew) return

  try {
    const supabase = createClient()
    const { data: prof } = await supabase
      .from('profiles')
      .select('total_stages_completed')
      .eq('id', userId)
      .single()

    if (prof) {
      await supabase
        .from('profiles')
        .update({ total_stages_completed: (prof.total_stages_completed ?? 0) + 1 })
        .eq('id', userId)
    }
  } catch (err) {
    console.error('saveStageResult: failed to update total_stages_completed', err)
  }
}
