"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, Star, Trophy, User } from "lucide-react";
import { motion } from "framer-motion";

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
        background: "color-mix(in srgb, var(--color-surface) 90%, transparent)",
        backdropFilter: "blur(16px)",
        borderTop: "0.5px solid var(--color-border)",
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
              gap: 3, textDecoration: "none", position: "relative",
              color: active ? "var(--color-accent-primary)" : "var(--color-text-secondary)",
              transition: "color 0.18s",
            }}
            aria-current={active ? "page" : undefined}
          >
            {/* Sliding top indicator */}
            {active && (
              <motion.div
                layoutId="nav-indicator"
                style={{
                  position: "absolute", top: 0, left: "20%", right: "20%",
                  height: 2, borderRadius: "0 0 2px 2px",
                  background: "var(--color-accent-primary)",
                  boxShadow: "0 0 8px rgba(0,255,255,0.5)",
                }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <motion.div
              animate={{ scale: active ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
            </motion.div>
            <span style={{
              fontSize: 9, fontWeight: active ? 700 : 500,
              fontFamily: "var(--font-mono)", letterSpacing: "0.06em",
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
