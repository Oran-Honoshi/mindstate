"use client";
import { Card } from "@/components/ui/Card";
import { Btn } from "@/components/ui/Btn";
import { Icon } from "@/components/ui/Icon";

export interface PricingPlan {
  name: string;
  monthly: string;
  annual: string;
  features: string[];
  popular: boolean;
  cta: string;
}

interface PricingPlanCardProps {
  plan: PricingPlan;
  isAnnual: boolean;
}

export function PricingPlanCard({ plan, isAnnual }: PricingPlanCardProps) {
  const price = isAnnual ? plan.annual : plan.monthly;
  return (
    <div style={{ position: "relative" }}>
      {plan.popular && (
        <div style={{
          position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
          background: "var(--accent)", color: "var(--on-accent)",
          fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.12em",
          textTransform: "uppercase", padding: "3px 14px",
          borderRadius: "var(--r-pill)", whiteSpace: "nowrap", zIndex: 1,
        }}>
          Most Popular
        </div>
      )}
      <Card variant={plan.popular ? "accent" : "default"} padding="16px">
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>
          {plan.name}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 14 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "var(--text)" }}>
            {price}
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)" }}>/mo</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {plan.features.map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Icon name="Check" size={14} color="var(--easy)" strokeWidth={2.6} />
              <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--text)" }}>{f}</span>
            </div>
          ))}
        </div>
        <Btn variant={plan.popular ? "primary" : "ghost"} size="md">
          {plan.cta}
        </Btn>
      </Card>
    </div>
  );
}
