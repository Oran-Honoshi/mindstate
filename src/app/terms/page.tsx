import type { Metadata } from "next";
import Link from "next/link";
import { Brain } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "MindState Terms of Service — rules and guidelines for using MindState.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="squircle w-7 h-7 flex items-center justify-center" style={{background:"linear-gradient(135deg,#3B6FE8,#8B6FC0)"}}>
            <Brain size={13} className="text-white"/>
          </div>
          <span className="font-semibold text-slate-800" style={{fontFamily:"var(--font-fraunces),serif"}}>MindState</span>
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-3" style={{fontFamily:"var(--font-fraunces),serif"}}>Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: May 2026</p>

        {[
          { title:"1. Acceptance of Terms", body:`By creating a MindState account or using any part of the service, you agree to these Terms of Service. If you do not agree, please do not use MindState.` },
          { title:"2. Description of Service", body:`MindState is a brain-training application offering logic puzzle games with subscription-based access to premium content. Free users receive access to Daily Challenges. Subscribers unlock all 100 stages per game, Infinite Mode, and leaderboards.` },
          { title:"3. Account Registration", body:`You must provide accurate information when creating an account. You are responsible for maintaining the security of your password. You must be at least 13 years old to create an account. One person may not maintain multiple accounts.` },
          { title:"4. Subscriptions & Billing", body:`Subscriptions are billed monthly via Paddle. You may cancel at any time; access continues until the end of the billing period. We do not offer refunds for partial months. Prices may change with 30 days notice. Family plan seats are non-transferable.` },
          { title:"5. Acceptable Use", body:`You agree not to: reverse engineer or copy any part of MindState, use automated tools to manipulate scores, share account credentials, upload harmful content, or use MindState for any illegal purpose. Violations may result in account termination.` },
          { title:"6. Intellectual Property", body:`All game designs, algorithms, visual assets, and content in MindState are owned by MindState and protected by copyright. You may not reproduce, distribute, or create derivative works without explicit written permission.` },
          { title:"7. User Content", body:`Your username and any profile information you provide remain yours. By submitting this information, you grant MindState a license to display it within the service (e.g., on leaderboards). We do not claim ownership of your personal data.` },
          { title:"8. Disclaimers", body:`MindState is provided "as is." We do not guarantee uninterrupted service. We are not liable for data loss, indirect damages, or lost profits. Brain-training benefits are based on general research and are not medical claims.` },
          { title:"9. Termination", body:`We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from your profile settings. Upon termination, your data will be deleted within 30 days.` },
          { title:"10. Governing Law", body:`These terms are governed by the laws of Israel. Any disputes shall be resolved in the courts of Tel Aviv.` },
          { title:"11. Contact", body:`For terms-related questions: legal@mindstate.app` },
        ].map((section, i) => (
          <div key={i} className="mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">{section.title}</h2>
            <p className="text-slate-600 leading-relaxed text-sm">{section.body}</p>
          </div>
        ))}
      </main>
      <footer className="border-t border-slate-100 bg-white px-6 py-8 text-center">
        <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} MindState. <Link href="/terms" className="hover:text-slate-700">Terms of Service</Link> · <Link href="/privacy" className="hover:text-slate-700">Privacy Policy</Link></p>
      </footer>
    </div>
  );
}
