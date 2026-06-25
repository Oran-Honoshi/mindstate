'use client'
import { useRef, useEffect, useState } from 'react'
import { useMinesweeperGame } from './useMinesweeperGame'
import type { MineCell } from '@/lib/games/minesweeperGenerator'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

const MINE_COLORS: Record<number, string> = {
  1: 'var(--accent)',
  2: 'var(--easy)',
  3: 'var(--hard)',
  4: 'var(--violet)',
  5: 'var(--medium)',
  6: 'var(--gold)',
  7: 'var(--text)',
  8: 'var(--muted)',
}

const BOARD_PADDING = 8
const MAX_BOARD_SIZE = 420
const MIN_CELL = 22
const CELL_GAP = 2

function MineIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <circle cx="12" cy="12" r="5" fill="var(--hard)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <line
          key={deg}
          x1={12 + 5.5 * Math.cos((deg * Math.PI) / 180)}
          y1={12 + 5.5 * Math.sin((deg * Math.PI) / 180)}
          x2={12 + 8 * Math.cos((deg * Math.PI) / 180)}
          y2={12 + 8 * Math.sin((deg * Math.PI) / 180)}
          stroke="var(--hard)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
      <circle cx="10" cy="10" r="1.2" fill="white" opacity="0.6" />
    </svg>
  )
}

function FlagIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <line x1="7" y1="4" x2="7" y2="20" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" />
      <polygon points="7,4 18,8 7,12" fill="var(--gold)" />
    </svg>
  )
}

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
  const iconSize = Math.max(10, Math.floor(cellSize * 0.6))

  return (
    <div
      onClick={handleClick}
      onContextMenu={e => { e.preventDefault(); onFlag() }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        width: cellSize,
        height: cellSize,
        borderRadius: Math.max(2, Math.floor(cellSize * 0.15)),
        border: `1px solid ${revealed ? 'var(--border)' : 'var(--surf2)'}`,
        background: revealed
          ? (cell.isMine ? 'rgba(255,80,80,0.15)' : 'var(--surf)')
          : 'var(--surf2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: revealed ? 'default' : 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: Math.max(10, Math.floor(cellSize * 0.55)),
        fontWeight: 700,
        color: MINE_COLORS[n] ?? 'var(--text)',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
      }}
    >
      {revealed && cell.isMine && <MineIcon size={iconSize} />}
      {revealed && !cell.isMine && n > 0 && n}
      {!revealed && cell.flagged && <FlagIcon size={iconSize} />}
    </div>
  )
}

export function MinesweeperBoard({ stage, difficulty, boardRef, onWin, onError, onGameOver }: Props) {
  const { board, gameOver, revealCell, toggleFlag } = useMinesweeperGame({ stage, difficulty, boardRef, onWin, onError, onGameOver })
  const rows = board.cells.length
  const cols = board.cells[0]?.length ?? 0
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(32)

  useEffect(() => {
    if (!rows || !cols) return
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width - BOARD_PADDING * 2
      const h = entry.contentRect.height - BOARD_PADDING * 2
      const available = Math.min(w, h, MAX_BOARD_SIZE)
      const calculated = Math.floor((available - CELL_GAP * (Math.max(rows, cols) - 1)) / Math.max(rows, cols))
      setCellSize(Math.max(MIN_CELL, calculated))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [rows, cols])

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        padding: BOARD_PADDING,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: CELL_GAP, opacity: gameOver ? 0.85 : 1 }}>
        {board.cells.map((row, r) => (
          <div key={r} style={{ display: 'flex', gap: CELL_GAP }}>
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
