'use client'
import { useRef, useEffect, useState, useMemo } from 'react'
import { useTangoGame } from './useTangoGame'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

interface Props {
  stage: number
  difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (result: WinResult) => void
  onError: () => void
}

const BOARD_PADDING = 16
const MAX_BOARD_SIZE = 420
const GAP = 4
const BADGE = 20

function SunIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <circle cx="12" cy="12" r="5" fill="var(--gold)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <line
          key={deg}
          x1={12 + 8 * Math.cos((deg * Math.PI) / 180)}
          y1={12 + 8 * Math.sin((deg * Math.PI) / 180)}
          x2={12 + 10 * Math.cos((deg * Math.PI) / 180)}
          y2={12 + 10 * Math.sin((deg * Math.PI) / 180)}
          stroke="var(--gold)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

function MoonIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="var(--accent)" stroke="none" />
    </svg>
  )
}

export function TangoBoard({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const { board, playerGrid, cellClick } = useTangoGame({ stage, difficulty, boardRef, onWin, onError })
  const { size, puzzle, constraints } = board
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(44)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width - BOARD_PADDING * 2
      const h = entry.contentRect.height - BOARD_PADDING * 2
      const available = Math.min(w, h, MAX_BOARD_SIZE)
      setCellSize(Math.floor(available / size))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [size])

  const iconSize = Math.floor(cellSize * 0.55)
  const boardPx = size * cellSize + (size - 1) * GAP
  const cx = (c: number) => c * (cellSize + GAP) + cellSize / 2
  const cy = (r: number) => r * (cellSize + GAP) + cellSize / 2

  const errorCells = useMemo(() => {
    const bad = new Set<string>()
    for (let r = 0; r < size; r++) {
      const s = playerGrid[r].filter(v => v === 'S').length
      const m = playerGrid[r].filter(v => v === 'M').length
      if (s > size / 2 || m > size / 2) {
        for (let c = 0; c < size; c++) bad.add(`${r},${c}`)
      }
    }
    for (let c = 0; c < size; c++) {
      const col = playerGrid.map(row => row[c])
      const s = col.filter(v => v === 'S').length
      const m = col.filter(v => v === 'M').length
      if (s > size / 2 || m > size / 2) {
        for (let r = 0; r < size; r++) bad.add(`${r},${c}`)
      }
    }
    return bad
  }, [playerGrid, size])

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: BOARD_PADDING,
      }}
    >
      <div style={{ position: 'relative', width: boardPx, height: boardPx }}>
        {Array.from({ length: size }, (_, r) =>
          Array.from({ length: size }, (_, c) => {
            const val = playerGrid[r][c]
            const given = puzzle[r][c] !== null
            const isErr = errorCells.has(`${r},${c}`) && val !== null
            return (
              <div
                key={`${r},${c}`}
                onClick={() => cellClick(r, c)}
                style={{
                  position: 'absolute',
                  left: c * (cellSize + GAP),
                  top: r * (cellSize + GAP),
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 8,
                  border: `1.5px solid ${isErr ? 'var(--hard)' : 'var(--border)'}`,
                  background: given ? 'var(--surf2)' : isErr ? 'rgba(255,80,80,0.08)' : 'var(--surf)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: given ? 'default' : 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  userSelect: 'none',
                }}
              >
                {val === 'S' && <SunIcon size={iconSize} />}
                {val === 'M' && <MoonIcon size={iconSize} />}
              </div>
            )
          })
        )}
        {constraints.map((con, i) => {
          const bx = (cx(con.col1) + cx(con.col2)) / 2 - BADGE / 2
          const by = (cy(con.row1) + cy(con.row2)) / 2 - BADGE / 2
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: bx,
                top: by,
                width: BADGE,
                height: BADGE,
                borderRadius: '50%',
                border: '1.5px solid var(--border)',
                background: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text)',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            >
              {con.type === 'same' ? '=' : '×'}
            </div>
          )
        })}
      </div>
    </div>
  )
}
