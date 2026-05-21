// src/app/terms/page.tsx
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";

export const metadata = {
  title: "Terms of Service — MindElement",
  description: "Terms of Service for MindElement brain-training app.",
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text1)" }}>
      <Navbar />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "100px 24px 80px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "var(--cyan)", textTransform: "uppercase", marginBottom: 16 }}>Legal</p>
        <h1 style={{ fontSize: 42, fontWeight: 700, fontFamily: "Georgia,serif", marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: "var(--text4)", marginBottom: 48 }}>Last updated: May 2025</p>

        <Legal title="1. Acceptance of Terms">
          By accessing or using MindElement ("the Service") at mindelement.app, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
        </Legal>

        <Legal title="2. Description of Service">
          MindElement is a browser-based brain-training application offering 24 logic puzzle games with 100 stages each. The Service is available as a Progressive Web App (PWA) and is accessible via any modern web browser.
        </Legal>

        <Legal title="3. Accounts">
          You must create an account to save progress and access subscription features. You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating your account. You must be at least 13 years old to use the Service.
        </Legal>

        <Legal title="4. Subscriptions and Billing">
          MindElement offers a free tier and paid subscription plans (Individual, Family · 3, Family · 7). Paid plans are billed monthly through Paddle, our payment processor. Subscriptions automatically renew unless cancelled before the renewal date. Prices are displayed in USD and may be subject to local taxes handled by Paddle. A 3-day free trial is available on all paid plans. You will not be charged during the trial period.
        </Legal>

        <Legal title="5. Refund Policy">
          We offer a full refund within 7 days of any charge. To request a refund, contact us at hello@mindelement.app with your account email and we will process it within 2 business days. Refunds are not available after 7 days from the charge date.
        </Legal>

        <Legal title="6. Cancellation">
          You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. You will retain access to paid features until that date. No partial refunds are issued for unused time beyond the 7-day refund window.
        </Legal>

        <Legal title="7. Acceptable Use">
          You agree not to: use the Service for any unlawful purpose; attempt to reverse engineer, hack, or disrupt the Service; create multiple accounts to abuse the free tier; share your account credentials with others outside a Family plan; use automated tools or bots to interact with the Service.
        </Legal>

        <Legal title="8. Intellectual Property">
          All content, game designs, graphics, and software in MindElement are owned by or licensed to MindElement and are protected by intellectual property laws. You may not copy, reproduce, or distribute any part of the Service without written permission.
        </Legal>

        <Legal title="9. User Data">
          We collect and process personal data as described in our <Link href="/privacy" style={{ color: "var(--cyan)" }}>Privacy Policy</Link>. By using the Service you consent to that processing.
        </Legal>

        <Legal title="10. Disclaimers">
          The Service is provided "as is" without warranties of any kind. We do not guarantee uninterrupted access or that the Service will be error-free. Brain-training games are for entertainment and cognitive engagement — we make no medical claims about cognitive improvement.
        </Legal>

        <Legal title="11. Limitation of Liability">
          To the maximum extent permitted by law, MindElement shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
        </Legal>

        <Legal title="12. Changes to Terms">
          We may update these Terms at any time. We will notify you of material changes via email or an in-app notice. Continued use of the Service after changes constitutes acceptance of the new Terms.
        </Legal>

        <Legal title="13. Governing Law">
          These Terms are governed by the laws of Israel. Any disputes shall be resolved in the courts of Israel.
        </Legal>

        <Legal title="14. Contact">
          For any questions about these Terms, contact us at <a href="mailto:hello@mindelement.app" style={{ color: "var(--cyan)" }}>hello@mindelement.app</a>.
        </Legal>

      </main>
    </div>
  );
}

function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text1)", marginBottom: 12, fontFamily: "Georgia,serif" }}>{title}</h2>
      <p style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.8 }}>{children}</p>
    </section>
  );
}