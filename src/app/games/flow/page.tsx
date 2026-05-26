"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "flow";
import { saveGameState, loadGameState, clearGameState } from "@/lib/games/gameStateStorage";
import { ResumeModal } from "@/components/ui/ResumeModal";
import { StageMap } from "@/components/ui/StageMap";
import {
  getLastStage, getLastStageRemote, markStageCompleted,
  getNextUncompletedStage, shouldShowGameCompleteModal,
} from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { generateFlowBoard, checkFlowComplete, type FlowBoard, type Color } from "@/lib/games/flowGenerator";
import { createXPState, calculateXP, finalizeXP, formatElapsed, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { HintButton } from "@/components/ui/HintButton";
import { ShowSolution } from "@/components/ui/ShowSolution";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { OutOfTokensModal } from "@/components/ui/OutOfTokensModal";

function getDifficulty(stage: number): Difficulty {
  if (stage === 1) return "medium";
  const h = Math.abs(Math.imul(stage * 2654435761, stage ^ 0x9e3779b9)) % 100;
  return h < 20 ? "easy" : h < 70 ? "medium" : "hard";
}

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap, setSnap] = useState(() => calculateXP(xpState));
  useEffect(() => {
    const iv = setInterval(() => setSnap(calculateXP(xpState)), 500);
    return () => clearInterval(iv);
  }, [xpState]);
  const pct = snap.percentRemaining;
  const color = pct > 0.6 ? "#22C55E" : pct > 0.3 ? "#F59E0B" : "var(--color-error)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 4, background: "var(--color-surface-2)", borderRadius: 2, overflow: "hidden" }}>
        <motion.div animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.5 }}
          style={{ height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace", minWidth: 36 }}>{snap.currentXP}</span>
      <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>XP</span>
    </div>
  );
}

type PathState = { color: Color; cells: string[] };

function FlowGameInner() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [board, setBoard] = useState<FlowBoard | null>(null);
  const [paths, setPaths] = useState<Map<string, PathState>>(new Map());
  const [cellColors, setCellColors] = useState<Map<string, Color>>(new Map());
  const [drawing, setDrawing] = useState<{ color: Color; cells: string[] } | null>(null);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string, unknown> | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [finalXP, setFinalXP] = useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => {
      if (xpState && !completed && !solutionRevealed) {
        timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000);
      }
    }
  );

  // Cross-device sync
  useEffect(() => {
    let cancelled = false;
    getLastStageRemote(GAME_SLUG).then(remote => {
      if (cancelled) return;
      if (remote > 0 && remote > stage) setStage(remote);
    });
    return () => { cancelled = true; };
  }, []);

  const loadStage = useCallback((s: number) => {
    // Token check FIRST — before any board setup
    if (user) {
      const ok = consumeToken(user.id);
      if (!ok) { setShowTokenModal(true); return; }
    }
    saveGameState(GAME_SLUG, { stage: s, savedAt: Date.now() });
    const diff = getDifficulty(s);
    const b = generateFlowBoard(`flow-${diff}-${s}`, diff);
    const xp = createXPState(diff);
    setBoard(b);
    setPaths(new Map());
    setCellColors(new Map());
    setDrawing(null);
    setXpState(xp);
    setCompleted(false);
    setFinalXP(0);
    setHintsUsed(0);
    setElapsed("00:00");
    setSolutionRevealed(false);
    setNextUncompleted(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
  }, [user]);

  const resumeChecked = useRef(false);
  useEffect(() => {
    if (!resumeChecked.current) {
      resumeChecked.current = true;
      const saved = loadGameState(GAME_SLUG);
      if (saved && (saved.stage as number) > 1) { setResumeData(saved); setShowResume(true); return; }
    }
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  // ── Show Solution ──────────────────────────────────────────────────────────
  function handleRevealSolution() {
    if (!board || !xpState) return;
    // Apply full solution to paths and cellColors
    const np = new Map<string, PathState>();
    const nc = new Map<string, Color>();
    for (const [color, cells] of board.solution) {
      np.set(color, { color, cells });
      cells.forEach(k => nc.set(k, color));
    }
    setPaths(np);
    setCellColors(nc);
    setSolutionRevealed(true);
    setXpState(prev => prev ? { ...prev, startTime: Date.now() - prev.decayDuration * 1000 } : prev);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function cellKey(r: number, c: number) { return `${r},${c}`; }

  function startDraw(r: number, c: number) {
    if (!board || completed || solutionRevealed) return;
    const k = cellKey(r, c);
    const dotColor = board.dots.get(k);
    const existingPath = [...paths.values()].find(p => p.cells.includes(k));
    let color: Color;
    if (dotColor) color = dotColor;
    else if (existingPath) color = existingPath.color;
    else return;
    const np = new Map(paths); np.delete(color);
    const nc = new Map(cellColors);
    [...cellColors.entries()].filter(([, c]) => c === color).forEach(([k]) => nc.delete(k));
    setCellColors(nc); setPaths(np);
    setDrawing({ color, cells: [k] });
    playClick();
  }

  function continueDraw(r: number, c: number) {
    if (!drawing || !board || completed || solutionRevealed) return;
    const k = cellKey(r, c);
    if (drawing.cells.includes(k)) {
      const idx = drawing.cells.indexOf(k);
      const trimmed = drawing.cells.slice(0, idx + 1);
      const nc = new Map(cellColors);
      drawing.cells.slice(idx + 1).forEach(k2 => { if (cellColors.get(k2) === drawing.color) nc.delete(k2); });
      setCellColors(nc);
      setDrawing({ ...drawing, cells: trimmed });
      return;
    }
    const last = drawing.cells[drawing.cells.length - 1];
    const [lr, lc] = last.split(",").map(Number);
    if (Math.abs(lr - r) + Math.abs(lc - c) !== 1) return;
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
      const np = new Map(paths);
      np.set(drawing.color, { color: drawing.color, cells: drawing.cells });
      const nc = new Map(cellColors);
      drawing.cells.forEach(k2 => nc.set(k2, drawing.color));
      setPaths(np); setCellColors(nc);
      saveGameState(GAME_SLUG, {
        stage, paths: Array.from(np.entries()).map(([k, v]) => [k, { color: v.color, cells: v.cells }]),
        hintsUsed, startTime: xpState?.startTime, savedAt: Date.now(),
      });
      if (checkFlowComplete(board, np) && xpState) {
        const earned = finalizeXP(xpState);
        setFinalXP(earned); setCompleted(true);
        if (timerRef.current) clearInterval(timerRef.current);
        playSuccess(); setTimeout(() => triggerConfetti(), 80);
        markStageCompleted(GAME_SLUG, stage);
        const next = getNextUncompletedStage(GAME_SLUG, TOTAL_STAGES);
        setNextUncompleted(next);
        if (shouldShowGameCompleteModal(GAME_SLUG, TOTAL_STAGES)) {
          setTimeout(() => setShowGameComplete(true), 1800);
        }
        if (typeof window !== "undefined") {
          const w = parseInt(localStorage.getItem("mindstate-wins") ?? "0") + 1;
          localStorage.setItem("mindstate-wins", String(w));
        }
        if (user) {
          updateStreak(user.id);
          saveScore({ user_id: user.id, game_slug: GAME_SLUG, stage_number: stage, difficulty: getDifficulty(stage), xp_earned: earned, time_taken: Math.floor((Date.now() - xpState.startTime) / 1000) });
        }
      }
    }
    setDrawing(null);
  }

  // ── Hints: extend one color's path by one cell toward its solution ─────────
  function handleHint() {
    if (!board || !xpState || completed || hintsUsed >= 3 || solutionRevealed) return;

    for (const [color, solutionCells] of board.solution) {
      const current = paths.get(color);
      const currentCells = current?.cells ?? [];

      // Find how far this color's current path matches the solution
      // The solution path is ordered start→end
      // We want to extend toward the solution by one step

      // If current path length >= solution, skip
      if (currentCells.length >= solutionCells.length) continue;

      // Figure out which end of the solution aligns with current path
      // (player might be drawing from either dot)
      let nextKey: string | null = null;

      if (currentCells.length === 0) {
        // No path yet — add the first cell of the solution
        nextKey = solutionCells[0];
      } else {
        const head = currentCells[0];
        const tail = currentCells[currentCells.length - 1];
        const solStart = solutionCells[0];
        const solEnd = solutionCells[solutionCells.length - 1];

        // Check if current path aligns from the start of solution
        if (head === solStart || tail === solStart) {
          // Extend from solStart direction
          const matchLen = currentCells.length;
          nextKey = solutionCells[matchLen] ?? null;
        } else if (head === solEnd || tail === solEnd) {
          // Player drew from the end — extend in reverse
          const rev = [...solutionCells].reverse();
          const matchLen = currentCells.length;
          nextKey = rev[matchLen] ?? null;
        } else {
          // Path is wrong — just add solution[1] from scratch
          nextKey = solutionCells[0];
        }
      }

      if (!nextKey) continue;

      // Reset this color and redraw from solution start up to nextKey
      const np = new Map(paths);
      const nc = new Map(cellColors);

      // Remove old path cells from nc
      const oldPath = np.get(color);
      if (oldPath) oldPath.cells.forEach(k => { if (nc.get(k) === color) nc.delete(k); });

      const newCells = [...(current?.cells ?? []), nextKey];
      np.set(color, { color, cells: newCells });
      newCells.forEach(k => nc.set(k, color));

      setPaths(np);
      setCellColors(nc);
      setHintsUsed(h => h + 1);
      setXpState(prev => prev ? { ...prev, hintsUsed: Math.min(prev.hintsUsed + 1, prev.maxHints) } : prev);
      playError();
      return;
    }
  }

  if (!board || !xpState) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>Generating board...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const diffColor = diff === "easy" ? "#22C55E" : diff === "medium" ? "#F59E0B" : "var(--color-error)";
  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 480) : 400;
  const cellSize = Math.floor(maxW / board.size);
  const connected = paths.size;
  const total = board.colors.length;
  const currentXP = calculateXP(xpState).currentXP;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <GamePageSchema slug={GAME_SLUG} />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "76px 16px 32px", gap: 18 }}>

        {/* Header */}
        <div style={{ width: "100%", maxWidth: 540, background: "var(--color-surface)", borderRadius: 20, border: "0.5px solid var(--color-border)", padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, overflow: "hidden", flexShrink: 1 }}>
              <Link href="/games" style={{ color: "var(--color-text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: 13 }}><ArrowLeft size={14} /> Games</Link>
              <div style={{ width: 1, height: 16, background: "#E2E8F0" }} />
              {/* Game name — was missing before */}
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>Flow</span>
              <div style={{ width: 1, height: 16, background: "#E2E8F0" }} />
              <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Stage</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>{stage}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: `${diffColor}15`, color: diffColor }}>{diff.toUpperCase()}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{connected}/{total} flows</span>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "monospace" }}>{elapsed}</span>
              <button onClick={() => loadStage(stage)} style={{ padding: 7, borderRadius: 9, border: "0.5px solid var(--color-border)", background: "var(--color-surface)", cursor: "pointer", color: "var(--color-text-secondary)", display: "flex" }}><RotateCcw size={13} /></button>
            </div>
          </div>
          <XPBar xpState={xpState} />
        </div>

        <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Drag from dot to dot · Fill every cell · No crossings</div>

        {solutionRevealed && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: "8px 20px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "0.5px solid rgba(239,68,68,0.2)", fontSize: 13, fontWeight: 600, color: "var(--color-error)" }}>
            Solution revealed · XP set to 1 · Retry to score properly
          </motion.div>
        )}

        {/* Board */}
        <div
          style={{
            border: "2px solid #E2E8F0", borderRadius: 16, overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)", cursor: "crosshair",
            userSelect: "none", touchAction: "none",
          }}
          onMouseLeave={endDraw}
          onTouchMove={(e) => {
            e.preventDefault();
            const t = e.touches[0];
            const el = document.elementFromPoint(t.clientX, t.clientY);
            if (el) {
              const k = (el as HTMLElement).dataset.cellkey;
              if (k) { const [r, c] = k.split(",").map(Number); continueDraw(r, c); }
            }
          }}
          onTouchEnd={endDraw}
        >
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${board.size},${cellSize}px)` }}>
            {Array.from({ length: board.size }, (_, r) =>
              Array.from({ length: board.size }, (_, c) => {
                const k = cellKey(r, c);
                const dotColor = board.dots.get(k);
                const cellColor = drawing?.cells.includes(k) ? drawing.color : cellColors.get(k);
                return (
                  <div key={k}
                    data-cellkey={k}
                    onMouseDown={() => startDraw(r, c)}
                    onMouseEnter={() => continueDraw(r, c)}
                    onMouseUp={endDraw}
                    onTouchStart={(e) => { e.preventDefault(); startDraw(r, c); }}
                    style={{
                      width: cellSize, height: cellSize,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: cellColor ? cellColor + "30" : "#FAFAF9",
                      borderRight: "0.5px solid #F0EDE8", borderBottom: "0.5px solid #F0EDE8",
                      borderTop: "none", borderLeft: "none", position: "relative",
                    }}>
                    {cellColor && !dotColor && (
                      <div style={{ position: "absolute", inset: 4, borderRadius: 4, background: cellColor, opacity: 0.7 }} />
                    )}
                    {dotColor && (
                      <div style={{
                        width: cellSize * 0.55, height: cellSize * 0.55,
                        borderRadius: "50%", background: dotColor,
                        boxShadow: `0 2px 8px ${dotColor}60`,
                        border: `3px solid ${dotColor}`,
                        position: "relative", zIndex: 2,
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <HintButton hintsLeft={3 - hintsUsed} xpCost={100} onUseHint={handleHint} disabled={completed || solutionRevealed} />
          <ShowSolution onReveal={handleRevealSolution} currentXP={currentXP} disabled={completed || solutionRevealed} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => stage > 1 && setStage(s => s - 1)} disabled={stage === 1}
            style={{ padding: "8px 16px", borderRadius: 12, border: "0.5px solid var(--color-border)", background: "var(--color-surface)", cursor: stage > 1 ? "pointer" : "not-allowed", fontSize: 12, color: "var(--color-text-secondary)", opacity: stage === 1 ? 0.4 : 1 }}>← Prev</button>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Stage {stage} of {TOTAL_STAGES}</span>
          <button onClick={() => setStage(s => s + 1)}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 16px", borderRadius: 12, border: "0.5px solid var(--color-border)", background: "var(--color-surface)", cursor: "pointer", fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 600 }}>Next <ChevronRight size={13} /></button>
        </div>
      </main>

      <OutOfTokensModal gameName="Flow" open={showTokenModal} onClose={() => setShowTokenModal(false)} />

      {showResume && resumeData && (
        <ResumeModal gameSlug={GAME_SLUG} stageName={`Stage ${resumeData.stage}`} savedAt={resumeData.savedAt as number}
          onResume={() => { const s = resumeData!; setShowResume(false); setResumeData(null); setStage(s.stage as number); }}
          onStartFresh={() => { clearGameState(GAME_SLUG); setShowResume(false); setResumeData(null); loadStage(stage); }} />
      )}

      {showMap && (
        <StageMap gameSlug={GAME_SLUG} totalStages={TOTAL_STAGES} currentStage={stage}
          onSelectStage={s => setStage(s)} onClose={() => setShowMap(false)} />
      )}

      <CompletionPopup
        open={completed} stage={stage} difficulty={getDifficulty(stage)}
        xpEarned={finalXP} elapsed={elapsed}
        onRetry={() => loadStage(stage)}
        onNext={() => { setCompleted(false); setStage(s => s + 1); }}
        onGoToLatest={nextUncompleted != null ? () => { setCompleted(false); setStage(nextUncompleted!); } : undefined}
        nextUncompletedStage={nextUncompleted ?? undefined}
        onShare={() => {
          const text = `MindElement · Flow Stage ${stage} · ${finalXP} XP · ${elapsed}`;
          if (navigator.share) navigator.share({ title: "MindElement", text, url: "https://mindelement.app" }).catch(() => {});
          else window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), "_blank");
        }} />

      <GameCompleteModal open={showGameComplete} gameName="Flow" totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)} />
    </div>
  );
}

export default function FlowGame() {
  return <ErrorBoundary game={GAME_SLUG}><FlowGameInner /></ErrorBoundary>;
}