import { useState, useCallback, useRef, useImperativeHandle } from 'react'
import { generateMineBoard, revealCells, checkWin } from '@/lib/games/minesweeperGenerator'
import type { MineBoard } from '@/lib/games/minesweeperGenerator'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

interface Props {
  stage: number
  difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (result: WinResult) => void
  onError: () => void
  onGameOver?: () => void
}

export function useMinesweeperGame({ stage, difficulty, boardRef, onWin, onError, onGameOver }: Props) {
  const seed = `minesweeper-${difficulty}-${stage}`
  const [board, setBoard] = useState<MineBoard>(() => generateMineBoard(seed, difficulty))
  const [gameOver, setGameOver] = useState(false)
  const firstClickedRef = useRef(false)
  const hintsRef = useRef(0)
  const movesRef = useRef(0)

  const revealCell = useCallback((r: number, c: number) => {
    if (gameOver) return
    movesRef.current += 1
    setBoard(prev => {
      const isFirst = !firstClickedRef.current
      if (isFirst) firstClickedRef.current = true
      const base = isFirst ? generateMineBoard(seed, difficulty, r, c) : prev
      const cell = base.cells[r]?.[c]
      if (!cell || cell.revealed || cell.flagged) return base
      if (cell.isMine) {
        const exploded = base.cells.map(row =>
          row.map(mc => mc.isMine ? { ...mc, revealed: true } : mc)
        )
        setTimeout(() => { setGameOver(true); onGameOver?.() }, 600)
        return { ...base, cells: exploded }
      }
      const newCells = revealCells(base.cells, r, c, base.rows, base.cols)
      if (checkWin(newCells, base.rows, base.cols)) {
        setTimeout(() => onWin({ hintsUsed: hintsRef.current, movesCount: movesRef.current }), 300)
      }
      return { ...base, cells: newCells }
    })
  }, [gameOver, seed, difficulty, onWin, onGameOver])

  const toggleFlag = useCallback((r: number, c: number) => {
    if (gameOver) return
    setBoard(prev => {
      const cell = prev.cells[r]?.[c]
      if (!cell || cell.revealed) return prev
      const newCells = prev.cells.map((row, ri) =>
        row.map((mc, ci) => ri === r && ci === c ? { ...mc, flagged: !mc.flagged } : mc)
      )
      return { ...prev, cells: newCells }
    })
  }, [gameOver])

  const applyHint = useCallback(() => {
    if (gameOver) return
    hintsRef.current += 1
    setBoard(prev => {
      const safe = prev.cells.flat().filter(c => !c.isMine && !c.revealed && !c.flagged)
      if (safe.length === 0) return prev
      const target = safe[Math.floor(Math.random() * safe.length)]
      const newCells = revealCells(prev.cells, target.row, target.col, prev.rows, prev.cols)
      if (checkWin(newCells, prev.rows, prev.cols)) {
        setTimeout(() => onWin({ hintsUsed: hintsRef.current, movesCount: movesRef.current }), 300)
      }
      return { ...prev, cells: newCells }
    })
  }, [gameOver, onWin])

  const check = useCallback(() => {
    if (!gameOver && !checkWin(board.cells, board.rows, board.cols)) onError()
  }, [gameOver, board, onError])

  useImperativeHandle(boardRef, () => ({ applyHint, check }), [applyHint, check])

  return { board, gameOver, revealCell, toggleFlag }
}
