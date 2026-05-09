"use client";
import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useSettingsStore();
  useEffect(() => { setTheme(theme); }, []);
  return <>{children}</>;
}
