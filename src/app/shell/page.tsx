import { RootShell } from "@/components/shell/RootShell";
import { GamesTab } from "@/features/games/GamesTab";
import { DailyTab } from "@/features/daily/DailyTab";
import { ProfileTab } from "@/features/profile/ProfileTab";

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
      <ProfileTab />
    </RootShell>
  );
}
