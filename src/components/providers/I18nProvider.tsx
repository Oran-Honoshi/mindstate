"use client";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n/config";
import { useSettingsStore } from "@/store/settingsStore";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { language, setLanguage } = useSettingsStore();
  useEffect(() => { setLanguage(language); }, []);
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
