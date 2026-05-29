"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RecordBreak } from "@/components/realtime/CelebrationToast";

export function useRealtimeGoals(
  memberIds: string[],
  memberMap: Record<string, string>,
  currentUserId?: string
) {
  const [latestRecord, setLatestRecord] = useState<RecordBreak | null>(null);
  const memberMapRef = useRef(memberMap);
  memberMapRef.current = memberMap;

  const idsKey = [...memberIds].sort().join(",");

  useEffect(() => {
    if (!memberIds.length) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`family-goals:${idsKey.slice(0, 50)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "scores" },
        (payload) => {
          const row = payload.new as {
            id: string;
            user_id: string;
            game_slug: string;
            xp_earned: number;
            stage_number: number;
          };
          if (!memberIds.includes(row.user_id)) return;
          if (row.user_id === currentUserId) return;
          setLatestRecord({
            id: row.id ?? String(Date.now()),
            username: memberMapRef.current[row.user_id] ?? "A family member",
            game_slug: row.game_slug,
            xp_earned: row.xp_earned,
            stage_number: row.stage_number,
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // idsKey and currentUserId fully capture the subscription identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, currentUserId]);

  return { latestRecord, clearRecord: () => setLatestRecord(null) };
}
