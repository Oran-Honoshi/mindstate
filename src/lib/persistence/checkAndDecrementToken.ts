import { createClient } from '@/lib/supabase/client'
import { consumeToken, getTokensRemaining } from '@/lib/games/tokenEngine'

export async function checkAndDecrementToken(
  userId: string
): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', userId)
    .single()

  if (data && data.subscription_status !== 'free') {
    return { allowed: true, remaining: 999 }
  }

  const success = consumeToken(userId)
  const remaining = getTokensRemaining(userId)
  return { allowed: success, remaining }
}
