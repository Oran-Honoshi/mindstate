"use client";
import { useState, ReactNode } from "react";
import { StatusBar } from "./StatusBar";
import { AppHeader } from "@/components/nav/AppHeader";
import { TabShell } from "./TabShell";
import { BottomNav } from "@/components/nav/BottomNav";

interface RootShellProps {
  children: ReactNode; // exactly 4 tab screen children
  userLevel?: number;
  livesUsed?: number;
  livesTotal?: number;
  avatarUrl?: string;
  userInitial?: string;
}

export function RootShell({
  children,
  userLevel = 1,
  livesUsed,
  livesTotal = 5,
  avatarUrl,
  userInitial,
}: RootShellProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "var(--bg)",
        overflow: "hidden", // prevents body scroll; each tab scrolls internally
      }}
    >
      <StatusBar />
      <AppHeader
        sticky
        userLevel={userLevel}
        livesUsed={livesUsed}
        livesTotal={livesTotal}
        avatarUrl={avatarUrl}
        userInitial={userInitial}
      />
      <TabShell activeTab={activeTab} onTabChange={setActiveTab}>
        {children}
      </TabShell>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} fixed={false} />
    </div>
  );
}
