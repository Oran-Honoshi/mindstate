import { generateGameMetadata } from "@/lib/seo/gameMetadata";

export const metadata = generateGameMetadata("memory");

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Deep-space nebula — fixed behind all content, visible only in dark mode via .cosmic-bg-layer */}
      <div aria-hidden className="cosmic-bg-layer fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,#07070E 0%,#0A0A1C 55%,#07070E 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 55% at 15% 25%,rgba(16,244,160,0.09) 0%,transparent 65%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 65% 70% at 85% 75%,rgba(168,85,247,0.11) 0%,transparent 60%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 40% at 70% 28%,rgba(34,211,238,0.05) 0%,transparent 55%)" }} />
      </div>
      {children}
    </>
  );
}
