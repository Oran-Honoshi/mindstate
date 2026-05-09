"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Lightbulb, Share2, ArrowLeft, RotateCcw, CheckCircle } from "lucide-react";
import Link from "next/link";
import {
  generateTangoBoard,
  validateBoard,
  buildSeed,
  type Cell,
  type TangoBoard,
  type CellStatus,
} from "@/lib/games/tangoGenerator";
import {
  createXPState,
  calculateXP,
  useHint as applyHint,
  finalizeXP,
  formatElapsed,
  xpColor,
  type XPState,
  type Difficulty,
} from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError, playHint } from "@/lib/audio/soundEngine";

// ── Stage map: 30 easy, 40 medium, 30 hard ───────────────────────────────────
function getDifficulty(stage: number): Difficulty {
  if (stage <= 30) return "easy";
  if (stage <= 70) return "medium";
  return "hard";
}

// ── Constraint symbol ─────────────────────────────────────────────────────────
function ConstraintBadge({ type }: { type: "same" | "diff" }) {
  return (
    <div
      className="absolute z-10 flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border"
      style={{
        background: "#121212",
        borderColor: type === "same" ? "#00FFFF40" : "#FF444440",
        color: type === "same" ? "#00FFFF" : "#FF4444",
      }}
    >
      {type === "same" ? "=" : "×"}
    </div>
  );
}

// ── XP Bar ────────────────────────────────────────────────────────────────────
function XPBar({ xpState }: { xpState: XPState }) {
  const [snapshot, setSnapshot] = useState(() => calculateXP(xpState));

  useEffect(() => {
    const interval = setInterval(() => {
      setSnapshot(calculateXP(xpState));
    }, 500);
    return () => clearInterval(interval);
  }, [xpState]);

  const color = xpColor(snapshot.percentRemaining);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${snapshot.percentRemaining * 100}%`, background: color }}
        />
      </div>
      <span className="text-sm font-mono font-bold tabular-nums" style={{ color }}>
        {snapshot.currentXP}
      </span>
      <span className="text-xs text-neutral-600 font-mono">XP</span>
    </div>
  );
}

// ── Main Game ─────────────────────────────────────────────────────────────────
export default function TangoGame() {
  const [stage, setStage] = useState(1);
  const [board, setBoard] = useState<TangoBoard | null>(null);
  const [playerGrid, setPlayerGrid] = useState<Cell[][]>([]);
  const [statuses, setStatuses] = useState<CellStatus[][]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [showHintFlash, setShowHintFlash] = useState(false);
  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load a stage
  const loadStage = useCallback((stageNum: number) => {
    const diff = getDifficulty(stageNum);
    const seed = buildSeed("tango", diff, stageNum);
    const newBoard = generateTangoBoard(seed, diff);
    const initialGrid = newBoard.puzzle.map((row) => [...row]);
    const initialStatuses = newBoard.puzzle.map((row) =>
      row.map((cell): CellStatus => (cell !== null ? "given" : "empty"))
    );
    const newXP = createXPState(diff);

    setBoard(newBoard);
    setPlayerGrid(initialGrid);
    setStatuses(initialStatuses);
    setXpState(newXP);
    setCompleted(false);
    setFinalXP(0);
    setElapsed("00:00");
    setErrorCells(new Set());

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(formatElapsed(newXP.startTime));
    }, 1000);
  }, []);

  useEffect(() => {
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  // Toggle cell: null → S → M → null
  function handleCellClick(row: number, col: number) {
    if (!board || completed) return;
    if (statuses[row][col] === "given") return;

    playClick();
    const current = playerGrid[row][col];
    const next: Cell = current === null ? "S" : current === "S" ? "M" : null;

    const newGrid = playerGrid.map((r, ri) =>
      r.map((c, ci) => (ri === row && ci === col ? next : c))
    );
    setPlayerGrid(newGrid);

    // Validate
    const newStatuses = validateBoard(board.puzzle, newGrid, board.solution);
    setStatuses(newStatuses);

    // Flash errors
    const errors = new Set<string>();
    newStatuses.forEach((r, ri) =>
      r.forEach((s, ci) => { if (s === "incorrect") errors.add(`${ri}-${ci}`); })
    );
    if (errors.size > 0) {
      setErrorCells(errors);
      playError();
      setTimeout(() => setErrorCells(new Set()), 600);
    } else {
      setErrorCells(new Set());
    }

    // Check win
    const allCorrect = newStatuses.every((r) => r.every((s) => s === "correct" || s === "given"));
    if (allCorrect && xpState) {
      const earned = finalizeXP(xpState);
      setFinalXP(earned);
      setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess();
    }
  }

  function handleHint() {
    if (!board || !xpState || completed) return;
    if (xpState.hintsUsed >= xpState.maxHints) return;

    // Reveal a random empty cell
    const emptyCells: [number, number][] = [];
    playerGrid.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell === null && board.puzzle[r][c] === null) emptyCells.push([r, c]);
      })
    );
    if (emptyCells.length === 0) return;

    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = playerGrid.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? board.solution[r][c] : cell))
    );
    const newXP = applyHint(xpState);
    setPlayerGrid(newGrid);
    setXpState(newXP);
    setStatuses(validateBoard(board.puzzle, newGrid, board.solution));
    setShowHintFlash(true);
    setTimeout(() => setShowHintFlash(false), 800);
    playHint();
  }

  function handleReset() {
    if (!board) return;
    loadStage(stage);
  }

  function handleShare() {
    if (!board) return;
    const url = `${window.location.origin}/play/tango?seed=${board.seed}`;
    navigator.clipboard.writeText(url);
  }

  function nextStage() {
    if (stage < 100) setStage((s) => s + 1);
  }

  if (!board || !xpState) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-neutral-500 font-mono text-sm animate-pulse">Generating board...</div>
      </div>
    );
  }

  const diff = getDifficulty(stage);
  const hintsLeft = xpState.maxHints - xpState.hintsUsed;
  const diffColor = diff === "easy" ? "#39FF14" : diff === "medium" ? "#FFD700" : "#FF6B6B";

  // Build constraint lookup for rendering
  const constraintMap = new Map<string, "same" | "diff">();
  board.constraints.forEach((c) => {
    const key = `${c.row1}-${c.col1}-${c.row2}-${c.col2}`;
    constraintMap.set(key, c.type);
  });

  const cellSize = board.size <= 4 ? 72 : board.size <= 6 ? 60 : 48;

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/60">
        <Link href="/games" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
          <Brain size={18} className="text-cyan-400" />
          <span className="font-mono text-sm font-bold tracking-widest">TANGO</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={handleShare} className="text-neutral-500 hover:text-cyan-400 transition-colors p-2">
            <Share2 size={15} />
          </button>
          <button onClick={handleReset} className="text-neutral-500 hover:text-white transition-colors p-2">
            <RotateCcw size={15} />
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 gap-6">
        {/* Stage info + XP */}
        <div className="w-full max-w-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-500">STAGE</span>
              <span className="text-lg font-bold font-mono">{stage}</span>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                style={{ color: diffColor, borderColor: diffColor + "40", background: diffColor + "10" }}
              >
                {diff.toUpperCase()} · {board.size}×{board.size}
              </span>
            </div>
            <span className="text-xs font-mono text-neutral-500 tabular-nums">{elapsed}</span>
          </div>
          {xpState && <XPBar xpState={xpState} />}
        </div>

        {/* Rules reminder */}
        <div className="w-full max-w-md flex gap-4 text-[11px] font-mono text-neutral-600">
          <span>◐ = Sun &nbsp; ◑ = Moon</span>
          <span>Equal per row/col</span>
          <span>No 3 in a row</span>
        </div>

        {/* Grid */}
        <div className="relative">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${board.size}, ${cellSize}px)` }}
          >
            {board.puzzle.map((row, r) =>
              row.map((_, c) => {
                const status = statuses[r][c];
                const value = playerGrid[r][c];
                const isGiven = status === "given";
                const isError = errorCells.has(`${r}-${c}`);
                const isCorrect = status === "correct";

                // Find constraints for this cell
                const rightConstraint = constraintMap.get(`${r}-${c}-${r}-${c+1}`);
                const bottomConstraint = constraintMap.get(`${r}-${c}-${r+1}-${c}`);

                return (
                  <div key={`${r}-${c}`} className="relative" style={{ width: cellSize, height: cellSize }}>
                    <motion.button
                      onClick={() => handleCellClick(r, c)}
                      animate={isError ? { x: [-3, 3, -3, 3, 0] } : {}}
                      transition={{ duration: 0.3 }}
                      className="w-full h-full rounded-lg flex items-center justify-center text-xl font-bold border-2 transition-all duration-150 select-none"
                      style={{
                        background: isGiven
                          ? "#1e1e1e"
                          : isCorrect
                          ? "#00FFFF08"
                          : isError
                          ? "#FF444415"
                          : "#1a1a1a",
                        borderColor: isGiven
                          ? "#333"
                          : isCorrect
                          ? "#00FFFF60"
                          : isError
                          ? "#FF4444"
                          : "#2a2a2a",
                        cursor: isGiven ? "default" : "pointer",
                        color: value === "S"
                          ? "#00FFFF"
                          : value === "M"
                          ? "#A78BFA"
                          : "transparent",
                      }}
                    >
                      {value === "S" ? "◐" : value === "M" ? "◑" : "·"}
                    </motion.button>

                    {/* Right constraint */}
                    {rightConstraint && c < board.size - 1 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                        <ConstraintBadge type={rightConstraint} />
                      </div>
                    )}
                    {/* Bottom constraint */}
                    {bottomConstraint && r < board.size - 1 && (
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
                        <ConstraintBadge type={bottomConstraint} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleHint}
            disabled={hintsLeft === 0 || completed}
            className="flex items-center gap-2 px-4 py-2.5 border border-neutral-700 rounded-lg text-xs font-mono tracking-wider transition-all hover:border-yellow-400/50 hover:text-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Lightbulb size={13} />
            HINT
            <span className="text-neutral-600">({hintsLeft})</span>
          </button>

          <div className="text-xs font-mono text-neutral-600 px-3">
            Click cell to cycle: · → ◐ → ◑
          </div>
        </div>

        {/* Hint flash */}
        <AnimatePresence>
          {showHintFlash && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-mono text-yellow-400 -mt-2"
            >
              Hint used — 25% XP deducted
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage selector */}
        <div className="w-full max-w-md">
          <p className="text-[10px] font-mono text-neutral-600 mb-2 tracking-widest">STAGE SELECT</p>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 100 }, (_, i) => i + 1).map((s) => {
              const d = getDifficulty(s);
              const color = d === "easy" ? "#39FF14" : d === "medium" ? "#FFD700" : "#FF6B6B";
              return (
                <button
                  key={s}
                  onClick={() => setStage(s)}
                  className="w-6 h-6 rounded text-[9px] font-mono transition-all"
                  style={{
                    background: s === stage ? color : "#1a1a1a",
                    color: s === stage ? "#000" : "#444",
                    border: `1px solid ${s === stage ? color : "#2a2a2a"}`,
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Completion overlay */}
      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-sm w-full text-center"
            >
              <CheckCircle size={40} className="text-cyan-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-1">Stage {stage} Complete</h2>
              <p className="text-neutral-500 text-sm mb-6">{elapsed} · {getDifficulty(stage)}</p>

              <div className="bg-neutral-800 rounded-xl p-4 mb-6">
                <p className="text-xs font-mono text-neutral-500 mb-1">XP EARNED</p>
                <p className="text-4xl font-bold" style={{ color: xpColor(finalXP / 1000) }}>
                  {finalXP}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 border border-neutral-700 rounded-lg text-sm font-mono tracking-wider hover:border-neutral-500 transition-colors"
                >
                  RETRY
                </button>
                {stage < 100 && (
                  <button
                    onClick={nextStage}
                    className="flex-1 py-3 bg-cyan-400 text-black rounded-lg text-sm font-mono font-bold tracking-wider hover:bg-green-400 transition-colors"
                  >
                    NEXT STAGE
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
