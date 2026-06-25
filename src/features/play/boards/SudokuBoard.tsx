'use client'
import { Delete } from 'lucide-react'
import { useSudokuGame } from './useSudokuGame'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

interface Props {
  stage: number; difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (r: WinResult) => void; onError: () => void
}

export function SudokuBoard({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const { data, board, selected, setSelected, errors, input } = useSudokuGame({ stage, difficulty, boardRef, onWin, onError })
  const { sz, puzzle, br, bc } = data
  const maxW = typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 400) : 360
  const cell = Math.floor(maxW / sz)
  const nums = Array.from({ length: sz }, (_, i) => i + 1)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 16 }}>
      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${sz},${cell}px)` }}>
          {puzzle.map((row, r) => row.map((given, c) => {
            const val = board[r][c]
            const isGiven = given !== null
            const isSel = selected?.[0] === r && selected?.[1] === c
            const isErr = errors.has(`${r}-${c}`)
            const rBox = (c + 1) % bc === 0 && c < sz - 1
            const bBox = (r + 1) % br === 0 && r < sz - 1
            return (
              <div key={`${r}-${c}`} onClick={() => { if (!isGiven) setSelected([r, c]) }}
                style={{
                  width: cell, height: cell, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: sz === 6 ? 18 : 13, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  cursor: isGiven ? 'default' : 'pointer',
                  background: isSel ? 'rgba(0,255,255,0.12)' : isErr ? 'rgba(255,80,80,0.08)' : isGiven ? 'var(--surf2)' : 'var(--surf)',
                  color: isGiven ? 'var(--text)' : isErr ? 'var(--hard)' : val ? 'var(--accent)' : 'var(--border)',
                  borderRight: rBox ? '2px solid var(--muted)' : '0.5px solid var(--border)',
                  borderBottom: bBox ? '2px solid var(--muted)' : '0.5px solid var(--border)',
                  borderTop: 'none', borderLeft: 'none',
                  boxShadow: isSel ? 'inset 0 0 0 2px var(--accent)' : 'none',
                }}>
                {val ?? ''}
              </div>
            )
          }))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {nums.map(n => (
          <button key={n} onClick={() => input(n)}
            style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surf)', fontSize: 16, fontWeight: 700, color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font-mono)', outline: 'none' }}>
            {n}
          </button>
        ))}
        <button onClick={() => input(null)}
          style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surf)', cursor: 'pointer', outline: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Delete size={16} color="var(--muted)" />
        </button>
      </div>
    </div>
  )
}
