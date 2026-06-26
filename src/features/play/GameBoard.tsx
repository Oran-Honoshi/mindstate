'use client'
import React from 'react'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { TangoBoard } from './boards/TangoBoard'
import { MemoryBoard } from './boards/MemoryBoard'
import { QueensBoard } from './boards/QueensBoard'
import { MinesweeperBoard } from './boards/MinesweeperBoard'
import { SudokuBoard } from './boards/SudokuBoard'
import { ZipBoard } from './boards/ZipBoard'
import { BridgesBoard } from './boards/BridgesBoard'
import { FlowBoard } from './boards/FlowBoard'
import { TwentyFortyEightBoard } from './boards/TwentyFortyEightBoard'
import { NonogramBoard } from './boards/NonogramBoard'

export interface WinResult { hintsUsed: number; movesCount: number }
export interface BoardRef { applyHint: () => void; check: () => void }

interface GameBoardProps {
  slug: string
  stage: number
  difficulty: 'easy' | 'medium' | 'hard'
  onWin: (result: WinResult) => void
  onError: () => void
  onGameOver?: () => void
  boardRef?: React.MutableRefObject<BoardRef | null>
}

const BOARD_FALLBACK = (
  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)' }}>
      Failed to load game board. Go back and try again.
    </p>
  </div>
)

export function GameBoard({ slug, stage, difficulty, onWin, onError, onGameOver, boardRef }: GameBoardProps) {
  const internalRef = React.useRef<BoardRef | null>(null)
  const ref = boardRef ?? internalRef
  const props = { stage, difficulty, boardRef: ref, onWin, onError }

  let board: React.ReactElement
  if (slug === 'tango') board = <TangoBoard {...props} />
  else if (slug === 'memory') board = <MemoryBoard {...props} />
  else if (slug === 'queens') board = <QueensBoard {...props} />
  else if (slug === 'minesweeper') board = <MinesweeperBoard {...props} onGameOver={onGameOver} />
  else if (slug === 'sudoku') board = <SudokuBoard {...props} />
  else if (slug === 'zip') board = <ZipBoard {...props} />
  else if (slug === 'bridges') board = <BridgesBoard {...props} />
  else if (slug === 'flow') board = <FlowBoard {...props} />
  else if (slug === '2048-pro') board = <TwentyFortyEightBoard {...props} />
  else if (slug === 'nonogram') board = <NonogramBoard {...props} />
  else board = (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)' }}>
        {slug} · coming soon
      </p>
    </div>
  )

  return (
    <ErrorBoundary game={slug} fallback={BOARD_FALLBACK}>
      {board}
    </ErrorBoundary>
  )
}
