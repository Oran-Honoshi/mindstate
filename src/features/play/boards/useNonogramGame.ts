import { useState, useRef, useCallback, useImperativeHandle } from 'react'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'
import { generateNonogram, checkNonogram, type NonogramBoard } from '@/lib/games/nonogramGenerator'

interface Props {
  stage: number; difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (r: WinResult) => void; onError: () => void
}

export function useNonogramGame({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const [board] = useState<NonogramBoard>(() => generateNonogram(`nono-${difficulty}-${stage}`, difficulty))
  const [grid, setGrid] = useState<(boolean | null)[][]>(() => Array.from({ length: board.size }, () => Array(board.size).fill(null)))
  const hints = useRef(0); const moves = useRef(0)

  const tap = useCallback((r: number, c: number) => {
    setGrid(prev => {
      const ng = prev.map(row => [...row])
      ng[r][c] = ng[r][c] === null ? true : ng[r][c] === true ? false : null
      moves.current++
      if (checkNonogram(board, ng)) setTimeout(() => onWin({ hintsUsed: hints.current, movesCount: moves.current }), 200)
      return ng
    })
  }, [board, onWin])

  const applyHint = useCallback(() => {
    setGrid(prev => {
      const ng = prev.map(r => [...r])
      for (let r = 0; r < board.size; r++) {
        if (ng[r].every(v => v === null)) { ng[r] = board.solution[r].map(v => v); hints.current++; return ng }
      }
      for (let r = 0; r < board.size; r++) for (let c = 0; c < board.size; c++) {
        if (ng[r][c] === null) { ng[r][c] = board.solution[r][c]; hints.current++; return ng }
      }
      return ng
    })
  }, [board])

  const check = useCallback(() => {
    if (checkNonogram(board, grid)) onWin({ hintsUsed: hints.current, movesCount: moves.current }); else onError()
  }, [board, grid, onWin, onError])

  const completedRows = new Set<number>()
  const completedCols = new Set<number>()
  for (let r = 0; r < board.size; r++) if (grid[r]?.every((v, c) => v === board.solution[r][c])) completedRows.add(r)
  for (let c = 0; c < board.size; c++) if (board.solution.every((row, r) => grid[r]?.[c] === row[c])) completedCols.add(c)

  useImperativeHandle(boardRef, () => ({ applyHint, check }), [applyHint, check])
  return { board, grid, tap, completedRows, completedCols }
}
