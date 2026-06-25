"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { fetchLeaderboard } from "@/lib/supabase/leaderboard";
import { getLevelInfo } from "@/lib/xpLevels";
import { Skeleton } from "@/components/ui/Skeleton";
import { ScopeToggle } from "./ScopeToggle";
import { GameFilterChips } from "./GameFilterChips";
import { Podium } from "./Podium";
import { RankList } from "./RankList";
import { SparkyImg } from "@/components/ui/SparkyImg";
import type { LeaderboardEntry, LeaderboardScope } from "./leaderboardData";

export function LeadersTab() {
  const [scope, setScope] = useState<LeaderboardScope>('global')
  const [selectedGame, setSelectedGame] = useState<string>('all')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    fetchLeaderboard(selectedGame, 'allTime', user?.id)
      .then((rows) => {
        const converted: LeaderboardEntry[] = rows.map((r) => {
          const lvl = getLevelInfo(r.total_xp)
          return {
            id: r.user_id,
            username: r.username,
            initial: r.avatar_initial,
            level: lvl.levelNumber,
            levelTitle: lvl.rankName,
            totalXP: r.total_xp,
            rank: r.rank,
            isCurrentUser: r.is_current_user,
          }
        })
        setEntries(converted)
      })
      .catch((err) => {
        console.error('LeadersTab: failed to load leaderboard', err)
        setEntries([])
      })
      .finally(() => setLoading(false))
  }, [selectedGame, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentUserId = user?.id ?? ''
  const displayEntries = scope === 'family' ? [] : entries
  const top3 = displayEntries.slice(0, 3)
  const rest = displayEntries.slice(3)
  const showFamilyEmpty = scope === 'family'

  const playedGames = [...new Set(entries.map(e => e.id))]
    .slice(0, 5)
    .map(id => ({ slug: id, name: id }))

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 12,
      padding: '12px var(--screen-pad)', paddingBottom: 80,
      height: '100%', overflowY: 'auto',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
        Rankings
      </div>

      <ScopeToggle scope={scope} onChange={setScope} />

      <GameFilterChips selectedGame={selectedGame} games={[]} onChange={setSelectedGame} />

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} height={56} radius="var(--r-card)" />)}
        </div>
      ) : showFamilyEmpty ? (
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
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
          Leaderboard populates as you play
        </div>
      ) : (
        <>
          <Podium entries={top3} currentUserId={currentUserId} />
          <RankList entries={rest} currentUserId={currentUserId} />
        </>
      )}
    </div>
  )
}
