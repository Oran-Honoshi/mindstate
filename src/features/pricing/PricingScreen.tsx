"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Micro } from "@/components/ui/Micro";
import { Icon } from "@/components/ui/Icon";
import { SparkyImg } from "@/components/ui/SparkyImg";
import { PricingPlanCard } from "./PricingPlanCard";
import type { PricingPlan } from "./PricingPlanCard";
import { PricingFaqItem } from "./PricingFaqItem";

const PLANS: PricingPlan[] = [
  { name: "Individual", monthly: "$2", annual: "$1.33", features: ["Unlimited plays", "All 24 games", "Personal leaderboard", "No ads ever"], popular: false, cta: "Choose Plan" },
  { name: "Family · 3", monthly: "$5", annual: "$3.33", features: ["Everything in Individual", "Family leaderboard", "3 profiles", "Invite with link"], popular: true, cta: "Start Free Trial" },
  { name: "Family · 7", monthly: "$10", annual: "$6.67", features: ["Everything in Family 3", "Up to 7 profiles"], popular: false, cta: "Choose Plan" },
];

const TRUST = [
  { icon: "Check" as const, label: "Cancel anytime" },
  { icon: "Lock" as const, label: "7-day free trial" },
  { icon: "Star" as const, label: "Family sharing" },
];

const FAQS = [
  { q: "Can I change plans later?", a: "Yes, upgrade or downgrade anytime from Settings." },
  { q: "What happens after the trial?", a: "You'll be charged on day 8. Cancel before then for free." },
];

export function PricingScreen() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div style={{ padding: "16px 18px 28px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", padding: "24px 0 16px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <SparkyImg expr="celebrate" size={52} />
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--text)" }}>
          Unlock Everything
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)", maxWidth: 280, margin: "6px auto 0", lineHeight: 1.5 }}>
          Play all 24 games, unlimited stages, family leaderboards.
        </div>
      </div>

      {/* Billing toggle */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, margin: "20px 0 16px" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: isAnnual ? "var(--muted)" : "var(--text)", fontWeight: isAnnual ? 400 : 600 }}>Monthly</span>
        <div
          onClick={() => setIsAnnual((a) => !a)}
          style={{ width: 44, height: 24, borderRadius: 12, position: "relative", background: isAnnual ? "var(--accent)" : "var(--surf2)", border: "1px solid var(--border)", cursor: "pointer", transition: "background 150ms", flexShrink: 0 }}
        >
          <motion.div
            animate={{ x: isAnnual ? 21 : 2 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{ position: "absolute", top: 3, width: 18, height: 18, borderRadius: 9, background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: isAnnual ? "var(--text)" : "var(--muted)", fontWeight: isAnnual ? 600 : 400 }}>Annual</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold)", padding: "2px 7px", background: "color-mix(in srgb, var(--gold) 12%, transparent)", borderRadius: "var(--r-pill)" }}>
            Save 33%
          </span>
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PLANS.map((plan) => (
          <PricingPlanCard key={plan.name} plan={plan} isAnnual={isAnnual} />
        ))}
      </div>

      {/* Trust strip */}
      <Card variant="default" padding="0" style={{ display: "flex", marginTop: 16, overflow: "hidden" }}>
        {TRUST.map((t, i) => (
          <div key={t.label} style={{ flex: 1, padding: "12px 8px", textAlign: "center", ...(i < TRUST.length - 1 ? { borderRight: "0.5px solid var(--border)" } : {}) }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Icon name={t.icon} size={14} color="var(--easy)" strokeWidth={2} />
            </div>
            <div style={{ marginTop: 4 }}>
              <Micro size={9}>{t.label}</Micro>
            </div>
          </div>
        ))}
      </Card>

      {/* FAQ */}
      <div style={{ margin: "22px 2px 12px" }}><Micro>FAQ</Micro></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FAQS.map((f, i) => (
          <PricingFaqItem key={i} q={f.q} a={f.a} />
        ))}
      </div>
    </div>
  );
}
