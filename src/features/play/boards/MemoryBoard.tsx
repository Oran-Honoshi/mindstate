'use client'
import { Leaf, Flame, Droplets, Star, Moon, Sun, Cloud, Zap, Heart, Crown, Gem, Snowflake, Feather, Fish, Bird, Music, Palette, Coffee, Globe, Compass, Atom } from 'lucide-react'
import { useMemoryGame } from './useMemoryGame'
import type { MemoryCard } from './useMemoryGame'
import type { MutableRefObject } from 'react'
import type { BoardRef, WinResult } from '../GameBoard'

const ICONS = [Leaf, Flame, Droplets, Star, Moon, Sun, Cloud, Zap, Heart, Crown, Gem, Snowflake, Feather, Fish, Bird, Music, Palette, Coffee, Globe, Compass, Atom]
const COLS = { easy: 4, medium: 5, hard: 6 }
const CARD_SIZE = { easy: 70, medium: 58, hard: 48 }

interface Props {
  stage: number
  difficulty: 'easy' | 'medium' | 'hard'
  boardRef: MutableRefObject<BoardRef | null>
  onWin: (result: WinResult) => void
  onError: () => void
}

function CardCell({ card, size, onClick }: { card: MemoryCard; size: number; onClick: () => void }) {
  const Icon = ICONS[card.iconIdx % ICONS.length]
  const revealed = card.flipped || card.matched
  return (
    <div style={{ width: size, height: size, perspective: '600px', cursor: 'pointer' }} onClick={onClick}>
      <div style={{
        width: '100%', height: '100%', position: 'relative',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.45s',
        transform: revealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          borderRadius: 10, border: '1.5px solid var(--border)',
          background: 'var(--surf)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: size * 0.3, height: size * 0.3, borderRadius: '50%', background: 'var(--surf2)' }} />
        </div>
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)', borderRadius: 10,
          border: `1.5px solid ${card.matched ? 'var(--easy)' : 'var(--border)'}`,
          background: card.matched ? 'rgba(57,255,20,0.08)' : 'var(--surf2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={size * 0.42} color={card.matched ? 'var(--easy)' : 'var(--accent)'} />
        </div>
      </div>
    </div>
  )
}

export function MemoryBoard({ stage, difficulty, boardRef, onWin, onError }: Props) {
  const { cards, cardClick } = useMemoryGame({ stage, difficulty, boardRef, onWin, onError })
  const cols = COLS[difficulty]
  const cardSize = CARD_SIZE[difficulty]

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, overflow: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${cardSize}px)`, gap: 8 }}>
        {cards.map(card => (
          <CardCell key={card.id} card={card} size={cardSize} onClick={() => cardClick(card.id)} />
        ))}
      </div>
    </div>
  )
}
