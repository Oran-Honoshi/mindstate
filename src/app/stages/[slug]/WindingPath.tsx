"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

const NODE = 44;
const CONNECTOR = 10;
const ROW_W = 5 * NODE + 4 * CONNECTOR; // 260

function diffColor(n: number): string {
  if (n <= 30) return "#54D06A";
  if (n <= 70) return "#F5A623";
  return "#FF5C66";
}

function stageAt(row: number, col: number): number {
  return row % 2 === 0 ? row * 5 + col + 1 : row * 5 + (4 - col) + 1;
}

interface WindingPathProps {
  slug: string;
  completed: Set<number>;
  lastStage: number;
}

export function WindingPath({ slug, completed, lastStage }: WindingPathProps) {
  const router = useRouter();
  const currentRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [lastStage]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {Array.from({ length: 20 }, (_, row) => {
        const isLTR = row % 2 === 0;
        return (
          <div key={row}>
            {/* Row of 5 nodes with horizontal connectors */}
            <div style={{ display: "flex", alignItems: "center", width: ROW_W }}>
              {Array.from({ length: 5 }, (_, col) => {
                const n = stageAt(row, col);
                const done = completed.has(n);
                const current = n === lastStage;
                const locked = n > lastStage;
                const color = diffColor(n);
                return (
                  <div key={col} style={{ display: "flex", alignItems: "center" }}>
                    {col > 0 && (
                      <div style={{ width: CONNECTOR, height: 2, background: "var(--color-border)" }} />
                    )}
                    <motion.button
                      ref={current ? currentRef : null}
                      onClick={() => !locked && router.push(`/games/${slug}?stage=${n}`)}
                      whileHover={!locked ? { scale: 1.1 } : {}}
                      whileTap={!locked ? { scale: 0.92 } : {}}
                      style={{
                        width: NODE, height: NODE, borderRadius: "50%", flexShrink: 0,
                        border: done ? `2px solid ${color}` : current ? "2px solid #2FE6E0" : locked ? "1px solid var(--color-border)" : `1.5px solid ${color}55`,
                        background: done ? `${color}1A` : current ? "rgba(47,230,224,0.08)" : "var(--color-surface)",
                        color: done ? color : current ? "#2FE6E0" : locked ? "var(--color-text-secondary)" : "var(--color-text-primary)",
                        fontSize: n === 100 ? 9 : 11, fontFamily: "var(--font-mono)", fontWeight: 700,
                        cursor: locked ? "not-allowed" : "pointer",
                        opacity: locked ? 0.28 : 1,
                        position: "relative",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        outline: "none",
                        boxShadow: current ? "0 0 14px rgba(47,230,224,0.35)" : "none",
                        transition: "box-shadow 0.2s",
                      }}
                    >
                      {done ? <Check size={14} strokeWidth={2.5} /> : n}
                      {current && (
                        <motion.div
                          animate={{ opacity: [1, 0.1, 1] }}
                          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                          style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "1.5px solid #2FE6E0", pointerEvents: "none" }}
                        />
                      )}
                    </motion.button>
                  </div>
                );
              })}
            </div>

            {/* Vertical connector between rows */}
            {row < 19 && (
              <div style={{ width: ROW_W, position: "relative", height: 10 }}>
                <div style={{
                  position: "absolute",
                  left: isLTR ? undefined : 21,
                  right: isLTR ? 21 : undefined,
                  top: 0, width: 2, height: 10,
                  background: "var(--color-border)", borderRadius: 1,
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
