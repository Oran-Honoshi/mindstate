"use client";

const TESTIMONIALS = [
  {
    quote: "I've tried every brain app out there. Mind Element is the only one I've actually stuck with. The daily challenges are perfectly sized for a lunch break.",
    name: "Sarah K.",
    role: "Product Manager",
    initial: "S",
    stars: "★★★★★",
  },
  {
    quote: "The family leaderboard is genius. My kids and I compete every morning. It's become a ritual.",
    name: "David R.",
    role: "Father of 3",
    initial: "D",
    stars: "★★★★★",
  },
  {
    quote: "Tango is absolutely addictive. I'm on a 47-day streak and I've stopped reaching for social media in the mornings.",
    name: "Oren M.",
    role: "Software Engineer",
    initial: "O",
    stars: "★★★★★",
  },
];

export function TestimonialsSection() {
  return (
    <section style={{ padding: "80px var(--screen-pad, 16px)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <h2 style={{
          textAlign: "center", marginBottom: 40,
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "clamp(28px,4vw,36px)", color: "var(--text)",
        }}>
          People are getting sharper.
        </h2>

        {/* Desktop 3-col / Mobile carousel */}
        <div style={{
          display: "flex", gap: 16, overflowX: "auto",
          scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch",
          paddingBottom: 8,
        }} className="lp-testimonials">
          {TESTIMONIALS.map(({ quote, name, role, initial, stars }) => (
            <div key={name} style={{
              flex: "1 1 280px", minWidth: "min(280px, 85vw)",
              scrollSnapAlign: "start", flexShrink: 0,
              background: "var(--surf)", border: "0.5px solid var(--border)",
              borderRadius: "var(--r-card)", padding: 24,
              boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}>
              <p style={{
                fontFamily: "var(--font-body)", fontSize: 15, color: "var(--text)",
                lineHeight: 1.6, fontStyle: "italic", marginBottom: 16,
              }}>
                &ldquo;{quote}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "var(--surf2)", display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
                    {initial}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                    {name}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold)" }}>
                    {stars}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
