"use client";
import { motion } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

const PLANS = [
  {
    name: "Free", price: "$0", period: "/mo",
    paddlePriceId: null, trial: false, free: true, highlight: false,
    features: [
      "Full vault access — all 24 games",
      "Hints on every challenge",
      "5 training sessions per day",
      "Global leaderboard",
      "Accessibility mode for all ages",
    ],
  },
  {
    name: "Individual", price: "$2", period: "/mo",
    paddlePriceId: "pri_01ks5tm2jqs69wrg92jxrc936b", trial: true, free: false, highlight: false,
    features: [
      "1 member account",
      "Thousands of stages — never runs out",
      "Unlimited daily training",
      "Full vault access — all 24 games",
      "3-day free trial",
    ],
  },
  {
    name: "Family Choice", price: "$5", period: "/mo",
    paddlePriceId: "pri_01ks5tnfpxvgdh2gkfm0k5pry8", trial: true, free: false, highlight: true,
    features: [
      "Up to 3 independent profiles",
      "Shared family leaderboard",
      "Unlimited daily training",
      "Full vault access — all 24 games",
      "3-day free trial",
    ],
  },
  {
    name: "Grand Family", price: "$10", period: "/mo",
    paddlePriceId: "pri_01ks5tpt6wsyn05gexnpade0a0", trial: true, free: false, highlight: false,
    features: [
      "Up to 7 independent profiles",
      "Everything in Family Choice, plus 4 more seats",
      "One bill covers all 7 members",
      "Unlimited daily training",
      "Full vault access — all 24 games",
      "3-day free trial",
    ],
  },
];

export function PricingSection() {
  const { user } = useAuthStore();

  return (
    <>
      <div id="pricing" style={{ scrollMarginTop: "70px" }}/>
      {/* ── PRICING ── */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 40, color: "var(--color-text-primary)", marginBottom: 10 }}>Simple, Honest Pricing</h2>
          <p style={{ fontSize: 18, color: "var(--color-text-secondary)" }}>Less than a coffee. Invest in the sharpest version of your household.</p>
        </div>
        <div className="pricing-grid" style={{ alignItems: "start", maxWidth: 860, margin: "0 auto" }}>
          {PLANS.map((plan, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              style={{ borderRadius: 24, padding: 28, position: "relative", background: plan.highlight ? "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))" : "var(--color-surface)", border: plan.highlight ? "none" : "0.5px solid var(--color-border)", boxShadow: plan.highlight ? "0 24px 56px rgba(79,110,247,0.3)" : "var(--shadow-sm)", color: plan.highlight ? "white" : "var(--color-text-primary)" }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 700, color: "var(--color-accent-primary)", background: "white", padding: "4px 14px", borderRadius: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", whiteSpace: "nowrap" }}>
                  Most Popular
                </div>
              )}
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12, color: plan.highlight ? "rgba(255,255,255,0.65)" : "var(--color-text-secondary)" }}>{plan.name}</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 22 }}>
                <span style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, fontFamily: "var(--font-sans)" }}>{plan.price}</span>
                <span style={{ fontSize: 14, paddingBottom: 7, opacity: 0.6 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: "none", marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: plan.highlight ? "rgba(255,255,255,0.88)" : "var(--color-text-secondary)" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: plan.highlight ? "rgba(255,255,255,0.2)" : "#EEF2FF" }}>
                      <Check size={10} color={plan.highlight ? "white" : "var(--color-accent-primary)"}/>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              {plan.free ? (
                <Link href="/auth/signup" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: "none", background: "var(--color-surface)", color: "var(--color-text-secondary)", border: "1.5px solid var(--color-border)" }}>
                  Start Training Free
                </Link>
              ) : (
                <button
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  if (typeof window !== "undefined" && (window as any).Paddle) {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (window as any).Paddle.Checkout.open({
                        items: [{ priceId: plan.paddlePriceId, quantity: 1 }],
                        customer: user?.email ? { email: user.email } : undefined,
                        customData: { user_id: user?.id ?? "" },
                      });
                    }
                  }}
                  style={{ display: "block", width: "100%", textAlign: "center", padding: "13px", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none", background: plan.highlight ? "white" : "transparent", color: plan.highlight ? "var(--color-accent-primary)" : "var(--color-text-secondary)", outline: plan.highlight ? "none" : "1.5px solid var(--color-border)" }}>
                  Test your skills free now
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <div id="faq" style={{ scrollMarginTop: "70px" }}/>
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "80px 48px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-secondary)", marginBottom: 10 }}>FAQ</p>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", lineHeight: 1.15 }}>
            Frequently Asked Questions
          </h2>
        </div>
        {[
          ["Is Mind Element free to use?", "Yes — free users get 5 daily training sessions across the full vault. Subscribe for unlimited access from $2/month."],
          ["What does Pro include?", "Unlimited daily training across the full vault, thousands of algorithmic stages, family leaderboards for up to 7 members, and early access to new experiences."],
          ["How much does Pro cost?", "Individual Pro is $2/month. Family plans start at $5/month for 3 members and $10/month for 7 members."],
          ["Is it appropriate for children?", "Yes. The puzzles build spatial reasoning and logical thinking without any ads, distractions, or inappropriate content."],
          ["Can it help older adults stay sharp?", "Yes. Accessibility Mode provides larger touch targets and optional timer-free play, designed for comfortable daily use at any age."],
          ["How does family billing work?", "One monthly charge covers up to 3 or 7 independent player profiles, each with their own progress and scores, plus a shared family leaderboard."],
          ["Can I cancel anytime?", "Yes. Cancel from your profile settings at any time. You keep access until the end of your billing period."],
          ["Do I need an account?", "No — you can play as a guest. Creating a free account saves your progress, streaks, and XP scores to the leaderboard."],
          ["Does it work offline?", "Yes. Mind Element is a Progressive Web App. Install it to your home screen and play without an internet connection."],
          ["What languages are supported?", "English, Spanish, German, French, Portuguese, Dutch, and Hebrew with full right-to-left layout."],
        ].map(([q, a], i) => (
          <details key={i} style={{ borderBottom: "0.5px solid var(--color-border)" }}>
            <summary style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", padding: "18px 0", cursor: "pointer", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {q}
              <span style={{ fontSize: 20, color: "var(--color-text-secondary)", flexShrink: 0 }}>+</span>
            </summary>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.75, paddingBottom: 18, maxWidth: 600 }}>{a}</p>
          </details>
        ))}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "0.5px solid var(--color-border)", background: "var(--color-surface-2)", padding: "32px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <img src="/icons/icon-192.png" alt="Mind Element" style={{ width: 28, height: 28, borderRadius: "22.5%", objectFit: "cover" }}/>
            <span style={{ fontWeight: 700, fontSize: 15, color: "var(--color-text-secondary)", fontFamily: "var(--font-sans)" }}>Mind Element</span>
          </Link>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>&copy; {new Date().getFullYear()} Mind Element. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {[["Games", "/games"], ["Pricing", "/pricing"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Refund", "/refund"], ["Contact", "/contact"]].map(([l, h]) => (
              <Link key={l} href={h} style={{ fontSize: 13, color: "var(--color-text-secondary)", textDecoration: "none" }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
