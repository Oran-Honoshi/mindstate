"use client";
import { useEffect } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import type { Theme } from "@/store/settingsStore";

const THEME_COLOR: Record<Theme, string> = {
  dark:  "#121212",
  light: "#FFFFFF",
  paper: "#F2E8D9",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore(s => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme === "dark" ? "dark" : "light";

    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = THEME_COLOR[theme];
  }, [theme]);

  return <>{children}</>;
}
