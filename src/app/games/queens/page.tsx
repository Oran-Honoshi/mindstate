"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle, ChevronRight, Share2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { generateQueensBoard, validateQueens, type QueensBoard } from "@/lib/games/queensGenerator";
import {
  createXPState, calculateXP, finalizeXP,
  formatElapsed, xpColor, type XPState, type Difficulty,
} from "@/lib/games/xpEngine";
import { buildSeed } from "@/lib/games/tangoGenerator";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";

function shareResult(game: string, stage: number, xp: number, elapsed: string) {
  const text = `🧠 MindState · ${game} Stage ${stage} · ${xp} XP · ${elapsed}`;
  const url = "https://mindstate.vercel.app";
  if (navigator.share) {
    navigator.share({ title:"MindState", text, url }).catch(()=>{});
  } else {
    const tweet = encodeURIComponent(text + " " + url);
    window.open("https://twitter.com/intent/tweet?text=" + tweet, "_blank");
  }
}

function getDifficulty(stage: number): Difficulty {
  if (stage <= 300) return "easy";
  if (stage <= 700) return "medium";
  return "hard";
}

// Vibrant, distinct region colors — bright enough to distinguish easily
const REGION_PALETTE = [
  { fill:"#EFF6FF", border:"#3B82F6", queen:"#1D4ED8" }, // Blue
  { fill:"#FFF7ED", border:"#F97316", queen:"#C2410C" }, // Orange
  { fill:"#F0FDF4", border:"#22C55E", queen:"#15803D" }, // Green
  { fill:"#FDF4FF", border:"#A855F7", queen:"#7E22CE" }, // Purple
  { fill:"#FFF1F2", border:"#F43F5E", queen:"#BE123C" }, // Rose
  { fill:"#FFFBEB", border:"#EAB308", queen:"#A16207" }, // Amber
  { fill:"#F0FDFA", border:"#14B8A6", queen:"#0F766E" }, // Teal
  { fill:"#FEF2F2", border:"#EF4444", queen:"#B91C1C" }, // Red
  { fill:"#F5F3FF", border:"#8B5CF6", queen:"#6D28D9" }, // Violet
  { fill:"#ECFEFF", border:"#06B6D4", queen:"#0E7490" }, // Cyan
];

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap,setSnap]=useState(()=>calculateXP(xpState));
  useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);
  const pct=snap.percentRemaining;
  const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1,height:4,background:"#F1EDE8",borderRadius:2,overflow:"hidden"}}>
        <motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/>
      </div>
      <span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span>
      <span style={{fontSize:11,color:"#94A3B8"}}>XP</span>
    </div>
  );
}

export default function QueensGame() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(1);
  const [board, setBoard] = useState<QueensBoard | null>(null);
  const [placed, setPlaced] = useState<Map<string, boolean>>(new Map());
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage = useCallback((s: number) => {
    const diff = getDifficulty(s);
    const seed = buildSeed("queens", diff, s);
    const b = generateQueensBoard(seed, diff);
    const xp = createXPState(diff);
    setBoard(b); setPlaced(new Map()); setErrors(new Set());
    setXpState(xp); setCompleted(false); setFinalXP(0); setElapsed("00:00");
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
  }, []);

  useEffect(() => {
    loadStage(stage);
    return () => { if(timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleCellClick(r: number, c: number) {
    if (completed || !board) return;
    const key = `${r},${c}`;
    const cur = placed.get(key);
    const np = new Map(placed);
    // Cycle: empty → queen → X marker → empty
    if (cur === undefined) np.set(key, true);
    else if (cur === true) np.set(key, false);
    else np.delete(key);
    setPlaced(np);
    playClick();
    const { correct, errors: errs } = validateQueens(np, board.solution);
    setErrors(errs);
    if (errs.size > 0) playError();
    if (correct && xpState) {
      const earned = finalizeXP(xpState);
      setFinalXP(earned); setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(() => triggerConfetti(), 80);
      if (user) saveScore({
        user_id:user.id, game_slug:"queens", stage_number:stage,
        difficulty:getDifficulty(stage), xp_earned:earned,
        time_taken:Math.floor((Date.now()-xpState.startTime)/1000)
      });
    }
  }

  if (!board || !xpState) return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#94A3B8", fontSize:13 }}>Generating board...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const queensPlaced = Array.from(placed.values()).filter(Boolean).length;

  // Large board — fill viewport
  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 560) : 480;
  const cellSize = Math.floor(maxW / board.size);

  return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB", display:"flex", flexDirection:"column" }}>
      <Navbar/>
      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"76px 16px 32px", gap:18 }}>

        {/* Stage header */}
        <div style={{ width:"100%", maxWidth:600, background:"white", borderRadius:20, border:"0.5px solid rgba(0,0,0,0.07)", padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Link href="/games" style={{ color:"#94A3B8", textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
                <ArrowLeft size={14}/> Games
              </Link>
              <div style={{ width:1, height:16, background:"#E2E8F0" }}/>
              <span style={{ fontSize:11, color:"#94A3B8" }}>Stage</span>
              <span style={{ fontSize:20, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif" }}>{stage}</span>
              <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10, background:`${diffColor}15`, color:diffColor }}>
                {diff.toUpperCase()} · {board.size}×{board.size}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:12, color:"#94A3B8" }}>
                ♛ {queensPlaced}/{board.size}
              </span>
              <span style={{ fontSize:12, color:"#94A3B8", fontFamily:"monospace" }}>{elapsed}</span>
              <button onClick={() => loadStage(stage)} style={{ padding:7, borderRadius:9, border:"0.5px solid #E2E8F0", background:"white", cursor:"pointer", color:"#94A3B8", display:"flex" }}>
                <RotateCcw size={13}/>
              </button>
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/play/queens?seed=${board.seed}`); }}
                style={{ padding:7, borderRadius:9, border:"0.5px solid #E2E8F0", background:"white", cursor:"pointer", color:"#94A3B8", display:"flex" }}>
                <Share2 size={13}/>
              </button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {/* Instructions */}
        <div style={{ fontSize:12, color:"#94A3B8", textAlign:"center" }}>
          Click → ♛ Queen &nbsp;·&nbsp; Click again → ✕ Mark &nbsp;·&nbsp; Click again → Clear
          &nbsp;·&nbsp; One queen per row, column & color region
        </div>

        {/* Board — large, clean borders, vibrant regions */}
        <div style={{
          border:"2px solid #E2E8F0",
          borderRadius:16,
          overflow:"hidden",
          boxShadow:"0 8px 32px rgba(0,0,0,0.08)",
        }}>
          <div style={{
            display:"grid",
            gridTemplateColumns:`repeat(${board.size},${cellSize}px)`,
          }}>
            {board.regions.map((row, r) =>
              row.map((regionId, c) => {
                const key = `${r},${c}`;
                const state = placed.get(key);
                const isQueen = state === true;
                const isMarked = state === false;
                const isError = errors.has(key);
                const pal = REGION_PALETTE[regionId % REGION_PALETTE.length];

                // Determine which borders to make thick (region boundaries)
                const rightDiff = c < board.size-1 && board.regions[r][c+1] !== regionId;
                const bottomDiff = r < board.size-1 && board.regions[r+1][c] !== regionId;
                const leftDiff = c > 0 && board.regions[r][c-1] !== regionId;
                const topDiff = r > 0 && board.regions[r-1][c] !== regionId;

                return (
                  <motion.button
                    key={key}
                    onClick={() => handleCellClick(r, c)}
                    animate={isError ? { scale:[1,0.94,1.02,1] } : {}}
                    transition={{ duration:0.25 }}
                    style={{
                      width:cellSize, height:cellSize,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background: isError ? "#FEF2F2" : pal.fill,
                      borderTop: topDiff ? `2.5px solid ${pal.border}` : "0.5px solid rgba(0,0,0,0.1)",
                      borderLeft: leftDiff ? `2.5px solid ${pal.border}` : "0.5px solid rgba(0,0,0,0.1)",
                      borderRight: rightDiff ? `2.5px solid ${pal.border}` : "0.5px solid rgba(0,0,0,0.1)",
                      borderBottom: bottomDiff ? `2.5px solid ${pal.border}` : "0.5px solid rgba(0,0,0,0.1)",
                      cursor:"pointer", outline:"none",
                      transition:"background 0.15s",
                      position:"relative",
                    }}>
                    {isQueen && (
                      <motion.div
                        initial={{ scale:0, rotate:-20 }}
                        animate={{ scale:1, rotate:0 }}
                        transition={{ type:"spring", stiffness:500, damping:25 }}
                        style={{
                          fontSize: Math.round(cellSize*0.45),
                          color: isError ? "#EF4444" : pal.queen,
                          lineHeight:1,
                          filter: isError ? "none" : `drop-shadow(0 2px 4px ${pal.border}60)`,
                        }}>
                        ♛
                      </motion.div>
                    )}
                    {isMarked && (
                      <span style={{ fontSize:Math.round(cellSize*0.3), color:"#CBD5E1", lineHeight:1 }}>✕</span>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Region legend */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center", maxWidth:580 }}>
          {Array.from({ length: board.size }, (_, i) => {
            const pal = REGION_PALETTE[i % REGION_PALETTE.length];
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:pal.fill, border:`2px solid ${pal.border}` }}/>
                <span style={{ fontSize:10, color:"#64748B" }}>Region {i+1}</span>
              </div>
            );
          })}
        </div>

        {/* Stage nav */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => stage>1&&setStage(s=>s-1)} disabled={stage===1}
            style={{ padding:"8px 16px", borderRadius:12, border:"0.5px solid #E2E8F0", background:"white", cursor:stage>1?"pointer":"not-allowed", fontSize:12, color:"#64748B", opacity:stage===1?0.4:1 }}>
            ← Prev
          </button>
          <span style={{ fontSize:12, color:"#94A3B8" }}>Stage {stage} of 1000</span>
          <button onClick={() => setStage(s=>s+1)}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 16px", borderRadius:12, border:"0.5px solid #E2E8F0", background:"white", cursor:"pointer", fontSize:12, color:"#374151", fontWeight:600 }}>
            Next <ChevronRight size={13}/>
          </button>
        </div>
      </main>

      {/* Completion overlay */}
      <AnimatePresence>
        {completed && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:24 }}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
              style={{ background:"white", borderRadius:28, padding:36, maxWidth:340, width:"100%", textAlign:"center", boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
              <CheckCircle size={48} color="#22C55E" style={{ margin:"0 auto 16px" }}/>
              <h2 style={{ fontSize:26, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:4 }}>
                Stage {stage} Complete
              </h2>
              <p style={{ fontSize:13, color:"#94A3B8", marginBottom:24 }}>{elapsed} · {diff}</p>
              <div style={{ background:"#F8F7F5", borderRadius:16, padding:20, marginBottom:24 }}>
                <p style={{ fontSize:11, color:"#94A3B8", fontWeight:600, marginBottom:4 }}>XP EARNED</p>
                <p style={{ fontSize:48, fontWeight:700, color:"#4F6EF7", fontFamily:"Georgia,serif" }}>{finalXP}</p>
              </div>
              <button onClick={()=>shareResult("Queens",stage,finalXP,elapsed)}
                style={{width:"100%",marginBottom:12,padding:"11px",borderRadius:14,border:"0.5px solid #E2E8F0",background:"white",fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <Share2 size={14}/> Share Result
              </button>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => loadStage(stage)}
                  style={{ flex:1, padding:13, borderRadius:14, border:"0.5px solid #E2E8F0", background:"white", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                  Retry
                </button>
                <button onClick={() => { setCompleted(false); setStage(s=>s+1); }}
                  style={{ flex:2, padding:13, borderRadius:14, border:"none", background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", fontSize:13, fontWeight:700, color:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  Next Stage <ChevronRight size={14}/>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
