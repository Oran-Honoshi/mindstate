"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowLeft, RotateCcw, CheckCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { generateQueensBoard, validateQueens, type QueensBoard } from "@/lib/games/queensGenerator";
import {
  createXPState, calculateXP, finalizeXP,
  formatElapsed, xpColor, type XPState, type Difficulty,
} from "@/lib/games/xpEngine";
import { buildSeed } from "@/lib/games/tangoGenerator";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";

function getDifficulty(stage: number): Difficulty {
  if (stage <= 30) return "easy";
  if (stage <= 70) return "medium";
  return "hard";
}

// Soft pastel-dark region colors
const REGION_COLORS = [
  "#00FFFF22", "#39FF1422", "#FFD70022", "#FF6B9D22",
  "#A78BFA22", "#FB923C22", "#34D39922", "#F472B622",
  "#60A5FA22", "#FBBF2422",
];
const REGION_BORDERS = [
  "#00FFFF", "#39FF14", "#FFD700", "#FF6B9D",
  "#A78BFA", "#FB923C", "#34D399", "#F472B6",
  "#60A5FA", "#FBBF24",
];

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap, setSnap] = useState(() => calculateXP(xpState));
  useEffect(() => {
    const iv = setInterval(() => setSnap(calculateXP(xpState)), 500);
    return () => clearInterval(iv);
  }, [xpState]);
  const color = xpColor(snap.percentRemaining);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${snap.percentRemaining * 100}%`, background: color }} />
      </div>
      <span className="text-sm font-mono font-bold tabular-nums" style={{ color }}>{snap.currentXP}</span>
      <span className="text-xs text-neutral-600 font-mono">XP</span>
    </div>
  );
}

export default function QueensGame() {
  const [stage, setStage] = useState(1);
  const [board, setBoard] = useState<QueensBoard | null>(null);
  // Map of "r,c" -> true (queen) | false (marked/X)
  const [placed, setPlaced] = useState<Map<string, boolean>>(new Map());
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStage = useCallback((s: number) => {
    const diff = getDifficulty(s);
    const seed = buildSeed("queens", diff, s);
    const b = generateQueensBoard(seed, diff);
    const newXP = createXPState(diff);
    setBoard(b);
    setPlaced(new Map());
    setErrors(new Set());
    setXpState(newXP);
    setCompleted(false);
    setFinalXP(0);
    setElapsed("00:00");
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(newXP.startTime)), 1000);
  }, []);

  useEffect(() => {
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleCellClick(r: number, c: number) {
    if (completed || !board) return;
    const key = `${r},${c}`;
    const current = placed.get(key);
    const newPlaced = new Map(placed);

    // Cycle: empty → queen → marked(X) → empty
    if (current === undefined) {
      newPlaced.set(key, true); // queen
    } else if (current === true) {
      newPlaced.set(key, false); // X marker
    } else {
      newPlaced.delete(key); // empty
    }

    setPlaced(newPlaced);
    playClick();

    const { correct, errors: errs } = validateQueens(newPlaced, board.solution);
    setErrors(errs);

    if (errs.size > 0) playError();

    if (correct && xpState) {
      const earned = finalizeXP(xpState);
      setFinalXP(earned);
      setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess();
    }
  }

  if (!board || !xpState) return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="text-neutral-500 font-mono text-sm animate-pulse">Generating board...</div>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff === "easy" ? "#39FF14" : diff === "medium" ? "#FFD700" : "#FF6B6B";
  const cellSize = board.size <= 6 ? 60 : board.size <= 8 ? 52 : 44;
  const queensPlaced = Array.from(placed.values()).filter(Boolean).length;

  return (
    <div className="min-h-screen  text-white flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/60">
        <Link href="/games" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
          <Brain size={18} className="text-cyan-400" />
          <span className="font-mono text-sm font-bold tracking-widest">QUEENS</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/play/queens?seed=${board.seed}`); }} className="text-neutral-500 hover:text-cyan-400 transition-colors p-2">
            <Share2 size={15} />
          </button>
          <button onClick={() => loadStage(stage)} className="text-neutral-500 hover:text-white transition-colors p-2">
            <RotateCcw size={15} />
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 py-6 gap-5">
        {/* Stage info */}
        <div className="w-full max-w-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-500">STAGE</span>
              <span className="text-lg font-bold font-mono">{stage}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                style={{ color: diffColor, borderColor: diffColor + "40", background: diffColor + "10" }}>
                {diff.toUpperCase()} · {board.size}×{board.size}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-neutral-500">Queens: <span className="text-white">{queensPlaced}/{board.size}</span></span>
              <span className="text-neutral-500 tabular-nums">{elapsed}</span>
            </div>
          </div>
          <XPBar xpState={xpState} />
        </div>

        {/* Rules */}
        <div className="w-full max-w-md text-[11px] font-mono text-neutral-600 flex gap-4">
          <span>Click → ♛ Queen</span>
          <span>Click again → ✕ Mark</span>
          <span>Click again → Clear</span>
        </div>

        {/* Board */}
        <div
          className="border border-neutral-700 rounded-xl overflow-hidden"
          style={{ display: "grid", gridTemplateColumns: `repeat(${board.size}, ${cellSize}px)` }}
        >
          {board.regions.map((row, r) =>
            row.map((regionId, c) => {
              const key = `${r},${c}`;
              const state = placed.get(key);
              const isQueen = state === true;
              const isMarked = state === false;
              const isError = errors.has(key);
              const color = REGION_COLORS[regionId % REGION_COLORS.length];
              const border = REGION_BORDERS[regionId % REGION_BORDERS.length];

              return (
                <motion.button
                  key={key}
                  onClick={() => handleCellClick(r, c)}
                  animate={isError ? { x: [-2, 2, -2, 2, 0] } : {}}
                  transition={{ duration: 0.25 }}
                  className="flex items-center justify-center border border-neutral-800/50 transition-all"
                  style={{
                    width: cellSize, height: cellSize,
                    background: isError ? "#FF444420" : color,
                    boxShadow: isQueen && !isError ? `inset 0 0 0 2px ${border}` : undefined,
                    fontSize: cellSize * 0.45,
                  }}
                >
                  {isQueen && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ color: isError ? "#FF4444" : border }}
                    >
                      ♛
                    </motion.span>
                  )}
                  {isMarked && (
                    <span className="text-neutral-600" style={{ fontSize: cellSize * 0.3 }}>✕</span>
                  )}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Region legend */}
        <div className="w-full max-w-md flex flex-wrap gap-2">
          {Array.from({ length: board.size }, (_, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border" style={{ background: REGION_COLORS[i % REGION_COLORS.length], borderColor: REGION_BORDERS[i % REGION_BORDERS.length] }} />
              <span className="text-[10px] font-mono text-neutral-600">Region {i + 1}</span>
            </div>
          ))}
        </div>

        {/* Stage selector */}
        <div className="w-full max-w-md">
          <p className="text-[10px] font-mono text-neutral-600 mb-2 tracking-widest">STAGE SELECT</p>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 100 }, (_, i) => i + 1).map((s) => {
              const d = getDifficulty(s);
              const color = d === "easy" ? "#39FF14" : d === "medium" ? "#FFD700" : "#FF6B6B";
              return (
                <button key={s} onClick={() => setStage(s)}
                  className="w-6 h-6 rounded text-[9px] font-mono transition-all"
                  style={{ background: s === stage ? color : "#1a1a1a", color: s === stage ? "#000" : "#444", border: `1px solid ${s === stage ? color : "#2a2a2a"}` }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <CheckCircle size={40} className="text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-1">Stage {stage} Complete</h2>
              <p className="text-neutral-500 text-sm mb-6">{elapsed} · {diff}</p>
              <div className="bg-neutral-800 rounded-xl p-4 mb-6">
                <p className="text-xs font-mono text-neutral-500 mb-1">XP EARNED</p>
                <p className="text-4xl font-bold" style={{ color: xpColor(finalXP / 1000) }}>{finalXP}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => loadStage(stage)} className="flex-1 py-3 border border-neutral-700 rounded-lg text-sm font-mono tracking-wider hover:border-neutral-500 transition-colors">RETRY</button>
                {stage < 100 && (
                  <button onClick={() => setStage(s => s + 1)} className="flex-1 py-3 bg-cyan-400 text-black rounded-lg text-sm font-mono font-bold tracking-wider hover:bg-green-400 transition-colors">NEXT STAGE</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
