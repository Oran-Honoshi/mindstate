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
import { generateFlowBoard, checkFlowComplete, type FlowBoard, type Color } from "@/lib/games/flowGenerator";
import { createXPState, calculateXP, finalizeXP, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { OutOfTokensModal } from "@/components/ui/OutOfTokensModal";
import { GameShell } from "@/components/game";
import { useSettingsStore } from "@/store/settingsStore";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getDifficulty(stage: number): Difficulty {
  if (stage === 1) return "medium";
  const h = Math.abs(Math.imul(stage * 2654435761, stage ^ 0x9e3779b9)) % 100;
  return h < 20 ? "easy" : h < 70 ? "medium" : "hard";
}

type PathState = { color: Color; cells: string[] };

function FlowGameInner() {
  const { user } = useAuthStore();
  const { theme } = useSettingsStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [board, setBoard] = useState<FlowBoard | null>(null);
  const [paths, setPaths] = useState<Map<string, PathState>>(new Map());
  const [cellColors, setCellColors] = useState<Map<string, Color>>(new Map());
  const [drawing, setDrawing] = useState<{ color: Color; cells: string[] } | null>(null);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveXP, setLiveXP] = useState(1000);
  const [finalElapsed, setFinalElapsed] = useState("0:00");
  const [completed, setCompleted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string, unknown> | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [finalXP, setFinalXP] = useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [history, setHistory] = useState<{ paths: Map<string, PathState>; cellColors: Map<string, Color> }[]>([]);
  const [checkState, setCheckState] = useState<Map<string, "correct" | "incorrect"> | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => {
      if (xpState && !completed && !solutionRevealed) {
        timerRef.current = setInterval(() => {
          setElapsedSeconds(Math.floor((Date.now() - xpState.startTime) / 1000));
          if (!useSettingsStore.getState().isPracticeMode) setLiveXP(calculateXP(xpState).currentXP);
        }, 500);
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
    setElapsedSeconds(0);
    setLiveXP(1000);
    setFinalElapsed("0:00");
    setSolutionRevealed(false);
    setHistory([]);
    setCheckState(null);
    if (checkTimerRef.current) { clearTimeout(checkTimerRef.current); checkTimerRef.current = null; }
    setNextUncompleted(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - xp.startTime) / 1000));
      if (!useSettingsStore.getState().isPracticeMode) setLiveXP(calculateXP(xp).currentXP);
    }, 500);
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

  function handleRevealSolution() {
    if (!board || !xpState) return;
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
      setHistory(h => [...h.slice(-19), { paths: new Map(paths), cellColors: new Map(cellColors) }]);
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
        setFinalElapsed(formatTime(Math.floor((Date.now() - xpState.startTime) / 1000)));
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
          saveScore({ user_id: user.id, game_slug: GAME_SLUG, stage_number: stage, difficulty: getDifficulty(stage), xp_earned: earned, time_taken: Math.floor((Date.now() - xpState.startTime) / 1000), hints_used: hintsUsed });
        }
      }
    }
    setDrawing(null);
  }

  function handleUndo() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setPaths(last.paths);
    setCellColors(last.cellColors);
    setDrawing(null);
    setHistory(h => h.slice(0, -1));
    playClick();
  }

  function handleCheck() {
    if (!board || completed || solutionRevealed) return;
    const result = new Map<string, "correct" | "incorrect">();
    const solutionByColor = new Map<Color, string[]>();
    for (const [color, cells] of board.solution) solutionByColor.set(color, cells);
    for (const [color, path] of paths) {
      const sol = solutionByColor.get(color);
      if (!sol) { path.cells.forEach(k => result.set(k, "incorrect")); continue; }
      const solSet = new Set(sol);
      const matches = path.cells.length === sol.length && path.cells.every(k => solSet.has(k));
      path.cells.forEach(k => result.set(k, matches ? "correct" : "incorrect"));
    }
    setCheckState(result);
    playClick();
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    checkTimerRef.current = setTimeout(() => setCheckState(null), 2000);
  }

  function handleHint() {
    if (!board || !xpState || completed || hintsUsed >= 3 || solutionRevealed) return;

    for (const [color, solutionCells] of board.solution) {
      const current = paths.get(color);
      const currentCells = current?.cells ?? [];

      if (currentCells.length >= solutionCells.length) continue;

      let nextKey: string | null = null;

      if (currentCells.length === 0) {
        nextKey = solutionCells[0];
      } else {
        const head = currentCells[0];
        const tail = currentCells[currentCells.length - 1];
        const solStart = solutionCells[0];
        const solEnd = solutionCells[solutionCells.length - 1];

        if (head === solStart || tail === solStart) {
          const matchLen = currentCells.length;
          nextKey = solutionCells[matchLen] ?? null;
        } else if (head === solEnd || tail === solEnd) {
          const rev = [...solutionCells].reverse();
          const matchLen = currentCells.length;
          nextKey = rev[matchLen] ?? null;
        } else {
          nextKey = solutionCells[0];
        }
      }

      if (!nextKey) continue;

      const np = new Map(paths);
      const nc = new Map(cellColors);

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

  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 480) : 400;
  const cellSize = Math.floor(maxW / board.size);
  const connected = paths.size;
  const total = board.colors.length;

  const boardBg = theme === "dark"
    ? `radial-gradient(circle, rgba(0,255,255,0.09) 1px, transparent 1px), #060d18`
    : theme === "light"
    ? `radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px), #f8f9fb`
    : `radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px), #f5f0e8`;

  const navBtnStyle = {
    padding: "8px 18px", borderRadius: 10,
    border: "1px solid var(--color-border)",
    background: "var(--color-surface)",
    cursor: "pointer", fontSize: 11,
    fontFamily: "var(--font-mono)",
    color: "var(--color-text-secondary)",
    fontWeight: 600, letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  };

  return (
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Flow"
        stageNumber={stage}
        difficulty={getDifficulty(stage)}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3 - hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
        onCheck={handleCheck}
      >
        <GamePageSchema slug={GAME_SLUG} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: "16px 16px 32px" }}>

          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}>
            FLOWS {connected}/{total} · DRAG DOT TO DOT · FILL ALL CELLS · NO CROSSINGS
          </div>

          {solutionRevealed && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: "8px 20px", borderRadius: 12, background: "color-mix(in srgb, var(--color-error) 8%, transparent)", border: "0.5px solid color-mix(in srgb, var(--color-error) 20%, transparent)", fontSize: 13, fontWeight: 600, color: "var(--color-error)", fontFamily: "var(--font-mono)" }}>
              SOLUTION REVEALED · XP SET TO 1 · RETRY TO SCORE
            </motion.div>
          )}

          <motion.div
            animate={completed && theme === "dark" ? {
              boxShadow: [
                "0 0 0 1px rgba(57,255,20,0.15), 0 20px 64px rgba(0,0,0,0.5)",
                "0 0 0 1px rgba(57,255,20,0.55), 0 0 40px rgba(57,255,20,0.18), 0 20px 64px rgba(0,0,0,0.5)",
                "0 0 0 1px rgba(57,255,20,0.15), 0 20px 64px rgba(0,0,0,0.5)",
              ],
            } : {}}
            transition={completed ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : {}}
            style={{
              padding: 10, borderRadius: 16,
              background: boardBg, backgroundSize: "18px 18px",
              border: "1px solid color-mix(in srgb, var(--color-accent-primary) 14%, transparent)",
              boxShadow: theme === "dark"
                ? "0 0 0 1px rgba(0,255,255,0.03), 0 20px 64px rgba(0,0,0,0.5)"
                : "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                borderRadius: 10, overflow: "hidden",
                cursor: "crosshair", userSelect: "none", touchAction: "none",
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
                    const check = checkState?.get(k);
                    const isDrawing = drawing?.cells.includes(k);
                    const emptyBg = theme === "dark" ? "rgba(6,13,24,0.92)" : "var(--color-surface)";
                    const pipeBg = check === "correct"
                      ? "color-mix(in srgb, var(--color-accent-secondary) 22%, var(--color-surface))"
                      : check === "incorrect"
                      ? "color-mix(in srgb, var(--color-error) 22%, var(--color-surface))"
                      : cellColor ? cellColor + (theme === "dark" ? "2a" : "18") : emptyBg;
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
                          background: pipeBg,
                          borderRight: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.05)" : "var(--color-border)"}`,
                          borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.05)" : "var(--color-border)"}`,
                          borderTop: "none", borderLeft: "none",
                          position: "relative", transition: "background 0.15s",
                        }}>
                        {cellColor && !dotColor && (
                          <div style={{
                            position: "absolute", inset: 5, borderRadius: 4,
                            background: cellColor,
                            opacity: isDrawing ? 1 : (completed ? 0.95 : 0.72),
                            boxShadow: completed && theme === "dark" ? `0 0 8px 2px ${cellColor}70` : "none",
                            transition: "opacity 0.2s, box-shadow 0.3s",
                          }} />
                        )}
                        {dotColor && (
                          <div style={{
                            width: cellSize * 0.58, height: cellSize * 0.58,
                            borderRadius: "50%", background: dotColor,
                            boxShadow: theme === "dark"
                              ? `0 0 10px 3px ${dotColor}80, 0 0 3px 1px ${dotColor}99`
                              : `0 2px 8px ${dotColor}60`,
                            position: "relative", zIndex: 2,
                          }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </GameShell>

      <OutOfTokensModal gameName="Flow" open={showTokenModal} onClose={() => setShowTokenModal(false)} />

      {showResume && resumeData && (
        <ResumeModal gameSlug={GAME_SLUG} stageNumber={resumeData.stage as number} savedAt={resumeData.savedAt as number}
          onDismiss={() => { setShowResume(false); setResumeData(null); }}
          onResume={() => { const s = resumeData!; setShowResume(false); setResumeData(null); setStage(s.stage as number); }}
          onStartFresh={() => { clearGameState(GAME_SLUG); setShowResume(false); setResumeData(null); loadStage(stage); }} />
      )}

      {showMap && (
        <StageMap gameSlug={GAME_SLUG} totalStages={TOTAL_STAGES} currentStage={stage}
          onSelectStage={s => setStage(s)} onClose={() => setShowMap(false)} />
      )}

      <CompletionPopup
        open={completed} stage={stage} difficulty={getDifficulty(stage)}
        xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={() => loadStage(stage)}
        onNext={() => { setCompleted(false); setStage(s => s + 1); }}
        onGoToLatest={nextUncompleted != null ? () => { setCompleted(false); setStage(nextUncompleted!); } : undefined}
        nextUncompletedStage={nextUncompleted ?? undefined}
        onShare={() => {
          const text = `MindElement · Flow Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;
          if (navigator.share) navigator.share({ title: "MindElement", text, url: "https://mindelement.app" }).catch(() => {});
          else window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), "_blank");
        }} />

      <GameCompleteModal open={showGameComplete} gameName="Flow" totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)} />
    </>
  );
}

export default function FlowGame() {
  return <ErrorBoundary game={GAME_SLUG}><FlowGameInner /></ErrorBoundary>;
}
