import { RootShell } from "@/components/shell/RootShell";
import { GamesTab } from "@/features/games/GamesTab";
import { DailyTab } from "@/features/daily/DailyTab";
import { LeadersTab } from "@/features/leaderboard/LeadersTab";
import { ProfileTab } from "@/features/profile/ProfileTab";

export const metadata = { title: "Shell Preview | MindElement" };

export default function ShellPreviewPage() {
  return (
    <RootShell>
      <GamesTab />
      <DailyTab />
      <LeadersTab />
      <ProfileTab />
    </RootShell>
  );
}
