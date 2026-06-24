import { useState, useCallback, useRef, useImperativeHandle } from 'react'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

export type MemoryCard = { id: number; iconIdx: number; flipped: boolean; matched: boolean }
const PAIRS = { easy: 6, medium: 10, hard: 15 }

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeBoard(stage: number, difficulty: 'easy' | 'medium' | 'hard'): MemoryCard[] {
  const rng = mulberry32(stage * 2654435761 ^ 0x9e3779b9)
  const pairs = PAIRS[difficulty]
  const indices = Array.from({ length: 21 }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]]
  }
  const chosen = indices.slice(0, pairs)
  const cards: MemoryCard[] = [...chosen, ...chosen].map((iconIdx, id) => ({ id, iconIdx, flipped: false, matched: false }))
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]]
  }
  return cards.map((c, id) => ({ ...c, id }))
}

interface Props {
  stage: number
  difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (result: WinResult) => void
  onError: () => void
}

export function useMemoryGame({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const [cards, setCards] = useState<MemoryCard[]>(() => makeBoard(stage, difficulty))
  const lockRef = useRef(false)
  const firstIdRef = useRef<number | null>(null)
  const hintsRef = useRef(0)
  const movesRef = useRef(0)

  const cardClick = useCallback((id: number) => {
    if (lockRef.current) return
    setCards(prev => {
      const card = prev.find(c => c.id === id)
      if (!card || card.flipped || card.matched) return prev
      const flipped = prev.map(c => c.id === id ? { ...c, flipped: true } : c)
      if (firstIdRef.current === null) { firstIdRef.current = id; return flipped }
      lockRef.current = true
      movesRef.current += 1
      const fid = firstIdRef.current
      firstIdRef.current = null
      const a = prev.find(c => c.id === fid)!
      if (a.iconIdx === card.iconIdx) {
        const matched = flipped.map(c => (c.id === fid || c.id === id) ? { ...c, matched: true } : c)
        lockRef.current = false
        if (matched.every(c => c.matched)) setTimeout(() => onWin({ hintsUsed: hintsRef.current, movesCount: movesRef.current }), 200)
        return matched
      }
      setTimeout(() => {
        setCards(c => c.map(x => (x.id === fid || x.id === id) ? { ...x, flipped: false } : x))
        lockRef.current = false
      }, 900)
      return flipped
    })
  }, [onWin])

  const applyHint = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true
    hintsRef.current += 1
    setCards(prev => {
      const unmatched = prev.filter(c => !c.matched && !c.flipped)
      if (unmatched.length < 2) { lockRef.current = false; return prev }
      const a = unmatched[0]
      const pair = unmatched.find(c => c.id !== a.id && c.iconIdx === a.iconIdx)
      if (!pair) { lockRef.current = false; return prev }
      const ids = [a.id, pair.id]
      const hinted = prev.map(c => ids.includes(c.id) ? { ...c, flipped: true } : c)
      setTimeout(() => {
        setCards(c => c.map(x => ids.includes(x.id) && !x.matched ? { ...x, flipped: false } : x))
        lockRef.current = false
      }, 1500)
      return hinted
    })
  }, [])

  const check = useCallback(() => {
    if (!cards.every(c => c.matched)) onError()
    else onWin({ hintsUsed: hintsRef.current, movesCount: movesRef.current })
  }, [cards, onError, onWin])

  useImperativeHandle(boardRef, () => ({ applyHint, check }), [applyHint, check])

  return { cards, cardClick, difficulty }
}
