"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import type { LeaderboardEntry } from "./leaderboardData";

interface PodiumProps {
  entries: LeaderboardEntry[]
  currentUserId: string
}

// Keyed by rank (1, 2, 3)
const CFG = {
  1: { sz: 52, rw: 2.5, rc: 'var(--gold)',   bh: 56, bw: 64, delay: 0.1,
       bg: 'color-mix(in srgb, var(--gold)   20%, var(--surf))', bt: 'var(--gold)'   },
  2: { sz: 42, rw: 2,   rc: 'var(--silver)', bh: 40, bw: 54, delay: 0,
       bg: 'color-mix(in srgb, var(--silver) 15%, var(--surf))', bt: 'var(--silver)' },
  3: { sz: 38, rw: 2,   rc: 'var(--bronze)', bh: 28, bw: 54, delay: 0.2,
       bg: 'color-mix(in srgb, var(--bronze) 15%, var(--surf))', bt: 'var(--bronze)' },
} as const

export function Podium({ entries, currentUserId }: PodiumProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Display order: rank2 (left), rank1 (center), rank3 (right)
  const cols = [entries[1], entries[0], entries[2]]

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, padding: '16px 0 0', minHeight: 160 }}>
      {cols.map((entry) => {
        if (!entry) return null
        const cfg = CFG[entry.rank as 1 | 2 | 3]
        if (!cfg) return null
        const isUser = entry.id === currentUserId
        const fz = Math.round(cfg.sz * 0.35)

        return (
          <div key={entry.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {entry.rank === 1 && (
              <Crown size={18} color="var(--gold)" style={{ marginBottom: 4 }} />
            )}
            <div style={{
              width: cfg.sz, height: cfg.sz, borderRadius: '50%',
              background: 'var(--surf2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `${cfg.rw}px solid ${cfg.rc}`,
              outline: isUser ? '2px solid var(--accent)' : 'none',
              outlineOffset: isUser ? 2 : 0,
              fontFamily: 'var(--font-display)', fontWeight: 700,
              color: 'var(--text)', fontSize: fz, flexShrink: 0,
            }}>
              {entry.initial}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12,
              color: 'var(--text)', marginTop: 8,
              whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis', maxWidth: 70, textAlign: 'center',
            }}>
              {entry.username}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              {entry.totalXP.toLocaleString()} XP
            </div>
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: mounted ? 1 : 0 }}
              style={{
                width: cfg.bw, height: cfg.bh, marginTop: 8,
                borderRadius: 'var(--r-card-sm) var(--r-card-sm) 0 0',
                borderTop: `2px solid ${cfg.bt}`,
                background: cfg.bg,
                transformOrigin: 'bottom',
              }}
              transition={{ duration: 0.5, delay: cfg.delay, ease: 'easeOut' }}
            />
          </div>
        )
      })}
    </div>
  )
}
