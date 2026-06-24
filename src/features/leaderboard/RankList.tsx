"use client";
import { ChevronDown } from "lucide-react";
import type { LeaderboardEntry } from "./leaderboardData";

interface RankListProps {
  entries: LeaderboardEntry[]
  currentUserId: string
}

function YouBadge() {
  return (
    <span style={{
      background: 'var(--accent)', color: 'var(--on-accent)',
      borderRadius: 'var(--r-pill)', padding: '1px 6px',
      fontFamily: 'var(--font-mono)', fontSize: 8, marginLeft: 6,
      flexShrink: 0,
    }}>
      YOU
    </span>
  )
}

function RankRow({ entry }: { entry: LeaderboardEntry }) {
  const isUser = entry.isCurrentUser
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 'var(--r-card)',
      background: isUser
        ? 'color-mix(in srgb, var(--accent) 10%, var(--surf))'
        : 'var(--surf)',
      border: `0.5px solid ${isUser
        ? 'color-mix(in srgb, var(--accent) 40%, transparent)'
        : 'var(--border)'}`,
    }}>
      <div style={{
        width: 24, textAlign: 'right', flexShrink: 0,
        fontFamily: 'var(--font-mono)', fontWeight: 700,
        fontSize: 14, color: 'var(--muted)',
      }}>
        {entry.rank}
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--surf2)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 13, color: 'var(--text)',
      }}>
        {entry.initial}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
            {entry.username}
          </span>
          {isUser && <YouBadge />}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
          {entry.levelTitle}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>
        {entry.totalXP.toLocaleString()}
      </div>
    </div>
  )
}

export function RankList({ entries, currentUserId }: RankListProps) {
  const currentUserEntry = entries.find(e => e.id === currentUserId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
      {entries.map(entry => <RankRow key={entry.id} entry={entry} />)}

      {currentUserEntry && (
        <div style={{ position: 'sticky', bottom: 0, zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ flex: 1 }}>
              <RankRow entry={currentUserEntry} />
            </div>
            <ChevronDown size={14} color="var(--muted)" />
          </div>
        </div>
      )}
    </div>
  )
}
