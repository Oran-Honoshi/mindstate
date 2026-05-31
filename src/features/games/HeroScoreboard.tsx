"use client";
import { motion } from "framer-motion";

const ROWS = [
  { game: "QUEENS",  stage: 34, xp: 847  },
  { game: "TANGO",   stage: 71, xp: 1000 },
  { game: "SUDOKU",  stage: 12, xp: 623  },
  { game: "BRIDGES", stage: 8,  xp: 412  },
  { game: "ZIP",     stage: 55, xp: 791  },
];

const STATS = [
  { n: "24",    l: "GAMES"   },
  { n: "2,400", l: "STAGES"  },
  { n: "∞",     l: "STREAKS" },
];

export function HeroScoreboard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 12, overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", borderBottom: "1px solid var(--color-border)",
        background: "var(--color-surface-2)",
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
          LIVE SCORES
        </span>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-accent-secondary)", boxShadow: "0 0 6px var(--color-accent-secondary)" }} />
      </div>

      {/* Score rows */}
      {ROWS.map((row, i) => (
        <motion.div
          key={row.game}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.3 + i * 0.07 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "11px 20px", borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 10, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", width: 14, textAlign: "right", flexShrink: 0 }}>
              {i + 1}
            </span>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", marginBottom: 2 }}>
                {row.game}
              </p>
              <p style={{ fontSize: 9, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
                STAGE {row.stage}
              </p>
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent-secondary)", fontFamily: "var(--font-mono)" }}>
            +{row.xp}
          </span>
        </motion.div>
      ))}

      {/* Footer stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--color-border)" }}>
        {STATS.map(({ n, l }, i) => (
          <div key={l} style={{
            padding: "14px 0", textAlign: "center",
            borderRight: i < 2 ? "1px solid var(--color-border)" : "none",
          }}>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--color-accent-primary)", fontFamily: "var(--font-mono)", lineHeight: 1, marginBottom: 4 }}>
              {n}
            </p>
            <p style={{ fontSize: 8, letterSpacing: "0.1em", color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
              {l}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
