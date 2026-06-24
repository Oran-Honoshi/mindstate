// DEPRECATED — superseded by CenturyClubOverlay (Step 12). Safe to delete after QA.
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SparkyImg } from "@/components/ui/SparkyImg";
import { triggerConfetti } from "@/components/effects/Confetti";
import { Share2 } from "lucide-react";

interface CenturyOverlayProps {
  gameName: string;
  onDismiss: () => void;
}

export function CenturyOverlay({ gameName, onDismiss }: CenturyOverlayProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    triggerConfetti();
    const duration = 1500;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(100 * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "radial-gradient(130% 80% at 50% 18%, #2a1d3a, #0B0C0F 62%)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Main content */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 30, position: "relative", zIndex: 4, textAlign: "center",
      }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{
            fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--color-violet)", marginBottom: 10,
          }}
        >
          Milestone
        </motion.div>

        {/* Animated count */}
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 110, lineHeight: 1,
          letterSpacing: "-0.04em",
          background: "linear-gradient(180deg, #8E7CFF, #2FE6E0)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 8,
          fontVariantNumeric: "tabular-nums",
        }}>
          {count}
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24,
            color: "var(--color-text-primary)", marginBottom: 10,
          }}>
            Century Club
          </div>
          <p style={{
            fontFamily: "var(--font-sans)", fontSize: 13.5,
            color: "var(--color-text-secondary)",
            maxWidth: 240, lineHeight: 1.55, margin: "0 auto",
          }}>
            {gameName}, solved. You&apos;ve joined the top 6% of all players.
          </p>
        </motion.div>

        {/* Sparky — small, below text */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 240, damping: 18 }}
          style={{ marginTop: 22 }}
        >
          <SparkyImg mood="violet" size={60} />
        </motion.div>
      </div>

      {/* Footer CTAs */}
      <div style={{
        padding: "0 30px 30px",
        display: "flex", flexDirection: "column", gap: 9,
        position: "relative", zIndex: 4,
      }}>
        <button
          onClick={onDismiss}
          style={{
            width: "100%", padding: "14px 0",
            borderRadius: 14, border: "none",
            background: "var(--color-accent-primary)",
            color: "var(--color-on-accent)",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
            cursor: "pointer",
          }}
        >
          Continue
        </button>
        <button
          onClick={onDismiss}
          style={{
            width: "100%", padding: "10px 0",
            borderRadius: 14, border: "none",
            background: "transparent",
            color: "var(--color-text-secondary)",
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}
        >
          <Share2 size={14} />
          Share the moment
        </button>
      </div>
    </motion.div>
  );
}
