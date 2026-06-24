'use client'

import { useState, useEffect, useCallback } from 'react'
import { Icon } from '@/components/ui/Icon'

export type ToastType = 'xp' | 'streak' | 'century' | 'levelUp'

export interface Toast {
  id: string
  type: ToastType
  xp?: number
  streak?: number
  level?: number
  levelTitle?: string
  gameName?: string
}

interface ToastStackProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

const TOAST_CONFIG: Record<ToastType, { icon: string; color: string; getTitle: (t: Toast) => string; getSub: (t: Toast) => string }> = {
  xp:      { icon: 'Bolt',   color: 'var(--gold)',   getTitle: t => `+${t.xp ?? 0} XP`,          getSub: t => t.gameName ?? '' },
  streak:  { icon: 'Flame',  color: 'var(--hard)',   getTitle: t => `${t.streak ?? 0} Day Streak!`, getSub: () => 'Keep it up' },
  century: { icon: 'Trophy', color: 'var(--gold)',   getTitle: () => 'Century Club!',              getSub: t => t.gameName ?? '' },
  levelUp: { icon: 'Crown',  color: 'var(--gold)',   getTitle: t => `Level Up! Level ${t.level ?? 1}`, getSub: t => t.levelTitle ?? '' },
}

function SingleToast({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const cfg = TOAST_CONFIG[toast.type]

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true))
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 220)
    }, 2800)
    return () => {
      cancelAnimationFrame(showTimer)
      clearTimeout(hideTimer)
    }
  }, [toast.id, onDismiss])

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--surf)',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--r-card)',
        padding: '12px 14px',
        transform: visible ? 'translateY(0)' : 'translateY(-48px)',
        opacity: visible ? 1 : 0,
        transition: visible
          ? 'transform 350ms cubic-bezier(.22,.68,0,1.2), opacity 350ms cubic-bezier(.22,.68,0,1.2)'
          : 'transform 220ms ease-in, opacity 220ms ease-in',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: `color-mix(in srgb, ${cfg.color} 15%, transparent)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={cfg.icon as Parameters<typeof Icon>[0]['name']} size={18} color={cfg.color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
          {cfg.getTitle(toast)}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
          {cfg.getSub(toast)}
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
      >
        <Icon name="X" size={16} color="var(--faint)" />
      </button>
    </div>
  )
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null
  const toast = toasts[0]
  return (
    <div style={{ position: 'fixed', top: 16, left: 16, right: 16, zIndex: 200 }}>
      <SingleToast key={toast.id} toast={toast} onDismiss={onDismiss} />
    </div>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

type AddToastPayload = Omit<Toast, 'id'>

interface ToastStackState {
  toasts: Toast[]
  addToast: (toast: AddToastPayload) => void
  dismissToast: (id: string) => void
}

export function useToastStack(): ToastStackState {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((payload: AddToastPayload) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(prev => [...prev, { ...payload, id }])
  }, [])

  return { toasts, addToast, dismissToast }
}
