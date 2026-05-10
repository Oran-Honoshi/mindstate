"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle, ChevronRight, Share2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { GameInstructions } from "@/components/ui/GameInstructions";
import { generateFlowBoard, checkFlowComplete, type FlowBoard, type Color } from "@/lib/games/flowGenerator";
import { createXPState, calculateXP, finalizeXP, formatElapsed, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { markDailyCompleted, getDailySeed } from "@/lib/games/dailyChallenge";
import { consumeToken } from "@/lib/games/tokenEngine";

function getDifficulty(stage: number): Difficulty {
  return stage <= 300 ? "easy" : stage <= 700 ? "medium" : "hard";
}

function shareResult(stage: number, xp: number, elapsed: string) {
  const text = `🌊 MindState · Flow Stage ${stage} · ${xp} XP · ${elapsed}`;
  const url = "https://mindstate.vercel.app";
  if (navigator.share) navigator.share({ title:"MindState", text, url }).catch(()=>{});
  else window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text + " " + url), "_blank");
}

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap, setSnap] = useState(() => calculateXP(xpState));
  useEffect(() => { const iv = setInterval(() => setSnap(calculateXP(xpState)), 500); return () => clearInterval(iv); }, [xpState]);
  const pct = snap.percentRemaining;
  const color = pct > 0.6 ? "#22C55E" : pct > 0.3 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, height:4, background:"var(--bg3)", borderRadius:2, overflow:"hidden" }}>
        <motion.div animate={{ width:`${pct*100}%` }} transition={{ duration:0.5 }} style={{ height:"100%", background:color, borderRadius:2 }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color, fontFamily:"monospace", minWidth:36 }}>{snap.currentXP}</span>
      <span style={{ fontSize:11, color:"var(--text4)" }}>XP</span>
    </div>
  );
}

type PathState = { color: Color; cells: string[] };

export default function FlowGame() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(1);
  const [board, setBoard] = useState<FlowBoard | null>(null);
  const [paths, setPaths] = useState<Map<string, PathState>>(new Map());
  const [cellColors, setCellColors] = useState<Map<string, Color>>(new Map());
  const [drawing, setDrawing] = useState<{ color: Color; cells: string[] } | null>(null);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage = useCallback((s: number) => {
    const diff = getDifficulty(s);
    const b = generateFlowBoard(`flow-${diff}-${s}`, diff);
    const xp = createXPState(diff);
    setBoard(b); setPaths(new Map()); setCellColors(new Map()); setDrawing(null);
    setXpState(xp); setCompleted(false); setFinalXP(0); setElapsed("00:00");
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
    if (user) consumeToken(user.id);
  }, [user]);

  useEffect(() => { loadStage(stage); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [stage, loadStage]);

  function key(r: number, c: number) { return `${r},${c}`; }

  function startDraw(r: number, c: number) {
    if (!board || completed) return;
    const k = key(r, c);
    const dotColor = board.dots.get(k);
    const existingPath = [...paths.values()].find(p => p.cells.includes(k));

    let color: Color;
    if (dotColor) {
      color = dotColor;
    } else if (existingPath) {
      color = existingPath.color;
    } else return;

    // Clear this color's existing path
    const np = new Map(paths);
    np.delete(color);
    const nc = new Map(cellColors);
    [...cellColors.entries()].filter(([,c])=>c===color).forEach(([k])=>nc.delete(k));
    setCellColors(nc);
    setPaths(np);

    setDrawing({ color, cells: [k] });
    playClick();
  }

  function continueDraw(r: number, c: number) {
    if (!drawing || !board || completed) return;
    const k = key(r, c);
    if (drawing.cells.includes(k)) {
      // Backtrack
      const idx = drawing.cells.indexOf(k);
      const trimmed = drawing.cells.slice(0, idx + 1);
      const nc = new Map(cellColors);
      drawing.cells.slice(idx + 1).forEach(k2 => { if (cellColors.get(k2) === drawing.color) nc.delete(k2); });
      setCellColors(nc);
      setDrawing({ ...drawing, cells: trimmed });
      return;
    }

    // Check adjacency
    const last = drawing.cells[drawing.cells.length - 1];
    const [lr, lc] = last.split(",").map(Number);
    if (Math.abs(lr - r) + Math.abs(lc - c) !== 1) return;

    // Can't cross other paths unless it's a matching dot
    const occupant = cellColors.get(k);
    const dotColor = board.dots.get(k);
    if (occupant && occupant !== drawing.color) return;
    if (dotColor && dotColor !== drawing.color) return;

    const newCells = [...drawing.cells, k];
    const nc = new Map(cellColors);
    nc.set(k, drawing.color);
    setCellColors(nc);
    setDrawing({ ...drawing, cells: newCells });
    playClick();
  }

  function endDraw() {
    if (!drawing || !board) return;
    const k = drawing.cells[drawing.cells.length - 1];
    const dotColor = board.dots.get(k);
    const startsAtDot = board.dots.get(drawing.cells[0]) === drawing.color;
    const endsAtDot = dotColor === drawing.color;

    if (startsAtDot && endsAtDot && drawing.cells.length >= 2) {
      // Valid path!
      const np = new Map(paths);
      np.set(drawing.color, { color: drawing.color, cells: drawing.cells });
      const nc = new Map(cellColors);
      drawing.cells.forEach(k2 => nc.set(k2, drawing.color));
      setPaths(np); setCellColors(nc);

      if (checkFlowComplete(board, np) && xpState) {
        const earned = finalizeXP(xpState);
        setFinalXP(earned); setCompleted(true);
        if (timerRef.current) clearInterval(timerRef.current);
        playSuccess(); setTimeout(() => triggerConfetti(), 80);
        if (user) saveScore({ user_id:user.id, game_slug:"flow", stage_number:stage, difficulty:getDifficulty(stage), xp_earned:earned, time_taken:Math.floor((Date.now()-xpState.startTime)/1000) });
      }
    }
    setDrawing(null);
  }

  if (!board || !xpState) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"var(--text4)", fontSize:13 }}>Generating board...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 480) : 400;
  const cellSize = Math.floor(maxW / board.size);
  const connected = paths.size;
  const total = board.colors.length;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      <Navbar/>
      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"76px 16px 32px", gap:18 }}>
        {/* Header */}
        <div style={{ width:"100%", maxWidth:540, background:"var(--surface)", borderRadius:20, border:"0.5px solid var(--border)", padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Link href="/games" style={{ color:"var(--text4)", textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13 }}><ArrowLeft size={14}/> Games</Link>
              <div style={{ width:1, height:16, background:"#E2E8F0" }}/>
              <span style={{ fontSize:11, color:"var(--text4)" }}>Stage</span>
              <span style={{ fontSize:20, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif" }}>{stage}</span>
              <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10, background:`${diffColor}15`, color:diffColor }}>{diff.toUpperCase()}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:12, color:"var(--text4)" }}>{connected}/{total} flows</span>
              <span style={{ fontSize:12, color:"var(--text4)", fontFamily:"monospace" }}>{elapsed}</span>
              <GameInstructions game="flow"/>
              <button onClick={() => loadStage(stage)} style={{ padding:7, borderRadius:9, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", color:"var(--text4)", display:"flex" }}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div style={{ fontSize:11, color:"var(--text4)" }}>Drag from dot to dot · Fill every cell · No crossings</div>

        {/* Board */}
        <div
          style={{ border:"2px solid #E2E8F0", borderRadius:16, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.08)", cursor:"crosshair", userSelect:"none" }}
          onMouseLeave={endDraw}
        >
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${board.size},${cellSize}px)` }}>
            {Array.from({ length:board.size }, (_,r) =>
              Array.from({ length:board.size }, (_,c) => {
                const k = key(r,c);
                const dotColor = board.dots.get(k);
                const cellColor = drawing?.cells.includes(k) ? drawing.color : cellColors.get(k);
                return (
                  <div key={k}
                    onMouseDown={() => startDraw(r,c)}
                    onMouseEnter={() => continueDraw(r,c)}
                    onMouseUp={endDraw}
                    onTouchStart={() => startDraw(r,c)}
                    style={{
                      width:cellSize, height:cellSize,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background: cellColor ? cellColor + "30" : "#FAFAF9",
                      borderRight:"0.5px solid #F0EDE8",
                      borderBottom:"0.5px solid #F0EDE8",
                      borderTop:"none", borderLeft:"none",
                      position:"relative",
                    }}>
                    {/* Path fill */}
                    {cellColor && !dotColor && (
                      <div style={{ position:"absolute", inset:4, borderRadius:4, background:cellColor, opacity:0.7 }}/>
                    )}
                    {/* Dot */}
                    {dotColor && (
                      <div style={{
                        width:cellSize*0.55, height:cellSize*0.55,
                        borderRadius:"50%", background:dotColor,
                        boxShadow:`0 2px 8px ${dotColor}60`,
                        border:`3px solid ${dotColor}`,
                        position:"relative", zIndex:2,
                      }}/>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Stage nav */}
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => stage>1&&setStage(s=>s-1)} disabled={stage===1}
            style={{ padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:stage>1?"pointer":"not-allowed", fontSize:12, color:"var(--text3)", opacity:stage===1?0.4:1 }}>← Prev</button>
          <span style={{ fontSize:12, color:"var(--text4)" }}>Stage {stage} of 1000</span>
          <button onClick={() => setStage(s=>s+1)}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", fontSize:12, color:"var(--text2)", fontWeight:600 }}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      <AnimatePresence>
        {completed && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:24 }}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
              style={{ background:"var(--surface)", borderRadius:28, padding:36, maxWidth:340, width:"100%", textAlign:"center", boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
              <CheckCircle size={48} color="#22C55E" style={{ margin:"0 auto 16px" }}/>
              <h2 style={{ fontSize:26, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", marginBottom:4 }}>Stage {stage} Complete</h2>
              <p style={{ fontSize:13, color:"var(--text4)", marginBottom:24 }}>{elapsed} · {diff}</p>
              <div style={{ background:"var(--bg2)", borderRadius:16, padding:20, marginBottom:20 }}>
                <p style={{ fontSize:11, color:"var(--text4)", fontWeight:600, marginBottom:4 }}>XP EARNED</p>
                <p style={{ fontSize:48, fontWeight:700, color:"#4F6EF7", fontFamily:"Georgia,serif" }}>{finalXP}</p>
              </div>
              <button onClick={() => shareResult(stage,finalXP,elapsed)}
                style={{ width:"100%", marginBottom:12, padding:"11px", borderRadius:14, border:"0.5px solid var(--border2)", background:"var(--surface)", fontSize:13, fontWeight:600, color:"var(--text2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <Share2 size={14}/> Share Result
              </button>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => loadStage(stage)} style={{ flex:1, padding:13, borderRadius:14, border:"0.5px solid var(--border2)", background:"var(--surface)", fontSize:13, fontWeight:600, color:"var(--text2)", cursor:"pointer" }}>Retry</button>
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
