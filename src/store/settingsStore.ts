"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "es" | "de" | "fr" | "pt" | "nl" | "he";
export type Theme = "dark" | "light" | "paper";

interface SettingsState {
  isSilentMode: boolean;
  isAccessibilityMode: boolean;
  isPracticeMode: boolean;
  isTimerEnabled: boolean;
  theme: Theme;
  language: Language;
  toggleSilentMode: () => void;
  toggleAccessibilityMode: () => void;
  togglePracticeMode: () => void;
  toggleTimer: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      isSilentMode: false,
      isAccessibilityMode: false,
      isPracticeMode: false,
      isTimerEnabled: true,
      theme: "dark",
      language: "en",

      toggleSilentMode: () => set(s => ({ isSilentMode: !s.isSilentMode })),
      togglePracticeMode: () => set(s => ({ isPracticeMode: !s.isPracticeMode })),
      toggleTimer: () => set(s => ({ isTimerEnabled: !s.isTimerEnabled })),

      toggleAccessibilityMode: () => {
        const next = !get().isAccessibilityMode;
        set({ isAccessibilityMode: next });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("accessibility-mode", next);
        }
      },

      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
          document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
        }
      },

      setLanguage: (language) => {
        set({ language });
        if (typeof document !== "undefined") {
          const dir = language === "he" ? "rtl" : "ltr";
          document.documentElement.dir = dir;
          document.documentElement.lang = language;
        }
        import("@/lib/i18n/config").then(({ default: i18n }) => {
          i18n.changeLanguage(language);
        });
      },
    }),
    { name: "mindstate-settings" }
  )
);
