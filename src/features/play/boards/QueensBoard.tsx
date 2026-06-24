'use client'
import { Crown, X } from 'lucide-react'
import { useQueensGame } from './useQueensGame'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

const REGION_COLORS = [
  'rgba(47,230,224,0.2)', 'rgba(255,194,75,0.2)', 'rgba(142,124,255,0.2)', 'rgba(84,208,106,0.2)',
  'rgba(255,92,102,0.2)', 'rgba(245,166,35,0.2)', 'rgba(205,127,50,0.2)', 'rgba(192,192,192,0.2)',
  'rgba(255,100,200,0.2)', 'rgba(100,200,255,0.2)',
]

const CELL_PX = { 6: 48, 8: 38, 10: 30 } as Record<number, number>

interface Props {
  stage: number
  difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (result: WinResult) => void
  onError: () => void
}

export function QueensBoard({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const { board, grid, cellClick, conflictCells } = useQueensGame({ stage, difficulty, boardRef, onWin, onError })
  const { size, regions } = board
  const CELL = CELL_PX[size] ?? 30

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, ${CELL}px)`,
        gridTemplateRows: `repeat(${size}, ${CELL}px)`,
        border: '1.5px solid var(--border)',
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        {Array.from({ length: size }, (_, r) =>
          Array.from({ length: size }, (_, c) => {
            const val = grid[r][c]
            const regionColor = REGION_COLORS[regions[r][c] % REGION_COLORS.length]
            const isConflict = conflictCells.has(`${r},${c}`)
            const borderRight = c < size - 1 && regions[r][c] !== regions[r][c + 1]
            const borderBottom = r < size - 1 && regions[r][c] !== regions[r + 1][c]
            return (
              <div
                key={`${r},${c}`}
                onClick={() => cellClick(r, c)}
                style={{
                  width: CELL, height: CELL,
                  background: isConflict ? 'rgba(255,80,80,0.15)' : regionColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', position: 'relative',
                  borderRight: borderRight ? '1.5px solid var(--border)' : '0.5px solid rgba(128,128,128,0.15)',
                  borderBottom: borderBottom ? '1.5px solid var(--border)' : '0.5px solid rgba(128,128,128,0.15)',
                }}
              >
                {val === 1 && <X size={CELL * 0.45} color="var(--muted)" strokeWidth={2.5} />}
                {val === 2 && (
                  <Crown
                    size={CELL * 0.5}
                    color={isConflict ? 'var(--hard)' : 'var(--text)'}
                    fill={isConflict ? 'rgba(255,80,80,0.3)' : 'rgba(255,255,255,0.1)'}
                  />
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
