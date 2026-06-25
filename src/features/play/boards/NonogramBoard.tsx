'use client'
import { useNonogramGame } from './useNonogramGame'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

interface Props {
  stage: number; difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (r: WinResult) => void; onError: () => void
}

export function NonogramBoard({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const { board, grid, tap, completedRows, completedCols } = useNonogramGame({ stage, difficulty, boardRef, onWin, onError })
  const maxW = typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 400) : 360
  const clueW = Math.min(56, maxW * 0.22)
  const cell = Math.floor((maxW - clueW) / board.size)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 }}>
      <div style={{ padding: 10, borderRadius: 12, border: '1px solid var(--border)', background: 'var(--surf)', display: 'inline-block' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {/* Column clues */}
          <div style={{ display: 'flex', marginLeft: clueW }}>
            {board.colClues.map((clue, c) => (
              <div key={c} style={{ width: cell, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4, minHeight: 36 }}>
                {clue.map((n, i) => (
                  <span key={i} style={{ fontSize: Math.min(cell * 0.38, 11), fontWeight: 700, color: completedCols.has(c) ? 'var(--easy)' : 'var(--muted)', lineHeight: 1.3, fontFamily: 'var(--font-mono)', transition: 'color 0.3s' }}>{n}</span>
                ))}
              </div>
            ))}
          </div>
          {/* Rows */}
          {board.solution.map((_, r) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Row clues */}
              <div style={{ width: clueW, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3, paddingRight: 5, minHeight: cell }}>
                {board.rowClues[r].map((n, i) => (
                  <span key={i} style={{ fontSize: Math.min(12, cell * 0.42), fontWeight: 700, color: completedRows.has(r) ? 'var(--easy)' : 'var(--muted)', fontFamily: 'var(--font-mono)', transition: 'color 0.3s' }}>{n}</span>
                ))}
              </div>
              {/* Cells */}
              {board.solution[r].map((_, c) => {
                const val = grid[r]?.[c]
                const done = completedRows.has(r) || completedCols.has(c)
                return (
                  <button key={c} onClick={() => tap(r, c)}
                    style={{
                      width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: val === true ? (done ? 'color-mix(in srgb, var(--easy) 30%, var(--accent))' : 'var(--accent)') : val === false ? 'rgba(255,80,80,0.08)' : 'var(--surf)',
                      borderRight: '0.5px solid var(--border)', borderBottom: '0.5px solid var(--border)', borderTop: 'none', borderLeft: 'none',
                      cursor: 'pointer', outline: 'none', transition: 'background 0.2s',
                    }}>
                    {val === true && <span style={{ width: cell - 4, height: cell - 4, display: 'block', background: done ? 'var(--easy)' : 'var(--accent)', borderRadius: 2 }} />}
                    {val === false && <span style={{ fontSize: Math.round(cell * 0.52), color: 'var(--hard)', fontWeight: 900, lineHeight: 1, userSelect: 'none', opacity: 0.7 }}>✕</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
