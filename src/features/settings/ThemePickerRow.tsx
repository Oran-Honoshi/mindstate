"use client";
import { useSettingsStore } from "@/store/settingsStore";
import type { Theme } from "@/store/settingsStore";

const THEMES: { key: Theme; label: string; bg: string; textColor: string }[] = [
  { key: "dark",  label: "Dark",  bg: "#0B0C0F", textColor: "#F4F6F8" },
  { key: "light", label: "Light", bg: "#F5F6F8", textColor: "#15171C" },
  { key: "paper", label: "Paper", bg: "#ECE3D0", textColor: "#241A0C" },
];

export function ThemePickerRow() {
  const { theme, setTheme } = useSettingsStore();

  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 12 }}>
        Theme
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {THEMES.map((t) => (
          <div
            key={t.key}
            onClick={() => setTheme(t.key)}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 10,
              background: t.bg,
              border: `${theme === t.key ? 2 : 0.5}px solid ${theme === t.key ? "var(--accent)" : "var(--border)"}`,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              padding: "0 0 8px",
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
          >
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: t.textColor,
              letterSpacing: "0.06em",
            }}>
              {t.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
