import type { Metadata } from "next";
import Link from "next/link";
import { Brain } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "MindElement Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="squircle w-7 h-7 flex items-center justify-center" style={{background:"linear-gradient(135deg,#3B6FE8,#8B6FC0)"}}>
            <Brain size={13} className="text-white"/>
          </div>
          <span className="font-semibold text-slate-800" style={{fontFamily:"var(--font-fraunces),serif"}}>MindElement</span>
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-3" style={{fontFamily:"var(--font-fraunces),serif"}}>Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: May 2026</p>

        {[
          { title:"1. Information We Collect", body:`We collect information you provide directly: your email address, username, and gameplay data (scores, XP, stage completion). We also collect anonymised usage analytics to improve the product. We do not sell your data to third parties.` },
          { title:"2. How We Use Your Information", body:`Your data is used to: provide and personalise the MindElement service, save your progress and scores, send essential product emails (account confirmation, password reset), and display leaderboard rankings. We never use your data for advertising.` },
          { title:"3. Data Storage & Security", body:`All data is stored securely using Supabase (PostgreSQL with Row-Level Security). Passwords are hashed using industry-standard bcrypt. We use HTTPS for all data transmission. Access to production data is strictly limited.` },
          { title:"4. Cookies & Local Storage", body:`We use localStorage to save your settings (language preference, silent mode, theme). We use authentication cookies provided by Supabase to keep you signed in. We do not use third-party tracking cookies.` },
          { title:"5. Children's Privacy", body:`MindElement is intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you believe a child has provided us personal data, please contact us immediately.` },
          { title:"6. Your Rights (GDPR & CCPA)", body:`You have the right to: access your personal data, correct inaccurate data, delete your account and all associated data, export your data in machine-readable format, and object to processing. To exercise these rights, email privacy@mindelement.app.` },
          { title:"7. Data Retention", body:`We retain your account data for as long as your account is active. If you delete your account, all personal data is permanently deleted within 30 days. Anonymised aggregate analytics are retained indefinitely.` },
          { title:"8. Third-Party Services", body:`We use Supabase for authentication and database services, and Paddle for payment processing. These services have their own privacy policies. We do not share your personal data with any other third parties.` },
          { title:"9. Changes to This Policy", body:`We may update this Privacy Policy from time to time. We will notify you of significant changes via email. Continued use of MindElement after changes constitutes acceptance of the updated policy.` },
          { title:"10. Contact", body:`For privacy-related questions: privacy@mindelement.app` },
        ].map((section, i) => (
          <div key={i} className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">{section.title}</h2>
            <p className="text-slate-600 leading-relaxed text-sm">{section.body}</p>
          </div>
        ))}
      </main>
      <footer className="border-t border-slate-100 bg-white px-6 py-8 text-center">
        <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} MindElement. <Link href="/terms" className="hover:text-slate-700">Terms of Service</Link> · <Link href="/privacy" className="hover:text-slate-700">Privacy Policy</Link></p>
      </footer>
    </div>
  );
}
