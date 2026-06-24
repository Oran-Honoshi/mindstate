"use client";
import { useState, useEffect, ReactNode } from "react";
import { StatusBar } from "./StatusBar";
import { AppHeader } from "@/components/nav/AppHeader";
import { TabShell } from "./TabShell";
import { BottomNav } from "@/components/nav/BottomNav";
import { ToastStack, useToastStack } from "@/components/modals/ToastStack";
import { PaywallModal } from "@/components/modals/PaywallModal";
import { RatingModal } from "@/components/modals/RatingModal";
import { WelcomeBackModal } from "@/components/modals/WelcomeBackModal";
import { usePaywallModal } from "@/store/usePaywallModal";
import { useGameProgressStore } from "@/store/useGameProgressStore";

interface RootShellProps {
  children: ReactNode;
  userLevel?: number;
  livesUsed?: number;
  livesTotal?: number;
  avatarUrl?: string;
  userInitial?: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export function RootShell({
  children,
  userLevel = 1,
  livesUsed,
  livesTotal = 5,
  avatarUrl,
  userInitial,
}: RootShellProps) {
  const [activeTab, setActiveTab] = useState(0);
  const { toasts, addToast, dismissToast } = useToastStack();

  // Paywall
  const { isOpen: paywallOpen, close: closePaywall } = usePaywallModal();

  // Rating modal
  const [ratingOpen, setRatingOpen] = useState(false);
  const { completionCount, hasRated, setHasRated, lastPlayedDate, setLastPlayedDate } = useGameProgressStore();
  useEffect(() => {
    if (completionCount === 5 && !hasRated) setRatingOpen(true);
  }, [completionCount, hasRated]);

  // Welcome back modal
  const [welcomeBackOpen, setWelcomeBackOpen] = useState(false);
  const [streakBroken, setStreakBroken] = useState(true);
  useEffect(() => {
    // Check URL params for test override
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const wb = params.get("welcomeback");
      if (wb === "broken") { setStreakBroken(true); setWelcomeBackOpen(true); return; }
      if (wb === "saved")  { setStreakBroken(false); setWelcomeBackOpen(true); return; }
    }
    if (lastPlayedDate && lastPlayedDate < today()) {
      setWelcomeBackOpen(true);
    }
  }, [lastPlayedDate]);

  // Debug toast trigger for /shell testing
  function fireDebugToasts() {
    addToast({ type: 'xp',      xp: 847,  gameName: 'Tango' });
    setTimeout(() => addToast({ type: 'streak', streak: 7 }), 3200);
    setTimeout(() => addToast({ type: 'century', gameName: 'Tango' }), 6400);
    setTimeout(() => addToast({ type: 'levelUp', level: 8, levelTitle: 'Strategist' }), 9600);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* Toast layer — above everything */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <StatusBar />
      <AppHeader
        sticky
        userLevel={userLevel}
        livesUsed={livesUsed}
        livesTotal={livesTotal}
        avatarUrl={avatarUrl}
        userInitial={userInitial}
      />
      <TabShell activeTab={activeTab} onTabChange={setActiveTab}>
        {children}
      </TabShell>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} fixed={false} />

      {/* Global modals */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={closePaywall}
        onSelectPlan={() => closePaywall()}
      />
      <RatingModal
        isOpen={ratingOpen}
        onClose={() => { setRatingOpen(false); setHasRated(); }}
        onFeedback={() => { setRatingOpen(false); setHasRated(); }}
      />
      <WelcomeBackModal
        isOpen={welcomeBackOpen}
        onClose={() => setWelcomeBackOpen(false)}
        streakBroken={streakBroken}
        streakCount={7}
        freezesRemaining={1}
        onPlayDaily={() => { setLastPlayedDate(today()); setWelcomeBackOpen(false); }}
        onGoToGames={() => setWelcomeBackOpen(false)}
      />

      {/* Debug toast button — remove before production */}
      {typeof window !== "undefined" && window.location.pathname === "/shell" && (
        <button
          onClick={fireDebugToasts}
          style={{
            position: "fixed", bottom: 80, right: 16, zIndex: 300,
            background: "var(--accent)", color: "var(--on-accent)",
            fontFamily: "var(--font-mono)", fontSize: 10,
            border: "none", borderRadius: 8, padding: "8px 12px",
            cursor: "pointer",
          }}
        >
          Test Toasts
        </button>
      )}
    </div>
  );
}
