// src/app/privacy/page.tsx
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";

export const metadata = {
  title: "Privacy Policy — MindElement",
  description: "Privacy Policy for MindElement brain-training app.",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text1)" }}>
      <Navbar />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "100px 24px 80px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "var(--cyan)", textTransform: "uppercase", marginBottom: 16 }}>Legal</p>
        <h1 style={{ fontSize: 42, fontWeight: 700, fontFamily: "Georgia,serif", marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: "var(--text4)", marginBottom: 48 }}>Last updated: May 2025</p>

        <Legal title="1. Who We Are">
          MindElement ("we", "us", "our") operates the brain-training application at mindelement.app. For privacy inquiries contact us at <a href="mailto:hello@mindelement.app" style={{ color: "var(--cyan)" }}>hello@mindelement.app</a>.
        </Legal>

        <Legal title="2. Data We Collect">
          We collect the following personal data: Account data — your email address and username when you register. Game data — your scores, stage progress, XP, and streaks. Usage data — pages visited, game sessions, and feature interactions. Payment data — handled entirely by Paddle; we never see or store your card details. Device data — browser type, device type, and IP address for security and analytics.
        </Legal>

        <Legal title="3. How We Use Your Data">
          We use your data to: provide and improve the Service; save your game progress and scores; process subscription payments through Paddle; send transactional emails (account confirmation, password reset) through Resend; display leaderboards; analyse usage to improve game design; prevent fraud and abuse.
        </Legal>

        <Legal title="4. Data Storage">
          Your data is stored securely in Supabase (PostgreSQL database) hosted on servers in the European Union. We use industry-standard encryption in transit (TLS) and at rest.
        </Legal>

        <Legal title="5. Third-Party Services">
          We use the following third-party services that may process your data: Supabase — database and authentication (supabase.com/privacy); Paddle — payment processing (paddle.com/privacy); Resend — transactional email (resend.com/privacy); Vercel — hosting and deployment (vercel.com/legal/privacy-policy). Each service processes only the data necessary for its function.
        </Legal>

        <Legal title="6. Cookies">
          We use minimal cookies: an authentication session cookie to keep you logged in, and anonymous analytics. We do not use advertising cookies or tracking pixels. You can disable cookies in your browser settings but this may affect login functionality.
        </Legal>

        <Legal title="7. Data Sharing">
          We do not sell your personal data. We do not share your data with third parties except the service providers listed above, and only to the extent necessary to provide the Service. We may disclose data if required by law.
        </Legal>

        <Legal title="8. Your Rights">
          You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your account and data; export your data in a portable format; withdraw consent at any time. To exercise these rights, email <a href="mailto:hello@mindelement.app" style={{ color: "var(--cyan)" }}>hello@mindelement.app</a>. We will respond within 30 days.
        </Legal>

        <Legal title="9. Data Retention">
          We retain your account data for as long as your account is active. If you delete your account, we delete your personal data within 30 days except where retention is required by law (e.g. financial records for 7 years).
        </Legal>

        <Legal title="10. Children's Privacy">
          The Service is not directed at children under 13. We do not knowingly collect data from children under 13. If you believe a child has provided us data, contact us immediately and we will delete it.
        </Legal>

        <Legal title="11. International Transfers">
          Your data may be processed outside your country of residence. We ensure appropriate safeguards are in place including standard contractual clauses where required.
        </Legal>

        <Legal title="12. Changes to This Policy">
          We may update this Privacy Policy. We will notify you of material changes via email or in-app notice. Continued use after changes constitutes acceptance.
        </Legal>

        <Legal title="13. Contact">
          For privacy questions or to exercise your rights: <a href="mailto:hello@mindelement.app" style={{ color: "var(--cyan)" }}>hello@mindelement.app</a>
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