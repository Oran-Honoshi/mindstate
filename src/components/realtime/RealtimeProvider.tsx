"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { triggerConfetti } from "@/components/effects/Confetti";
import { getUserFamilyGroup, getFamilyMembers } from "@/lib/supabase/family";
import { CelebrationToast, type RecordBreak } from "./CelebrationToast";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [toasts, setToasts] = useState<RecordBreak[]>([]);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const group = await getUserFamilyGroup(user.id);
      if (!group || cancelled) return;

      const members = await getFamilyMembers((group as any).id);
      if (cancelled) return;

      const familyIds = new Set<string>(members.map((m: any) => m.user_id));
      if (familyIds.size === 0) return;

      channelRef.current = supabase
        .channel(`family:scores:${(group as any).id}`)
        .on(
          "postgres_changes" as any,
          { event: "INSERT", schema: "public", table: "scores" },
          async (payload: any) => {
            const score = payload.new;
            if (score.user_id === user.id) return;
            if (!familyIds.has(score.user_id)) return;
            if (seenIds.current.has(score.id)) return;
            seenIds.current.add(score.id);

            const { data: best } = await supabase
              .from("scores")
              .select("xp_earned")
              .eq("game_slug", score.game_slug)
              .eq("stage_number", score.stage_number)
              .in("user_id", Array.from(familyIds))
              .order("xp_earned", { ascending: false })
              .limit(1)
              .single();

            if (!best || score.xp_earned >= (best.xp_earned ?? 0)) {
              const { data: prof } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", score.user_id)
                .single();

              const record: RecordBreak = {
                id: score.id,
                username: prof?.username ?? "Family member",
                game_slug: score.game_slug,
                xp_earned: score.xp_earned,
                stage_number: score.stage_number,
              };

              setToasts(prev => [...prev, record]);
              triggerConfetti();
            }
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      channelRef.current?.unsubscribe();
      channelRef.current = null;
    };
  }, [user]);

  return (
    <>
      {children}
      <div style={{
        position: "fixed", top: 80, right: 20, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 10,
        pointerEvents: "none",
      }}>
        <AnimatePresence>
          {toasts.map(toast => (
            <div key={toast.id} style={{ pointerEvents: "auto" }}>
              <CelebrationToast
                record={toast}
                onDismiss={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
