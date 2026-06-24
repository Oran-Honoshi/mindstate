export type DailyChallenge = {
  id: string
  gameSlug: string
  gameName: string
  stage: number
  difficulty: 'easy' | 'medium' | 'hard'
  xpReward: number
  isCompleted: boolean
  xpEarned?: number
  bestTimeSeconds?: number
}

export const MOCK_CHALLENGES: DailyChallenge[] = [
  { id: '1', gameSlug: 'tango',       gameName: 'Tango',       stage: 14, difficulty: 'medium', xpReward: 600, isCompleted: true,  xpEarned: 540, bestTimeSeconds: 134 },
  { id: '2', gameSlug: 'memory',      gameName: 'Memory',      stage: 8,  difficulty: 'easy',   xpReward: 400, isCompleted: true,  xpEarned: 380 },
  { id: '3', gameSlug: 'queens',      gameName: 'Queens',      stage: 22, difficulty: 'medium', xpReward: 600, isCompleted: false },
  { id: '4', gameSlug: 'sudoku',      gameName: 'Sudoku',      stage: 5,  difficulty: 'easy',   xpReward: 400, isCompleted: false },
  { id: '5', gameSlug: 'zip',         gameName: 'Zip',         stage: 18, difficulty: 'medium', xpReward: 600, isCompleted: false },
  { id: '6', gameSlug: 'minesweeper', gameName: 'Minesweeper', stage: 3,  difficulty: 'easy',   xpReward: 400, isCompleted: false },
  { id: '7', gameSlug: 'bridges',     gameName: 'Bridges',     stage: 31, difficulty: 'hard',   xpReward: 800, isCompleted: false },
  { id: '8', gameSlug: 'nonogram',    gameName: 'Nonogram',    stage: 7,  difficulty: 'easy',   xpReward: 400, isCompleted: false },
]

export const DIFFICULTY_COLOR: Record<'easy' | 'medium' | 'hard', string> = {
  easy:   'var(--easy)',
  medium: 'var(--medium)',
  hard:   'var(--hard)',
}
