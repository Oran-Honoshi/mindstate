"use client";
// src/components/ui/SharePrompt.tsx
// Listens for share trigger events and shows the ShareModal.
// Three trigger moments:
//  1. me:share:purchase  — after Paddle checkout
//  2. me:share:session   — after N completed games (from useShareTrigger)
//  3. me:share:challenge — after stage 3 / hard stage / game mastered (from games)

import { useState, useEffect } from "react";
import { ShareModal } from "@/components/ui/ShareModal";

export function SharePrompt() {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<"after-purchase" | "after-game" | "challenge">("after-game");
  const [gameSlug, setGameSlug] = useState<string | undefined>(undefined);
  const [stage, setStage] = useState<number | undefined>(undefined);
  const [xpEarned, setXpEarned] = useState<number | undefined>(undefined);

  useEffect(() => {
    function onPurchase() {
      setContext("after-purchase");
      setGameSlug(undefined);
      setStage(undefined);
      setOpen(true);
    }

    function onSession() {
      setContext("after-game");
      setGameSlug(undefined);
      setStage(undefined);
      setOpen(true);
    }

    function onChallenge(e: Event) {
      const detail = (e as CustomEvent).detail as { slug?: string; stage?: number; xp?: number } | undefined;
      setContext("challenge");
      setGameSlug(detail?.slug);
      setStage(detail?.stage);
      setXpEarned(detail?.xp);
      setOpen(true);
    }

    window.addEventListener("me:share:purchase", onPurchase);
    window.addEventListener("me:share:session", onSession);
    window.addEventListener("me:share:challenge", onChallenge);

    return () => {
      window.removeEventListener("me:share:purchase", onPurchase);
      window.removeEventListener("me:share:session", onSession);
      window.removeEventListener("me:share:challenge", onChallenge);
    };
  }, []);

  return (
    <ShareModal
      open={open}
      onClose={() => setOpen(false)}
      context={context === "challenge" ? "after-game" : context}
      gameSlug={gameSlug}
      xpEarned={xpEarned}
    />
  );
}