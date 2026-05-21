// src/app/pricing/page.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Users, Crown } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { useAuthStore } from "@/store/authStore";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    paddlePriceId: null,
    trial: false,
    free: true,
    highlight: false,
    icon: Zap,
    color: "#64748B",
    features: ["Full vault access","Hints on every challenge","5 training sessions/day","Global leaderboard"],
  },
  {
    name: "Individual",
    price: "$2",
    period: "/mo",
    paddlePriceId: "pri_01ks5tm2jqs69wrg92jxrc936b",
    trial: true,
    free: false,
    highlight: false,
    icon: Crown,
    color: "#4F6EF7",
    features: ["1 member account","Thousands of algorithmic stages","Unlimited daily training","Full vault access","Infinite mode","3-day free trial"],
  },
  {
    name: "Family Choice",
    price: "$5",
    period: "/mo",
    paddlePriceId: "pri_01ks5tnfpxvgdh2gkfm0k5pry8",
    trial: true,
    free: false,
    highlight: true,
    icon: Users,
    color: "#9C6BE8",
    features: ["Up to 3 independent profiles","Dedicated child & senior UI","Shared family milestones","Unlimited daily training","Full vault access","3-day free trial"],
  },
  {
    name: "Grand Family",
    price: "$10",
    period: "/mo",
    paddlePriceId: "pri_01ks5tpt6wsyn05gexnpade0a0",
    trial: true,
    free: false,
    highlight: false,
    icon: Users,
    color: "#39FF14",
    features: ["Up to 7 independent profiles","Master billing dashboard","All Family Choice perks","Unlimited daily training","Full vault access","3-day free trial"],
  },
];

export default function PricingPage() {
  const { user } = useAuthStore();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).Paddle) {
        (window as any).Paddle.Setup({ token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN });
      }
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  function openCheckout(priceId: string) {
  if (typeof window !== "undefined" && (window as any).Paddle) {
    (window as any).Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: user?.email ? { email: user.email } : undefined,
      customData: { user_id: user?.id ?? "" },
    });
  }
}

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text1)" }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "var(--cyan)", textTransform: "uppercase", marginBottom: 16 }}>
            Pricing
          </p>
          <h1 style={{ fontSize: "clamp(36px,4vw,56px)", fontWeight: 700, fontFamily: "Georgia,serif", color: "var(--text1)", marginBottom: 16, lineHeight: 1.1 }}>
            Simple, honest pricing
          </h1>
          <p style={{ fontSize: 17, color: "var(--text3)", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            Start free. Upgrade when you're ready. Cancel anytime — no questions asked.
          </p>
        </motion.div>

        {/* Plan cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, marginBottom: 64 }}>
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div key={plan.name}
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{
                  background: plan.highlight ? "linear-gradient(135deg,#4F6EF7,#9C6BE8)" : "var(--surface)",
                  border: plan.highlight ? "none" : "0.5px solid var(--border)",
                  borderRadius: 24, padding: "32px 28px",
                  boxShadow: plan.highlight ? "0 24px 56px rgba(79,110,247,0.3)" : "var(--shadow-sm)",
                  position: "relative", display: "flex", flexDirection: "column",
                }}>

                {plan.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "#00FFFF", color: "#121212", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>
                    MOST POPULAR
                  </div>
                )}

                <div style={{ width: 44, height: 44, borderRadius: 14, background: plan.highlight ? "rgba(255,255,255,0.2)" : `${plan.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon size={20} color={plan.highlight ? "white" : plan.color} />
                </div>

                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: plan.highlight ? "rgba(255,255,255,0.65)" : "var(--text4)", marginBottom: 8 }}>
                  {plan.name}
                </p>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 48, fontWeight: 700, fontFamily: "Georgia,serif", color: plan.highlight ? "white" : "var(--text1)", lineHeight: 1 }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 14, color: plan.highlight ? "rgba(255,255,255,0.6)" : "var(--text4)" }}>
                    {plan.period}
                  </span>
                </div>

                {plan.trial && (
                  <p style={{ fontSize: 12, color: plan.highlight ? "rgba(255,255,255,0.55)" : "var(--text4)", marginBottom: 24 }}>
                    3-day free trial · then billed monthly
                  </p>
                )}
                {plan.free && (
                  <p style={{ fontSize: 12, color: "var(--text4)", marginBottom: 24 }}>
                    No credit card required
                  </p>
                )}

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: plan.highlight ? "rgba(255,255,255,0.88)" : "var(--text2)" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: plan.highlight ? "rgba(255,255,255,0.2)" : "#EEF2FF" }}>
                        <Check size={10} color={plan.highlight ? "white" : "#4F6EF7"} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.free ? (
                  <Link href="/auth/signup" style={{ display: "block", textAlign: "center", padding: "13px", borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: "none", background: "var(--surface)", color: "var(--text2)", border: "1.5px solid var(--border2)" }}>
                    Start Free
                  </Link>
                ) : (
                  <button onClick={() => openCheckout(plan.paddlePriceId!)}
                    style={{ display: "block", width: "100%", textAlign: "center", padding: "13px", borderRadius: 14, fontWeight: 700, fontSize: 14, cursor: "pointer", border: "none", background: plan.highlight ? "white" : "transparent", color: plan.highlight ? "#4F6EF7" : "var(--text2)", outline: plan.highlight ? "none" : "1.5px solid var(--border2)" }}>
                    {plan.highlight ? "Protect Your Household" : plan.name === "Grand Family" ? "Access Grand Vault" : "Start Free Trial"}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, fontFamily: "Georgia,serif", textAlign: "center", marginBottom: 32 }}>
            Common questions
          </h2>
          {[
            ["Do I need a credit card for the free plan?", "No. The free plan requires no credit card and never expires. You get 5 plays per day across all 24 games, forever."],
            ["How does the 3-day free trial work?", "Enter your card to start the trial. You won't be charged for 3 days. Cancel any time before the trial ends and you pay nothing."],
            ["Can I cancel anytime?", "Yes — cancel with one click from your account settings. No cancellation fees, no questions asked. You keep access until the end of your billing period."],
            ["What's the refund policy?", "We offer a full refund within 7 days of being charged. Contact us at hello@mindelement.app and we'll process it immediately."],
            ["How does Family pricing work?", "One subscription covers 3 or 7 members. The account holder invites family members via a private link. Each member gets their own profile, scores, and streaks."],
            ["What is Infinite Mode?", "Infinite Mode unlocks unlimited procedurally generated puzzles beyond the 100 stages — available on Individual and Family plans."],
          ].map(([q, a], i) => (
            <FAQ key={i} q={q} a={a} />
          ))}
        </motion.div>

        {/* Footer note */}
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text4)", marginTop: 48 }}>
          By subscribing you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--cyan)", textDecoration: "none" }}>Terms of Service</Link>
          {" "}and{" "}
          <Link href="/privacy" style={{ color: "var(--cyan)", textDecoration: "none" }}>Privacy Policy</Link>.
          {" "}Payments processed securely by{" "}
          <a href="https://paddle.com" target="_blank" rel="noopener noreferrer" style={{ color: "var(--cyan)", textDecoration: "none" }}>Paddle</a>.
        </p>

      </main>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "0.5px solid var(--border)", padding: "20px 0" }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text1)" }}>{q}</span>
        <span style={{ fontSize: 20, color: "var(--text4)", flexShrink: 0, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
      </button>
      {open && (
        <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.7, marginTop: 12, paddingRight: 32 }}>
          {a}
        </motion.p>
      )}
    </div>
  );
}