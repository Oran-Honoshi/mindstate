"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Settings } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";

export function AppHeader() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;
  const [tokens, setTokens] = useState(FREE_DAILY_TOKENS);

  useEffect(() => {
    if (!user || isPro) return;
    setTokens(getTokensRemaining(user.id));
    const iv = setInterval(() => setTokens(getTokensRemaining(user.id)), 10000);
    return () => clearInterval(iv);
  }, [user, isPro]);

  const initial = (profile?.username ?? user?.email ?? "U")[0].toUpperCase();

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 16px 12px",
      background: "var(--color-bg)",
      borderBottom: "1px solid var(--color-border)",
    }}>
      {/* NodeMark + brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 7,
          background: "var(--color-surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "var(--color-accent-primary)",
          }} />
        </div>
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
          color: "var(--color-text-primary)",
        }}>
          Mind Element
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Token pill */}
      {user && (
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          background: "var(--color-surface)", border: "1px solid var(--color-border)",
          borderRadius: 8, padding: "5px 9px", flexShrink: 0,
        }}>
          <Zap
            size={12}
            color="var(--color-accent-primary)"
            fill="var(--color-accent-primary)"
            strokeWidth={0}
          />
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "var(--color-text-secondary)",
          }}>
            {isPro ? "∞" : `${tokens}/${FREE_DAILY_TOKENS}`}
          </span>
        </div>
      )}

      {/* Settings button */}
      <button
        onClick={() => router.push("/settings")}
        aria-label="Settings"
        style={{
          width: 32, height: 32, borderRadius: 9,
          background: "var(--color-surface)", border: "1px solid var(--color-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, padding: 0,
        }}
      >
        <Settings size={16} color="var(--color-text-secondary)" />
      </button>

      {/* Avatar */}
      <button
        onClick={() => router.push("/profile")}
        aria-label="Profile"
        style={{
          width: 32, height: 32, borderRadius: "50%",
          background: user ? "var(--color-accent-primary)" : "var(--color-surface-2)",
          border: "none", cursor: "pointer", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700,
          color: user ? "var(--color-on-accent)" : "var(--color-text-faint)",
          fontFamily: "var(--font-display)",
        }}
      >
        {user ? initial : "?"}
      </button>
    </div>
  );
}
