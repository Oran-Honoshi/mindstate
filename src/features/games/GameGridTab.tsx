'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GameIcon, GameId } from '@/components/ui/GameIcon'
import { BoardPreview } from '@/components/ui/BoardPreview'
import { Bar } from '@/components/ui/Bar'
import { Micro } from '@/components/ui/Micro'
import { Icon } from '@/components/ui/Icon'
import { MasteryBadge } from '@/components/ui/MasteryBadge'

const SLUG_MAP: Record<string, string> = {
  'logic-path': 'logicpath', 'pattern-match': 'patternmatch', '2048-pro': '2048',
  'gravity-sort': 'gravity', 'hex-merge': 'hexmerge', 'word-sling': 'wordsling',
  'word-climb': 'wordclimb', 'name-country': 'namecountry', 'name-city': 'namecity',
}

const DIFF_COLOR: Record<string, string> = {
  easy: 'var(--easy)',
  medium: 'var(--medium)',
  hard: 'var(--hard)',
}

const PER_PAGE = 6

export interface GridGame {
  slug: string
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  currentStage: number
  stagesCompleted: number
  isUnlocked: boolean
  unlockLevel?: number
}

interface GameGridTabProps {
  games: GridGame[]
  onSelect: (slug: string) => void
}

function GameTile({ game, onSelect }: { game: GridGame; onSelect: (slug: string) => void }) {
  const gameId = (SLUG_MAP[game.slug] ?? game.slug) as GameId

  return (
    <div
      onClick={() => game.isUnlocked && onSelect(game.slug)}
      style={{
        background: 'var(--surf)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--r-card)',
        overflow: 'hidden',
        position: 'relative',
        minHeight: 110,
        cursor: game.isUnlocked ? 'pointer' : 'default',
      }}
    >
      {/* Board preview background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ transform: 'scale(0.55)', opacity: 0.35 }}>
          <BoardPreview game={game.slug} size={20} gap={3} />
        </div>
      </div>

      {/* Mastery badge */}
      {game.stagesCompleted >= 10 && (
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
          <MasteryBadge slug={game.slug} size={28} />
        </div>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, padding: 10, display: 'flex', flexDirection: 'column', gap: 4, height: '100%', boxSizing: 'border-box' }}>
        <GameIcon game={gameId} size={38} />
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {game.name}
        </div>
        <Micro color={DIFF_COLOR[game.difficulty]} size={9}>{game.difficulty}</Micro>
        <div style={{ marginTop: 'auto', paddingTop: 6 }}>
          <Micro color="var(--muted)" size={9}>Stage {game.currentStage}</Micro>
          <div style={{ marginTop: 3 }}>
            <Bar colorMode="accent" value={game.currentStage / 100} height={3} />
          </div>
        </div>
      </div>

      {/* Lock overlay */}
      {!game.isUnlocked && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, zIndex: 3 }}>
          <Icon name="Lock" size={24} color="var(--faint)" strokeWidth={1.8} />
          {game.unlockLevel && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--faint)' }}>
              Level {game.unlockLevel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export function GameGridTab({ games, onSelect }: GameGridTabProps) {
  const [page, setPage] = useState(0)
  const pageCount = Math.ceil(games.length / PER_PAGE)
  const pageGames = games.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Micro color="var(--muted)">All games</Micro>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Micro color="var(--muted)" size={9}>{page + 1} / {pageCount}</Micro>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              style={{ background: 'none', border: 'none', cursor: page > 0 ? 'pointer' : 'default', padding: 2, opacity: page > 0 ? 1 : 0.3, display: 'flex' }}>
              <Icon name="ChevronLeft" size={18} color="var(--accent)" strokeWidth={2} />
            </button>
            <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1}
              style={{ background: 'none', border: 'none', cursor: page < pageCount - 1 ? 'pointer' : 'default', padding: 2, opacity: page < pageCount - 1 ? 1 : 0.3, display: 'flex' }}>
              <Icon name="ChevronRight" size={18} color="var(--accent)" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <motion.div
        key={page}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--grid-gap)' }}
      >
        {pageGames.map(g => <GameTile key={g.slug} game={g} onSelect={onSelect} />)}
      </motion.div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 12 }}>
        {Array.from({ length: pageCount }, (_, i) => (
          <button key={i} onClick={() => setPage(i)}
            style={{ width: page === i ? 18 : 6, height: 6, borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0, background: page === i ? 'var(--accent)' : 'var(--border)', transition: 'all 0.25s' }} />
        ))}
      </div>
    </div>
  )
}
