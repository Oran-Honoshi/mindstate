import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "en" | "he";
type Theme = "light" | "dark";

interface SettingsState {
  isSilentMode: boolean;
  theme: Theme;
  language: Language;
  toggleSilentMode: () => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      isSilentMode: false,
      theme: "light",
      language: "en",
      toggleSilentMode: () => set(s => ({ isSilentMode: !s.isSilentMode })),
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        // Immediately apply to DOM
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", next === "dark");
          document.documentElement.style.colorScheme = next;
        }
      },
      setLanguage: (language) => {
        set({ language });
        if (typeof document !== "undefined") {
          document.documentElement.dir = language === "he" ? "rtl" : "ltr";
          document.documentElement.lang = language;
        }
      },
    }),
    { name: "mindstate-settings" }
  )
);
