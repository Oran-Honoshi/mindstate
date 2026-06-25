'use client'
import { useRef, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useQueensGame } from './useQueensGame'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

/* intentional — Queens region palette */
const REGION_COLORS = [
  { bg: 'rgba(47,230,224,0.15)',  border: 'rgba(47,230,224,0.3)'  },
  { bg: 'rgba(255,194,75,0.15)',  border: 'rgba(255,194,75,0.3)'  },
  { bg: 'rgba(142,124,255,0.15)', border: 'rgba(142,124,255,0.3)' },
  { bg: 'rgba(84,208,106,0.15)',  border: 'rgba(84,208,106,0.3)'  },
  { bg: 'rgba(255,92,102,0.15)',  border: 'rgba(255,92,102,0.3)'  },
  { bg: 'rgba(245,166,35,0.15)',  border: 'rgba(245,166,35,0.3)'  },
  { bg: 'rgba(255,150,200,0.15)', border: 'rgba(255,150,200,0.3)' },
  { bg: 'rgba(150,230,255,0.15)', border: 'rgba(150,230,255,0.3)' },
]

const BOARD_PADDING = 16
const MAX_BOARD_SIZE = 420

function CrownIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path
        d="M3 17l2-8 4 4 3-7 3 7 4-4 2 8H3z"
        fill={color}
        stroke={color}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(38)

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
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
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
            const iconSize = Math.floor(cellSize * 0.5)
            return (
              <div
                key={`${r},${c}`}
                onClick={() => cellClick(r, c)}
                style={{
                  width: cellSize,
                  height: cellSize,
                  background: isConflict ? 'rgba(255,80,80,0.15)' : regionColor.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  borderRight: borderRight
                    ? `1.5px solid ${regionColor.border}`
                    : `0.5px solid ${regionColor.border}`,
                  borderBottom: borderBottom
                    ? `1.5px solid ${regionColor.border}`
                    : `0.5px solid ${regionColor.border}`,
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  userSelect: 'none',
                }}
              >
                {val === 1 && <X size={iconSize} color="var(--muted)" strokeWidth={2.5} />}
                {val === 2 && (
                  <CrownIcon
                    size={iconSize}
                    color={isConflict ? 'var(--hard)' : 'var(--text)'}
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
