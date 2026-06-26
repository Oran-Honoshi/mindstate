"use client";
import { useRouter } from "next/navigation";
import { HeroPhoneMockups } from "./HeroPhoneMockups";

export function HeroSection() {
  const router = useRouter();
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 65%)",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 1080, margin: "0 auto",
        padding: "120px var(--screen-pad, 16px) 80px",
        textAlign: "center",
      }}>
        {/* Eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center",
          borderRadius: "var(--r-pill)", padding: "6px 16px",
          background: "color-mix(in srgb, var(--accent) 10%, var(--surf))",
          border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
          fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)",
          marginBottom: 20,
        }}>
          24 Games · Daily Challenges · Real Progress
        </div>

        {/* H1 */}
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: "clamp(36px, 6vw, 56px)", lineHeight: 1.1,
          color: "var(--text)", marginBottom: 16,
        }}>
          Train your mind.<br />Every day.
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: "var(--font-body)", fontSize: 16, color: "var(--muted)",
          maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6,
        }}>
          The brain-training app for people who actually want to get sharper.
          Logic puzzles, memory games, and daily challenges — free to start.
        </p>

        {/* CTA group */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => router.push("/auth/signup")}
            style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
              padding: "15px 28px", borderRadius: "var(--r-btn)",
              background: "var(--accent)", color: "var(--on-accent)", border: "none",
              cursor: "pointer",
            }}
          >
            Start Free — No card needed
          </button>
          <a href="/auth/signin" style={{
            fontFamily: "var(--font-body)", fontSize: 14, color: "var(--muted)",
            textDecoration: "none", alignSelf: "center",
          }}>Sign in</a>
        </div>

        {/* Social proof */}
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", marginTop: 16,
        }}>
          10,000+ players · 4.9★ rating · Zero ads
        </p>

        {/* Phone mockups */}
        <div style={{ marginTop: 48 }}>
          <HeroPhoneMockups />
        </div>
      </div>
    </section>
  );
}
