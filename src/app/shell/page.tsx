import { RootShell } from "@/components/shell/RootShell";
import { GamesTab } from "@/features/games/GamesTab";

export const metadata = { title: "Shell Preview | MindElement" };

export default function ShellPreviewPage() {
  return (
    <RootShell>
      <GamesTab />
      <div
        style={{
          padding: 16,
          color: "var(--text)",
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        Daily tab — coming in Step 5
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
        Leaders tab — coming in Step 5
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
        Profile tab — coming in Step 5
      </div>
    </RootShell>
  );
}
