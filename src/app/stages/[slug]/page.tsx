'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import { Bar } from '@/components/ui/Bar'
import { StagePath } from './StagePath'
import { StageIntroModal } from '@/components/modals/StageIntroModal'
import { getLastStage, getCompletedStages } from '@/lib/games/stageProgress'
import { getGameProgress } from '@/lib/persistence/getGameProgress'
import { checkAndDecrementToken } from '@/lib/persistence/checkAndDecrementToken'
import { PaywallModal } from '@/components/modals/PaywallModal'
import { useAuthStore } from '@/store/authStore'

const GAME_NAMES: Record<string, string> = {
  tango:'Tango', memory:'Memory', queens:'Queens', sudoku:'Mini Sudoku',
  zip:'Zip', minesweeper:'Minesweeper', flow:'Flow', nonogram:'Nonogram',
  bridges:'Bridges', 'pattern-match':'Pattern Match', '2048-pro':'2048 Pro',
  kakuro:'Kakuro', 'gravity-sort':'Gravity Sort', 'hex-merge':'Hex Merge',
  'logic-path':'Logic Path', lightup:'Light Up', patches:'Patches',
  'word-sling':'Word Sling', hearts:'Hearts', solitaire:'Solitaire',
  'word-climb':'Word Climb', pinpoint:'Pinpoint',
  'name-country':'Name the Country', 'name-city':'Name the City',
}
const VALID_GAME_SLUGS = new Set(Object.keys(GAME_NAMES))

function getNextUnplayed(completedSet: Set<number>): number {
  for (let s = 1; s <= 100; s++) {
    if (!completedSet.has(s)) return s
  }
  return 100
}

export default function StagesPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { user } = useAuthStore()

  if (!VALID_GAME_SLUGS.has(slug)) notFound()

  const gameName = GAME_NAMES[slug] ?? slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')

  const [lastStage, setLastStage] = useState(1)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [pendingStage, setPendingStage] = useState<number | null>(null)
  const [paywallOpen, setPaywallOpen] = useState(false)

  useEffect(() => {
    // Seed from localStorage immediately for instant render
    setLastStage(getLastStage(slug))
    setCompleted(getCompletedStages(slug))

    if (!user) return
    getGameProgress(user.id, slug)
      .then((progress) => {
        setCompleted(progress.completedSet)
        setLastStage(getNextUnplayed(progress.completedSet))
      })
      .catch((err) => console.error('StagesPage: failed to load progress', err))
  }, [slug, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStart(stage: number, timerEnabled: boolean) {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    const { allowed } = await checkAndDecrementToken(user.id)
    if (!allowed) {
      setPendingStage(null)
      setPaywallOpen(true)
      return
    }
    router.push(`/play/${slug}?stage=${stage}&timer=${timerEnabled}`)
  }

  const pendingDifficulty = pendingStage
    ? (pendingStage <= 30 ? 'easy' : pendingStage <= 70 ? 'medium' : 'hard')
    : 'easy'

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 50, height: 56,
        background: 'var(--surf)', borderBottom: '0.5px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 var(--screen-pad)', gap: 12, flexShrink: 0,
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--text)' }}>
          <Icon name="ChevronLeft" size={22} color="var(--text)" />
        </button>
        <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
          {gameName} · Stages
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
          border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          borderRadius: 99, padding: '4px 10px', color: 'var(--accent)',
        }}>
          {completed.size} / 100
        </span>
      </div>

      <Bar colorMode="accent" value={completed.size / 100} height={4} animated={false} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <StagePath slug={slug} completed={completed} lastStage={lastStage} onStageSelect={setPendingStage} />
      </div>

      {pendingStage !== null && (
        <StageIntroModal
          isOpen
          onClose={() => setPendingStage(null)}
          onStart={handleStart}
          gameSlug={slug}
          gameName={gameName}
          stage={pendingStage}
          difficulty={pendingDifficulty}
          maxXP={1000}
          bestXP={0}
        />
      )}

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onSelectPlan={() => setPaywallOpen(false)}
      />
    </div>
  )
}
