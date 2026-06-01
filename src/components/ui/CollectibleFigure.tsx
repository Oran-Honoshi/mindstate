"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { SparkyImg } from "@/components/ui/SparkyImg";
import { getTotalXP } from "@/lib/xpLevels";

const EQUIP_KEY = "ms_equipped_sparky";

const COLLECTIBLES = [
  { id: "idle",      label: "Spark",       mood: "idle"      as const, minTier: 0, color: "#2FE6E0" },
  { id: "happy",     label: "Ember",       mood: "happy"     as const, minTier: 1, color: "#2FE6E0" },
  { id: "focused",   label: "Flare",       mood: "focused"   as const, minTier: 2, color: "#2FE6E0" },
  { id: "surprised", label: "Nova",        mood: "surprised" as const, minTier: 3, color: "#2FE6E0" },
  { id: "celebrate", label: "Pulsar",      mood: "celebrate" as const, minTier: 4, color: "#2FE6E0" },
  { id: "gold",      label: "Quasar",      mood: "gold"      as const, minTier: 5, color: "#8E7CFF" },
  { id: "violet",    label: "Grandmaster", mood: "violet"    as const, minTier: 6, color: "#FFC24B" },
];

function getTier(xp: number): number {
  const thresholds = [0, 1000, 2500, 5000, 10000, 20000, 40000];
  let tier = 0;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) tier = i;
  }
  return tier;
}

interface CollectibleFigureProps {
  userId?: string;
}

export function CollectibleFigure({ userId }: CollectibleFigureProps) {
  const [equipped, setEquipped] = useState("idle");
  const [tier, setTier] = useState(0);

  useEffect(() => {
    setTier(getTier(getTotalXP()));
    setEquipped(localStorage.getItem(EQUIP_KEY) ?? "idle");
  }, []);

  function equip(id: string, unlocked: boolean) {
    if (!unlocked) return;
    setEquipped(id);
    localStorage.setItem(EQUIP_KEY, id);
  }

  const unlocked = COLLECTIBLES.filter(c => c.minTier <= tier).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)" }}>Sparky Collection</p>
        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
          {unlocked}/{COLLECTIBLES.length} unlocked
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {COLLECTIBLES.map(c => {
          const isUnlocked = c.minTier <= tier;
          const isEquipped = equipped === c.id;
          return (
            <motion.button
              key={c.id}
              onClick={() => equip(c.id, isUnlocked)}
              whileHover={isUnlocked ? { scale: 1.04 } : {}}
              whileTap={isUnlocked ? { scale: 0.95 } : {}}
              style={{
                background: isEquipped ? `${c.color}14` : "var(--color-surface-2)",
                border: `1px solid ${isEquipped ? c.color : "var(--color-border)"}`,
                borderRadius: 10, padding: "10px 6px", cursor: isUnlocked ? "pointer" : "default",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                opacity: isUnlocked ? 1 : 0.38,
                position: "relative",
              }}
            >
              {isUnlocked ? (
                <SparkyImg mood={c.mood} size={40} />
              ) : (
                <div style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Lock size={16} color="var(--color-text-secondary)" />
                </div>
              )}
              <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                fontFamily: "var(--font-mono)", color: isEquipped ? c.color : "var(--color-text-secondary)",
                margin: 0, textAlign: "center" }}>
                {c.label}
              </p>
              {isEquipped && (
                <div style={{ position: "absolute", top: 5, right: 5, width: 6, height: 6,
                  borderRadius: "50%", background: c.color }} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
