import { RootShell } from "@/components/shell/RootShell";
import { GamesTab } from "@/features/games/GamesTab";
import { DailyTab } from "@/features/daily/DailyTab";

export const metadata = { title: "Shell Preview | MindElement" };

export default function ShellPreviewPage() {
  return (
    <RootShell>
      <GamesTab />
      <DailyTab />
      <div
        style={{
          padding: 16,
          color: "var(--text)",
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        Leaders tab — coming later
      </div>
      <div
        style={{
          padding: 16,
          color: "var(--text)",
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        Profile tab — coming later
      </div>
    </RootShell>
  );
}
