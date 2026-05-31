"use client";
import { motion } from "framer-motion";
import { ChevronRight, Download } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { HeroPhoneMockups } from "@/features/landing/HeroPhoneMockups";
import { HeroTokens } from "./HeroTokens";
import { HeroAudience } from "./HeroAudience";

const BASE = "https://ixlcndaryfgkbcjooitu.supabase.co/storage/v1/object/public/asset%20library/";
const AVATAR_IMGS = [
  BASE + "2%20women%20at%20a%20cafe%20playing%20phones.jpg",
  BASE + "woman%20at%20the%20park%20playing%20phone.jpg",
  BASE + "woman%20at%20work%20playing%20phone.jpg",
  BASE + "man%20at%20subway%20playing%20phone.jpg",
  BASE + "woman%20at%20dining%20table%20at%20home%20smiling%20holding%20phone.jpg",
];

const PROOF_STATS = ["24 GAMES", "THOUSANDS OF STAGES", "ZERO ADS EVER", "FREE TO START"];

export function GameHero() {
  const { user } = useAuthStore();
  const { isInstallable, triggerInstall } = usePWAInstall();

  return (
    <>
      {/* ── HERO ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(80px,10vh,140px) 48px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px,6vw,96px)", alignItems: "center" }}>
        <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 4, border: "1px solid var(--color-accent-primary)", marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent-primary)", boxShadow: "0 0 6px var(--color-accent-primary)" }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "var(--color-accent-primary)", fontFamily: "var(--font-mono)" }}>LIVE · FREE TO START</span>
          </div>

          <h1 style={{ fontSize: "clamp(48px,5.5vw,88px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.025em", color: "var(--color-text-primary)", marginBottom: 24 }}>
            SHARPER<br />EVERY DAY.
          </h1>

          <p style={{ fontSize: 18, color: "var(--color-text-secondary)", lineHeight: 1.65, maxWidth: 440, marginBottom: 40 }}>
            24 precision logic games. 100 algorithmic stages each. Score faster, earn more XP, build streaks, compete with family.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 }}>
            <Link href="/games" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 8, background: "var(--color-accent-primary)", color: "#000", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              Start Training Free <ChevronRight size={15} />
            </Link>
            <Link href="#games" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 8, border: "1px solid var(--color-border)", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
              See All 24 Games
            </Link>
            {isInstallable && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={triggerInstall}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 8, border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
                <Download size={15} /> Install App
              </motion.button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {AVATAR_IMGS.map((src, i) => (
                <div key={i} style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid var(--color-bg)", marginLeft: i > 0 ? -9 : 0, overflow: "hidden", zIndex: 5 - i, position: "relative" }}>
                  <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Loved by players everywhere</p>
          </div>
        </motion.div>

        <HeroPhoneMockups />
      </section>

      {/* ── STAT TICKER ── */}
      <section style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px", display: "flex", alignItems: "stretch" }}>
          {PROOF_STATS.map((stat, i) => (
            <div key={stat} style={{ flex: 1, padding: "18px 0", textAlign: "center", borderRight: i < PROOF_STATS.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: "var(--color-text-primary)", fontFamily: "var(--font-mono)" }}>{stat}</span>
            </div>
          ))}
        </div>
      </section>

      <HeroTokens />
      <HeroAudience />
    </>
  );
}
