"use client";
import { useSettingsStore } from "@/store/settingsStore";
import type { Theme } from "@/store/settingsStore";
import { Icon } from "@/components/ui/Icon";

export function LandingFooter() {
  const { theme, setTheme } = useSettingsStore();
  const themes: Theme[] = ["dark", "light", "paper"];
  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];

  return (
    <footer style={{ background: "var(--surf)", borderTop: "0.5px solid var(--border)" }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto",
        padding: "32px var(--screen-pad, 16px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 24,
      }}>
        {/* Left: logo + copyright */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: "linear-gradient(135deg, var(--accent), var(--violet))",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 11, color: "var(--bg)" }}>ME</span>
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
              Mind Element
            </span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
            © 2025 Mind Element. All rights reserved.
          </div>
        </div>

        {/* Center: links */}
        <div style={{ display: "flex", gap: 20 }} className="lp-footer-links">
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a key={l} href="#" style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>

        {/* Right: theme toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setTheme(nextTheme)} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--surf2)", border: "0.5px solid var(--border)",
            borderRadius: "var(--r-pill)", padding: "6px 14px",
            cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)",
          }}>
            <Icon name="Settings" size={13} color="var(--muted)" />
            Theme
          </button>
        </div>
      </div>
    </footer>
  );
}
