'use client'
import React from 'react'
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

export function GameBoard({ slug, stage, difficulty, onWin, onError, onGameOver, boardRef }: GameBoardProps) {
  const internalRef = React.useRef<BoardRef | null>(null)
  const ref = boardRef ?? internalRef
  const props = { stage, difficulty, boardRef: ref, onWin, onError }

  if (slug === 'tango') return <TangoBoard {...props} />
  if (slug === 'memory') return <MemoryBoard {...props} />
  if (slug === 'queens') return <QueensBoard {...props} />
  if (slug === 'minesweeper') return <MinesweeperBoard {...props} onGameOver={onGameOver} />
  if (slug === 'sudoku') return <SudokuBoard {...props} />
  if (slug === 'zip') return <ZipBoard {...props} />
  if (slug === 'bridges') return <BridgesBoard {...props} />
  if (slug === 'flow') return <FlowBoard {...props} />
  if (slug === '2048-pro') return <TwentyFortyEightBoard {...props} />
  if (slug === 'nonogram') return <NonogramBoard {...props} />

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)' }}>
        {slug} · coming soon
      </p>
    </div>
  )
}
