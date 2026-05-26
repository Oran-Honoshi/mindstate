"use client";
import { useSettingsStore } from "@/store/settingsStore";
import type { Theme } from "@/store/settingsStore";

const THEMES: { value: Theme; label: string }[] = [
  { value: "dark",  label: "Dark"  },
  { value: "light", label: "Light" },
  { value: "paper", label: "Paper" },
];

export function ThemeSwitcher() {
  const theme = useSettingsStore(s => s.theme);
  const setTheme = useSettingsStore(s => s.setTheme);

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {THEMES.map(({ value, label }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            aria-pressed={active}
            style={{
              padding: "5px 12px",
              borderRadius: 10,
              border: "0.5px solid",
              borderColor: active ? "var(--color-accent-primary)" : "transparent",
              background: active ? "transparent" : "var(--color-surface-2)",
              color: active ? "var(--color-accent-primary)" : "var(--color-text-secondary)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
