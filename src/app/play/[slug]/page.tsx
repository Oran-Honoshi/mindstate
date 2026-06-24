'use client'

import { Suspense, useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { GameIcon } from '@/components/ui/GameIcon'
import type { GameId } from '@/components/ui/GameIcon'
import { HintModal } from '@/components/modals/HintModal'
import { QuitModal } from '@/components/modals/QuitModal'
import { PlayTopBar } from './PlayTopBar'
import { PlayFooter } from './PlayFooter'

const SLUG_MAP: Record<string, string> = {
  'logic-path': 'logicpath', 'pattern-match': 'patternmatch', '2048-pro': '2048',
  'gravity-sort': 'gravity', 'hex-merge': 'hexmerge', 'word-sling': 'wordsling',
  'word-climb': 'wordclimb', 'name-country': 'namecountry', 'name-city': 'namecity',
}
const GAME_NAMES: Record<string, string> = {
  tango:'Tango', memory:'Memory', queens:'Queens', sudoku:'Mini Sudoku',
  zip:'Zip', flow:'Flow', bridges:'Bridges', kakuro:'Kakuro', 'logic-path':'Logic Path',
  lightup:'Light Up', nonogram:'Nonogram', 'pattern-match':'Pattern Match', patches:'Patches',
  '2048-pro':'2048 Pro', 'gravity-sort':'Gravity Sort', 'hex-merge':'Hex Merge',
  'word-sling':'Word Sling', hearts:'Hearts', solitaire:'Solitaire', minesweeper:'Minesweeper',
  'word-climb':'Word Climb', pinpoint:'Pinpoint', 'name-country':'Name the Country', 'name-city':'Name the City',
}

function fmtTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const HINT_COSTS = [50, 150, 400]

function PlayContent() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const stage = parseInt(searchParams.get('stage') ?? '1')
  const timerEnabled = searchParams.get('timer') !== 'false'
  const gameId = (SLUG_MAP[slug] ?? slug) as GameId
  const gameName = GAME_NAMES[slug] ?? slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')

  const [xpRemaining, setXpRemaining] = useState(1000)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [modal, setModal] = useState<'hint' | 'quit' | null>(null)

  useEffect(() => {
    if (!timerEnabled || modal !== null) return
    const id = setInterval(() => setXpRemaining(x => Math.max(0, x - 1)), 250)
    return () => clearInterval(id)
  }, [timerEnabled, modal])

  useEffect(() => {
    if (modal !== null) return
    const id = setInterval(() => setTimerSeconds(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [modal])

  function handleCheck() {
    router.push(`/complete/${slug}/${stage}?xp=${xpRemaining}&time=${fmtTime(timerSeconds)}&hints=${hintsUsed}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: 'var(--bg)' }}>
      <PlayTopBar gameName={gameName} gameId={gameId} stage={stage} xpRemaining={xpRemaining} timerSeconds={timerSeconds} onQuit={() => setModal('quit')} />

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Card variant="default" padding="24px" radius="var(--r-card)">
          <div style={{ textAlign: 'center', maxWidth: 280, width: '100%' }}>
            <div style={{ margin: '0 auto 12px' }}><GameIcon game={gameId} size={52} /></div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)' }}>
              {gameName} board · coming soon
            </p>
          </div>
        </Card>
      </div>

      <PlayFooter hintsUsed={hintsUsed} onHint={() => setModal('hint')} onCheck={handleCheck} />

      {modal === 'hint' && (
        <HintModal isOpen onClose={() => setModal(null)}
          onUseHint={(tier) => {
            setXpRemaining(x => Math.max(0, x - HINT_COSTS[tier - 1]))
            setHintsUsed(h => h + 1)
            setModal(null)
          }}
          xpRemaining={xpRemaining}
        />
      )}
      {modal === 'quit' && (
        <QuitModal isOpen onClose={() => setModal(null)}
          onAbandon={() => router.push(`/stages/${slug}`)}
          timeElapsed={timerSeconds} xpRemaining={xpRemaining} hintsUsed={hintsUsed}
        />
      )}
    </div>
  )
}

export default function PlayPage() {
  return <Suspense><PlayContent /></Suspense>
}
