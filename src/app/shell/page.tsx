import { RootShell } from "@/components/shell/RootShell";

export const metadata = { title: "Shell Preview | MindElement" };

export default function ShellPreviewPage() {
  return (
    <RootShell>
      <div
        style={{
          padding: 16,
          color: "var(--text)",
          fontFamily: "var(--font-display)",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        Games tab — coming in Step 4
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
        Daily tab — coming in Step 4
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
        Leaders tab — coming in Step 4
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
        Profile tab — coming in Step 4
      </div>
    </RootShell>
  );
}
