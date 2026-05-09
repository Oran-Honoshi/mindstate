"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle, ChevronRight, Share2, Delete } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import {
  createXPState, calculateXP, finalizeXP,
  formatElapsed, xpColor, type XPState, type Difficulty,
} from "@/lib/games/xpEngine";
import { buildSeed } from "@/lib/games/tangoGenerator";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";

type SudokuCell = number | null;
type SudokuBoard = SudokuCell[][];

function getDifficulty(stage: number): Difficulty {
  if (stage <= 300) return "easy";
  if (stage <= 700) return "medium";
  return "hard";
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedToNumber(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function isValid(board: SudokuBoard, r: number, c: number, num: number, size: number): boolean {
  for (let i = 0; i < size; i++) {
    if (board[r][i] === num || board[i][c] === num) return false;
  }
  const br = size === 9 ? 3 : 2, bc = size === 9 ? 3 : 3;
  const sr = Math.floor(r / br) * br, sc = Math.floor(c / bc) * bc;
  for (let ri = sr; ri < sr + br; ri++)
    for (let ci = sc; ci < sc + bc; ci++)
      if (board[ri][ci] === num) return false;
  return true;
}

function solve(board: SudokuBoard, size: number, rng: () => number): boolean {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === null) {
        const nums = Array.from({ length: size }, (_, i) => i + 1);
        for (let i = nums.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [nums[i], nums[j]] = [nums[j], nums[i]]; }
        for (const n of nums) {
          if (isValid(board, r, c, n, size)) {
            board[r][c] = n;
            if (solve(board, size, rng)) return true;
            board[r][c] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateSudoku(seed: string, difficulty: Difficulty) {
  const size = difficulty === "hard" ? 9 : 6;
  const remove = difficulty === "easy" ? 18 : difficulty === "medium" ? 24 : 51;
  const br = difficulty === "hard" ? 3 : 2, bc = difficulty === "hard" ? 3 : 3;
  const rng = mulberry32(seedToNumber(seed));
  const solution: SudokuBoard = Array.from({ length: size }, () => Array(size).fill(null));
  solve(solution, size, rng);
  const puzzle: SudokuBoard = solution.map(r => [...r]);
  const indices = Array.from({ length: size * size }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [indices[i], indices[j]] = [indices[j], indices[i]]; }
  for (let i = 0; i < remove; i++) puzzle[Math.floor(indices[i] / size)][indices[i] % size] = null;
  return { size, solution, puzzle, br, bc };
}

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap, setSnap] = useState(() => calculateXP(xpState));
  useEffect(() => { const iv = setInterval(() => setSnap(calculateXP(xpState)), 500); return () => clearInterval(iv); }, [xpState]);
  const pct = snap.percentRemaining;
  const color = pct > 0.6 ? "#22C55E" : pct > 0.3 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, height:4, background:"#F1EDE8", borderRadius:2, overflow:"hidden" }}>
        <motion.div animate={{ width:`${pct*100}%` }} transition={{ duration:0.5 }} style={{ height:"100%", background:color, borderRadius:2 }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color, fontFamily:"monospace", minWidth:36 }}>{snap.currentXP}</span>
      <span style={{ fontSize:11, color:"#94A3B8" }}>XP</span>
    </div>
  );
}

export default function SudokuGame() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(1);
  const [puzzleData, setPuzzleData] = useState<ReturnType<typeof generateSudoku> | null>(null);
  const [playerBoard, setPlayerBoard] = useState<SudokuBoard>([]);
  const [selected, setSelected] = useState<[number,number]|null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [xpState, setXpState] = useState<XPState|null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage = useCallback((s: number) => {
    const diff = getDifficulty(s);
    const seed = buildSeed("sudoku", diff, s);
    const data = generateSudoku(seed, diff);
    const xp = createXPState(diff);
    setPuzzleData(data);
    setPlayerBoard(data.puzzle.map(r => [...r]));
    setSelected(null); setErrors(new Set());
    setXpState(xp); setCompleted(false); setFinalXP(0); setElapsed("00:00");
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
  }, []);

  useEffect(() => { loadStage(stage); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, [stage, loadStage]);

  function handleInput(num: number | null) {
    if (!puzzleData || !selected || completed) return;
    const [r, c] = selected;
    if (puzzleData.puzzle[r][c] !== null) return;
    const nb = playerBoard.map(row => [...row]);
    nb[r][c] = num;
    setPlayerBoard(nb);
    const errs = new Set<string>();
    nb.forEach((row, ri) => row.forEach((v, ci) => {
      if (puzzleData.puzzle[ri][ci] !== null || v === null) return;
      if (v !== puzzleData.solution[ri][ci]) errs.add(`${ri}-${ci}`);
    }));
    if (errs.size > 0) { setErrors(errs); playError(); } else { setErrors(new Set()); }
    const allCorrect = nb.every((row, ri) => row.every((v, ci) => puzzleData.puzzle[ri][ci] !== null || v === puzzleData.solution[ri][ci]));
    const allFilled = nb.every(row => row.every(v => v !== null));
    if (allCorrect && allFilled && xpState) {
      const earned = finalizeXP(xpState); setFinalXP(earned); setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(() => triggerConfetti(), 80);
      if (user) saveScore({ user_id:user.id, game_slug:"sudoku", stage_number:stage, difficulty:getDifficulty(stage), xp_earned:earned, time_taken:Math.floor((Date.now()-xpState.startTime)/1000) });
    }
  }

  if (!puzzleData || !xpState) return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"#94A3B8", fontSize:13 }}>Generating puzzle...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 480) : 400;
  const cellSize = Math.floor(maxW / puzzleData.size);
  const nums = Array.from({ length: puzzleData.size }, (_, i) => i + 1);

  return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB", display:"flex", flexDirection:"column" }}>
      <Navbar/>
      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"76px 16px 32px", gap:18 }}>
        {/* Stage header */}
        <div style={{ width:"100%", maxWidth:520, background:"white", borderRadius:20, border:"0.5px solid rgba(0,0,0,0.07)", padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Link href="/games" style={{ color:"#94A3B8", textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
                <ArrowLeft size={14}/> Games
              </Link>
              <div style={{ width:1, height:16, background:"#E2E8F0" }}/>
              <span style={{ fontSize:11, color:"#94A3B8" }}>Stage</span>
              <span style={{ fontSize:20, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif" }}>{stage}</span>
              <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10, background:`${diffColor}15`, color:diffColor }}>
                {diff.toUpperCase()} · {puzzleData.size}×{puzzleData.size}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:12, color:"#94A3B8", fontFamily:"monospace" }}>{elapsed}</span>
              <button onClick={() => loadStage(stage)} style={{ padding:7, borderRadius:9, border:"0.5px solid #E2E8F0", background:"white", cursor:"pointer", color:"#94A3B8", display:"flex" }}>
                <RotateCcw size={13}/>
              </button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {/* Board */}
        <div style={{ border:"2px solid #374151", borderRadius:12, overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.08)" }}>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${puzzleData.size},${cellSize}px)` }}>
            {puzzleData.puzzle.map((row, r) => row.map((given, c) => {
              const value = playerBoard[r][c];
              const isGiven = given !== null;
              const isSelected = selected?.[0]===r && selected?.[1]===c;
              const isError = errors.has(`${r}-${c}`);
              const sameVal = selected && value !== null && playerBoard[selected[0]][selected[1]]===value && !isSelected;
              const rightBox = (c+1)%puzzleData.bc===0 && c<puzzleData.size-1;
              const bottomBox = (r+1)%puzzleData.br===0 && r<puzzleData.size-1;
              return (
                <motion.button key={`${r}-${c}`}
                  onClick={() => { if (!isGiven) setSelected([r,c]); playClick(); }}
                  animate={isError?{x:[-2,2,-2,2,0]}:{}}
                  transition={{ duration:0.25 }}
                  style={{
                    width:cellSize, height:cellSize,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize: puzzleData.size===6 ? 18 : 14,
                    fontWeight:700, outline:"none", cursor:isGiven?"default":"pointer",
                    background: isSelected ? "#EEF2FF"
                      : isError ? "#FEF2F2"
                      : sameVal ? "#F5F7FF"
                      : isGiven ? "#F8F7F5" : "white",
                    color: isGiven ? "#1C1917"
                      : isError ? "#EF4444"
                      : value ? "#4F6EF7" : "#CBD5E1",
                    borderRight: rightBox ? "2px solid #374151" : "0.5px solid #E2E8F0",
                    borderBottom: bottomBox ? "2px solid #374151" : "0.5px solid #E2E8F0",
                    borderTop:"none", borderLeft:"none",
                    boxShadow: isSelected ? "inset 0 0 0 2px #4F6EF7" : "none",
                  }}>
                  {value ?? ""}
                </motion.button>
              );
            }))}
          </div>
        </div>

        {/* Number pad */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
          {nums.map(n => (
            <button key={n} onClick={() => handleInput(n)}
              style={{ width:44, height:44, borderRadius:12, border:"0.5px solid #E2E8F0", background:"white", fontSize:16, fontWeight:700, color:"#374151", cursor:"pointer", boxShadow:"0 2px 6px rgba(0,0,0,0.04)", transition:"all 0.15s" }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor="#4F6EF7"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor="#E2E8F0"}>
              {n}
            </button>
          ))}
          <button onClick={() => handleInput(null)}
            style={{ width:44, height:44, borderRadius:12, border:"0.5px solid #E2E8F0", background:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}>
            <Delete size={16} color="#94A3B8"/>
          </button>
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

      <AnimatePresence>
        {completed && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:24 }}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
              style={{ background:"white", borderRadius:28, padding:36, maxWidth:340, width:"100%", textAlign:"center", boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
              <CheckCircle size={48} color="#22C55E" style={{ margin:"0 auto 16px" }}/>
              <h2 style={{ fontSize:26, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:4 }}>Stage {stage} Complete</h2>
              <p style={{ fontSize:13, color:"#94A3B8", marginBottom:24 }}>{elapsed} · {diff}</p>
              <div style={{ background:"#F8F7F5", borderRadius:16, padding:20, marginBottom:24 }}>
                <p style={{ fontSize:11, color:"#94A3B8", fontWeight:600, marginBottom:4 }}>XP EARNED</p>
                <p style={{ fontSize:48, fontWeight:700, color:"#4F6EF7", fontFamily:"Georgia,serif" }}>{finalXP}</p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => loadStage(stage)} style={{ flex:1, padding:13, borderRadius:14, border:"0.5px solid #E2E8F0", background:"white", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>Retry</button>
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
