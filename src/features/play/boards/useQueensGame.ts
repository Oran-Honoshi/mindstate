import { useState, useCallback, useMemo, useRef, useImperativeHandle } from 'react'
import { generateQueensBoard, validateQueens, solveQueens } from '@/lib/games/queensGenerator'
import type { QueensBoard } from '@/lib/games/queensGenerator'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

interface Props {
  stage: number
  difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (result: WinResult) => void
  onError: () => void
}

export function useQueensGame({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const [board] = useState<QueensBoard>(() =>
    generateQueensBoard(`queens-${difficulty}-${stage}`, difficulty)
  )
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: board.size }, () => Array(board.size).fill(0))
  )
  const hintsRef = useRef(0)
  const movesRef = useRef(0)

  const cellClick = useCallback((r: number, c: number) => {
    movesRef.current += 1
    setGrid(prev => {
      const ng = prev.map(row => [...row])
      ng[r][c] = (ng[r][c] + 1) % 3
      if (validateQueens(board, ng)) {
        setTimeout(() => onWin({ hintsUsed: hintsRef.current, movesCount: movesRef.current }), 200)
      }
      return ng
    })
  }, [board, onWin])

  const conflictCells = useMemo(() => {
    const queens: [number, number][] = []
    grid.forEach((row, r) => row.forEach((v, c) => { if (v === 2) queens.push([r, c]) }))
    const bad = new Set<string>()
    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const [r1, c1] = queens[i], [r2, c2] = queens[j]
        const same = r1 === r2 || c1 === c2 || board.regions[r1][c1] === board.regions[r2][c2]
        const adj = Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1
        if (same || adj) { bad.add(`${r1},${c1}`); bad.add(`${r2},${c2}`) }
      }
    }
    return bad
  }, [grid, board])

  const applyHint = useCallback(() => {
    const solution = solveQueens(board.size, board.regions)
    if (!solution) return
    setGrid(prev => {
      const ng = prev.map(row => [...row])
      for (const [r, c] of solution) {
        if (ng[r][c] !== 2) {
          ng[r][c] = 2
          hintsRef.current += 1
          return ng
        }
      }
      return ng
    })
  }, [board])

  const check = useCallback(() => {
    if (!validateQueens(board, grid)) onError()
    else onWin({ hintsUsed: hintsRef.current, movesCount: movesRef.current })
  }, [board, grid, onError, onWin])

  useImperativeHandle(boardRef, () => ({ applyHint, check }), [applyHint, check])

  return { board, grid, cellClick, conflictCells }
}
