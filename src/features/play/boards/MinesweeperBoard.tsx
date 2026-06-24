'use client'
import { useRef } from 'react'
import { Flag, Bomb } from 'lucide-react'
import { useMinesweeperGame } from './useMinesweeperGame'
import type { MineCell } from '@/lib/games/minesweeperGenerator'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

const NUM_COLORS = ['', 'var(--accent)', 'var(--easy)', 'var(--hard)', '#60A5FA', '#F87171', '#34D399', 'var(--text)', 'var(--muted)']
const CELL_PX = { easy: 38, medium: 26, hard: 19 }

interface Props {
  stage: number
  difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (result: WinResult) => void
  onError: () => void
  onGameOver?: () => void
}

function MineCellView({ cell, cellSize, onReveal, onFlag }: {
  cell: MineCell; cellSize: number
  onReveal: () => void; onFlag: () => void
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressedRef = useRef(false)

  const handleTouchStart = () => {
    timerRef.current = setTimeout(() => { longPressedRef.current = true; onFlag() }, 500)
  }
  const handleTouchEnd = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }
  const handleClick = () => {
    if (longPressedRef.current) { longPressedRef.current = false; return }
    onReveal()
  }

  const revealed = cell.revealed
  const n = cell.adjacentMines
  return (
    <div
      onClick={handleClick}
      onContextMenu={e => { e.preventDefault(); onFlag() }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        width: cellSize, height: cellSize,
        borderRadius: 4,
        border: `1px solid ${revealed ? 'var(--border)' : 'var(--surf2)'}`,
        background: revealed
          ? (cell.isMine ? 'rgba(255,80,80,0.15)' : 'var(--surf)')
          : 'var(--surf2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: revealed ? 'default' : 'pointer',
        fontFamily: 'var(--font-mono)', fontSize: Math.max(cellSize * 0.45, 10),
        fontWeight: 700, color: NUM_COLORS[n] ?? 'var(--text)',
        userSelect: 'none',
      }}
    >
      {revealed && cell.isMine && <Bomb size={cellSize * 0.55} color="var(--hard)" />}
      {revealed && !cell.isMine && n > 0 && n}
      {!revealed && cell.flagged && <Flag size={cellSize * 0.5} color="var(--hard)" fill="var(--hard)" />}
    </div>
  )
}

export function MinesweeperBoard({ stage, difficulty, boardRef, onWin, onError, onGameOver }: Props) {
  const { board, gameOver, revealCell, toggleFlag } = useMinesweeperGame({ stage, difficulty, boardRef, onWin, onError, onGameOver })
  const cellSize = CELL_PX[difficulty]

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, overflow: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, opacity: gameOver ? 0.85 : 1 }}>
        {board.cells.map((row, r) => (
          <div key={r} style={{ display: 'flex', gap: 2 }}>
            {row.map((cell, c) => (
              <MineCellView
                key={c}
                cell={cell}
                cellSize={cellSize}
                onReveal={() => !gameOver && revealCell(r, c)}
                onFlag={() => !gameOver && toggleFlag(r, c)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
