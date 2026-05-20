"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "es" | "de" | "fr" | "pt" | "nl" | "he";
export type Theme = "light" | "dark";

interface SettingsState {
  isSilentMode: boolean;
  isAccessibilityMode: boolean;
  theme: Theme;
  language: Language;
  toggleSilentMode: () => void;
  toggleAccessibilityMode: () => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      isSilentMode: false,
      isAccessibilityMode: false,
      theme: "light",
      language: "en",

      toggleSilentMode: () => set(s => ({ isSilentMode: !s.isSilentMode })),

      toggleAccessibilityMode: () => {
        const next = !get().isAccessibilityMode;
        set({ isAccessibilityMode: next });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("accessibility-mode", next);
        }
      },

      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", next === "dark");
          document.documentElement.style.colorScheme = next;
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