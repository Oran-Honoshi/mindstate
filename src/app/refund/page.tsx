// src/app/refund/page.tsx
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";

export const metadata = {
  title: "Refund Policy — MindElement",
  description: "Refund Policy for MindElement brain-training app.",
};

export default function RefundPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)" }}>
      <Navbar />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "100px 24px 80px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "var(--cyan)", textTransform: "uppercase", marginBottom: 16 }}>Legal</p>
        <h1 style={{ fontSize: 42, fontWeight: 700, fontFamily: "var(--font-sans)", marginBottom: 8 }}>Refund Policy</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 48 }}>Last updated: May 2025</p>

        <section style={{ background: "var(--color-surface)", border: "0.5px solid var(--color-border)", borderRadius: 20, padding: "28px 32px", marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", marginBottom: 12 }}>
            Our commitment
          </h2>
          <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
            We stand behind MindElement. If you are not satisfied with your subscription, we will refund you — no hassle, no questions asked — within 7 days of your charge.
          </p>
        </section>

        <Legal title="Free Trial">
          All paid plans include a 3-day free trial. You will not be charged during the trial period. If you cancel before the trial ends, you owe nothing. The trial is available once per account per plan.
        </Legal>

        <Legal title="7-Day Refund Window">
          If you are charged and are not satisfied, contact us within 7 days of the charge date at <a href="mailto:hello@mindelement.app" style={{ color: "var(--cyan)" }}>hello@mindelement.app</a> with your account email. We will issue a full refund within 2 business days. No partial refunds are available after the 7-day window.
        </Legal>

        <Legal title="How to Request a Refund">
          Email <a href="mailto:hello@mindelement.app" style={{ color: "var(--cyan)" }}>hello@mindelement.app</a> with: your account email address, the date of the charge, and optionally a reason (not required). We will confirm receipt and process the refund within 2 business days. Refunds are returned to the original payment method.
        </Legal>

        <Legal title="Cancellation vs Refund">
          Cancelling your subscription stops future charges but does not issue a refund for the current period. To receive a refund for the current period, you must explicitly request one within the 7-day window. After cancellation you retain access until the end of the paid period.
        </Legal>

        <Legal title="Family Plans">
          Refunds for Family plans are issued to the plan administrator (the account holder who purchased the subscription). Refunds cover the full subscription amount regardless of how many family members are active.
        </Legal>

        <Legal title="Exceptions">
          Refunds will not be issued for: charges older than 7 days (unless required by applicable law); accounts found to have abused the free trial or refund policy; accounts terminated for violating our <Link href="/terms" style={{ color: "var(--cyan)" }}>Terms of Service</Link>.
        </Legal>

        <Legal title="Payment Processing">
          All payments are processed by Paddle. Refunds are initiated by us and processed through Paddle back to your original payment method. Processing time may vary by bank (typically 3–10 business days to appear on your statement).
        </Legal>

        <Legal title="Contact">
          Questions about this policy? Email <a href="mailto:hello@mindelement.app" style={{ color: "var(--cyan)" }}>hello@mindelement.app</a> — we respond within 24 hours.
        </Legal>

      </main>
    </div>
  );
}

function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12, fontFamily: "var(--font-sans)" }}>{title}</h2>
      <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.8 }}>{children}</p>
    </section>
  );
}