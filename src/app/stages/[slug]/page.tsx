"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getLastStage, getCompletedStages } from "@/lib/games/stageProgress";

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
  { label:"Easy",   range:"1–30",   start:1,  end:30,  color:"#15803D", bg:"rgba(34,197,94,0.08)"   },
  { label:"Medium", range:"31–70",  start:31, end:70,  color:"#B45309", bg:"rgba(245,158,11,0.08)"  },
  { label:"Hard",   range:"71–100", start:71, end:100, color:"#DC2626", bg:"rgba(239,68,68,0.08)"   },
];

function bandColor(n: number) {
  if (n <= 30) return "#15803D";
  if (n <= 70) return "#B45309";
  return "#DC2626";
}

export default function StagesPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const gameName = GAME_NAMES[slug] ?? slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
  const [lastStage, setLastStage] = useState(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLastStage(getLastStage(slug));
    setCompleted(getCompletedStages(slug));
  }, [slug]);

  return (
    <div style={{ minHeight:"100vh", background:"var(--color-bg)" }}>

      {/* Top bar */}
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
          <p style={{ fontSize:16, fontWeight:700, color:"var(--color-text-primary)", fontFamily:"var(--font-sans)" }}>{gameName}</p>
          <p style={{ fontSize:11, color:"var(--color-text-secondary)" }}>Stage Map</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:20,
          background:"var(--color-surface)", border:"0.5px solid var(--color-border)" }}>
          <Check size={11} color="#22C55E"/>
          <span style={{ fontSize:12, fontWeight:700, color:"var(--color-text-primary)" }}>{completed.size}</span>
          <span style={{ fontSize:11, color:"var(--color-text-secondary)" }}>/ 100</span>
        </div>
      </div>

      <main style={{ maxWidth:480, margin:"0 auto", padding:"68px 16px 40px" }}>

        {/* Difficulty legend */}
        <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
          {BANDS.map(b => (
            <span key={b.label} style={{ fontSize:11, fontWeight:600, padding:"3px 10px",
              borderRadius:8, background:b.bg, color:b.color }}>
              {b.label} {b.range}
            </span>
          ))}
        </div>

        {/* 10×10 grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(10, 1fr)", gap:5 }}>
          {Array.from({ length:100 }, (_, i) => {
            const n = i + 1;
            const isDone  = completed.has(n);
            const isCurrent = n === lastStage;
            const isLocked  = n > lastStage;
            const bg     = isDone ? "rgba(34,197,94,0.12)" : isCurrent ? "rgba(0,255,255,0.08)" : isLocked ? "var(--color-surface-2)" : "var(--color-surface)";
            const border = isDone ? "1px solid #86EFAC" : isCurrent ? "1.5px solid var(--color-accent-primary)" : "0.5px solid var(--color-border)";
            const color  = isDone ? "#15803D" : isCurrent ? "var(--color-accent-primary)" : isLocked ? "var(--color-text-secondary)" : "var(--color-text-primary)";
            return (
              <motion.button key={n}
                onClick={() => !isLocked && router.push(`/games/${slug}?stage=${n}`)}
                whileHover={!isLocked ? { scale:1.1 } : {}}
                whileTap={!isLocked ? { scale:0.88 } : {}}
                style={{ aspectRatio:"1", borderRadius:7, border, background:bg, color,
                  fontSize:8, fontFamily:"var(--font-mono)", fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:isLocked ? "not-allowed" : "pointer", outline:"none",
                  opacity:isLocked ? 0.45 : 1, position:"relative",
                  boxShadow:isCurrent ? "0 0 8px rgba(0,255,255,0.25)" : "none" }}>
                {isDone ? <Check size={8}/> : n}
                {/* Difficulty stripe at top */}
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
                  borderRadius:"7px 7px 0 0", background:bandColor(n), opacity:0.55 }}/>
                {/* Current stage pulse ring */}
                {isCurrent && (
                  <motion.div animate={{ opacity:[1,0.25,1] }} transition={{ repeat:Infinity, duration:1.5 }}
                    style={{ position:"absolute", inset:-2, borderRadius:9,
                      border:"1.5px solid var(--color-accent-primary)", pointerEvents:"none" }}/>
                )}
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
