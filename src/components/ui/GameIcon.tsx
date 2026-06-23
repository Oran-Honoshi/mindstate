'use client'

import { ReactNode } from 'react'

export type GameId =
  | 'tango' | 'memory' | 'queens' | 'sudoku' | 'zip' | 'flow'
  | 'bridges' | 'kakuro' | 'logicpath' | 'lightup' | 'nonogram'
  | 'patternmatch' | 'patches' | '2048' | 'gravity' | 'hexmerge'
  | 'wordsling' | 'hearts' | 'solitaire' | 'minesweeper'
  | 'wordclimb' | 'pinpoint' | 'namecountry' | 'namecity'

interface GameIconProps {
  game: GameId
  size?: number
}

// All colors are CSS variables — no hardcoded hex
const C = 'var(--accent)'
const V = 'var(--violet)'
const G = 'var(--gold)'
const E = 'var(--easy)'
const H = 'var(--hard)'
const M = 'var(--medium)'

// Dark surface colors from theme tokens
const SURF  = 'var(--surf)'
const SURF2 = 'var(--surf2)'
const BDR   = 'var(--border)'
const BG    = 'var(--bg)'

function GameTile({ children, size = 72 }: { children: ReactNode; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" style={{ display: 'block' }}>
      <rect x="0" y="0" width="72" height="72" rx="18" fill={SURF} />
      <rect x="0.6" y="0.6" width="70.8" height="70.8" rx="17.6" fill="none" stroke="#fff" strokeOpacity="0.06" />
      {children}
    </svg>
  )
}

const ICONS: Record<GameId, ReactNode> = {
  tango: (
    <g>
      <circle cx="27" cy="36" r="9" fill={G} />
      <circle cx="27" cy="36" r="9" fill="none" stroke={G} strokeOpacity="0.4" strokeWidth="1.4" />
      <path d="M50 26 C 41 26, 38 31, 38 37 C 38 43, 41 48, 50 48 C 44 42, 44 32, 50 26 Z" fill={V} />
    </g>
  ),
  queens: (
    <g>
      <path d="M24 46 L24 32 L30 38 L36 28 L42 38 L48 32 L48 46 Z" fill={C} />
      <rect x="24" y="46" width="24" height="5" rx="2" fill={C} />
    </g>
  ),
  memory: (
    <g>
      <rect x="20" y="22" width="22" height="28" rx="5" fill={V} opacity="0.55" />
      <rect x="32" y="26" width="22" height="28" rx="5" fill={C} />
      <circle cx="43" cy="40" r="5" fill={BG} />
    </g>
  ),
  sudoku: (
    <g stroke={C} strokeWidth="2" opacity="0.85">
      <rect x="22" y="22" width="28" height="28" rx="3" fill="none" />
      <line x1="31.3" y1="22" x2="31.3" y2="50" />
      <line x1="40.6" y1="22" x2="40.6" y2="50" />
      <line x1="22" y1="31.3" x2="50" y2="31.3" />
      <line x1="22" y1="40.6" x2="50" y2="40.6" />
    </g>
  ),
  zip: (
    <g fill="none" stroke={C} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 48 L24 30 L48 30 L48 48" />
      <circle cx="24" cy="48" r="5" fill={C} />
      <circle cx="48" cy="48" r="5" fill={G} />
    </g>
  ),
  flow: (
    <g fill="none">
      <path d="M24 28 Q24 48 48 48" stroke={H} strokeWidth="5" strokeLinecap="round" />
      <circle cx="24" cy="28" r="6" fill={H} />
      <circle cx="48" cy="48" r="6" fill={H} />
    </g>
  ),
  bridges: (
    <g>
      <circle cx="26" cy="36" r="8" fill="none" stroke={C} strokeWidth="3" />
      <circle cx="50" cy="36" r="8" fill="none" stroke={C} strokeWidth="3" />
      <line x1="34" y1="33" x2="42" y2="33" stroke={C} strokeWidth="2.5" />
      <line x1="34" y1="39" x2="42" y2="39" stroke={C} strokeWidth="2.5" />
    </g>
  ),
  nonogram: (
    <g>
      <g fill={C}>
        {([[0,0],[1,0],[2,1],[0,2],[2,2]] as [number,number][]).map(([c,r],i) => (
          <rect key={i} x={24+c*9} y={24+r*9} width="7" height="7" rx="1.5" />
        ))}
      </g>
      <g fill="none" stroke={C} strokeOpacity="0.3" strokeWidth="1">
        {([0,1,2] as number[]).flatMap(c => ([0,1,2] as number[]).map(r => (
          <rect key={`${c}-${r}`} x={24+c*9} y={24+r*9} width="7" height="7" rx="1.5" />
        )))}
      </g>
    </g>
  ),
  kakuro: (
    <g>
      <rect x="22" y="22" width="28" height="28" rx="4" fill="none" stroke={C} strokeWidth="2" />
      <path d="M22 22 L50 50" stroke={C} strokeWidth="1.6" />
      <path d="M22 22 L50 22 L50 50 Z" fill={C} fillOpacity="0.16" />
      <text x="43" y="33" fontSize="9" fill={C} fontFamily="monospace" textAnchor="middle">7</text>
      <text x="30" y="47" fontSize="9" fill={C} fontFamily="monospace" textAnchor="middle">4</text>
    </g>
  ),
  logicpath: (
    <g fill="none" stroke={C} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 26 L24 40 L40 40 L40 30 L48 30" />
      <circle cx="24" cy="26" r="4.5" fill={C} />
      <circle cx="48" cy="30" r="4.5" fill={G} />
    </g>
  ),
  lightup: (
    <g>
      <rect x="22" y="22" width="11" height="11" rx="2" fill={SURF2} />
      <rect x="39" y="39" width="11" height="11" rx="2" fill={SURF2} />
      <g stroke={G} strokeWidth="2.2" strokeLinecap="round">
        <line x1="36" y1="22" x2="36" y2="27" />
        <line x1="36" y1="45" x2="36" y2="50" />
        <line x1="22" y1="36" x2="27" y2="36" />
        <line x1="45" y1="36" x2="50" y2="36" />
      </g>
      <circle cx="36" cy="36" r="6.5" fill={G} />
    </g>
  ),
  patternmatch: (
    <g>
      <circle cx="23" cy="30" r="3.5" fill={C} />
      <rect x="30" y="26.5" width="7" height="7" rx="1.5" fill={V} />
      <path d="M46 26 l4 7 l-8 0 z" fill={G} />
      <rect x="29" y="40" width="14" height="11" rx="2" fill="none" stroke={C} strokeWidth="1.6" strokeDasharray="3 2" />
      <text x="36" y="49" fontSize="9" fill={C} fontFamily="monospace" textAnchor="middle">?</text>
    </g>
  ),
  patches: (
    <g>
      {([[22,22,V],[35,22,C],[22,35,G],[35,35,H]] as [number,number,string][]).map(([x,y,c],i) => (
        <rect key={i} x={x} y={y} width="13" height="13" rx="3" fill={c} />
      ))}
    </g>
  ),
  '2048': (
    <g>
      {([[24,24,V],[38,24,V],[24,38,G],[38,38,C]] as [number,number,string][]).map(([x,y,c],i) => (
        <rect key={i} x={x} y={y} width="12" height="12" rx="3" fill={c} opacity={i < 2 ? 1 : 0.85} />
      ))}
    </g>
  ),
  gravity: (
    <g>
      {([26,36,46] as number[]).map((x,ci) => (
        <g key={ci}>
          <rect x={x-5} y="24" width="10" height="26" rx="5" fill={SURF2} />
          {([0,1] as number[]).map(ri => (
            <circle key={ri} cx={x} cy={42-ri*10} r="4" fill={[C,G,V,H][(ci+ri)%4]} />
          ))}
        </g>
      ))}
    </g>
  ),
  hexmerge: (
    <g>
      <path d="M36 22 L48 29 L48 43 L36 50 L24 43 L24 29 Z" fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M36 30 L42 33.5 L42 40 L36 43.5 L30 40 L30 33.5 Z" fill={C} fillOpacity="0.8" />
    </g>
  ),
  wordsling: (
    <g>
      {(['A','B','C'] as string[]).map((ch,i) => (
        <g key={i}>
          <rect x={22+i*10} y="30" width="8.5" height="11" rx="2" fill={i===1 ? G : SURF2} stroke={E} strokeWidth="1" />
          <text x={26.2+i*10} y="38.5" fontSize="7" fill={i===1 ? BG : E} fontFamily="monospace" textAnchor="middle" fontWeight="bold">{ch}</text>
        </g>
      ))}
    </g>
  ),
  hearts: (
    <g>
      <path d="M36 47 C 24 38, 24 28, 31 28 C 34.5 28, 36 31, 36 33 C 36 31, 37.5 28, 41 28 C 48 28, 48 38, 36 47 Z" fill={H} />
    </g>
  ),
  solitaire: (
    <g>
      <g transform="rotate(-10 34 38)">
        <rect x="25" y="26" width="17" height="23" rx="3" fill={SURF2} stroke={C} strokeWidth="1.3" />
      </g>
      <g transform="rotate(7 41 38)">
        <rect x="33" y="25" width="17" height="23" rx="3" fill={BDR} stroke={C} strokeWidth="1.3" />
        <path d="M41.5 41 C 37 37, 37 32.5, 40.3 33.6 C 41 33.8, 41.5 34.8, 41.5 35.3 C 41.5 34.8, 42 33.8, 42.7 33.6 C 46 32.5, 46 37, 41.5 41 Z" fill={H} />
      </g>
    </g>
  ),
  minesweeper: (
    <g>
      <rect x="22" y="22" width="28" height="28" rx="4" fill={SURF2} stroke={BDR} strokeWidth="1" />
      <g stroke={H} strokeWidth="2" strokeLinecap="round">
        <line x1="36" y1="28" x2="36" y2="44" />
        <line x1="28" y1="36" x2="44" y2="36" />
        <line x1="30.5" y1="30.5" x2="41.5" y2="41.5" />
        <line x1="41.5" y1="30.5" x2="30.5" y2="41.5" />
      </g>
      <circle cx="36" cy="36" r="5.5" fill={H} />
    </g>
  ),
  wordclimb: (
    <g>
      <path d="M22 50 L50 22" stroke={E} strokeWidth="1.5" strokeDasharray="3 2" strokeOpacity="0.4" />
      {([0,1,2] as number[]).map(i => (
        <rect key={i} x={24+i*9} y={43-i*9} width="9" height="9" rx="2" fill={E} opacity={0.5+i*0.25} />
      ))}
    </g>
  ),
  pinpoint: (
    <g>
      <circle cx="36" cy="36" r="13" fill="none" stroke={C} strokeWidth="2" />
      <circle cx="36" cy="36" r="7" fill="none" stroke={C} strokeWidth="2" />
      <circle cx="36" cy="36" r="2.6" fill={G} />
    </g>
  ),
  namecountry: (
    <g>
      <line x1="26" y1="22" x2="26" y2="50" stroke={C} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="26" y="24" width="22" height="4" fill={C} />
      <rect x="26" y="28" width="22" height="4" fill="#E8EDF2" />
      <rect x="26" y="32" width="22" height="4" fill={E} />
    </g>
  ),
  namecity: (
    <g>
      {([[24,38,C],[31,30,V],[38,34,G],[45,26,C]] as [number,number,string][]).map(([x,y,c],i) => (
        <rect key={i} x={x} y={y} width="6" height={50-y} rx="1.5" fill={c} fillOpacity="0.92" />
      ))}
    </g>
  ),
}

export function GameIcon({ game, size = 38 }: GameIconProps) {
  return (
    <GameTile size={size}>
      {ICONS[game] ?? ICONS.tango}
    </GameTile>
  )
}
