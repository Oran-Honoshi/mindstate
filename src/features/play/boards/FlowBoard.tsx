'use client'
import { useFlowGame } from './useFlowGame'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

interface Props {
  stage: number; difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (r: WinResult) => void; onError: () => void
}

export function FlowBoard({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const { board, paths, cellColors, drawing, startDraw, contDraw, endDraw } = useFlowGame({ stage, difficulty, boardRef, onWin, onError })
  const maxW = typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 400) : 360
  const cell = Math.floor(maxW / board.size)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
        FLOWS {paths.size}/{board.colors.length} · DRAG DOT TO DOT · FILL ALL CELLS
      </div>
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', cursor: 'crosshair', touchAction: 'none', userSelect: 'none' }}
        onMouseLeave={endDraw}
        onTouchMove={e => {
          e.preventDefault()
          const t = e.touches[0]
          const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null
          if (el?.dataset.ck) { const [r, c] = el.dataset.ck.split(',').map(Number); contDraw(r, c) }
        }}
        onTouchEnd={endDraw}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${board.size},${cell}px)` }}>
          {Array.from({ length: board.size }, (_, r) => Array.from({ length: board.size }, (_, c) => {
            const k = `${r},${c}`
            const dot = board.dots.get(k)
            const cc = drawing?.cells.includes(k) ? drawing.color : cellColors.get(k)
            return (
              <div key={k} data-ck={k}
                onMouseDown={() => startDraw(r, c)}
                onMouseEnter={() => contDraw(r, c)}
                onMouseUp={endDraw}
                onTouchStart={e => { e.preventDefault(); startDraw(r, c) }}
                style={{
                  width: cell, height: cell, position: 'relative',
                  background: cc ? cc + '22' : 'var(--surf)',
                  borderRight: `1px solid var(--border)`, borderBottom: `1px solid var(--border)`,
                  borderTop: 'none', borderLeft: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                {cc && !dot && (
                  <div style={{ position: 'absolute', inset: 5, borderRadius: 3, background: cc, opacity: 0.75 }} />
                )}
                {dot && (
                  <div style={{ width: cell * 0.55, height: cell * 0.55, borderRadius: '50%', background: dot, position: 'relative', zIndex: 2 }} />
                )}
              </div>
            )
          }))}
        </div>
      </div>
    </div>
  )
}
