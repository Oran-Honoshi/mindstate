"use client";
import { useState, useEffect, ReactNode, Children, isValidElement } from "react";
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
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

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
  const { toasts, dismissToast } = useToastStack();
  useCelebrationStore();

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
        {Children.map(children, (child, i) =>
          isValidElement(child) ? <ErrorBoundary key={i}>{child}</ErrorBoundary> : child
        )}
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
    </div>
    </SubScreenProvider>
  );
}
