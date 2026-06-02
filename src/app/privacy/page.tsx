// src/app/privacy/page.tsx
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";

export const metadata = {
  title: "Privacy Policy — MindElement",
  description: "Privacy Policy for MindElement brain-training app.",
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)" }}>
      <Navbar />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "100px 24px 80px", fontFamily: "var(--font-sans)", fontSize: 16, lineHeight: 1.7 }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--cyan)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 40 }}>
          ← Back to home
        </Link>

        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "var(--cyan)", textTransform: "uppercase", marginBottom: 16 }}>Legal</p>
        <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 56 }}>Last updated: June 1, 2026</p>

        <Legal title="1. Who We Are">
          Mind Element is a brain-training application operated by Oran Schreiber (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). This Privacy Policy explains how we collect, use, and protect your information when you use our app and website at mindelement.app.
          <br /><br />
          Contact: <a href="mailto:privacy@mindelement.app" style={{ color: "var(--cyan)" }}>privacy@mindelement.app</a>
        </Legal>

        <Legal title="2. Information We Collect">
          <strong style={{ color: "var(--color-text-primary)" }}>Information you provide:</strong>
          <ul>
            <li>Account details: email address, username, and optional profile photo when you register</li>
            <li>Family group information when you create or join a family group</li>
            <li>Payment information processed securely by Paddle (we never see or store your card details)</li>
          </ul>
          <strong style={{ color: "var(--color-text-primary)" }}>Information collected automatically:</strong>
          <ul>
            <li>Game progress: stages completed, XP earned, scores, streaks, and hints used</li>
            <li>Usage data: which games you play, how long you play, and when you play</li>
            <li>Device information: device type, operating system, and browser type</li>
            <li>IP address and approximate location (country level only)</li>
          </ul>
          <strong style={{ color: "var(--color-text-primary)" }}>Information we do not collect:</strong>
          <ul>
            <li>We do not collect precise GPS location</li>
            <li>We do not access your contacts, camera, or microphone</li>
            <li>We do not track you across other apps or websites</li>
          </ul>
        </Legal>

        <Legal title="3. How We Use Your Information">
          We use your information to:
          <ul>
            <li>Provide and maintain the Mind Element service</li>
            <li>Save your game progress and sync it across your devices</li>
            <li>Display leaderboards and family group scores</li>
            <li>Send you important account notifications (not marketing without your consent)</li>
            <li>Process subscription payments via Paddle</li>
            <li>Improve the app based on aggregate usage patterns</li>
            <li>Respond to your support requests</li>
          </ul>
        </Legal>

        <Legal title="4. Data Sharing">
          We do not sell your personal data. We share data only with:
          <ul style={{ marginBottom: 16 }}>
            <li><strong style={{ color: "var(--color-text-primary)" }}>Supabase</strong> — our database and authentication provider (data stored in EU region)</li>
            <li><strong style={{ color: "var(--color-text-primary)" }}>Paddle</strong> — our payment processor (handles all subscription billing)</li>
            <li><strong style={{ color: "var(--color-text-primary)" }}>Vercel</strong> — our hosting provider</li>
            <li><strong style={{ color: "var(--color-text-primary)" }}>Law enforcement</strong> — only when required by law or to protect safety</li>
          </ul>
          Your username and scores may be visible to other users on public leaderboards. Family group members can see each other&apos;s scores within the group.
        </Legal>

        <Legal title="5. Children's Privacy">
          Mind Element is designed for users of all ages including children. We do not knowingly collect personal information from children under 13 without parental consent. If you are a parent and believe your child has provided us personal information without consent, please contact us at <a href="mailto:privacy@mindelement.app" style={{ color: "var(--cyan)" }}>privacy@mindelement.app</a> and we will delete it promptly.
          <br /><br />
          For family accounts, the adult account holder (admin) is responsible for managing family member access.
        </Legal>

        <Legal title="6. Data Retention">
          We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where required by law to retain it longer.
          <br /><br />
          Game scores and leaderboard entries may be retained in anonymized form after account deletion.
        </Legal>

        <Legal title="7. Your Rights">
          Depending on your location, you may have the right to:
          <ul style={{ marginBottom: 16 }}>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Delete your account and associated data</li>
            <li>Export your data in a portable format</li>
            <li>Opt out of any marketing communications</li>
          </ul>
          To exercise these rights, contact us at <a href="mailto:privacy@mindelement.app" style={{ color: "var(--cyan)" }}>privacy@mindelement.app</a> or use the account deletion option in your profile settings.
          <br /><br />
          <strong style={{ color: "var(--color-text-primary)" }}>GDPR (EU users):</strong> Our legal basis for processing is contract performance (to provide the service you signed up for) and legitimate interests (improving the app). You may withdraw consent at any time.
          <br /><br />
          <strong style={{ color: "var(--color-text-primary)" }}>CCPA (California users):</strong> We do not sell personal information. You have the right to know what data we collect and request deletion.
        </Legal>

        <Legal title="8. Security">
          We use industry-standard security measures including:
          <ul style={{ marginBottom: 16 }}>
            <li>Encrypted connections (HTTPS/TLS) for all data transmission</li>
            <li>Encrypted storage via Supabase</li>
            <li>Row-level security policies so users can only access their own data</li>
            <li>Regular security reviews</li>
          </ul>
          No system is 100% secure. If you believe your account has been compromised, contact us immediately.
        </Legal>

        <Legal title="9. Cookies and Local Storage">
          We use browser localStorage to save your game preferences, theme selection, and offline progress. We do not use third-party advertising cookies. We do not use tracking pixels.
        </Legal>

        <Legal title="10. Third-Party Links">
          The app may contain links to third-party sites (such as leaderboard profiles). We are not responsible for the privacy practices of those sites.
        </Legal>

        <Legal title="11. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice in the app or sending an email to your registered address. Continued use of Mind Element after changes constitutes acceptance of the updated policy.
        </Legal>

        <Legal title="12. Contact Us">
          For privacy questions or requests:
          <br /><br />
          Email: <a href="mailto:privacy@mindelement.app" style={{ color: "var(--cyan)" }}>privacy@mindelement.app</a><br />
          Website: mindelement.app/privacy
        </Legal>

      </main>
    </div>
  );
}

function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 44 }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12, fontFamily: "var(--font-sans)" }}>{title}</h2>
      <div style={{ color: "var(--color-text-secondary)" }}>{children}</div>
    </section>
  );
}
