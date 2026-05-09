import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      nav: { games: "Games", leaderboard: "Leaderboard", profile: "Profile", settings: "Settings", upgrade: "Upgrade" },
      common: { loading: "Loading...", error: "Something went wrong", play: "Play", locked: "Locked", free: "Free", pro: "Pro", back: "Back", save: "Save", cancel: "Cancel", close: "Close" },
    },
  },
  he: {
    translation: {
      nav: { games: "משחקים", leaderboard: "לוח תוצאות", profile: "פרופיל", settings: "הגדרות", upgrade: "שדרג" },
      common: { loading: "טוען...", error: "משהו השתבש", play: "שחק", locked: "נעול", free: "חינם", pro: "פרו", back: "חזור", save: "שמור", cancel: "ביטול", close: "סגור" },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "he"],
    interpolation: { escapeValue: false },
    detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
  });

export const RTL_LANGUAGES = ["he"];
export function isRTL(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang);
}
export default i18n;
