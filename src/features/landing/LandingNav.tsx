"use client";
// Fixed top nav — marketing page only, independent of app shell
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/Btn";
import { useSettingsStore } from "@/store/settingsStore";

export function LandingNav() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useSettingsStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const themes = ["dark", "light", "paper"] as const;
  const themeLabels = { dark: "D", light: "L", paper: "P" };

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 56,
      background: "color-mix(in srgb, var(--bg) 85%, transparent)",
      backdropFilter: "blur(12px)",
      borderBottom: `0.5px solid ${scrolled ? "var(--border)" : "transparent"}`,
      transition: "border-color 200ms",
    }}>
      <nav style={{
        maxWidth: 1080, margin: "0 auto", height: "100%",
        padding: "0 var(--screen-pad, 16px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }} aria-label="Marketing navigation">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, var(--accent), var(--violet))",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--bg)" }}>ME</span>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
            Mind Element
          </span>
        </div>

        {/* Right: nav links + theme + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* Desktop nav links */}
          <div className="lp-navlinks" style={{ display: "flex", gap: 24 }}>
            {[["Features", "#features"], ["Games", "#games"], ["Pricing", "#pricing"]].map(([label, href]) => (
              <a key={href} href={href} style={{
                fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)",
                textDecoration: "none", fontWeight: 500,
              }}>{label}</a>
            ))}
          </div>

          {/* Theme toggle */}
          <div style={{ display: "flex", gap: 2, background: "var(--surf)", border: "0.5px solid var(--border)", borderRadius: 9, padding: 3 }}>
            {themes.map((t) => (
              <button key={t} onClick={() => setTheme(t)} title={t} style={{
                width: 24, height: 24, borderRadius: 6, border: "none", cursor: "pointer",
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                background: theme === t ? "var(--accent)" : "transparent",
                color: theme === t ? "var(--on-accent)" : "var(--muted)",
              }}>{themeLabels[t]}</button>
            ))}
          </div>

          {/* Sign in */}
          <a href="/auth/login" style={{
            fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)", textDecoration: "none",
          }}>Sign in</a>

          {/* CTA */}
          <Btn variant="primary" size="sm" fullWidth={false} onClick={() => router.push("/auth/register")}>
            Start Free
          </Btn>
        </div>
      </nav>
    </header>
  );
}
