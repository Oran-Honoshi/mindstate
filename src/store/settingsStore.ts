import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isRTL } from "@/lib/i18n/config";

export type Language = "en" | "he";
export type Theme = "dark" | "light";

interface SettingsState {
  isSilentMode: boolean;
  setSilentMode: (val: boolean) => void;
  toggleSilentMode: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      isSilentMode: false,
      setSilentMode: (val) => set({ isSilentMode: val }),
      toggleSilentMode: () => set((state) => ({ isSilentMode: !state.isSilentMode })),
      language: "en",
      isRTL: false,
      setLanguage: (lang) => {
        const rtl = isRTL(lang);
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
          document.documentElement.setAttribute("lang", lang);
        }
        set({ language: lang, isRTL: rtl });
        import("@/lib/i18n/config").then(({ default: i18n }) => {
          i18n.changeLanguage(lang);
        });
      },
      theme: "dark",
      setTheme: (theme) => {
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
          document.documentElement.classList.toggle("light", theme === "light");
        }
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        get().setTheme(next);
      },
    }),
    {
      name: "mindstate-settings",
      onRehydrateStorage: () => (state) => {
        if (!state || typeof document === "undefined") return;
        document.documentElement.setAttribute("dir", isRTL(state.language) ? "rtl" : "ltr");
        document.documentElement.setAttribute("lang", state.language);
        document.documentElement.classList.toggle("dark", state.theme === "dark");
      },
    }
  )
);
