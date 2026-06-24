'use client'

import { useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { Btn } from '@/components/ui/Btn'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'

interface Member { name: string; initial: string }

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  inviteCode: string
  memberCount: number
  maxSeats: number
  members: Member[]
}

const AVATAR_COLORS = ['var(--gold)', 'var(--accent)', 'var(--violet)', 'var(--easy)', 'var(--hard)', 'var(--medium)']

export function InviteModal({ isOpen, onClose, inviteCode, memberCount, maxSeats, members }: InviteModalProps) {
  const [copied, setCopied] = useState(false)

  const emptySlots = Math.max(0, maxSeats - memberCount)
  const shareUrl = `https://mindstate.app/join/${inviteCode}`

  function handleCopyCode() {
    navigator.clipboard.writeText(inviteCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ url: shareUrl, title: 'Join my MindState family!', text: `Use code ${inviteCode} to join.` }).catch(() => {})
    } else {
      navigator.clipboard.writeText(shareUrl).catch(() => {})
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 4 }}>
        Invite to Your Family
      </div>

      {/* Seats row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
        {members.map((m, i) => (
          <div key={i} style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: `color-mix(in srgb, ${AVATAR_COLORS[i % AVATAR_COLORS.length]} 22%, transparent)`,
            border: `2px solid color-mix(in srgb, ${AVATAR_COLORS[i % AVATAR_COLORS.length]} 55%, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
              {m.initial}
            </span>
          </div>
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div key={`empty-${i}`} style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'var(--surf2)', border: '2px dashed var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="Plus" size={12} color="var(--faint)" />
          </div>
        ))}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
        {memberCount} of {maxSeats} seats used
      </div>

      {/* Invite code */}
      <Card variant="default" padding="14px" radius="var(--r-card)">
        <div onClick={handleCopyCode} style={{ cursor: 'pointer', textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 24, color: 'var(--text)', letterSpacing: '0.15em',
          }}>
            {inviteCode}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: copied ? 'var(--accent)' : 'var(--muted)', marginTop: 4 }}>
            {copied ? 'Copied!' : 'Tap to copy'}
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 12 }}>
        <Btn variant="primary" size="md" onClick={handleShare}>
          <Icon name="Share" size={16} style={{ marginRight: 6 }} />
          Share Invite Link
        </Btn>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
        Link expires in 7 days
      </div>
    </BottomSheet>
  )
}
