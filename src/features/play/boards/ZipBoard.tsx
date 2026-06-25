'use client'
import { useRef } from 'react'
import { useZipGame } from './useZipGame'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

interface Props {
  stage: number; difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (r: WinResult) => void; onError: () => void
}

export function ZipBoard({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const { board, path, interact, dragging, reset } = useZipGame({ stage, difficulty, boardRef, onWin, onError })
  const containerRef = useRef<HTMLDivElement>(null)
  const pathSet = new Set(path.map(([r, c]) => `${r},${c}`))
  const last = path[path.length - 1]
  const maxW = typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 400) : 360
  const gap = 8
  const cell = Math.floor((maxW - (board.size - 1) * gap) / board.size)
  const svgSize = board.size * (cell + gap) - gap

  function getCell(touch: { clientX: number; clientY: number }): [number, number] | null {
    if (!containerRef.current) return null
    const rect = containerRef.current.getBoundingClientRect()
    const step = cell + gap
    const c = Math.floor((touch.clientX - rect.left) / step)
    const r = Math.floor((touch.clientY - rect.top) / step)
    if (r < 0 || r >= board.size || c < 0 || c >= board.size) return null
    return [r, c]
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 }}>
      <div style={{ padding: 10, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surf)' }}>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} width={svgSize} height={svgSize}>
            {path.slice(1).map(([r, c], i) => {
              const [pr, pc] = path[i]
              const step = cell + gap, cx = cell / 2
              return <line key={i} x1={pc * step + cx} y1={pr * step + cx} x2={c * step + cx} y2={r * step + cx} stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
            })}
          </svg>
          <div ref={containerRef}
            style={{ display: 'grid', gridTemplateColumns: `repeat(${board.size},${cell}px)`, gap, position: 'relative', zIndex: 2, touchAction: 'none' }}
            onMouseLeave={() => { dragging.current = false }}
            onTouchStart={e => { dragging.current = true; const pos = getCell(e.touches[0]); if (pos) interact(pos[0], pos[1]) }}
            onTouchMove={e => { if (!dragging.current) return; const pos = getCell(e.touches[0]); if (pos) interact(pos[0], pos[1]) }}
            onTouchEnd={() => { dragging.current = false }}>
            {Array.from({ length: board.size }, (_, r) => Array.from({ length: board.size }, (_, c) => {
              const key = `${r},${c}`
              const inPath = pathSet.has(key)
              const isLast = last[0] === r && last[1] === c
              const wp = board.waypoints.get(key)
              return (
                <div key={key}
                  onMouseDown={() => { dragging.current = true; interact(r, c) }}
                  onMouseEnter={() => { if (dragging.current) interact(r, c) }}
                  onMouseUp={() => { dragging.current = false }}
                  style={{
                    width: cell, height: cell, borderRadius: Math.round(cell * 0.2),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${isLast ? 'var(--accent)' : wp ? 'var(--accent)' : inPath ? 'rgba(0,255,255,0.35)' : 'var(--border)'}`,
                    background: isLast ? 'rgba(0,255,255,0.14)' : inPath ? 'rgba(0,255,255,0.06)' : 'var(--surf2)',
                    fontSize: Math.round(cell * 0.34), fontWeight: 700, fontFamily: 'var(--font-mono)',
                    color: wp ? 'var(--accent)' : 'var(--muted)',
                    cursor: 'pointer', userSelect: 'none',
                  }}>
                  {wp ?? ''}
                </div>
              )
            }))}
          </div>
        </div>
      </div>
      <button onClick={reset} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}>RESET</button>
    </div>
  )
}
