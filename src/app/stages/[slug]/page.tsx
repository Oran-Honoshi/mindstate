"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getLastStage, getCompletedStages } from "@/lib/games/stageProgress";
import { MasteryBadge } from "@/components/ui/MasteryBadge";
import { WindingPath } from "./WindingPath";

const GAME_NAMES: Record<string, string> = {
  tango:"Tango", memory:"Memory", queens:"Queens", sudoku:"Mini Sudoku",
  zip:"Zip", minesweeper:"Minesweeper", flow:"Flow", nonogram:"Nonogram",
  bridges:"Bridges", "pattern-match":"Pattern Match", "2048-pro":"2048 Pro",
  kakuro:"Kakuro", "gravity-sort":"Gravity Sort", "hex-merge":"Hex Merge",
  "logic-path":"Logic Path", lightup:"Light Up", patches:"Patches",
  "word-sling":"Word Sling", hearts:"Hearts", solitaire:"Solitaire",
  "word-climb":"Word Climb", pinpoint:"Pinpoint",
  "name-country":"Name the Country", "name-city":"Name the City",
};

const BANDS = [
  { label:"EASY",   range:"1–30",   color:"#54D06A", bg:"rgba(84,208,106,0.08)"   },
  { label:"MEDIUM", range:"31–70",  color:"#F5A623", bg:"rgba(245,166,35,0.08)"   },
  { label:"HARD",   range:"71–100", color:"#FF5C66", bg:"rgba(255,92,102,0.08)"   },
];

export default function StagesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const gameName = GAME_NAMES[slug] ?? slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const [lastStage, setLastStage] = useState(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLastStage(getLastStage(slug));
    setCompleted(getCompletedStages(slug));
  }, [slug]);

  const pct = Math.round((completed.size / 100) * 100);

  return (
    <div style={{ minHeight:"100vh", background:"var(--color-bg)" }}>

      {/* Fixed top bar */}
      <div style={{ position:"fixed", top:0, left:0, right:0, height:56, zIndex:50,
        display:"flex", alignItems:"center", gap:12, padding:"0 16px",
        background:"color-mix(in srgb, var(--color-bg) 93%, transparent)",
        backdropFilter:"blur(20px)", borderBottom:"0.5px solid var(--color-border)" }}>
        <Link href="/games" style={{ display:"flex", alignItems:"center", justifyContent:"center",
          width:34, height:34, borderRadius:10, background:"var(--color-surface)",
          border:"0.5px solid var(--color-border)", textDecoration:"none",
          color:"var(--color-text-secondary)", flexShrink:0 }}>
          <ArrowLeft size={14}/>
        </Link>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:16, fontWeight:700, color:"var(--color-text-primary)" }}>{gameName}</p>
          <p style={{ fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)" }}>STAGE MAP</p>
        </div>
        <MasteryBadge slug={slug} size={34} />
        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:20,
          background:"var(--color-surface)", border:"0.5px solid var(--color-border)" }}>
          <Check size={11} color="#22C55E"/>
          <span style={{ fontSize:12, fontWeight:700, fontFamily:"var(--font-mono)", color:"var(--color-text-primary)" }}>{completed.size}</span>
          <span style={{ fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)" }}>/100</span>
        </div>
      </div>

      <main style={{ maxWidth:480, margin:"0 auto", padding:"72px 16px 48px" }}>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          style={{ marginBottom:20 }}
        >
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)" }}>PROGRESS</span>
            <span style={{ fontSize:13, fontWeight:700, fontFamily:"var(--font-mono)", color: pct === 100 ? "var(--color-accent-primary)" : "var(--color-text-primary)" }}>{pct}%</span>
          </div>
          <div style={{ height:4, background:"var(--color-surface-2)", borderRadius:2, overflow:"hidden" }}>
            <motion.div
              initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ delay:0.2, duration:0.6, ease:"easeOut" }}
              style={{ height:"100%", borderRadius:2, background: pct === 100 ? "var(--color-accent-primary)" : "rgba(0,255,255,0.55)" }}
            />
          </div>
        </motion.div>

        {/* Difficulty legend */}
        <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
          {BANDS.map(b => (
            <span key={b.label} style={{ fontSize:10, fontWeight:700, letterSpacing:"0.08em", padding:"3px 10px",
              borderRadius:4, background:b.bg, color:b.color, fontFamily:"var(--font-mono)" }}>
              {b.label} {b.range}
            </span>
          ))}
        </div>

        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.45 }}
        >
          <WindingPath slug={slug} completed={completed} lastStage={lastStage} />
        </motion.div>
      </main>
    </div>
  );
}
