"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, Star, Trophy, User } from "lucide-react";

const TABS = [
  { label: "Games",  href: "/games",       Icon: Grid2X2 },
  { label: "Daily",  href: "/daily",       Icon: Star    },
  { label: "League", href: "/leaderboard", Icon: Trophy  },
  { label: "You",    href: "/profile",     Icon: User    },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  // Hide during active gameplay — /games/[slug] routes, but not the hub at /games
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
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 3, textDecoration: "none",
              color: active ? "var(--color-accent-primary)" : "var(--color-text-secondary)",
              transition: "color 0.15s",
            }}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              fontFamily: "var(--font-sans)", letterSpacing: "0.02em",
            }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
