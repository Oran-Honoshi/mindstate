export type LeaderboardScope = 'global' | 'family'
export type LeaderboardPeriod = 'allTime' | 'thisWeek' | 'today'

export interface LeaderboardEntry {
  id: string
  username: string
  initial: string
  avatarUrl?: string
  level: number
  levelTitle: string
  totalXP: number
  rank: number
  isCurrentUser: boolean
  isFamilyMember?: boolean
}

export const CURRENT_USER_ID = 'oran'

function filler(rank: number): LeaderboardEntry {
  return {
    id: `player-${rank}`,
    username: `Player${rank}`,
    initial: 'P',
    level: Math.max(1, 20 - rank),
    levelTitle: 'Apprentice',
    totalXP: Math.max(100, 18200 - (rank - 6) * 1400),
    rank,
    isCurrentUser: false,
  }
}

export const globalEntries: LeaderboardEntry[] = [
  { id: 'maya',  username: 'Maya',  initial: 'M', level: 22, levelTitle: 'Tactician', totalXP: 48200, rank: 1,  isCurrentUser: false },
  { id: 'oran',  username: 'Oran',  initial: 'O', level: 7,  levelTitle: 'Tactician', totalXP: 3240,  rank: 2,  isCurrentUser: true },
  { id: 'lior',  username: 'Lior',  initial: 'L', level: 18, levelTitle: 'Sharp',     totalXP: 31500, rank: 3,  isCurrentUser: false },
  { id: 'dana',  username: 'Dana',  initial: 'D', level: 15, levelTitle: 'Sharp',     totalXP: 24800, rank: 4,  isCurrentUser: false },
  { id: 'ron',   username: 'Ron',   initial: 'R', level: 12, levelTitle: 'Sharp',     totalXP: 18200, rank: 5,  isCurrentUser: false },
  ...Array.from({ length: 10 }, (_, i) => filler(i + 6)),
]

export const familyEntries: LeaderboardEntry[] = [
  { id: 'oran', username: 'Oran', initial: 'O', level: 7, levelTitle: 'Tactician', totalXP: 3240, rank: 1, isCurrentUser: true },
  { id: 'sara', username: 'Sara', initial: 'S', level: 5, levelTitle: 'Novice',    totalXP: 1840, rank: 2, isCurrentUser: false, isFamilyMember: true },
  { id: 'tom',  username: 'Tom',  initial: 'T', level: 3, levelTitle: 'Novice',    totalXP: 920,  rank: 3, isCurrentUser: false, isFamilyMember: true },
  { id: 'noa',  username: 'Noa',  initial: 'N', level: 2, levelTitle: 'Beginner',  totalXP: 440,  rank: 4, isCurrentUser: false, isFamilyMember: true },
]

export const playedGames = [
  { slug: 'tango',   name: 'Tango'   },
  { slug: 'queens',  name: 'Queens'  },
  { slug: 'memory',  name: 'Memory'  },
  { slug: 'sudoku',  name: 'Sudoku'  },
  { slug: 'zip',     name: 'Zip'     },
  { slug: 'flow',    name: 'Flow'    },
]
