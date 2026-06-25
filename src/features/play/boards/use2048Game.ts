import { useState, useEffect, useRef, useCallback, useImperativeHandle } from 'react'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

type Grid = number[][]
type Difficulty = 'easy' | 'medium' | 'hard'

function addTile(g: Grid) {
  const empty: number[][] = []; g.forEach((row, r) => row.forEach((v, c) => { if (v === 0) empty.push([r, c]) }))
  if (!empty.length) return
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]; g[r][c] = Math.random() < 0.9 ? 2 : 4
}
function initGrid(seed: number): Grid {
  const g: Grid = Array.from({ length: 4 }, () => Array(4).fill(0)); addTile(g); addTile(g); void seed; return g
}
function compress(row: number[]): { row: number[]; merged: boolean } {
  const nums = row.filter(v => v !== 0); let merged = false
  for (let i = 0; i < nums.length - 1; i++) if (nums[i] === nums[i + 1]) { nums[i] *= 2; nums.splice(i + 1, 1); merged = true }
  while (nums.length < 4) nums.push(0); return { row: nums, merged }
}
function move(g: Grid, dir: 'up' | 'down' | 'left' | 'right'): { grid: Grid; moved: boolean } {
  const ng = g.map(r => [...r]); let moved = false
  if (dir === 'left' || dir === 'right') {
    for (let r = 0; r < 4; r++) {
      const row = dir === 'right' ? [...ng[r]].reverse() : ng[r]
      const { row: nr } = compress(row); const final = dir === 'right' ? [...nr].reverse() : nr
      if (final.some((v, i) => v !== ng[r][i])) moved = true; ng[r] = final
    }
  } else {
    for (let c = 0; c < 4; c++) {
      const col = Array.from({ length: 4 }, (_, r) => ng[r][c])
      const row = dir === 'down' ? [...col].reverse() : col
      const { row: nr } = compress(row); const final = dir === 'down' ? [...nr].reverse() : nr
      if (final.some((v, i) => v !== col[i])) moved = true; final.forEach((v, r) => { ng[r][c] = v })
    }
  }
  return { grid: ng, moved }
}
function hasLost(g: Grid) {
  if (g.some(r => r.some(v => v === 0))) return false
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { if (c < 3 && g[r][c] === g[r][c + 1]) return false; if (r < 3 && g[r][c] === g[r + 1][c]) return false }
  return true
}

const TARGET: Record<Difficulty, number> = { easy: 512, medium: 1024, hard: 2048 }

interface Props {
  stage: number; difficulty: Difficulty
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (r: WinResult) => void; onError: () => void
}

export function use2048Game({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const [grid, setGrid] = useState<Grid>(() => initGrid(stage))
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const hints = useRef(0); const moves = useRef(0)
  const target = TARGET[difficulty]
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const handleMove = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    if (gameState !== 'playing') return
    setGrid(prev => {
      const { grid: ng, moved } = move(prev, dir)
      if (!moved) return prev
      addTile(ng); moves.current++
      if (ng.some(r => r.some(v => v >= target))) { setGameState('won'); setTimeout(() => onWin({ hintsUsed: hints.current, movesCount: moves.current }), 200) }
      else if (hasLost(ng)) setGameState('lost')
      return ng
    })
  }, [gameState, target, onWin])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, 'up' | 'down' | 'left' | 'right'> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }
      if (map[e.key]) { e.preventDefault(); handleMove(map[e.key]) }
    }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [handleMove])

  const applyHint = useCallback(() => { hints.current++ }, [])
  const check = useCallback(() => { if (gameState === 'won') onWin({ hintsUsed: hints.current, movesCount: moves.current }); else onError() }, [gameState, onWin, onError])

  useImperativeHandle(boardRef, () => ({ applyHint, check }), [applyHint, check])
  return { grid, gameState, target, handleMove, touchStart }
}
