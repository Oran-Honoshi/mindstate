"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GAMES } from "@/features/games/GameGrid";
import { MasteryBadge } from "@/components/ui/MasteryBadge";
import { getMasteryTier, type MasteryTier } from "@/lib/mastery";
import { getCompletedStages } from "@/lib/games/stageProgress";

export function MasterySection() {
  const [tiers, setTiers] = useState<Record<string, MasteryTier>>({});

  useEffect(() => {
    const result: Record<string, MasteryTier> = {};
    GAMES.forEach(g => {
      result[g.slug] = getMasteryTier(getCompletedStages(g.slug).size);
    });
    setTiers(result);
  }, []);

  const mastered = GAMES.filter(g => tiers[g.slug] !== null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
      className="ms-card"
      style={{ padding: "18px 20px", marginBottom: 12 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 14, color: "#8E7CFF" }}>◆</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>Game Mastery</span>
        </div>
        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
          {mastered.length}/{GAMES.length}
        </span>
      </div>

      {mastered.length === 0 ? (
        <p style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>
          Complete 10+ stages in any game to earn mastery.
        </p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {mastered.map(g => (
            <div key={g.slug} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <MasteryBadge slug={g.slug} size={38} />
              <span style={{
                fontSize: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
                color: "var(--color-text-secondary)", textAlign: "center", maxWidth: 44,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {g.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
