"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const RULES = [
  {
    label: "FREE DAILY LIMIT",
    value: "5",
    unit: "PLAYS / DAY",
    desc: "Full vault access. All 24 games. Sessions reset at midnight.",
    accent: false,
  },
  {
    label: "WEEKLY STREAK BONUS",
    value: "+10",
    unit: "BONUS PLAYS",
    desc: "Play 7 consecutive days. Bonus credited automatically.",
    accent: false,
  },
  {
    label: "PRO UNLIMITED",
    value: "∞",
    unit: "NO LIMITS",
    desc: "Unlimited training from $2/month. Family plans from $5.",
    accent: true,
  },
];

export function HeroTokens() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px 0" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-accent-primary)", fontFamily: "var(--font-mono)", marginBottom: 16 }}>
          HOW IT WORKS
        </p>
        <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.1 }}>
          Train daily. Build streaks. Go unlimited.
        </h2>
      </motion.div>

      <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden", marginBottom: 80 }}>
        {RULES.map((rule, i) => (
          <motion.div key={rule.label}
            initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            style={{
              display: "grid", gridTemplateColumns: "180px 1fr auto",
              alignItems: "center", gap: "0 32px",
              padding: "24px 28px",
              borderBottom: i < 2 ? "1px solid var(--color-border)" : "none",
              background: rule.accent ? "rgba(0,255,255,0.04)" : "var(--color-surface)",
            }}
          >
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: rule.accent ? "var(--color-accent-primary)" : "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 6 }}>
                {rule.label}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: rule.accent ? "var(--color-accent-primary)" : "var(--color-text-primary)", fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                  {rule.value}
                </span>
                <span style={{ fontSize: 9, fontWeight: 700, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
                  {rule.unit}
                </span>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              {rule.desc}
            </p>
            {rule.accent ? (
              <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "var(--color-accent-primary)", color: "#000", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                See Plans <ChevronRight size={12} />
              </Link>
            ) : (
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
                {i === 0 ? "NO CARD NEEDED" : "AUTO CREDITED"}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
