"use client";
import { motion } from "framer-motion";
import { GameSnapshot } from "@/components/ui/GameSnapshots";

interface PhoneProps {
  slug: string;
  rotate: number;
  featured?: boolean;
  offsetY?: number;
}

function Phone({ slug, rotate, featured = false, offsetY = 0 }: PhoneProps) {
  return (
    <div style={{ position: "relative", transform: `translateY(${offsetY}px)`, zIndex: featured ? 3 : 1 }}>
      {featured && (
        <div style={{
          position: "absolute", inset: -40,
          background: "radial-gradient(circle, rgba(0,255,255,0.22) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
      )}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: featured ? 0.05 : 0.2 }}
        style={{
          width: featured ? 180 : 152,
          height: featured ? 320 : 276,
          borderRadius: 36,
          border: "2px solid rgba(0,255,255,0.3)",
          background: "#0C0C0C",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transform: `rotate(${rotate}deg)`,
          boxShadow: featured
            ? "0 24px 64px rgba(0,0,0,0.75), 0 0 40px rgba(0,255,255,0.1)"
            : "0 16px 40px rgba(0,0,0,0.55)",
          position: "relative",
        }}
      >
        {/* Notch */}
        <div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ width: 52, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.12)" }} />
        </div>
        {/* Game screen */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", transform: "scale(1.45)", transformOrigin: "center" }}>
          <GameSnapshot slug={slug} />
        </div>
        {/* Home bar */}
        <div style={{ height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
        </div>
      </motion.div>
    </div>
  );
}

export function HeroPhoneMockups() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "28px 0", userSelect: "none" }}>
      <div style={{ marginRight: -20 }}>
        <Phone slug="tango" rotate={-6} offsetY={28} />
      </div>
      <Phone slug="memory" rotate={0} featured />
      <div style={{ marginLeft: -20 }}>
        <Phone slug="queens" rotate={6} offsetY={28} />
      </div>
    </div>
  );
}
