"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Lightbulb, ChevronRight } from "lucide-react";
import { getCityInfo, getCountryData, type CountryData } from "@/lib/places";

interface FactsRevealPanelProps {
  type: "city" | "country";
  name: string;
  subtitle?: string;
  isDark: boolean;
  xpEarned: number;
  onNext: () => void;
}

function toTitleCase(s: string): string {
  return s.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

export function FactsRevealPanel({ type, name, subtitle, isDark, xpEarned, onNext }: FactsRevealPanelProps) {
  const [facts, setFacts] = useState<string[]>([]);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [countryData, setCountryData] = useState<CountryData | null>(null);

  useEffect(() => {
    const titleName = toTitleCase(name);
    getCityInfo(titleName).then(info => {
      if (info.thumbnailUrl) setImgUrl(info.thumbnailUrl);
      setFacts(info.facts);
    });
    if (type === "country") {
      getCountryData(titleName).then(d => {
        if (!d) return;
        setCountryData(d);
        setFacts(prev => {
          const extras: string[] = [];
          if (d.capital) extras.push(`Capital: ${d.capital}`);
          if (d.population) extras.push(`Population: ${d.population}`);
          return [...extras, ...prev].slice(0, 3);
        });
      });
    }
  }, [name, type]);

  const accent = isDark ? "var(--color-accent-primary)" : "#00CCCC";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        width: "100%", maxWidth: 480, borderRadius: 16, overflow: "hidden",
        background: isDark
          ? "radial-gradient(120% 80% at 50% 0%, rgba(245,158,11,0.07), rgba(6,13,24,0.97))"
          : "var(--color-surface)",
        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--color-border)",
      }}
    >
      {imgUrl && (
        <div style={{ height: 140, position: "relative", overflow: "hidden" }}>
          <img src={imgUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.65))" }} />
          {type === "country" && countryData && (
            <img src={countryData.flagUrl} alt="" width={60} height={40}
              style={{ position: "absolute", top: 10, right: 10, borderRadius: 4, boxShadow: "0 2px 10px rgba(0,0,0,0.5)" }} />
          )}
        </div>
      )}
      {!imgUrl && type === "country" && countryData && (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 18, paddingBottom: 6 }}>
          <img src={countryData.flagUrl} alt="" width={88} height={58}
            style={{ borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.35)" }} />
        </div>
      )}

      <div style={{ padding: "16px 20px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 14 }}>
          <CheckCircle size={18} color="#22C55E" strokeWidth={2.2} />
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 20, color: "var(--color-text-primary)" }}>{name}</span>
          {subtitle && <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>· {subtitle}</span>}
        </div>

        {facts.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "center", marginBottom: 10 }}>
              <Lightbulb size={12} color="#F59E0B" strokeWidth={2} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "#F59E0B" }}>
                Did you know?
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {facts.slice(0, 3).map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: accent, marginTop: 6, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--color-text-secondary)" }}>{f}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%", marginTop: 18, padding: "13px 0", borderRadius: 12,
            border: "none", cursor: "pointer", background: accent, color: "#000",
            fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
            letterSpacing: "0.06em", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          Next Stage{xpEarned > 0 ? ` · +${xpEarned} XP` : ""}
          <ChevronRight size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}
