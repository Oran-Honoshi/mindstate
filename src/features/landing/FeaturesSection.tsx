"use client";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";

interface Feature { icon: IconName; name: string; desc: string; }

const FEATURES: Feature[] = [
  { icon: "Grid",  name: "24 Games",      desc: "Logic, memory, words, geography, and more. New challenges daily." },
  { icon: "Flame", name: "Daily Streak",  desc: "Build the habit. Play every day. Watch your streak grow." },
  { icon: "User",  name: "Family Plans",  desc: "Compete with your family. Group leaderboard from $5/month." },
  { icon: "Star",  name: "XP & Levels",   desc: "Earn XP, level up, unlock mastery tiers. Progress that feels real." },
  { icon: "Check", name: "Zero Ads",      desc: "No ads. No dark patterns. Just clean, focused brain training." },
  { icon: "Bolt",  name: "Works Offline", desc: "Installed as a PWA. Play anywhere, even without connection." },
];

export function FeaturesSection() {
  return (
    <section id="features" style={{ padding: "80px var(--screen-pad, 16px)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(28px,4vw,36px)", color: "var(--text)", marginBottom: 8 }}>
            Why Mind Element?
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--muted)" }}>
            Built for people who take their brain seriously.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {FEATURES.map(({ icon, name, desc }) => (
            <div key={name} style={{
              background: "var(--surf)", border: "0.5px solid var(--border)",
              borderRadius: "var(--r-card)", padding: 24,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "var(--r-icon, 12px)",
                background: "color-mix(in srgb, var(--accent) 10%, var(--surf))",
                border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <Icon name={icon} size={24} color="var(--accent)" strokeWidth={2} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
                {name}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)", marginTop: 6, lineHeight: 1.6 }}>
                {desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
