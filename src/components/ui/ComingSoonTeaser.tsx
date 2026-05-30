"use client";

import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Gamepad2, Layers, Trophy } from "lucide-react";
import Link from "next/link";

export function ComingSoonTeaser({ compact = false }: { compact?: boolean }) {
  // Compact version — shown under the games grid, NO "Get Early Access" CTA here
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: "rgba(0,255,255,0.05)",
          borderRadius: 20, border: "0.5px solid rgba(0,255,255,0.15)",
          padding: "20px 24px",
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(0,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Sparkles size={18} color="var(--color-accent-primary)" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 2 }}>
              New games in development · More stages coming
            </p>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
              With our ongoing development plan, you will always be challenged with something new.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full roadmap section
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Sparkles size={16} color="var(--color-accent-primary)" />
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-secondary)" }}>
            What is coming next
          </p>
        </div>
        <h2 style={{
          fontSize: 36, fontWeight: 700, color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)", marginBottom: 12, lineHeight: 1.15,
        }}>
          With our ongoing and future development plan,
          <span style={{ display: "block", color: "var(--color-accent-primary)" }}>
            you will always be challenged.
          </span>
        </h2>
        <p style={{ fontSize: 17, color: "var(--color-text-secondary)", maxWidth: 540, lineHeight: 1.7 }}>
          New games and stages are always in development. MindElement grows with you — there is always a next challenge waiting.
        </p>
      </motion.div>

      {/* Three vertical tiles — no dates, no game names */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
        {[
          {
            icon: Gamepad2,
            color: "var(--color-accent-primary)",
            bg: "rgba(0,255,255,0.06)",
            title: "Dozens more games are under development",
            body: "New logic disciplines, new mechanics, new ways to challenge your mind. The vault keeps growing.",
          },
          {
            icon: Layers,
            color: "var(--color-accent-primary)",
            bg: "rgba(0,255,255,0.06)",
            title: "Hundreds of new stages to existing games",
            body: "Every current game will receive hundreds of additional stages across all difficulty tiers — easy, medium, and hard.",
          },
          {
            icon: Trophy,
            color: "#F59E0B",
            bg: "rgba(245,158,11,0.08)",
            title: "Worldwide contests",
            body: "Compete globally against other players. Timed challenges, leaderboard events, and seasonal tournaments are on the way.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: "var(--color-surface)",
              borderRadius: 20,
              border: "0.5px solid var(--color-border)",
              padding: "24px 28px",
              display: "flex", alignItems: "flex-start", gap: 18,
              boxShadow: "var(--shadow-sm)",
            }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: item.bg,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <item.icon size={22} color={item.color} />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 6 }}>
                {item.title}
              </p>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
                {item.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Get Early Access CTA — lives here now, not in compact tile */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.24 }}
        style={{
          borderRadius: 22, padding: "28px 32px",
          background: "var(--color-accent-primary)",
          boxShadow: "0 16px 40px rgba(0,255,255,0.18)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24, flexWrap: "wrap",
        }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "#000", marginBottom: 6 }}>
            Be first to everything new.
          </p>
          <p style={{ fontSize: 14, color: "rgba(0,0,0,0.6)", lineHeight: 1.6, maxWidth: 480 }}>
            Pro subscribers get access to every new game and stage the moment it ships. Start with a 3-day free trial.
          </p>
        </div>
        <Link href="/auth/signup"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 22px", borderRadius: 14, background: "white",
            color: "var(--color-accent-primary)", fontSize: 14, fontWeight: 700, textDecoration: "none",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
          Get Early Access <ChevronRight size={14} />
        </Link>
      </motion.div>
    </section>
  );
}