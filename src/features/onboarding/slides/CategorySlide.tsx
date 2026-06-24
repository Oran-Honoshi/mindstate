'use client'

import { Crown, Brain, BookOpen, Globe, Hash, Target, Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'

const CATEGORIES = [
  { id: 'logic',    label: 'Logic',     Icon: Crown },
  { id: 'memory',   label: 'Memory',    Icon: Brain },
  { id: 'words',    label: 'Words',     Icon: BookOpen },
  { id: 'geo',      label: 'Geography', Icon: Globe },
  { id: 'numbers',  label: 'Numbers',   Icon: Hash },
  { id: 'strategy', label: 'Strategy',  Icon: Target },
]

interface Props {
  selectedCategories: Set<string>
  onChange: (categories: Set<string>) => void
}

export function CategorySlide({ selectedCategories, onChange }: Props) {
  function toggle(id: string) {
    const next = new Set(selectedCategories)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px var(--screen-pad) 0', overflowY: 'auto' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--text)', marginBottom: 6 }}>
        Choose your style
      </h2>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
        Select all that interest you
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {CATEGORIES.map(({ id, label, Icon }) => {
          const selected = selectedCategories.has(id)
          return (
            <Card
              key={id}
              variant="default"
              padding="14px 10px"
              onClick={() => toggle(id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                minHeight: 90, cursor: 'pointer', position: 'relative',
                border: selected ? '1.5px solid var(--accent)' : '0.5px solid var(--border)',
                background: selected ? 'color-mix(in srgb, var(--accent) 8%, var(--surf))' : 'var(--surf)',
              }}
            >
              {selected && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={9} color="var(--on-accent)" strokeWidth={3} />
                </div>
              )}
              <Icon size={32} color={selected ? 'var(--accent)' : 'var(--muted)'} strokeWidth={1.5} />
              <span style={{
                fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
                color: selected ? 'var(--text)' : 'var(--muted)',
              }}>
                {label}
              </span>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
