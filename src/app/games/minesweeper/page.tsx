"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowLeft, RotateCcw, CheckCircle, Share2, Flag, Bomb } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import {
  generateMineBoard, revealCells, checkWin,
  type MineBoard, type MineCell,
} from "@/lib/games/minesweeperGenerator";
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

const NUM_COLORS: Record<number, string> = {
  1: "#60A5FA", 2: "#34D399", 3: "#FF6B6B",
  4: "#A78BFA", 5: "#FB923C", 6: "#00FFFF",
  7: "#F472B6", 8: "#FBBF24",
};

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

function CellButton({
  cell, onClick, onFlag, cellSize, exploded,
}: {
  cell: MineCell;
  onClick: () => void;
  onFlag: () => void;
  cellSize: number;
  exploded: boolean;
}) {
  const fontSize = cellSize * 0.42;

  if (cell.revealed) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.12 }}
        className="flex items-center justify-center rounded font-bold select-none"
        style={{
          width: cellSize, height: cellSize,
          background: cell.isMine ? (exploded ? "#FF4444" : "#FF444420") : "#1e1e1e",
          border: "1px solid #2a2a2a",
          fontSize,
          color: cell.isMine ? "#FF4444" : NUM_COLORS[cell.adjacentMines] ?? "transparent",
        }}
      >
        {cell.isMine ? <Bomb size={fontSize * 0.8} color="#FF4444" /> : cell.adjacentMines > 0 ? cell.adjacentMines : null}
      </motion.div>
    );
  }

  return (
    <button
      onClick={onClick}
      onContextMenu={(e) => { e.preventDefault(); onFlag(); }}
      className="flex items-center justify-center rounded font-bold transition-all active:scale-95 select-none"
      style={{
        width: cellSize, height: cellSize,
        background: cell.flagged ? "#FFD70015" : "#2a2a2a",
        border: `1px solid ${cell.flagged ? "#FFD70060" : "#3a3a3a"}`,
        fontSize,
      }}
    >
      {cell.flagged && <Flag size={fontSize * 0.75} color="#FFD700" />}
    </button>
  );
}

export default function MinesweeperGame() {
  const [stage, setStage] = useState(1);
  const [board, setBoard] = useState<MineBoard | null>(null);
  const [cells, setCells] = useState<MineCell[][]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [lost, setLost] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [explodedCell, setExplodedCell] = useState<string | null>(null);
  const [firstClick, setFirstClick] = useState(true);
  const [flagMode, setFlagMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seedRef = useRef("");

  const loadStage = useCallback((s: number) => {
    const diff = getDifficulty(s);
    const seed = buildSeed("minesweeper", diff, s);
    seedRef.current = seed;
    const b = generateMineBoard(seed, diff);
    const newXP = createXPState(diff);
    setBoard(b);
    setCells(b.cells.map(row => row.map(cell => ({ ...cell }))));
    setXpState(newXP);
    setCompleted(false);
    setLost(false);
    setFinalXP(0);
    setElapsed("00:00");
    setExplodedCell(null);
    setFirstClick(true);
    setFlagMode(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(newXP.startTime)), 1000);
  }, []);

  useEffect(() => {
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleClick(r: number, c: number) {
    if (!board || completed || lost) return;
    const cell = cells[r][c];
    if (cell.revealed || cell.flagged) return;

    if (flagMode) { handleFlag(r, c); return; }

    // First click: regenerate board to guarantee safety
    let workingCells = cells;
    if (firstClick) {
      setFirstClick(false);
      const diff = getDifficulty(stage);
      const safeBoard = generateMineBoard(seedRef.current, diff, r, c);
      workingCells = safeBoard.cells.map(row => row.map(cell => ({ ...cell })));
      setBoard(safeBoard);
    }

    const targetCell = workingCells[r][c];
    if (targetCell.isMine) {
      // Game over — reveal all mines
      const newCells = workingCells.map(row =>
        row.map(cell => cell.isMine ? { ...cell, revealed: true } : { ...cell })
      );
      setCells(newCells);
      setExplodedCell(`${r},${c}`);
      setLost(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playError();
      return;
    }

    playClick();
    const newCells = revealCells(workingCells, r, c, board.rows, board.cols);
    setCells(newCells);

    if (checkWin(newCells, board.rows, board.cols) && xpState) {
      const earned = finalizeXP(xpState);
      setFinalXP(earned);
      setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess();
    }
  }

  function handleFlag(r: number, c: number) {
    if (!board || completed || lost) return;
    const cell = cells[r][c];
    if (cell.revealed) return;
    const newCells = cells.map(row =>
      row.map(cell =>
        cell.row === r && cell.col === c ? { ...cell, flagged: !cell.flagged } : cell
      )
    );
    setCells(newCells);
  }

  if (!board || !xpState || cells.length === 0) return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="text-neutral-500 font-mono text-sm animate-pulse">Generating board...</div>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff === "easy" ? "#39FF14" : diff === "medium" ? "#FFD700" : "#FF6B6B";
  const cellSize = board.cols <= 8 ? 44 : board.cols <= 12 ? 34 : 26;
  const flagCount = cells.flat().filter(c => c.flagged).length;
  const remainingMines = board.mineCount - flagCount;
  const revealedCount = cells.flat().filter(c => c.revealed && !c.isMine).length;
  const totalSafe = board.rows * board.cols - board.mineCount;

  return (
    <div style={{minHeight:"100vh",background:"#FDFCFB",color:"#1C1917",display:"flex",flexDirection:"column"}}>
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 24px",borderBottom:"0.5px solid rgba(0,0,0,0.07)",background:"rgba(253,252,251,0.95)"}}>
        <Link href="/games" style={{display:"flex",alignItems:"center",gap:6,color:"#64748B",textDecoration:"none",fontSize:13}}>
          <ArrowLeft size={16} />
          <Brain size={18} className="text-cyan-400" />
          <span className="font-mono text-sm font-bold tracking-widest">MINESWEEPER</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/play/minesweeper?seed=${board.seed}`)}
            className="text-neutral-500 hover:text-cyan-400 transition-colors p-2">
            <Share2 size={15} />
          </button>
          <button onClick={() => loadStage(stage)} style={{padding:8,borderRadius:10,border:"0.5px solid #E2E8F0",background:"white",cursor:"pointer",color:"#94A3B8",display:"flex",alignItems:"center"}}>
            <RotateCcw size={15} />
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 py-6 gap-5 overflow-auto">
        {/* Stage info */}
        <div className="w-full max-w-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-500">STAGE</span>
              <span className="text-lg font-bold font-mono">{stage}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                style={{ color: diffColor, borderColor: diffColor + "40", background: diffColor + "10" }}>
                {diff.toUpperCase()} · {board.rows}×{board.cols}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1 text-red-400">
                <Bomb size={11} /> {remainingMines}
              </span>
              <span className="flex items-center gap-1 text-yellow-400">
                <Flag size={11} /> {flagCount}
              </span>
              <span className="text-neutral-500 tabular-nums">{elapsed}</span>
            </div>
          </div>
          {!lost && <XPBar xpState={xpState} />}
        </div>

        {/* Progress */}
        <div className="w-full max-w-lg flex items-center gap-3">
          <div style={{flex:1,height:4,background:"#F1EDE8",borderRadius:2,overflow:"hidden"}}>
            <div className="h-full bg-cyan-400/60 rounded-full transition-all duration-300"
              style={{ width: `${(revealedCount / totalSafe) * 100}%` }} />
          </div>
          <span className="text-[10px] font-mono text-neutral-600">
            {revealedCount}/{totalSafe} safe
          </span>
        </div>

        {/* Flag mode toggle */}
        <div className="w-full max-w-lg flex items-center gap-3">
          <button
            onClick={() => setFlagMode(f => !f)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-mono tracking-wider transition-all"
            style={{
              borderColor: flagMode ? "#FFD700" : "#3a3a3a",
              color: flagMode ? "#FFD700" : "#525252",
              background: flagMode ? "#FFD70010" : "transparent",
            }}
          >
            <Flag size={12} />
            FLAG MODE {flagMode ? "ON" : "OFF"}
          </button>
          <span className="text-[10px] font-mono text-neutral-700">
            or right-click any cell
          </span>
        </div>

        {/* Board */}
        <div
          style={{ border:"0.5px solid #E2E8F0", borderRadius:12, overflow:"hidden", display:"grid", gridTemplateColumns:`repeat(${board.cols},${cellSize}px)`, gap:"2px", padding:"4px", background:"#F8F7F5" }}
        >
          {cells.map((row, r) =>
            row.map((cell, c) => (
              <CellButton
                key={`${r},${c}`}
                cell={cell}
                onClick={() => handleClick(r, c)}
                onFlag={() => handleFlag(r, c)}
                cellSize={cellSize}
                exploded={explodedCell === `${r},${c}`}
              />
            ))
          )}
        </div>

        {/* Stage selector */}
        <div className="w-full max-w-lg">
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

      {/* Loss overlay */}
      <AnimatePresence>
        {lost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{background:"white",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.18)",border:"1px solid #FCA5A5"}}
            >
              <Bomb size={40} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-1 text-red-400">Mine Hit</h2>
              <p className="text-neutral-500 text-sm mb-6">{elapsed} · Stage {stage}</p>
              <div className="flex gap-3">
                <button onClick={() => loadStage(stage)}
                  className="flex-1 py-3 bg-red-400/20 border border-red-400/40 text-red-400 rounded-lg text-sm font-mono font-bold tracking-wider hover:bg-red-400/30 transition-colors">
                  TRY AGAIN
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win overlay */}
      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{background:"white",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.18)"}}
            >
              <CheckCircle size={40} className="text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-1">Stage {stage} Clear</h2>
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
