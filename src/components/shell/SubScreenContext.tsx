"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type SubScreenId = 'family' | 'settings' | 'pricing';

interface SubScreenContextValue {
  activeSub: SubScreenId | null;
  openSubScreen: (id: SubScreenId) => void;
  closeSubScreen: () => void;
}

const SubScreenContext = createContext<SubScreenContextValue | null>(null);

export function SubScreenProvider({ children }: { children: ReactNode }) {
  const [activeSub, setActiveSub] = useState<SubScreenId | null>(null);
  return (
    <SubScreenContext.Provider value={{
      activeSub,
      openSubScreen: (id) => setActiveSub(id),
      closeSubScreen: () => setActiveSub(null),
    }}>
      {children}
    </SubScreenContext.Provider>
  );
}

export function useSubScreen() {
  const ctx = useContext(SubScreenContext);
  if (!ctx) throw new Error("useSubScreen must be inside SubScreenProvider");
  return ctx;
}

/** Safe version — returns null when used outside the provider */
export function useSubScreenSafe() {
  return useContext(SubScreenContext);
}
