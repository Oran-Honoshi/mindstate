import { CSSProperties } from 'react'

const ICON_PATHS = {
  // navigation
  ChevronRight:  'M9 6l6 6-6 6',
  ChevronLeft:   'M15 6l-6 6 6 6',
  ChevronDown:   'M6 9l6 6 6-6',
  // rewards / gamification
  Flame:   'M12 3c1 3-2 4-2 7a2 2 0 104 0c0-1 0-2-1-3 2 1 4 3 4 6a5 5 0 11-10 0c0-4 4-5 5-10z',
  Bolt:    'M13 3L5 13h6l-1 8 8-10h-6z',
  Crown:   'M4 8l3 9h10l3-9-5 4-3-6-3 6z',
  Star:    'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  Trophy:  'M7 4h10v3a5 5 0 01-10 0V4zM7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3M9 14h6M10 14v4M14 14v4M8 20h8',
  Medal:   'M8 3l4 6 4-6M9 3h6M12 9a6 6 0 100 12 6 6 0 000-12zM12 13l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z',
  // actions
  Lock:   'M7 10V8a5 5 0 0110 0v2M5 10h14v9a1 1 0 01-1 1H6a1 1 0 01-1-1z',
  Check:  'M5 13l4 4L19 7',
  X:      'M6 6l12 12M18 6L6 18',
  Plus:   'M12 5v14M5 12h14',
  Minus:  'M5 12h14',
  // sharing / social
  Share:  'M16 6l-4-3-4 3M12 3v12M5 12v6a1 1 0 001 1h12a1 1 0 001-1v-6',
  Copy:   'M8 5H6a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-2M8 5a1 1 0 001 1h6a1 1 0 001-1M8 5a1 1 0 011-1h6a1 1 0 011 1',
  Bell:   'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  // navigation / app
  Settings: 'M12 9a3 3 0 100 6 3 3 0 000-6zM12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2',
  User:     'M12 12a4 4 0 100-8 4 4 0 000 8zM5 21c0-3.5 3-6 7-6s7 2.5 7 6',
  Grid:     'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  Calendar: 'M5 5h14v15H5zM5 9h14M9 3v4M15 3v4',
  BarChart: 'M5 19V9M10 19V5M15 19v-7M20 19v-4',
  // game
  Hint:  'M12 3a6 6 0 00-4 10.5c.6.6 1 1.3 1 2.5h6c0-1.2.4-1.9 1-2.5A6 6 0 0012 3zM9 18h6M10 21h4',
  Undo:  'M9 7L4 12l5 5M4 12h11a5 5 0 010 10',
  Info:  'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8h.01M11 12h1v4h1',
} as const

export type IconName = keyof typeof ICON_PATHS

interface IconProps {
  name: IconName
  size?: number
  color?: string
  strokeWidth?: number
  style?: CSSProperties
}

export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.8, style }: IconProps) {
  const d = ICON_PATHS[name]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      <path d={d} />
    </svg>
  )
}
