"use client";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

const FAQS = [
  { q: "Do I need a credit card for the free plan?", a: "No. The free plan is free forever — 5 plays a day across all 24 games, no card required." },
  { q: "How does the XP and scoring work?", a: "Each stage starts at 1,000 XP and decays in real time — the faster you solve, the more you keep. Hints cost a percentage; Practice mode removes all pressure." },
  { q: "What are Sparky figures?", a: "Collectible looks for your avatar, earned by leveling up and hitting milestones, displayed next to your name on every leaderboard." },
  { q: "How does family pricing work?", a: "Family Choice ($5/mo) covers up to 3 independent profiles with a shared family leaderboard; Grand Family ($10/mo) covers up to 7. One bill." },
  { q: "Can I cancel anytime?", a: "Yes — upgrade, downgrade or cancel anytime from Settings. Paid plans start with a 7-day free trial." },
];

export function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ padding: "80px var(--screen-pad, 16px)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: 40, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(26px,3.5vw,36px)", color: "var(--text)" }}>
          Common questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map(({ q, a }, i) => (
            <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{
              background: "var(--surf)", border: "0.5px solid var(--border)",
              borderRadius: "var(--r-card)", padding: "16px 18px", cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ flex: 1, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{q}</span>
                <Icon name={open === i ? "X" : "ChevronRight"} size={16} color="var(--faint)" strokeWidth={2} />
              </div>
              {open === i && (
                <p style={{ fontFamily: "var(--font-body)", fontSize: 13, lineHeight: 1.6, color: "var(--muted)", marginTop: 12, marginBottom: 0 }}>{a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
