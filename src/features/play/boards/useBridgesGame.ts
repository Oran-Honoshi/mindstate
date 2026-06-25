import { useState, useRef, useCallback, useImperativeHandle } from 'react'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'
import { generateBridges, checkBridges, type BridgesBoard, type Bridge } from '@/lib/games/bridgesGenerator'

interface Props {
  stage: number; difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (r: WinResult) => void; onError: () => void
}

export function useBridgesGame({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const [board] = useState<BridgesBoard>(() => generateBridges(`bridges-${difficulty}-${stage}`, difficulty))
  const [placed, setPlaced] = useState<Bridge[]>([])
  const hints = useRef(0); const moves = useRef(0)

  const toggle = useCallback((fromId: number, toId: number) => {
    setPlaced(prev => {
      const ex = prev.find(b => (b.from === fromId && b.to === toId) || (b.from === toId && b.to === fromId))
      let next: Bridge[]
      if (!ex) next = [...prev, { from: fromId, to: toId, count: 1 }]
      else if (ex.count === 1) next = prev.map(b => b === ex ? { ...b, count: 2 as 2 } : b)
      else next = prev.filter(b => b !== ex)
      moves.current++
      if (checkBridges(board, next)) setTimeout(() => onWin({ hintsUsed: hints.current, movesCount: moves.current }), 200)
      return next
    })
  }, [board, onWin])

  const applyHint = useCallback(() => {
    setPlaced(prev => {
      for (const sol of board.solution) {
        const ex = prev.find(b => (b.from === sol.from && b.to === sol.to) || (b.from === sol.to && b.to === sol.from))
        if (!ex) { hints.current++; return [...prev, { from: sol.from, to: sol.to, count: 1 }] }
        if (ex.count < sol.count) { hints.current++; return prev.map(b => ((b.from === sol.from && b.to === sol.to) || (b.from === sol.to && b.to === sol.from)) ? { ...b, count: sol.count } : b) }
      }
      return prev
    })
  }, [board])

  const check = useCallback(() => {
    setPlaced(prev => { if (checkBridges(board, prev)) onWin({ hintsUsed: hints.current, movesCount: moves.current }); else onError(); return prev })
  }, [board, onWin, onError])

  function islandTotal(id: number) { return placed.filter(b => b.from === id || b.to === id).reduce((s, b) => s + b.count, 0) }
  function getBridge(a: number, b: number) { return placed.find(br => (br.from === a && br.to === b) || (br.from === b && br.to === a)) }
  function isBlocked(a: typeof board.islands[0], b: typeof board.islands[0]) {
    const sameRow = a.r === b.r, sameCol = a.c === b.c
    return board.islands.some(m => {
      if (m.id === a.id || m.id === b.id) return false
      if (sameRow && m.r === a.r && Math.min(a.c, b.c) < m.c && m.c < Math.max(a.c, b.c)) return true
      if (sameCol && m.c === a.c && Math.min(a.r, b.r) < m.r && m.r < Math.max(a.r, b.r)) return true
      return false
    })
  }

  useImperativeHandle(boardRef, () => ({ applyHint, check }), [applyHint, check])
  return { board, placed, toggle, islandTotal, getBridge, isBlocked }
}
