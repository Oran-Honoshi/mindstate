// src/app/terms/page.tsx
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";

export const metadata = {
  title: "Terms of Service — MindElement",
  description: "Terms of Service for MindElement brain-training app.",
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)" }}>
      <Navbar />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "100px 24px 80px", fontFamily: "var(--font-sans)", fontSize: 16, lineHeight: 1.7 }}>
        <Link href="/" style={{ fontSize: 13, color: "var(--cyan)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 40 }}>
          ← Back to home
        </Link>

        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", color: "var(--cyan)", textTransform: "uppercase", marginBottom: 16 }}>Legal</p>
        <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 56 }}>Last updated: June 1, 2026</p>

        <Legal title="1. Agreement to Terms">
          By downloading, installing, or using Mind Element (&quot;the app&quot;), you agree to these Terms of Service (&quot;Terms&quot;). If you do not agree, do not use the app.
          <br /><br />
          These Terms apply to all users including guests, registered users, and subscribers.
        </Legal>

        <Legal title="2. The Service">
          Mind Element is a brain-training application offering 24 logic games with 100 algorithmically generated stages each, daily challenges, leaderboards, and family group features.
          <ul>
            <li><strong style={{ color: "var(--color-text-primary)" }}>Free tier:</strong> 5 game sessions per day, access to all 24 games, global leaderboard access.</li>
            <li><strong style={{ color: "var(--color-text-primary)" }}>Individual subscription ($2/month):</strong> Unlimited daily sessions, all 24 games, leaderboard participation.</li>
            <li><strong style={{ color: "var(--color-text-primary)" }}>Family Choice ($5/month):</strong> Everything in Individual for up to 3 members, shared family leaderboard.</li>
            <li><strong style={{ color: "var(--color-text-primary)" }}>Grand Family ($10/month):</strong> Everything in Family Choice for up to 7 members.</li>
          </ul>
        </Legal>

        <Legal title="3. Account Registration">
          You may use Mind Element as a guest or create a registered account. To register you must:
          <ul style={{ marginBottom: 16 }}>
            <li>Provide a valid email address</li>
            <li>Be at least 13 years old, or have parental consent if younger</li>
            <li>Provide accurate and truthful information</li>
            <li>Keep your password secure and not share your account</li>
          </ul>
          You are responsible for all activity that occurs under your account. Notify us immediately at <a href="mailto:support@mindelement.app" style={{ color: "var(--cyan)" }}>support@mindelement.app</a> if you suspect unauthorized access.
        </Legal>

        <Legal title="4. Subscriptions and Payments">
          Subscriptions are processed by Paddle, our payment provider. By subscribing you authorize Paddle to charge your payment method on a recurring monthly basis.
          <br /><br />
          <strong style={{ color: "var(--color-text-primary)" }}>Free trial:</strong> Where offered, free trials convert to paid subscriptions automatically at the end of the trial period unless cancelled.
          <br /><br />
          <strong style={{ color: "var(--color-text-primary)" }}>Cancellation:</strong> You may cancel your subscription at any time through your account settings or through Paddle. Cancellation takes effect at the end of the current billing period. No partial refunds are issued for unused time.
          <br /><br />
          <strong style={{ color: "var(--color-text-primary)" }}>Refunds:</strong> We offer a 7-day refund for first-time subscribers who are not satisfied. Contact <a href="mailto:support@mindelement.app" style={{ color: "var(--cyan)" }}>support@mindelement.app</a> within 7 days of your first charge.
          <br /><br />
          <strong style={{ color: "var(--color-text-primary)" }}>Price changes:</strong> We will give at least 30 days notice before changing subscription prices.
        </Legal>

        <Legal title="5. Family Groups">
          Family group admins are responsible for managing their group members. The admin account holder:
          <ul>
            <li>Must be an adult (18+)</li>
            <li>Is responsible for ensuring family members comply with these Terms</li>
            <li>Can add or remove members up to the plan limit</li>
            <li>Is billed for the entire family subscription</li>
          </ul>
        </Legal>

        <Legal title="6. Acceptable Use">
          You agree not to:
          <ul>
            <li>Use the app for any unlawful purpose</li>
            <li>Attempt to cheat, exploit bugs, or manipulate leaderboards</li>
            <li>Share your account with others outside your family plan</li>
            <li>Reverse engineer, decompile, or attempt to extract the source code</li>
            <li>Upload harmful, offensive, or inappropriate content</li>
            <li>Harass other users</li>
            <li>Use automated tools or bots to play games or collect XP</li>
          </ul>
          We reserve the right to suspend or terminate accounts that violate these rules without refund.
        </Legal>

        <Legal title="7. User Content">
          Any username, profile information, or other content you submit must not:
          <ul style={{ marginBottom: 16 }}>
            <li>Impersonate another person</li>
            <li>Contain offensive, hateful, or inappropriate language</li>
            <li>Violate any third-party rights</li>
          </ul>
          We reserve the right to remove content that violates these Terms.
        </Legal>

        <Legal title="8. Intellectual Property">
          All content in Mind Element — including game logic, designs, graphics, the Sparky mascot, and the Mind Element brand — is owned by Oran Schreiber or our licensors and protected by copyright and intellectual property laws.
          <br /><br />
          You are granted a limited, non-exclusive, non-transferable license to use the app for personal, non-commercial purposes.
          <br /><br />
          You may not copy, modify, distribute, sell, or lease any part of the app or its content.
        </Legal>

        <Legal title="9. Disclaimer of Warranties">
          Mind Element is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that:
          <ul style={{ marginBottom: 16 }}>
            <li>The app will be uninterrupted or error-free</li>
            <li>Game progress will never be lost</li>
            <li>The app will be available at any particular time</li>
          </ul>
          We are not responsible for any loss of game progress, XP, or streaks due to technical issues.
        </Legal>

        <Legal title="10. Limitation of Liability">
          To the maximum extent permitted by law, our total liability to you for any claims arising from your use of Mind Element is limited to the amount you paid us in the 12 months preceding the claim, or $10, whichever is greater.
          <br /><br />
          We are not liable for indirect, incidental, special, or consequential damages including loss of data or loss of profits.
        </Legal>

        <Legal title="11. Termination">
          We may suspend or terminate your account if you violate these Terms. You may delete your account at any time in your profile settings.
          <br /><br />
          Upon termination, your right to use the app ends immediately. Sections 8, 10, and 12 survive termination.
        </Legal>

        <Legal title="12. Governing Law">
          These Terms are governed by the laws of Israel. Any disputes will be resolved in the courts of Israel.
          <br /><br />
          For EU users: Nothing in these Terms affects your statutory rights as a consumer under EU law.
        </Legal>

        <Legal title="13. Changes to Terms">
          We may update these Terms from time to time. We will notify you of material changes by posting a notice in the app or emailing your registered address at least 14 days before changes take effect. Continued use after that date constitutes acceptance.
        </Legal>

        <Legal title="14. Contact">
          For questions about these Terms:
          <br /><br />
          Email: <a href="mailto:support@mindelement.app" style={{ color: "var(--cyan)" }}>support@mindelement.app</a><br />
          Website: mindelement.app/terms
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
