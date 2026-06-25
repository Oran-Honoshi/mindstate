'use client'
import { useBridgesGame } from './useBridgesGame'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

interface Props {
  stage: number; difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (r: WinResult) => void; onError: () => void
}

export function BridgesBoard({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const { board, placed, toggle, islandTotal, getBridge, isBlocked } = useBridgesGame({ stage, difficulty, boardRef, onWin, onError })
  const maxW = typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 400) : 360
  const cell = Math.floor(maxW / board.size)
  const off = 3.5

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>CLICK BETWEEN ISLANDS · CLICK AGAIN FOR DOUBLE BRIDGE</div>
      <div style={{ padding: 12, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surf)' }}>
        <svg width={board.size * cell} height={board.size * cell} style={{ display: 'block' }}>
          {board.islands.map(a => board.islands.map(b => {
            if (b.id <= a.id) return null
            const sameRow = a.r === b.r, sameCol = a.c === b.c
            if ((!sameRow && !sameCol) || isBlocked(a, b)) return null
            const br = getBridge(a.id, b.id)
            const x1 = (a.c + 0.5) * cell, y1 = (a.r + 0.5) * cell
            const x2 = (b.c + 0.5) * cell, y2 = (b.r + 0.5) * cell
            const [dx, dy] = a.r === b.r ? [0, off] : [off, 0]
            const col = 'var(--accent)'
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
            return (
              <g key={`${a.id}-${b.id}`} onClick={() => toggle(a.id, b.id)} style={{ cursor: 'pointer' }}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={cell * 0.6} />
                {br?.count === 1 && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={2.5} opacity={0.8} />}
                {br?.count === 2 && <>
                  <line x1={x1 - dx} y1={y1 - dy} x2={x2 - dx} y2={y2 - dy} stroke={col} strokeWidth={2} opacity={0.8} />
                  <line x1={x1 + dx} y1={y1 + dy} x2={x2 + dx} y2={y2 + dy} stroke={col} strokeWidth={2} opacity={0.8} />
                </>}
                {!br && <circle cx={mx} cy={my} r={cell * 0.08} fill="var(--border)" opacity={0.5} />}
              </g>
            )
          }))}
          {board.islands.map(island => {
            const total = islandTotal(island.id)
            const done = total === island.required
            const over = total > island.required
            const x = (island.c + 0.5) * cell, y = (island.r + 0.5) * cell
            const r = cell * 0.28
            const fill = done ? 'var(--easy)' : over ? 'var(--hard)' : 'var(--accent)'
            return (
              <g key={island.id}>
                <circle cx={x} cy={y} r={r} fill={fill} opacity={0.92} />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: Math.round(r * 1.1), fontWeight: 700, fill: '#000', fontFamily: 'var(--font-mono)', userSelect: 'none' }}>
                  {island.required}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
