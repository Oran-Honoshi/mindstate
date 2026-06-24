"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { PricingPlanCard } from "@/features/pricing/PricingPlanCard";
import type { PricingPlan } from "@/features/pricing/PricingPlanCard";
import { useRouter } from "next/navigation";

const PLANS: PricingPlan[] = [
  { name: "Individual", monthly: "$2", annual: "$1.33", features: ["Unlimited plays", "All 24 games", "Personal leaderboard", "No ads ever"], popular: false, cta: "Choose Plan" },
  { name: "Family · 3", monthly: "$5", annual: "$3.33", features: ["Everything in Individual", "Family leaderboard", "3 profiles", "Invite with link"], popular: true, cta: "Start Free Trial" },
  { name: "Family · 7", monthly: "$10", annual: "$6.67", features: ["Everything in Family 3", "Up to 7 profiles"], popular: false, cta: "Choose Plan" },
];

export function LandingPricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);
  const router = useRouter();

  return (
    <section id="pricing" style={{ padding: "80px var(--screen-pad, 16px)", background: "var(--surf2)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(28px,4vw,36px)", color: "var(--text)", marginBottom: 8 }}>
            Simple, honest pricing.
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--muted)" }}>
            Start free. Go pro when you&apos;re ready.
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 32 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: isAnnual ? "var(--muted)" : "var(--text)", fontWeight: isAnnual ? 400 : 600 }}>Monthly</span>
          <div onClick={() => setIsAnnual(a => !a)} style={{ width: 44, height: 24, borderRadius: 12, position: "relative", background: isAnnual ? "var(--accent)" : "var(--surf2)", border: "1px solid var(--border)", cursor: "pointer" }}>
            <motion.div animate={{ x: isAnnual ? 21 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} style={{ position: "absolute", top: 3, width: 18, height: 18, borderRadius: 9, background: "white" }} />
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: isAnnual ? "var(--text)" : "var(--muted)", fontWeight: isAnnual ? 600 : 400 }}>Annual</span>
        </div>

        {/* Plans row */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", maxWidth: 860, margin: "0 auto" }}>
          {PLANS.map((plan, i) => (
            <div key={plan.name} style={{ flex: 1, minWidth: 220, transform: i === 1 ? "scale(1.02)" : undefined, transformOrigin: "top center" }}>
              <PricingPlanCard plan={plan} isAnnual={isAnnual} />
            </div>
          ))}
        </div>

        {/* Free tier note */}
        <div style={{ maxWidth: 420, margin: "24px auto 0", background: "var(--surf)", border: "0.5px solid var(--border)", borderRadius: "var(--r-card)", padding: 16, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 6 }}>Not ready? Play free.</div>
          <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)", marginBottom: 14 }}>5 games per day, all 24 games, no card required.</div>
          <button onClick={() => router.push("/auth/register")} style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--accent)", background: "transparent", border: "1.5px solid var(--accent)", borderRadius: "var(--r-btn)", padding: "10px 20px", cursor: "pointer" }}>
            Try for free
          </button>
        </div>
      </div>
    </section>
  );
}
