'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { TOKENS } from './tokens'
import { useSettingsStore } from '@/store/settingsStore'
import type { Theme } from '@/store/settingsStore'

export type ThemeKey = Theme

type ThemeColors = typeof TOKENS.theme[keyof typeof TOKENS.theme]

type TokensForTheme = ThemeColors & {
  key: ThemeKey
  fixed: typeof TOKENS.fixed
  radius: typeof TOKENS.radius
  font: typeof TOKENS.font
  motion: typeof TOKENS.motion
}

interface ThemeContextValue {
  theme: ThemeKey
  setTheme: (t: ThemeKey) => void
  tokens: TokensForTheme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSettingsStore(s => s.theme)
  const setTheme = useSettingsStore(s => s.setTheme)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
  }, [theme])

  const tokens: TokensForTheme = {
    ...TOKENS.theme[theme],
    key: theme,
    fixed: TOKENS.fixed,
    radius: TOKENS.radius,
    font: TOKENS.font,
    motion: TOKENS.motion,
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, tokens }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
