// src/components/ui/SharePrompt.tsx
// Global listener — place once in layout.tsx alongside <RatingModal />
// Listens for me:share:purchase and me:share:session events
"use client";
import { useState, useEffect } from "react";
import { ShareModal } from "@/components/ui/ShareModal";

export function SharePrompt() {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<"after-purchase" | "after-game">("after-game");

  useEffect(() => {
    function onPurchase() {
      setContext("after-purchase");
      setOpen(true);
    }
    function onSession() {
      setContext("after-game");
      setOpen(true);
    }
    window.addEventListener("me:share:purchase", onPurchase);
    window.addEventListener("me:share:session", onSession);
    return () => {
      window.removeEventListener("me:share:purchase", onPurchase);
      window.removeEventListener("me:share:session", onSession);
    };
  }, []);

  return (
    <ShareModal
      open={open}
      onClose={() => setOpen(false)}
      context={context}
    />
  );
}