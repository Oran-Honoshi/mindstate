"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Calendar, BarChart2, User } from "lucide-react";

const TABS = [
  { label: "Games",   href: "/games",       Icon: Grid      },
  { label: "Daily",   href: "/daily",       Icon: Calendar  },
  { label: "Leaders", href: "/leaderboard", Icon: BarChart2 },
  { label: "You",     href: "/profile",     Icon: User      },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/games/")) return null;

  return (
    <nav
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        height: "calc(56px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        display: "flex", alignItems: "stretch",
      }}
      aria-label="Main navigation"
    >
      {TABS.map(({ label, href, Icon }) => {
        const active = pathname === href || (href !== "/games" && pathname.startsWith(href + "/"));
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 4, textDecoration: "none",
              padding: "10px 0 6px",
              color: active ? "var(--color-accent-primary)" : "var(--color-text-faint)",
              transition: "color 0.18s",
            }}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={2} />
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 7.5,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
