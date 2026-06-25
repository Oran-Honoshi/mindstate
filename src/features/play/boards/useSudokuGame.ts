import { useState, useRef, useCallback, useImperativeHandle } from 'react'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'
import { buildSeed } from '@/lib/games/tangoGenerator'

type Cell = number | null
type SBoard = Cell[][]
type Difficulty = 'easy' | 'medium' | 'hard'

function mb32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function s2n(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0; return Math.abs(h) }
function valid(b: SBoard, r: number, c: number, n: number, sz: number) {
  for (let i = 0; i < sz; i++) if (b[r][i] === n || b[i][c] === n) return false
  const br = sz === 9 ? 3 : 2, bc = sz === 9 ? 3 : 3
  const sr = Math.floor(r / br) * br, sc = Math.floor(c / bc) * bc
  for (let ri = sr; ri < sr + br; ri++) for (let ci = sc; ci < sc + bc; ci++) if (b[ri][ci] === n) return false
  return true
}
function solveB(b: SBoard, sz: number, rng: () => number): boolean {
  for (let r = 0; r < sz; r++) for (let c = 0; c < sz; c++) {
    if (b[r][c] === null) {
      const ns = Array.from({ length: sz }, (_, i) => i + 1)
      for (let i = ns.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [ns[i], ns[j]] = [ns[j], ns[i]] }
      for (const n of ns) { if (valid(b, r, c, n, sz)) { b[r][c] = n; if (solveB(b, sz, rng)) return true; b[r][c] = null } }
      return false
    }
  }
  return true
}
function genSudoku(seed: string, diff: Difficulty) {
  const sz = diff === 'hard' ? 9 : 6, rm = diff === 'easy' ? 18 : diff === 'medium' ? 24 : 51
  const br = diff === 'hard' ? 3 : 2, bc = diff === 'hard' ? 3 : 3
  const rng = mb32(s2n(seed))
  const sol: SBoard = Array.from({ length: sz }, () => Array(sz).fill(null))
  solveB(sol, sz, rng)
  const puzzle: SBoard = sol.map(r => [...r])
  const idx = Array.from({ length: sz * sz }, (_, i) => i)
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]] }
  for (let i = 0; i < rm; i++) puzzle[Math.floor(idx[i] / sz)][idx[i] % sz] = null
  return { sz, sol, puzzle, br, bc }
}

interface Props {
  stage: number; difficulty: Difficulty
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (r: WinResult) => void; onError: () => void
}

export function useSudokuGame({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const [data] = useState(() => genSudoku(buildSeed('sudoku', difficulty, stage), difficulty))
  const [board, setBoard] = useState<SBoard>(() => data.puzzle.map(r => [...r]))
  const [selected, setSelected] = useState<[number, number] | null>(null)
  const [errors, setErrors] = useState<Set<string>>(new Set())
  const hints = useRef(0); const moves = useRef(0)

  const won = useCallback((b: SBoard) =>
    b.every((row, r) => row.every((v, c) => data.puzzle[r][c] !== null || v === data.sol[r][c])) &&
    b.every(row => row.every(v => v !== null))
  , [data])

  const input = useCallback((num: number | null) => {
    if (!selected) return
    const [r, c] = selected
    if (data.puzzle[r][c] !== null) return
    moves.current++
    setBoard(prev => {
      const nb = prev.map(row => [...row]); nb[r][c] = num
      const errs = new Set<string>()
      nb.forEach((row, ri) => row.forEach((v, ci) => { if (data.puzzle[ri][ci] !== null || v === null) return; if (v !== data.sol[ri][ci]) errs.add(`${ri}-${ci}`) }))
      setErrors(errs)
      if (won(nb)) setTimeout(() => onWin({ hintsUsed: hints.current, movesCount: moves.current }), 200)
      return nb
    })
  }, [selected, data, won, onWin])

  const applyHint = useCallback(() => {
    setBoard(prev => {
      const nb = prev.map(r => [...r])
      for (let r = 0; r < data.sz; r++) for (let c = 0; c < data.sz; c++) {
        if (data.puzzle[r][c] === null && nb[r][c] === null) { nb[r][c] = data.sol[r][c]; hints.current++; return nb }
      }
      return nb
    })
  }, [data])

  const check = useCallback(() => {
    if (won(board)) onWin({ hintsUsed: hints.current, movesCount: moves.current }); else onError()
  }, [board, won, onWin, onError])

  useImperativeHandle(boardRef, () => ({ applyHint, check }), [applyHint, check])
  return { data, board, selected, setSelected, errors, input }
}
