import Image from "next/image";

export default function GamesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Cosmic background — fixed viewport layer, dark mode only via .cosmic-bg-layer */}
      <div aria-hidden className="cosmic-bg-layer fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <Image
          src="/images/cosmic-bg.png"
          alt=""
          fill
          priority
          className="object-cover object-center"
          style={{ opacity: 0.55 }}
        />
        {/* Darken + tint overlays for depth and legibility */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,rgba(7,7,14,0.72) 0%,rgba(10,10,28,0.55) 50%,rgba(7,7,14,0.75) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 55% at 15% 25%,rgba(16,244,160,0.07) 0%,transparent 65%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 65% at 85% 75%,rgba(168,85,247,0.09) 0%,transparent 60%)" }} />
      </div>
      {children}
    </>
  );
}
