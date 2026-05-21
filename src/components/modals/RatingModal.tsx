// src/components/modals/RatingModal.tsx
// Replaces the old RatingModal — wraps TrustpilotReviewModal with
// smart trigger logic (after-purchase, after N sessions).
"use client";
import { useState, useEffect } from "react";
import { TrustpilotReviewModal } from "@/components/ui/TrustpilotReviewModal";
import { useAuthStore } from "@/store/authStore";

const STORAGE_KEY = "me_review_state";
const SESSIONS_BEFORE_ASK = 5;       // Ask after 5 completed games
const DAYS_BEFORE_RE_ASK  = 30;      // Don't re-ask for 30 days

interface ReviewState {
  lastAsked: number;
  totalSessions: number;
  dismissed: boolean;
  rated: boolean;
}

function getReviewState(): ReviewState {
  if (typeof window === "undefined") return { lastAsked: 0, totalSessions: 0, dismissed: false, rated: false };
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return { lastAsked: 0, totalSessions: 0, dismissed: false, rated: false };
  }
}

function saveReviewState(state: Partial<ReviewState>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...getReviewState(), ...state }));
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Call after every completed game session */
export function incrementReviewSession() {
  const state = getReviewState();
  saveReviewState({ totalSessions: (state.totalSessions ?? 0) + 1 });
}

/** Call immediately after a successful purchase */
export function triggerReviewAfterPurchase() {
  saveReviewState({ lastAsked: 0 }); // Reset cooldown so it shows now
  window.dispatchEvent(new CustomEvent("me:review:purchase"));
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RatingModal() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<"after-purchase" | "after-session" | "manual">("manual");
  const [gamesPlayed, setGamesPlayed] = useState(0);

  useEffect(() => {
    // Listen for purchase trigger
    function onPurchase() {
      setContext("after-purchase");
      setOpen(true);
    }
    window.addEventListener("me:review:purchase", onPurchase);
    return () => window.removeEventListener("me:review:purchase", onPurchase);
  }, []);

  useEffect(() => {
    if (!user) return;

    const state = getReviewState();
    if (state.rated) return;
    if (state.dismissed) {
      // Check cooldown
      const daysSince = (Date.now() - (state.lastAsked ?? 0)) / (1000 * 60 * 60 * 24);
      if (daysSince < DAYS_BEFORE_RE_ASK) return;
    }

    // Check if enough sessions
    const sessions = state.totalSessions ?? 0;
    if (sessions >= SESSIONS_BEFORE_ASK) {
      const daysSince = (Date.now() - (state.lastAsked ?? 0)) / (1000 * 60 * 60 * 24);
      if (!state.lastAsked || daysSince >= DAYS_BEFORE_RE_ASK) {
        // Delay by 2s so it doesn't fire immediately on mount
        const timer = setTimeout(() => {
          setGamesPlayed(sessions);
          setContext("after-session");
          setOpen(true);
          saveReviewState({ lastAsked: Date.now() });
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  function handleClose() {
    setOpen(false);
    saveReviewState({ dismissed: true, lastAsked: Date.now() });
  }

  return (
    <TrustpilotReviewModal
      open={open}
      onClose={handleClose}
      context={context}
      gamesPlayed={gamesPlayed}
    />
  );
}