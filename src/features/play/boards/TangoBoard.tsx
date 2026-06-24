'use client'
import { useMemo } from 'react'
import { Sun, Moon } from 'lucide-react'
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

const CELL_PX = { 4: 72, 6: 52, 8: 40 } as Record<number, number>
const GAP = 4
const BADGE = 20

export function TangoBoard({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const { board, playerGrid, cellClick } = useTangoGame({ stage, difficulty, boardRef, onWin, onError })
  const { size, puzzle, constraints } = board
  const CELL = CELL_PX[size] ?? 40
  const boardPx = size * CELL + (size - 1) * GAP

  const cx = (c: number) => c * (CELL + GAP) + CELL / 2
  const cy = (r: number) => r * (CELL + GAP) + CELL / 2

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
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
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
                  left: c * (CELL + GAP), top: r * (CELL + GAP),
                  width: CELL, height: CELL, borderRadius: 8,
                  border: `1.5px solid ${isErr ? 'var(--hard)' : 'var(--border)'}`,
                  background: given ? 'var(--surf2)' : isErr ? 'rgba(255,80,80,0.08)' : 'var(--surf)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: given ? 'default' : 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                {val === 'S' && <Sun size={CELL * 0.42} color="var(--gold)" />}
                {val === 'M' && <Moon size={CELL * 0.42} color="var(--accent)" />}
              </div>
            )
          })
        )}
        {constraints.map((con, i) => {
          const bx = (cx(con.col1) + cx(con.col2)) / 2 - BADGE / 2
          const by = (cy(con.row1) + cy(con.row2)) / 2 - BADGE / 2
          return (
            <div key={i} style={{
              position: 'absolute', left: bx, top: by,
              width: BADGE, height: BADGE, borderRadius: '50%',
              border: '1.5px solid var(--border)', background: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              color: 'var(--text)', zIndex: 2, pointerEvents: 'none',
            }}>
              {con.type === 'same' ? '=' : '×'}
            </div>
          )
        })}
      </div>
    </div>
  )
}
