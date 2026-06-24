'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { HintModal } from '@/components/modals/HintModal'
import { QuitModal } from '@/components/modals/QuitModal'
import { GameBoard } from '@/features/play/GameBoard'
import type { BoardRef, WinResult } from '@/features/play/GameBoard'
import { PlayTopBar } from './PlayTopBar'
import { PlayFooter } from './PlayFooter'
import { playSuccess, playError } from '@/lib/audio/soundEngine'

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

import type { GameId } from '@/components/ui/GameIcon'

function fmtTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function getDifficulty(stage: number): 'easy' | 'medium' | 'hard' {
  if (stage === 1) return 'medium'
  const h = Math.abs(Math.imul(stage * 2654435761, stage ^ 0x9e3779b9)) % 100
  return h < 20 ? 'easy' : h < 70 ? 'medium' : 'hard'
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
  const difficulty = getDifficulty(stage)

  const [xpRemaining, setXpRemaining] = useState(1000)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [modal, setModal] = useState<'hint' | 'quit' | null>(null)
  const boardRef = useRef<BoardRef | null>(null)

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

  function handleWin(result: WinResult) {
    playSuccess()
    router.push(`/complete/${slug}/${stage}?xp=${xpRemaining}&time=${fmtTime(timerSeconds)}&hints=${result.hintsUsed}`)
  }

  function handleError() { playError() }
  function handleCheck() { boardRef.current?.check?.() }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden', background: 'var(--bg)' }}>
      <PlayTopBar gameName={gameName} gameId={gameId} stage={stage} xpRemaining={xpRemaining} timerSeconds={timerSeconds} onQuit={() => setModal('quit')} />

      <GameBoard
        slug={slug} stage={stage} difficulty={difficulty}
        onWin={handleWin} onError={handleError} boardRef={boardRef}
      />

      <PlayFooter hintsUsed={hintsUsed} onHint={() => setModal('hint')} onCheck={handleCheck} />

      {modal === 'hint' && (
        <HintModal isOpen onClose={() => setModal(null)}
          onUseHint={(tier) => {
            setXpRemaining(x => Math.max(0, x - HINT_COSTS[tier - 1]))
            setHintsUsed(h => h + 1)
            boardRef.current?.applyHint?.()
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
