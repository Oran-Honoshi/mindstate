"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getLevelInfo, getTotalXP } from "@/lib/xpLevels";

const SIZE = 140;
const STROKE = 8;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

interface XPRingProps {
  totalXP: number;
  stagesPlayed: number;
  uniqueGames: number;
}

export function XPRing({ totalXP, stagesPlayed, uniqueGames }: XPRingProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const info = getLevelInfo(totalXP);
  const dash = mounted ? info.progress * CIRC : 0;
  const gap = CIRC - dash;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
      className="ms-card"
      style={{ padding: "20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}
    >
      {/* Ring */}
      <div style={{ flexShrink: 0, position: "relative", width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke="var(--color-surface-2)" strokeWidth={STROKE}
          />
          <motion.circle
            cx={SIZE / 2} cy={SIZE / 2} r={R}
            fill="none" stroke={info.color} strokeWidth={STROKE}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${CIRC}` }}
            animate={{ strokeDasharray: `${dash} ${gap}` }}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center",
        }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: info.color, fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em", lineHeight: 1.1, marginBottom: 2 }}>
            {info.name.toUpperCase()}
          </p>
          <p style={{ fontSize: 10, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
            TIER {info.tier}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ flex: 1, minWidth: 140, display: "flex", flexDirection: "column", gap: 14 }}>
        <Stat label="TOTAL XP" value={totalXP.toLocaleString()} color={info.color} />
        <Stat label="STAGES" value={stagesPlayed.toString()} />
        <Stat label="GAMES" value={`${uniqueGames}/20`} />
        <div style={{ height: 3, background: "var(--color-surface-2)", borderRadius: 2, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(info.progress * 100)}%` }}
            transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
            style={{ height: "100%", background: info.color, borderRadius: 2 }}
          />
        </div>
        <p style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", marginTop: -8 }}>
          {info.currentXP.toLocaleString()} / {info.nextLevelXP.toLocaleString()} XP TO NEXT
        </p>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <p style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-mono)",
        color: color ?? "var(--color-text-primary)", lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 9, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)",
        letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>
        {label}
      </p>
    </div>
  );
}
