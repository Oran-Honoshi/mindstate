'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { triggerConfetti } from '@/components/effects/Confetti'
import { markStageCompleted } from '@/lib/games/stageProgress'
import { saveStageResult } from '@/lib/persistence/saveStageResult'
import { useAuthStore } from '@/store/authStore'
import { SparkyImg } from '@/components/ui/SparkyImg'
import type { SparkyExpr } from '@/components/ui/SparkyImg'
import { GameIcon } from '@/components/ui/GameIcon'
import type { GameId } from '@/components/ui/GameIcon'
import { Icon } from '@/components/ui/Icon'
import { Card } from '@/components/ui/Card'
import { Btn } from '@/components/ui/Btn'
import { ToastCelebration } from '@/components/celebrations/ToastCelebration'
import { CardCelebration } from '@/components/celebrations/CardCelebration'
import { useCompleteCelebrations } from './useCompleteCelebrations'
import { GAMES } from '@/features/games/GameGrid'

const SLUG_MAP: Record<string, string> = {
  'logic-path': 'logicpath', 'pattern-match': 'patternmatch', '2048-pro': '2048',
  'gravity-sort': 'gravity', 'hex-merge': 'hexmerge', 'word-sling': 'wordsling',
  'word-climb': 'wordclimb', 'name-country': 'namecountry', 'name-city': 'namecity',
}

function parseTimeSecs(t: string): number {
  if (t === '—') return 0
  const parts = t.split(':').map(Number)
  return (parts[0] || 0) * 60 + (parts[1] || 0)
}

function writeDailyCompletion(slug: string, xpEarned: number) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const key = `me-daily-${today}`
    const existing = JSON.parse(localStorage.getItem(key) ?? '{}') as Record<string, { xpEarned: number }>
    if (!existing[slug]) {
      existing[slug] = { xpEarned }
      localStorage.setItem(key, JSON.stringify(existing))
    }
  } catch {}
}

function StageCompleteContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)

  const slug = params.slug as string
  const stageN = parseInt(params.stage as string, 10)
  const xp = parseInt(searchParams.get('xp') ?? '0', 10)
  const time = searchParams.get('time') ?? '—'
  const hints = parseInt(searchParams.get('hints') ?? '0', 10)
  const isDaily = searchParams.get('daily') === 'true'

  const gameId = (SLUG_MAP[slug] ?? slug) as GameId
  const gameName = GAMES.find(g => g.slug === slug)?.name ?? slug
  const starsEarned = xp >= 800 ? 3 : xp >= 500 ? 2 : 1
  const sparkyExpr: SparkyExpr = xp >= 800 ? 'celebrate' : xp >= 500 ? 'happy' : xp >= 200 ? 'focused' : 'surprised'
  const { state: cel, dismiss } = useCompleteCelebrations(xp, stageN, slug, gameName)

  useEffect(() => {
    markStageCompleted(slug, stageN)
    if (isDaily) writeDailyCompletion(slug, xp)
    if (!user) return
    const difficulty = stageN <= 30 ? 'easy' : stageN <= 70 ? 'medium' : 'hard'
    saveStageResult({
      userId: user.id,
      gameSlug: slug,
      stageNumber: stageN,
      xpEarned: xp,
      timeSeconds: parseTimeSecs(time),
      hintsUsed: hints,
      difficulty,
    }).catch((err) => console.error('saveStageResult failed:', err))
  }, [slug, stageN]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(triggerConfetti, 300)
    return () => clearTimeout(t)
  }, [])

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', minHeight: '100dvh', background: 'var(--bg)', padding: '48px var(--screen-pad) 32px', textAlign: 'center' }}>
      <GameIcon game={gameId} size={52} />
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '16px 0' }}>
        {[1, 2, 3].map(n => (
          <Icon key={n} name="Star" size={28} color={n <= starsEarned ? 'var(--gold)' : 'var(--surf2)'} strokeWidth={n <= starsEarned ? 2 : 1.5} />
        ))}
      </div>
      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 52, color: 'var(--accent)', lineHeight: 1, margin: 0 }}>+{xp}</p>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.14em', marginBottom: 8 }}>XP EARNED</p>
      <SparkyImg size={52} expr={sparkyExpr} />
      <Card variant="default" padding="0" radius="var(--r-card)">
        <div style={{ display: 'flex', margin: '16px 0 24px' }}>
          {[{ v: time, l: 'time' }, { v: String(stageN), l: 'stage' }, { v: String(hints), l: 'hints used' }].map((s, i) => (
            <div key={s.l} style={{ flex: 1, textAlign: 'center', padding: '14px 8px', borderLeft: i > 0 ? '0.5px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{s.v}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        <Btn variant="ghost" size="md" onClick={handleShare}>
          <Icon name="Share" size={16} color="var(--accent)" style={{ marginRight: 6 }} />
          {copied ? 'Copied!' : 'Share Challenge'}
        </Btn>
        <Btn variant="primary" size="lg" onClick={() => router.push(`/stages/${slug}`)}>
          Next Stage →
        </Btn>
      </div>
      <AnimatePresence>
        {cel.showToast && <ToastCelebration key="toast" xpEarned={xp} timeTaken={parseTimeSecs(time)} hintsUsed={hints} onDismiss={() => dismiss('showToast')} />}
        {cel.showCard && <CardCelebration key="card" title={stageN % 10 === 0 ? `Stage ${stageN} Milestone!` : 'Achievement!'} description={stageN % 10 === 0 ? `You've cleared ${stageN} stages in ${gameName}. Keep pushing!` : 'A new achievement unlocked.'} onDismiss={() => dismiss('showCard')} />}
      </AnimatePresence>
    </div>
  )
}

export default function StageCompletePage() {
  return <Suspense><StageCompleteContent /></Suspense>
}
