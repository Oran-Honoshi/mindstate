'use client'

import { useParams, useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/Icon'
import { GameIcon } from '@/components/ui/GameIcon'
import type { GameId } from '@/components/ui/GameIcon'
import { Btn } from '@/components/ui/Btn'
import { LobbyHero } from './LobbyHero'
import { LobbyProgress } from './LobbyProgress'

const SLUG_MAP: Record<string, string> = {
  'logic-path': 'logicpath', 'pattern-match': 'patternmatch', '2048-pro': '2048',
  'gravity-sort': 'gravity', 'hex-merge': 'hexmerge', 'word-sling': 'wordsling',
  'word-climb': 'wordclimb', 'name-country': 'namecountry', 'name-city': 'namecity',
}

const GAME_NAMES: Record<string, string> = {
  tango: 'Tango', memory: 'Memory', queens: 'Queens', sudoku: 'Mini Sudoku',
  zip: 'Zip', flow: 'Flow', bridges: 'Bridges', kakuro: 'Kakuro',
  'logic-path': 'Logic Path', lightup: 'Light Up', nonogram: 'Nonogram',
  'pattern-match': 'Pattern Match', patches: 'Patches', '2048-pro': '2048 Pro',
  'gravity-sort': 'Gravity Sort', 'hex-merge': 'Hex Merge', 'word-sling': 'Word Sling',
  hearts: 'Hearts', solitaire: 'Solitaire', minesweeper: 'Minesweeper',
  'word-climb': 'Word Climb', pinpoint: 'Pinpoint',
  'name-country': 'Name the Country', 'name-city': 'Name the City',
}

const DESCRIPTIONS: Record<string, string> = {
  tango: 'Balance sun & moon — equal symbols in every row and column.',
  queens: 'One queen per row, column and colored region — no conflicts.',
  memory: 'Flip cards and find every matching pair across the deck.',
  sudoku: 'Fill every cell with digits — no repeats in any row or column.',
  zip: 'Trace a single path that visits every cell exactly once.',
  flow: 'Connect every color pair without crossing any path.',
  bridges: 'Link all islands with exactly the right number of bridges.',
  kakuro: 'A crossword where every clue is a sum, not a word.',
}

const MOCK: Record<string, { stagesCompleted: number; level: number; bestXP: number }> = {
  tango:  { stagesCompleted: 34, level: 7, bestXP: 847 },
  queens: { stagesCompleted: 12, level: 3, bestXP: 612 },
  memory: { stagesCompleted: 8,  level: 2, bestXP: 723 },
}

export default function LobbyPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()

  const gameId = (SLUG_MAP[slug] ?? slug) as GameId
  const gameName = GAME_NAMES[slug] ?? slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
  const desc = DESCRIPTIONS[slug] ?? 'Master this puzzle through 100 progressive stages.'
  const { stagesCompleted, level, bestXP } = MOCK[slug] ?? { stagesCompleted: 0, level: 1, bestXP: 0 }
  const ctaLabel = stagesCompleted > 0 ? `Continue · Stage ${stagesCompleted + 1}` : 'Start · Stage 1'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', minHeight: '100dvh' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50, height: 56,
        background: 'var(--surf)', borderBottom: '0.5px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 var(--screen-pad)',
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text)', display: 'flex' }}>
          <Icon name="ChevronLeft" size={22} color="var(--text)" />
        </button>
        <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
          {gameName}
        </span>
        <GameIcon game={gameId} size={28} />
      </div>

      <LobbyHero gameId={gameId} gameName={gameName} description={desc} level={level} stagesCompleted={stagesCompleted} bestXP={bestXP} />

      <div style={{ flex: 1 }}>
        <LobbyProgress stagesCompleted={stagesCompleted} />
      </div>

      <div style={{ padding: '0 var(--screen-pad) 32px', marginTop: 20 }}>
        <Btn variant="primary" size="lg" onClick={() => router.push(`/stages/${slug}`)}>
          {ctaLabel}
        </Btn>
      </div>
    </div>
  )
}
