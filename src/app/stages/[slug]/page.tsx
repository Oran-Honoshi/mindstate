"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getLastStage, getCompletedStages } from "@/lib/games/stageProgress";
import { StagePath } from "./StagePath";

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

function StageMedal({ count }: { count: number }) {
  let color: string, symbol: string;
  if (count >= 75) { color = "#A78BFA"; symbol = "◆"; }
  else if (count >= 50) { color = "#FFC24B"; symbol = "★"; }
  else if (count >= 25) { color = "#9CA3AF"; symbol = "◉"; }
  else if (count >= 10) { color = "#B45309"; symbol = "●"; }
  else return null;
  return (
    <div style={{
      width: 34, height: 34, borderRadius: "50%",
      border: `2px solid ${color}`, background: `${color}18`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14, color, flexShrink: 0,
    }}>{symbol}</div>
  );
}

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
          border:"1px solid var(--color-border)", textDecoration:"none",
          color:"var(--color-text-secondary)", flexShrink:0 }}>
          <ArrowLeft size={18}/>
        </Link>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:16, fontWeight:700, color:"var(--color-text-primary)" }}>{gameName}</p>
          <p style={{ fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)" }}>{`Stage ${lastStage} of 100`}</p>
        </div>
        <StageMedal count={completed.size} />
      </div>

      <main style={{ maxWidth:480, margin:"0 auto", padding:"72px 16px 48px" }}>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
          style={{ marginBottom:20 }}
        >
          <div style={{ height:6, background:"var(--color-surface-2)", borderRadius:3, overflow:"hidden" }}>
            <motion.div
              initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ delay:0.2, duration:0.6, ease:"easeOut" }}
              style={{ height:"100%", borderRadius:3, background:"linear-gradient(to right, var(--color-accent-primary), var(--color-gold))" }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.45 }}
        >
          <StagePath slug={slug} completed={completed} lastStage={lastStage} />
        </motion.div>
      </main>
    </div>
  );
}
