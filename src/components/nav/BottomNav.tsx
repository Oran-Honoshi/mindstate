"use client";
import { usePathname, useRouter } from "next/navigation";
import { Icon, IconName } from "@/components/ui/Icon";

const TABS: { label: string; href: string; icon: IconName }[] = [
  { label: "GAMES",   href: "/games",        icon: "Grid"     },
  { label: "DAILY",   href: "/daily",        icon: "Calendar" },
  { label: "LEADERS", href: "/leaderboard",  icon: "BarChart" },
  { label: "YOU",     href: "/profile",      icon: "User"     },
];

interface BottomNavProps {
  /** Controlled mode: 0–3. When provided with onTabChange, skips router navigation. */
  activeTab?: number;
  onTabChange?: (n: number) => void;
  /**
   * When true (default), renders as position:fixed at the bottom of the viewport.
   * Set to false when used inside a flex column (e.g. RootShell).
   */
  fixed?: boolean;
}

export function BottomNav({ activeTab, onTabChange, fixed = true }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const controlled = activeTab !== undefined && onTabChange !== undefined;

  // Hide on game board screens (any /games/* sub-route)
  if (pathname.startsWith("/games/")) return null;

  const activeIdx = controlled
    ? activeTab
    : TABS.findIndex(
        ({ href }) =>
          pathname === href || (href !== "/games" && pathname.startsWith(href + "/")),
      );

  function handlePress(idx: number) {
    if (controlled) {
      if (idx !== activeTab) onTabChange(idx);
    } else {
      router.push(TABS[idx].href);
    }
  }

  return (
    <nav
      aria-label="Main navigation"
      style={{
        display: "flex",
        background: "var(--surf)",
        borderTop: "0.5px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        ...(fixed
          ? { position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100 }
          : { flexShrink: 0 }),
      }}
    >
      {TABS.map(({ label, href, icon }, idx) => {
        const active = idx === activeIdx;
        return (
          <button
            key={href}
            onClick={() => handlePress(idx)}
            aria-current={active ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              minHeight: 52,
              padding: "10px 0 6px",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Icon
              name={icon}
              size={20}
              color={active ? "var(--accent)" : "var(--faint)"}
              strokeWidth={2}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 7.5,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: active ? "var(--accent)" : "var(--faint)",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
