"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";
import { SparkyImg } from "@/components/ui/SparkyImg";
import { Icon } from "@/components/ui/Icon";
import { useSubScreenSafe } from "@/components/shell/SubScreenContext";

interface AppHeaderProps {
  livesUsed?: number;
  livesTotal?: number;
  userLevel?: number;
  avatarUrl?: string;
  userInitial?: string;
  /** When true, renders sticky (for use inside RootShell flex column) */
  sticky?: boolean;
}

function ringColor(level: number): string {
  if (level >= 25) return "var(--violet)";
  if (level >= 10) return "var(--gold)";
  return "var(--accent)";
}

export function AppHeader({
  livesUsed,
  livesTotal = 5,
  userLevel = 1,
  avatarUrl,
  userInitial,
  sticky = false,
}: AppHeaderProps) {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const subScreen = useSubScreenSafe();
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;
  const [tokens, setTokens] = useState(FREE_DAILY_TOKENS);

  useEffect(() => {
    if (!user || isPro) return;
    setTokens(getTokensRemaining(user.id));
    const iv = setInterval(() => setTokens(getTokensRemaining(user.id)), 10_000);
    return () => clearInterval(iv);
  }, [user, isPro]);

  const resolvedInitial =
    userInitial ?? (profile?.username ?? user?.email ?? "U")[0].toUpperCase();
  // lives remaining = total – used; show "5/5" by default when livesUsed is not provided
  const used = livesUsed ?? (isPro ? 0 : FREE_DAILY_TOKENS - tokens);
  const remaining = Math.max(0, livesTotal - used);
  const ring = ringColor(userLevel);

  return (
    <div
      style={{
        position: sticky ? "sticky" : "fixed",
        top: sticky ? 0 : 0,
        left: sticky ? undefined : 0,
        right: sticky ? undefined : 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 16px",
        height: 56,
        background: "var(--bg)",
        borderBottom: "0.5px solid var(--border)",
        flexShrink: 0,
      }}
    >
      {/* Left: Sparky idle + brand name */}
      <SparkyImg expr="idle" size={26} />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 14,
          color: "var(--text)",
        }}
      >
        Mind Element
      </span>

      <div style={{ flex: 1 }} />

      {/* Lives / plays pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: "var(--surf)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "5px 9px",
          flexShrink: 0,
        }}
      >
        <Icon name="Bolt" size={14} color="var(--accent)" strokeWidth={2} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--muted)",
          }}
        >
          {isPro ? "∞" : `${remaining}/${livesTotal}`}
        </span>
      </div>

      {/* Settings button */}
      <button
        onClick={() => subScreen ? subScreen.openSubScreen("settings") : router.push("/settings")}
        aria-label="Settings"
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: "var(--surf)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
          padding: 0,
        }}
      >
        <Icon name="Settings" size={16} color="var(--muted)" />
      </button>

      {/* Avatar with tier ring */}
      <button
        onClick={() => router.push("/profile")}
        aria-label="Profile"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            padding: 2,
            background: ring,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Avatar"
              width={26}
              height={26}
              style={{ borderRadius: "50%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "var(--surf)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--muted)",
                fontFamily: "var(--font-display)",
              }}
            >
              {resolvedInitial}
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
