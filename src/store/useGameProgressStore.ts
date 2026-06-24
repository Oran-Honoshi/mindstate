'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GameProgressState {
  completionCount: number
  hasRated: boolean
  lastPlayedDate: string | null
  incrementCompletion: () => void
  setHasRated: () => void
  setLastPlayedDate: (date: string) => void
}

export const useGameProgressStore = create<GameProgressState>()(
  persist(
    (set) => ({
      completionCount: 0,
      hasRated: false,
      lastPlayedDate: null,
      incrementCompletion: () => set(s => ({ completionCount: s.completionCount + 1 })),
      setHasRated: () => set({ hasRated: true }),
      setLastPlayedDate: (date) => set({ lastPlayedDate: date }),
    }),
    { name: 'mindstate-game-progress' }
  )
)
