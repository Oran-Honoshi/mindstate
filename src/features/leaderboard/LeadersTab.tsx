"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScopeToggle } from "./ScopeToggle";
import { GameFilterChips } from "./GameFilterChips";
import { Podium } from "./Podium";
import { RankList } from "./RankList";
import { SparkyImg } from "@/components/ui/SparkyImg";
import {
  globalEntries, familyEntries, playedGames,
  CURRENT_USER_ID, type LeaderboardScope,
} from "./leaderboardData";

export function LeadersTab() {
  const [scope, setScope] = useState<LeaderboardScope>('global')
  const [selectedGame, setSelectedGame] = useState<string>('all')
  const router = useRouter()

  const entries = scope === 'global' ? globalEntries : familyEntries
  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)
  const showFamilyEmpty = scope === 'family' && familyEntries.length <= 1

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 12,
      padding: '12px var(--screen-pad)', paddingBottom: 80,
      height: '100%', overflowY: 'auto',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 22,
        fontWeight: 700, color: 'var(--text)',
      }}>
        Rankings
      </div>

      <ScopeToggle scope={scope} onChange={setScope} />

      <GameFilterChips
        selectedGame={selectedGame}
        games={playedGames}
        onChange={setSelectedGame}
      />

      {showFamilyEmpty ? (
        <div style={{
          background: 'var(--surf)', border: '0.5px solid var(--border)',
          borderRadius: 'var(--r-card)', padding: 24,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center', gap: 12,
        }}>
          <SparkyImg expr="idle" size={52} />
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>
            No family group yet
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--muted)' }}>
            Create or join a family group to compete with people you know.
          </div>
          <button
            onClick={() => router.push('/family')}
            style={{
              background: 'var(--accent)', color: 'var(--on-accent)',
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 14, padding: '10px 20px',
              borderRadius: 'var(--r-btn)', border: 'none', cursor: 'pointer',
            }}
          >
            Set Up Family
          </button>
        </div>
      ) : (
        <>
          <Podium entries={top3} currentUserId={CURRENT_USER_ID} />
          <RankList entries={rest} currentUserId={CURRENT_USER_ID} />
        </>
      )}
    </div>
  )
}
