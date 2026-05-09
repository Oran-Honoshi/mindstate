"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowLeft, RotateCcw, CheckCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import {
  generateZipBoard, validateZipPath, isAdjacent,
  type ZipBoard,
} from "@/lib/games/zipGenerator";
import {
  createXPState, calculateXP, finalizeXP,
  formatElapsed, xpColor, type XPState, type Difficulty,
} from "@/lib/games/xpEngine";
import { buildSeed } from "@/lib/games/tangoGenerator";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";

function getDifficulty(stage: number): Difficulty {
  if (stage <= 300) return "easy";
  if (stage <= 700) return "medium";
  return "hard";
}

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap, setSnap] = useState(() => calculateXP(xpState));
  useEffect(() => {
    const iv = setInterval(() => setSnap(calculateXP(xpState)), 500);
    return () => clearInterval(iv);
  }, [xpState]);
  const color = xpColor(snap.percentRemaining);
  return (
    <div className="flex items-center gap-3">
      <div style={{flex:1,height:4,background:"#F1EDE8",borderRadius:2,overflow:"hidden"}}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${snap.percentRemaining * 100}%`, background: color }} />
      </div>
      <span className="text-sm font-mono font-bold tabular-nums" style={{ color }}>{snap.currentXP}</span>
      <span className="text-xs text-neutral-600 font-mono">XP</span>
    </div>
  );
}

// Draw SVG lines between path cells
function PathLines({ path, cellSize, gap }: { path: [number, number][]; cellSize: number; gap: number }) {
  if (path.length < 2) return null;
  const total = cellSize + gap;
  const center = cellSize / 2;
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {path.slice(1).map(([r, c], i) => {
        const [pr, pc] = path[i];
        return (
          <line
            key={i}
            x1={pc * total + center}
            y1={pr * total + center}
            x2={c * total + center}
            y2={r * total + center}
            stroke="#00FFFF"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.6}
          />
        );
      })}
    </svg>
  );
}

export default function ZipGame() {
  const [stage, setStage] = useState(1);
  const [board, setBoard] = useState<ZipBoard | null>(null);
  const [playerPath, setPlayerPath] = useState<[number, number][]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStage = useCallback((s: number) => {
    const diff = getDifficulty(s);
    const seed = buildSeed("zip", diff, s);
    const b = generateZipBoard(seed, diff);
    const newXP = createXPState(diff);
    setBoard(b);
    setPlayerPath([]);
    setXpState(newXP);
    setCompleted(false);
    setFinalXP(0);
    setElapsed("00:00");
    setHasError(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(newXP.startTime)), 1000);
  }, []);

  useEffect(() => {
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleCellEnter(r: number, c: number) {
    if (!isDragging || !board || completed) return;
    extendPath(r, c);
  }

  function handleCellClick(r: number, c: number) {
    if (!board || completed) return;
    if (playerPath.length === 0) {
      setPlayerPath([[r, c]]);
      playClick();
      return;
    }
    extendPath(r, c);
  }

  function extendPath(r: number, c: number) {
    if (!board) return;
    const key = `${r},${c}`;
    const pathKeys = playerPath.map(([pr, pc]) => `${pr},${pc}`);

    // If clicking last cell again — undo last step
    const last = playerPath[playerPath.length - 1];
    if (last && last[0] === r && last[1] === c) return;

    // If clicking second-to-last — backtrack
    if (playerPath.length >= 2) {
      const prev = playerPath[playerPath.length - 2];
      if (prev[0] === r && prev[1] === c) {
        setPlayerPath(p => p.slice(0, -1));
        return;
      }
    }

    // Must be adjacent to last
    if (!isAdjacent(last[0], last[1], r, c)) {
      setHasError(true);
      playError();
      setTimeout(() => setHasError(false), 500);
      return;
    }

    // Must not revisit
    if (pathKeys.includes(key)) {
      setHasError(true);
      playError();
      setTimeout(() => setHasError(false), 500);
      return;
    }

    const newPath: [number, number][] = [...playerPath, [r, c]];
    setPlayerPath(newPath);
    playClick();

    // Validate
    const { valid, complete, error } = validateZipPath(newPath, board);
    if (!valid || error) {
      setHasError(true);
      playError();
      setTimeout(() => setHasError(false), 500);
      return;
    }

    if (complete && xpState) {
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
  const cellSize = board.size <= 5 ? 64 : board.size <= 6 ? 56 : 50;
  const gap = 6;
  const pathSet = new Set(playerPath.map(([r, c]) => `${r},${c}`));
  const lastCell = playerPath[playerPath.length - 1];
  const totalCells = board.size * board.size;

  return (
    <div style={{minHeight:"100vh",background:"#FDFCFB",color:"#1C1917",display:"flex",flexDirection:"column"}}>
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 24px",borderBottom:"0.5px solid rgba(0,0,0,0.07)",background:"rgba(253,252,251,0.95)"}}>
        <Link href="/games" style={{display:"flex",alignItems:"center",gap:6,color:"#64748B",textDecoration:"none",fontSize:13}}>
          <ArrowLeft size={16} />
          <Brain size={18} className="text-cyan-400" />
          <span className="font-mono text-sm font-bold tracking-widest">ZIP</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/play/zip?seed=${board.seed}`)}
            className="text-neutral-500 hover:text-cyan-400 transition-colors p-2">
            <Share2 size={15} />
          </button>
          <button onClick={() => loadStage(stage)} style={{padding:8,borderRadius:10,border:"0.5px solid #E2E8F0",background:"white",cursor:"pointer",color:"#94A3B8",display:"flex",alignItems:"center"}}>
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
              <span className="text-neutral-500">
                Cells: <span className="text-white">{playerPath.length}/{totalCells}</span>
              </span>
              <span className="text-neutral-500 tabular-nums">{elapsed}</span>
            </div>
          </div>
          <XPBar xpState={xpState} />
        </div>

        {/* Rules */}
        <div className="w-full max-w-md text-[11px] font-mono text-neutral-600">
          Connect all cells in order through the numbered waypoints
        </div>

        {/* Board */}
        <div
          className="relative"
          style={{
            width: board.size * (cellSize + gap) - gap,
            height: board.size * (cellSize + gap) - gap,
          }}
          onMouseLeave={() => setIsDragging(false)}
        >
          <PathLines path={playerPath} cellSize={cellSize} gap={gap} />

          {board.cells.map((row, r) =>
            row.map((cell, c) => {
              const key = `${r},${c}`;
              const inPath = pathSet.has(key);
              const isLast = lastCell?.[0] === r && lastCell?.[1] === c;
              const isFirst = playerPath[0]?.[0] === r && playerPath[0]?.[1] === c;
              const waypoint = board.waypoints.get(key);
              const pathIndex = playerPath.findIndex(([pr, pc]) => pr === r && pc === c);

              return (
                <motion.button
                  key={key}
                  onMouseDown={() => { setIsDragging(true); handleCellClick(r, c); }}
                  onMouseEnter={() => handleCellEnter(r, c)}
                  onMouseUp={() => setIsDragging(false)}
                  onTouchStart={() => handleCellClick(r, c)}
                  animate={hasError && isLast ? { x: [-3, 3, -3, 3, 0] } : {}}
                  transition={{ duration: 0.25 }}
                  className="absolute flex items-center justify-center rounded-xl border-2 font-bold transition-all duration-100 select-none"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    left: c * (cellSize + gap),
                    top: r * (cellSize + gap),
                    zIndex: 2,
                    background: inPath
                      ? isLast ? "#00FFFF20" : "#00FFFF10"
                      : "#1a1a1a",
                    borderColor: inPath
                      ? isLast ? "#00FFFF" : "#00FFFF50"
                      : waypoint ? "#FFD700" : "#2a2a2a",
                    boxShadow: isLast ? "0 0 12px #00FFFF40" : undefined,
                    fontSize: waypoint ? cellSize * 0.36 : cellSize * 0.25,
                    color: waypoint ? "#FFD700"
                      : inPath ? "#00FFFF80"
                      : "#333",
                  }}
                >
                  {waypoint
                    ? waypoint
                    : inPath && pathIndex >= 0
                    ? <div className="w-2 h-2 rounded-full bg-cyan-400 opacity-60" />
                    : null}
                </motion.button>
              );
            })
          )}
        </div>

        {/* Undo / Reset */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPlayerPath(p => p.slice(0, -1))}
            disabled={playerPath.length === 0}
            className="px-4 py-2 border border-neutral-700 rounded-lg text-xs font-mono tracking-wider hover:border-neutral-500 transition-all disabled:opacity-30"
          >
            UNDO
          </button>
          <button
            onClick={() => setPlayerPath([])}
            disabled={playerPath.length === 0}
            className="px-4 py-2 border border-neutral-700 rounded-lg text-xs font-mono tracking-wider hover:border-red-400/50 hover:text-red-400 transition-all disabled:opacity-30"
          >
            CLEAR
          </button>
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
              style={{background:"white",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.18)"}}
            >
              <CheckCircle size={40} className="text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-1">Stage {stage} Complete</h2>
              <p className="text-neutral-500 text-sm mb-6">{elapsed} · {diff}</p>
              <div style={{background:"#F8F7F5",borderRadius:16,padding:20,marginBottom:24}}>
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
