import { useState, useRef, useCallback, useImperativeHandle } from 'react'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'
import { generateFlowBoard, checkFlowComplete, type FlowBoard, type Color } from '@/lib/games/flowGenerator'

type PathState = { color: Color; cells: string[] }

interface Props {
  stage: number; difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (r: WinResult) => void; onError: () => void
}

export function useFlowGame({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const [board] = useState<FlowBoard>(() => generateFlowBoard(`flow-${difficulty}-${stage}`, difficulty))
  const [paths, setPaths] = useState<Map<string, PathState>>(new Map())
  const [cellColors, setCellColors] = useState<Map<string, Color>>(new Map())
  const [drawing, setDrawing] = useState<{ color: Color; cells: string[] } | null>(null)
  const hints = useRef(0); const moves = useRef(0)

  const key = (r: number, c: number) => `${r},${c}`

  const startDraw = useCallback((r: number, c: number) => {
    const k = key(r, c)
    const dot = board.dots.get(k)
    const existing = [...paths.values()].find(p => p.cells.includes(k))
    const color: Color = dot ?? (existing?.color ?? '')
    if (!color) return
    const np = new Map(paths); np.delete(color)
    const nc = new Map(cellColors); [...cellColors.entries()].filter(([, c]) => c === color).forEach(([k]) => nc.delete(k))
    setCellColors(nc); setPaths(np)
    setDrawing({ color, cells: [k] })
  }, [board, paths, cellColors])

  const contDraw = useCallback((r: number, c: number) => {
    if (!drawing) return
    const k = key(r, c)
    if (drawing.cells.includes(k)) {
      const idx = drawing.cells.indexOf(k)
      const trimmed = drawing.cells.slice(0, idx + 1)
      const nc = new Map(cellColors)
      drawing.cells.slice(idx + 1).forEach(k2 => { if (cellColors.get(k2) === drawing.color) nc.delete(k2) })
      setCellColors(nc); setDrawing({ ...drawing, cells: trimmed }); return
    }
    const last = drawing.cells[drawing.cells.length - 1]
    const [lr, lc] = last.split(',').map(Number)
    if (Math.abs(lr - r) + Math.abs(lc - c) !== 1) return
    if (cellColors.get(k) && cellColors.get(k) !== drawing.color) return
    if (board.dots.get(k) && board.dots.get(k) !== drawing.color) return
    const nc = new Map(cellColors); nc.set(k, drawing.color)
    setCellColors(nc); setDrawing({ ...drawing, cells: [...drawing.cells, k] })
  }, [drawing, board, cellColors])

  const endDraw = useCallback(() => {
    if (!drawing) return
    const k = drawing.cells[drawing.cells.length - 1]
    const startsAtDot = board.dots.get(drawing.cells[0]) === drawing.color
    const endsAtDot = board.dots.get(k) === drawing.color
    if (startsAtDot && endsAtDot && drawing.cells.length >= 2) {
      moves.current++
      const np = new Map(paths); np.set(drawing.color, { color: drawing.color, cells: drawing.cells })
      const nc = new Map(cellColors); drawing.cells.forEach(k2 => nc.set(k2, drawing.color))
      setPaths(np); setCellColors(nc)
      if (checkFlowComplete(board, np)) setTimeout(() => onWin({ hintsUsed: hints.current, movesCount: moves.current }), 200)
    }
    setDrawing(null)
  }, [drawing, board, paths, cellColors, onWin])

  const applyHint = useCallback(() => {
    for (const [color, solCells] of board.solution) {
      const cur = paths.get(color)?.cells ?? []
      if (cur.length >= solCells.length) continue
      const nextKey = solCells[cur.length] ?? null
      if (!nextKey) continue
      const np = new Map(paths); const nc = new Map(cellColors)
      const old = np.get(color); if (old) old.cells.forEach(k => { if (nc.get(k) === color) nc.delete(k) })
      const newCells = [...cur, nextKey]
      np.set(color, { color, cells: newCells }); newCells.forEach(k => nc.set(k, color))
      setPaths(np); setCellColors(nc); hints.current++; return
    }
  }, [board, paths, cellColors])

  const check = useCallback(() => {
    if (checkFlowComplete(board, paths)) onWin({ hintsUsed: hints.current, movesCount: moves.current }); else onError()
  }, [board, paths, onWin, onError])

  useImperativeHandle(boardRef, () => ({ applyHint, check }), [applyHint, check])
  return { board, paths, cellColors, drawing, startDraw, contDraw, endDraw }
}
