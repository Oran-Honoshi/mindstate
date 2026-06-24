'use client'

import { useState, useEffect } from 'react'

// ── Utility functions (backwards-compat with old trigger system) ──────────────

const STORAGE_KEY = 'me_review_state'

function getReviewState(): { totalSessions: number; lastAsked: number } {
  if (typeof window === 'undefined') return { totalSessions: 0, lastAsked: 0 }
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } catch { return { totalSessions: 0, lastAsked: 0 } }
}

export function incrementReviewSession() {
  const s = getReviewState()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, totalSessions: (s.totalSessions ?? 0) + 1 }))
}

export function triggerReviewAfterPurchase() {
  const s = getReviewState()
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, lastAsked: 0 }))
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('me:review:purchase'))
}

import { CenterModal } from './CenterModal'
import { SparkyImg } from '@/components/ui/SparkyImg'
import { Btn } from '@/components/ui/Btn'
import { Icon } from '@/components/ui/Icon'

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  onFeedback: (rating: number, text: string) => void
}

export function RatingModal({ isOpen, onClose, onFeedback }: RatingModalProps) {
  const [selectedRating, setSelectedRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [showStoreCta, setShowStoreCta] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')

  useEffect(() => {
    if (selectedRating >= 4) {
      const t = setTimeout(() => setShowStoreCta(true), 600)
      return () => clearTimeout(t)
    } else {
      setShowStoreCta(false)
    }
  }, [selectedRating])

  const displayRating = hovered || selectedRating

  return (
    <CenterModal isOpen={isOpen} onClose={onClose}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <SparkyImg expr="happy" size={52} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>
          Enjoying Mind Element?
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', marginTop: 6, marginBottom: 16, lineHeight: 1.5 }}>
          Your rating helps others find us.
        </div>

        {/* Star row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setSelectedRating(n)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                transform: displayRating >= n ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 120ms ease',
              }}
            >
              <Icon
                name="Star"
                size={32}
                color={displayRating >= n ? 'var(--gold)' : 'var(--surf2)'}
                strokeWidth={displayRating >= n ? 0 : 1.5}
              />
            </button>
          ))}
        </div>

        {selectedRating >= 4 && showStoreCta && (
          <div style={{ marginBottom: 12 }}>
            <Btn variant="primary" onClick={() => window.open('https://apps.apple.com', '_blank')}>
              Rate on App Store
            </Btn>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
              Your review has been pre-copied to clipboard
            </div>
          </div>
        )}

        {selectedRating >= 1 && selectedRating <= 3 && (
          <div style={{ marginBottom: 12 }}>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="Tell us what could be better…"
              style={{
                width: '100%', minHeight: 80, padding: 10,
                fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text)',
                background: 'var(--surf2)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-input)', resize: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ marginTop: 8 }}>
              <Btn variant="primary" onClick={() => onFeedback(selectedRating, feedbackText)}>
                Send Feedback
              </Btn>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)',
            textAlign: 'center', display: 'block', width: '100%', marginTop: 4,
          }}
        >
          Not now
        </button>
      </div>
    </CenterModal>
  )
}
