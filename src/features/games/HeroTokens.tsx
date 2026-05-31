"use client";
import { motion } from "framer-motion";
import { Grid, Flame, Infinity } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  num: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  color: string;
  iconBg: string;
  iconBorder: string;
}

const STEPS: Step[] = [
  {
    num: "01",
    title: "PICK A GAME",
    desc: "Choose from 24 precision logic games. Each has 100 algorithmically generated stages.",
    Icon: Grid,
    color: "var(--color-accent-primary)",
    iconBg: "rgba(0,255,255,0.1)",
    iconBorder: "rgba(0,255,255,0.25)",
  },
  {
    num: "02",
    title: "TRAIN DAILY",
    desc: "5 free sessions every day. Build your streak. The longer your streak, the sharper you get.",
    Icon: Flame,
    color: "var(--color-accent-secondary)",
    iconBg: "rgba(57,255,20,0.1)",
    iconBorder: "rgba(57,255,20,0.25)",
  },
  {
    num: "03",
    title: "GO UNLIMITED",
    desc: "Subscribe for $2/month. Unlimited play, family groups, and leaderboard glory.",
    Icon: Infinity,
    color: "var(--color-accent-primary)",
    iconBg: "rgba(0,255,255,0.1)",
    iconBorder: "rgba(0,255,255,0.25)",
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
          Three steps to sharper.
        </h2>
      </motion.div>

      <div className="how-grid" style={{ marginBottom: 80 }}>
        {STEPS.map((step, i) => (
          <motion.div key={step.num}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            style={{
              padding: "28px 24px 24px",
              borderRadius: 12,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1, letterSpacing: "-0.02em" }}>
                {step.num}
              </span>
              <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                background: step.iconBg,
                border: `1px solid ${step.iconBorder}`,
              }}>
                <step.Icon size={19} color={step.color} />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 8, letterSpacing: "0.02em" }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.65, margin: 0 }}>
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
