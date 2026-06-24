import { useState, useCallback, useRef, useImperativeHandle } from 'react'
import { generateTangoBoard, validateBoard, buildSeed } from '@/lib/games/tangoGenerator'
import type { Cell, TangoBoard } from '@/lib/games/tangoGenerator'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

interface Props {
  stage: number
  difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (result: WinResult) => void
  onError: () => void
}

export function useTangoGame({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const [board] = useState<TangoBoard>(() =>
    generateTangoBoard(buildSeed('tango', difficulty, stage), difficulty)
  )
  const [playerGrid, setPlayerGrid] = useState<Cell[][]>(() =>
    board.puzzle.map(row => [...row])
  )
  const hintsRef = useRef(0)
  const movesRef = useRef(0)

  const isWon = useCallback((grid: Cell[][]) =>
    validateBoard(board.puzzle, grid, board.solution)
      .every(row => row.every(s => s === 'correct' || s === 'given'))
  , [board])

  const cellClick = useCallback((r: number, c: number) => {
    if (board.puzzle[r][c] !== null) return
    movesRef.current += 1
    setPlayerGrid(prev => {
      const ng = prev.map(row => [...row])
      ng[r][c] = ng[r][c] === null ? 'S' : ng[r][c] === 'S' ? 'M' : null
      if (isWon(ng)) {
        setTimeout(() => onWin({ hintsUsed: hintsRef.current, movesCount: movesRef.current }), 200)
      }
      return ng
    })
  }, [board.puzzle, isWon, onWin])

  const applyHint = useCallback(() => {
    setPlayerGrid(prev => {
      const ng = prev.map(row => [...row])
      for (let r = 0; r < board.size; r++) {
        for (let c = 0; c < board.size; c++) {
          if (board.puzzle[r][c] === null && ng[r][c] === null) {
            ng[r][c] = board.solution[r][c]
            hintsRef.current += 1
            return ng
          }
        }
      }
      return ng
    })
  }, [board])

  const check = useCallback(() => {
    if (!isWon(playerGrid)) onError()
    else onWin({ hintsUsed: hintsRef.current, movesCount: movesRef.current })
  }, [playerGrid, isWon, onError, onWin])

  useImperativeHandle(boardRef, () => ({ applyHint, check }), [applyHint, check])

  return { board, playerGrid, cellClick }
}
