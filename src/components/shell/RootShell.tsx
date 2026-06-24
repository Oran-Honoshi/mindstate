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
import { CelebrationManager } from "@/components/celebrations/CelebrationManager";
import { useCelebrationStore } from "@/store/useCelebrationStore";
import { SubScreenProvider } from "./SubScreenContext";
import { SubScreenLayer } from "./SubScreenLayer";

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
  const { triggerLevelUp, triggerCentury, triggerStreak } = useCelebrationStore();

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
    <SubScreenProvider>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* Sub-screens slide in above everything at z-50 */}
      <SubScreenLayer />

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

      {/* Celebration overlay system */}
      <CelebrationManager />

      {/* Debug buttons for /shell — remove before production */}
      {typeof window !== "undefined" && window.location.pathname === "/shell" && (
        <div style={{ position: "fixed", bottom: 80, right: 16, zIndex: 400, display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={fireDebugToasts}
            style={{ background: "var(--accent)", color: "var(--on-accent)", fontFamily: "var(--font-mono)", fontSize: 10, border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}
          >
            Test Toasts
          </button>
          <button
            onClick={() => triggerLevelUp(8, "Strategist", 3200)}
            style={{ background: "var(--violet)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 10, border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}
          >
            Test LevelUp
          </button>
          <button
            onClick={() => triggerCentury("tango", "Tango", 9240, 971, 3)}
            style={{ background: "var(--gold)", color: "#06231F", fontFamily: "var(--font-mono)", fontSize: 10, border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}
          >
            Test Century
          </button>
          <button
            onClick={() => triggerStreak(30, Array.from({ length: 28 }, (_, i) => i < 28))}
            style={{ background: "var(--hard)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 10, border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}
          >
            Test Streak
          </button>
        </div>
      )}
    </div>
    </SubScreenProvider>
  );
}
