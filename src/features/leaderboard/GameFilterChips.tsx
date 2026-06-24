"use client";

interface Game { slug: string; name: string }

interface GameFilterChipsProps {
  selectedGame: string | 'all'
  games: Game[]
  onChange: (slug: string | 'all') => void
}

export function GameFilterChips({ selectedGame, games, onChange }: GameFilterChipsProps) {
  const all: Game[] = [{ slug: 'all', name: 'All Games' }, ...games]

  return (
    <div style={{
      display: 'flex',
      overflowX: 'auto',
      gap: 8,
      padding: '2px 0 4px',
      scrollbarWidth: 'none',
    }}>
      {all.map(({ slug, name }) => {
        const active = selectedGame === slug
        return (
          <button
            key={slug}
            onClick={() => onChange(slug as string | 'all')}
            style={{
              borderRadius: 'var(--r-pill)',
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: '150ms ease',
              flexShrink: 0,
              background: active ? 'var(--accent)' : 'var(--surf2)',
              color: active ? 'var(--on-accent)' : 'var(--muted)',
              border: active ? 'none' : '0.5px solid var(--border)',
            }}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
