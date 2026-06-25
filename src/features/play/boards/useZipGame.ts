import { useState, useRef, useCallback, useImperativeHandle } from 'react'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'
import { generateZipBoard, type ZipBoard } from '@/lib/games/zipGenerator'

type Pos = [number, number]

function isComplete(path: Pos[], b: ZipBoard) {
  if (path.length !== b.size * b.size) return false
  const set = new Set(path.map(([r, c]) => `${r},${c}`))
  const maxWp = Math.max(...Array.from(b.waypoints.values()))
  const last = path[path.length - 1]
  return b.waypoints.get(`${last[0]},${last[1]}`) === maxWp &&
    [...b.waypoints.keys()].every(k => set.has(k))
}

function tryAdd(r: number, c: number, cur: Pos[], b: ZipBoard): Pos[] | null {
  const set = new Set(cur.map(([pr, pc]) => `${pr},${pc}`))
  const last = cur[cur.length - 1]
  if (cur.length >= 2) { const p = cur[cur.length - 2]; if (p[0] === r && p[1] === c) return cur.slice(0, -1) }
  if (set.has(`${r},${c}`) || Math.abs(last[0] - r) + Math.abs(last[1] - c) !== 1) return null
  const wp = b.waypoints.get(`${r},${c}`)
  if (wp !== undefined) {
    const visited = [...b.waypoints.entries()].filter(([k]) => set.has(k)).map(([, v]) => v)
    const max = visited.length > 0 ? Math.max(...visited) : 0
    if (wp !== max + 1) return null
  }
  return [...cur, [r, c]]
}

interface Props {
  stage: number; difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (r: WinResult) => void; onError: () => void
}

export function useZipGame({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const [board] = useState<ZipBoard>(() => generateZipBoard(`zip-${difficulty}-${stage}`, difficulty))
  const [path, setPath] = useState<Pos[]>(() => [board.path[0]])
  const hints = useRef(0)
  const dragging = useRef(false)

  const interact = useCallback((r: number, c: number) => {
    setPath(prev => {
      const next = tryAdd(r, c, prev, board)
      if (!next) return prev
      if (isComplete(next, board)) setTimeout(() => onWin({ hintsUsed: hints.current, movesCount: next.length }), 200)
      return next
    })
  }, [board, onWin])

  const applyHint = useCallback(() => {
    setPath(prev => {
      const idx = prev.length
      if (idx < board.path.length) { hints.current++; return [...prev, board.path[idx]] }
      return prev
    })
  }, [board])

  const check = useCallback(() => {
    setPath(prev => {
      if (isComplete(prev, board)) onWin({ hintsUsed: hints.current, movesCount: prev.length }); else onError()
      return prev
    })
  }, [board, onWin, onError])

  useImperativeHandle(boardRef, () => ({ applyHint, check }), [applyHint, check])
  return { board, path, interact, dragging, reset: () => setPath([board.path[0]]) }
}
