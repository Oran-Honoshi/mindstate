"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";
import { triggerConfetti } from "@/components/effects/Confetti";
import { Trophy, Zap, Star } from "lucide-react";

interface RecordBreak {
  id: string;
  username: string;
  game_slug: string;
  xp_earned: number;
  stage_number: number;
}

const GAME_NAMES: Record<string, string> = {
  tango:"Tango", memory:"Memory", queens:"Queens",
  sudoku:"Mini Sudoku", zip:"Zip", minesweeper:"Minesweeper",
};

function CelebrationToast({ record, onDismiss }: { record: RecordBreak; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      style={{
        background: "white",
        borderRadius: 20,
        padding: "14px 18px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(79,110,247,0.15)",
        border: "0.5px solid rgba(79,110,247,0.2)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 300,
        maxWidth: 380,
        cursor: "pointer",
      }}
      onClick={onDismiss}
    >
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Trophy size={18} color="white"/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1917", marginBottom: 2 }}>
          Record broken! 
        </p>
        <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.4 }}>
          <strong style={{ color: "#4F6EF7" }}>{record.username}</strong> scored{" "}
          <strong style={{ color: "#1C1917" }}>{record.xp_earned} XP</strong> on{" "}
          {GAME_NAMES[record.game_slug] ?? record.game_slug} Stage {record.stage_number}
        </p>
      </div>
      <Zap size={14} color="#F59E0B" style={{ flexShrink: 0 }}/>
    </motion.div>
  );
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuthStore();
  const [toasts, setToasts] = useState<RecordBreak[]>([]);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    channelRef.current = supabase
      .channel("public:scores")
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "scores" },
        async (payload: any) => {
          const score = payload.new;
          if (score.user_id === user.id) return;
          if (seenIds.current.has(score.id)) return;
          seenIds.current.add(score.id);

          // Check if this beats existing best for that game+stage
          const { data: best } = await supabase
            .from("scores")
            .select("xp_earned")
            .eq("game_slug", score.game_slug)
            .eq("stage_number", score.stage_number)
            .order("xp_earned", { ascending: false })
            .limit(1)
            .single();

          if (!best || score.xp_earned >= (best.xp_earned ?? 0)) {
            // Fetch username
            const { data: prof } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", score.user_id)
              .single();

            const record: RecordBreak = {
              id: score.id,
              username: prof?.username ?? "Someone",
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

    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [user]);

  return (
    <>
      {children}
      {/* Toast container */}
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
