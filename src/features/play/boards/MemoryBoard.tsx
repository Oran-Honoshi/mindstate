'use client'
import { useRef, useEffect, useState } from 'react'
import { useMemoryGame } from './useMemoryGame'
import type { MemoryCard } from './useMemoryGame'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

const COLS = { easy: 4, medium: 5, hard: 6 }
const CARD_GAP = 6
const BOARD_PADDING = 16
const MAX_BOARD_SIZE = 420

const FACE_COLORS = [
  'var(--accent)', 'var(--gold)', 'var(--violet)',
  'var(--easy)', 'var(--hard)', 'var(--medium)',
]
const FACE_SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'cross']

function FaceShape({ shape, color, size }: { shape: string; color: string; size: number }) {
  const s = size
  switch (shape) {
    case 'square':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <rect x="10" y="10" width="80" height="80" rx="8" fill={color} />
        </svg>
      )
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="50,8 92,90 8,90" fill={color} />
        </svg>
      )
    case 'diamond':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="50,6 94,50 50,94 6,50" fill={color} />
        </svg>
      )
    case 'star': {
      const pts = Array.from({ length: 5 }, (_, i) => {
        const outer = (Math.PI * 2 * i) / 5 - Math.PI / 2
        const inner = outer + Math.PI / 5
        return [
          `${50 + 44 * Math.cos(outer)},${50 + 44 * Math.sin(outer)}`,
          `${50 + 18 * Math.cos(inner)},${50 + 18 * Math.sin(inner)}`,
        ]
      }).flat().join(' ')
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points={pts} fill={color} />
        </svg>
      )
    }
    case 'cross':
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <rect x="38" y="10" width="24" height="80" rx="6" fill={color} />
          <rect x="10" y="38" width="80" height="24" rx="6" fill={color} />
        </svg>
      )
    default:
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill={color} />
        </svg>
      )
  }
}

interface Props {
  stage: number
  difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (result: WinResult) => void
  onError: () => void
}

function CardCell({ card, cardWidth, cardHeight, onClick }: {
  card: MemoryCard
  cardWidth: number
  cardHeight: number
  onClick: () => void
}) {
  const revealed = card.flipped || card.matched
  const shapeSize = Math.floor(cardWidth * 0.55)
  const color = FACE_COLORS[card.iconIdx % 6]
  const shape = FACE_SHAPES[Math.floor(card.iconIdx / 6) % 6]
  const monoSize = Math.max(12, Math.floor(cardWidth * 0.3))

  return (
    <div
      style={{
        width: cardWidth,
        height: cardHeight,
        perspective: '600px',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
      }}
      onClick={onClick}
    >
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.45s',
        transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Card back */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          borderRadius: 10, border: '1.5px solid var(--border)',
          background: 'radial-gradient(circle at 50% 50%, var(--surf) 0%, var(--surf2) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: monoSize,
            color: 'var(--border)',
            letterSpacing: '0.05em',
          }}>ME</span>
        </div>
        {/* Card face */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', borderRadius: 10,
          border: `1.5px solid ${card.matched ? 'var(--easy)' : 'var(--border)'}`,
          background: card.matched ? 'rgba(57,255,20,0.08)' : 'var(--surf2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FaceShape
            shape={shape}
            color={card.matched ? 'var(--easy)' : color}
            size={shapeSize}
          />
        </div>
      </div>
    </div>
  )
}

export function MemoryBoard({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const { cards, cardClick } = useMemoryGame({ stage, difficulty, boardRef, onWin, onError })
  const cols = COLS[difficulty]
  const rows = Math.ceil(cards.length / cols)
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellSize, setCellSize] = useState(60)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width - BOARD_PADDING * 2
      const h = entry.contentRect.height - BOARD_PADDING * 2
      const fromWidth = Math.floor((w - CARD_GAP * (cols - 1)) / cols)
      const fromHeight = Math.floor((h - CARD_GAP * (rows - 1)) / (rows * 1.4))
      setCellSize(Math.min(fromWidth, fromHeight, Math.floor(MAX_BOARD_SIZE / cols)))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [cols, rows])

  const cardWidth = cellSize
  const cardHeight = Math.floor(cellSize * 1.4)

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: BOARD_PADDING,
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cardWidth}px)`,
        gap: CARD_GAP,
      }}>
        {cards.map(card => (
          <CardCell
            key={card.id}
            card={card}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            onClick={() => cardClick(card.id)}
          />
        ))}
      </div>
    </div>
  )
}
