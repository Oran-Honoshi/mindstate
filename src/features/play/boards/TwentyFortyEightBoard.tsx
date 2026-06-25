'use client'
import { use2048Game } from './use2048Game'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

const COLORS: Record<number, { bg: string; color: string }> = {
  0: { bg: '#EDE0C8', color: 'transparent' }, 2: { bg: '#EEE4DA', color: '#776E65' }, 4: { bg: '#EDE0C8', color: '#776E65' },
  8: { bg: '#F2B179', color: 'white' }, 16: { bg: '#F59563', color: 'white' }, 32: { bg: '#F67C5F', color: 'white' },
  64: { bg: '#F65E3B', color: 'white' }, 128: { bg: '#EDCF72', color: 'white' }, 256: { bg: '#EDCC61', color: 'white' },
  512: { bg: '#EDC850', color: 'white' }, 1024: { bg: '#EDC53F', color: 'white' }, 2048: { bg: '#EDC22E', color: 'white' },
}
function tileStyle(val: number) { return COLORS[val] ?? { bg: '#3C3A32', color: 'white' } }

interface Props {
  stage: number; difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (r: WinResult) => void; onError: () => void
}

export function TwentyFortyEightBoard({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const { grid, gameState, target, handleMove, touchStart } = use2048Game({ stage, difficulty, boardRef, onWin, onError })
  const maxW = typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 320) : 300
  const cell = Math.floor((maxW - 16) / 4)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>
        {gameState === 'lost' ? 'GAME OVER · RETRY' : `ARROWS OR SWIPE · REACH ${target}`}
      </div>

      <div
        style={{ background: 'var(--surf2)', borderRadius: 12, padding: 8, touchAction: 'none' }}
        onTouchStart={e => { const t = e.touches[0]; touchStart.current = { x: t.clientX, y: t.clientY } }}
        onTouchEnd={e => {
          if (!touchStart.current) return
          const t = e.changedTouches[0]
          const dx = t.clientX - touchStart.current.x, dy = t.clientY - touchStart.current.y
          touchStart.current = null
          if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
          handleMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
        }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(4,${cell}px)`, gap: 6 }}>
          {grid.map((row, r) => row.map((val, c) => {
            const { bg, color } = tileStyle(val)
            const fs = val >= 1000 ? cell * 0.26 : cell * 0.36
            return (
              <div key={`${r}-${c}-${val}`}
                style={{ width: cell, height: cell, borderRadius: 6, background: val === 0 ? '#EDE0C8' : bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fs, fontWeight: 700, color: val === 0 ? 'transparent' : color, fontFamily: 'var(--font-mono)' }}>
                {val || ''}
              </div>
            )
          }))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,44px)', gridTemplateRows: 'repeat(2,44px)', gap: 6 }}>
        {([{ dir: 'up', label: '↑', col: 2, row: 1 }, { dir: 'left', label: '←', col: 1, row: 2 }, { dir: 'down', label: '↓', col: 2, row: 2 }, { dir: 'right', label: '→', col: 3, row: 2 }] as const).map(btn => (
          <button key={btn.dir} onClick={() => handleMove(btn.dir)}
            style={{ gridColumn: btn.col, gridRow: btn.row, width: 44, height: 44, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surf)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', outline: 'none' }}>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  )
}
