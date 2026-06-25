"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "zip";
import { saveGameState, loadGameState, clearGameState } from "@/lib/games/gameStateStorage";
import { ResumeModal } from "@/components/ui/ResumeModal";
import { StageMap } from "@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion } from "framer-motion";
import { createXPState, calculateXP, finalizeXP, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { GameShell } from "@/components/game";

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

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedToNum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

type Pos = [number, number];
interface ZipBoard { size: number; path: Pos[]; waypoints: Map<string, number>; seed: string; }

function generateZipBoard(seed: string, difficulty: Difficulty): ZipBoard {
  const size = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const rng = mulberry32(seedToNum(seed));
  const dirs: Pos[] = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function findPath(): Pos[] | null {
    const startR = Math.floor(rng() * size), startC = Math.floor(rng() * size);
    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    const path: Pos[] = [];
    function bt(r: number, c: number): boolean {
      if (r < 0 || r >= size || c < 0 || c >= size || visited[r][c]) return false;
      visited[r][c] = true; path.push([r, c]);
      if (path.length === size * size) return true;
      for (const [dr, dc] of shuffle(dirs)) { if (bt(r + dr, c + dc)) return true; }
      path.pop(); visited[r][c] = false; return false;
    }
    return bt(startR, startC) ? path : null;
  }
  let path: Pos[] | null = null, attempts = 0;
  while (!path && attempts < 50) { path = findPath(); attempts++; }
  if (!path) {
    path = [];
    for (let r = 0; r < size; r++) {
      const cols = r % 2 === 0 ? Array.from({ length: size }, (_, c) => c) : Array.from({ length: size }, (_, c) => size - 1 - c);
      for (const c of cols) path.push([r, c]);
    }
  }
  // Explicit completeness guarantee: path must visit every cell exactly once
  if (path.length !== size * size) {
    path = [];
    for (let r = 0; r < size; r++) {
      const cols = r % 2 === 0 ? Array.from({ length: size }, (_, c) => c) : Array.from({ length: size }, (_, c) => size - 1 - c);
      for (const c of cols) (path as Pos[]).push([r, c]);
    }
  }
  const numWaypoints = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
  const interval = Math.floor(path.length / (numWaypoints - 1));
  const waypointIndices = [0];
  for (let i = 1; i < numWaypoints - 1; i++) waypointIndices.push(i * interval);
  waypointIndices.push(path.length - 1);
  const waypoints = new Map<string, number>();
  waypointIndices.forEach((idx, i) => { waypoints.set(`${path![idx][0]},${path![idx][1]}`, i + 1); });
  return { size, path, waypoints, seed };
}

function ZipGameInner() {
  const { user } = useAuthStore();
  const { theme } = useSettingsStore();
  const searchParams = useSearchParams();
  const isDaily = searchParams.get("daily") === "1";
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [board, setBoard] = useState<ZipBoard | null>(null);
  const [userPath, setUserPath] = useState<Pos[]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveXP, setLiveXP] = useState(1000);
  const [finalElapsed, setFinalElapsed] = useState("0:00");
  const [completed, setCompleted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [finalXP, setFinalXP] = useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<Pos[][]>([]);
  const [checkState, setCheckState] = useState<Map<string, "correct" | "incorrect"> | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const cellSizeRef = useRef(0);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => {
      if (xpState && !completed) {
        timerRef.current = setInterval(() => {
          setElapsedSeconds(Math.floor((Date.now() - xpState.startTime) / 1000));
          if (!useSettingsStore.getState().isPracticeMode) setLiveXP(calculateXP(xpState).currentXP);
        }, 500);
      }
    }
  );

  const loadStage = useCallback((s: number) => {
    saveGameState("zip", { stage: s, savedAt: Date.now() });
    const diff = getDifficulty(s);
    const b = generateZipBoard(`zip-${diff}-${s}`, diff);
    const xp = createXPState(diff);
    setBoard(b); setUserPath([b.path[0]]);
    setXpState(xp); setCompleted(false); setFinalXP(0); setHintsUsed(0);
    setElapsedSeconds(0); setLiveXP(1000); setFinalElapsed("0:00");
    setSolutionRevealed(false);
    setCheckState(null);
    if (checkTimerRef.current) { clearTimeout(checkTimerRef.current); checkTimerRef.current = null; }
    setHistory([]);
    setNextUncompleted(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - xp.startTime) / 1000));
      if (!useSettingsStore.getState().isPracticeMode) setLiveXP(calculateXP(xp).currentXP);
    }, 500);
    if (user && !isDaily) { const ok = consumeToken(user.id); if (!ok) { setShowTokenModal(true); return; } }
  }, [user]);

  const resumeChecked = useRef(false);
  useEffect(() => {
    if (!resumeChecked.current) {
      resumeChecked.current = true;
      const saved = loadGameState("zip");
      if (saved && (saved.stage as number) > 1) { setResumeData(saved); setShowResume(true); return; }
    }
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleRevealSolution() {
    if (!board || !xpState) return;
    setUserPath([...board.path]);
    setSolutionRevealed(true);
    setXpState(prev => prev ? { ...prev, startTime: Date.now() - prev.decayDuration * 1000 } : prev);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function tryAddCell(r: number, c: number, currentPath: Pos[]): Pos[] | null {
    if (!board) return null;
    const pathSet = new Set(currentPath.map(([pr, pc]) => `${pr},${pc}`));
    const last = currentPath[currentPath.length - 1];
    if (currentPath.length >= 2) {
      const prev = currentPath[currentPath.length - 2];
      if (prev[0] === r && prev[1] === c) return currentPath.slice(0, -1);
    }
    if (pathSet.has(`${r},${c}`)) return null;
    if (Math.abs(last[0] - r) + Math.abs(last[1] - c) !== 1) return null;
    const wp = board.waypoints.get(`${r},${c}`);
    if (wp !== undefined) {
      const visitedWps = [...board.waypoints.entries()].filter(([k]) => pathSet.has(k)).map(([, v]) => v);
      const maxWp = visitedWps.length > 0 ? Math.max(...visitedWps) : 0;
      if (wp !== maxWp + 1) return null;
    }
    return [...currentPath, [r, c]];
  }

  function checkComplete(path: Pos[], b: ZipBoard): boolean {
    if (path.length !== b.size * b.size) return false;
    const maxWp = Math.max(...Array.from(b.waypoints.values()));
    const pathSet = new Set(path.map(([r, c]) => `${r},${c}`));
    return b.waypoints.get(`${path[path.length - 1][0]},${path[path.length - 1][1]}`) === maxWp &&
      [...b.waypoints.entries()].every(([k]) => pathSet.has(k));
  }

  function handleCellInteraction(r: number, c: number) {
    if (!board || completed || solutionRevealed) return;
    setUserPath(prev => {
      const newPath = tryAddCell(r, c, prev);
      if (!newPath) return prev;
      setHistory(h => [...h.slice(-19), [...prev]]);
      saveGameState("zip", { stage, userPath: newPath, hintsUsed, startTime: xpState?.startTime, savedAt: Date.now() });
      playClick();
      if (checkComplete(newPath, board) && xpState) {
        const earned = finalizeXP(xpState);
        setFinalXP(earned);
        setFinalElapsed(formatTime(Math.floor((Date.now() - xpState.startTime) / 1000)));
        setCompleted(true);
        if (timerRef.current) clearInterval(timerRef.current);
        playSuccess(); setTimeout(() => triggerConfetti(), 80);
        markStageCompleted("zip", stage);
        if (user) saveScore({ user_id: user.id, game_slug: "zip", stage_number: stage, difficulty: getDifficulty(stage), xp_earned: earned, time_taken: Math.floor((Date.now() - xpState.startTime) / 1000), hints_used: hintsUsed });
      }
      return newPath;
    });
  }

  function getCellFromTouch(touch: React.Touch | Touch): [number, number] | null {
    if (!boardRef.current || !board) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left, y = touch.clientY - rect.top;
    const step = cellSizeRef.current + 10;
    const c = Math.floor(x / step), r = Math.floor(y / step);
    if (r < 0 || r >= board.size || c < 0 || c >= board.size) return null;
    if (x - c * step > cellSizeRef.current || y - r * step > cellSizeRef.current) return null;
    return [r, c];
  }

  function handleUndo() {
    if (history.length === 0 || completed || solutionRevealed) return;
    setUserPath(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
    playClick();
  }

  function handleHint() {
    if (!board || !xpState || completed || hintsUsed >= 3 || solutionRevealed) return;
    const nextIdx = userPath.length;
    if (nextIdx < board.path.length) {
      setUserPath(prev => [...prev, board.path[nextIdx]]);
      setHintsUsed(h => h + 1);
      setXpState(prev => prev ? { ...prev, hintsUsed: Math.min((prev.hintsUsed || 0) + 1, prev.maxHints) } : prev);
      playError();
    }
  }

  function handleCheck() {
    if (!board || completed || solutionRevealed) return;
    const result = new Map<string, "correct" | "incorrect">();
    userPath.forEach(([r, c], i) => {
      const [er, ec] = board.path[i] ?? [-1, -1];
      result.set(`${r},${c}`, er === r && ec === c ? "correct" : "incorrect");
    });
    setCheckState(result);
    playClick();
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    checkTimerRef.current = setTimeout(() => setCheckState(null), 2000);
  }

  if (!board || !xpState) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 13, fontFamily: "var(--font-mono)" }}>GENERATING BOARD...</p>
    </div>
  );

  const pathSet = new Set(userPath.map(([r, c]) => `${r},${c}`));
  const last = userPath[userPath.length - 1];
  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 480) : 400;
  const gap = 10;
  const cellSize = Math.floor((maxW - (board.size - 1) * gap) / board.size);
  cellSizeRef.current = cellSize;
  const totalCells = board.size * board.size;
  const svgSize = board.size * (cellSize + gap) - gap;

  const pathLineColor = completed
    ? "var(--color-accent-secondary)"
    : solutionRevealed
    ? "var(--color-error)"
    : "var(--color-accent-primary)";

  const boardBg = theme === "dark"
    ? "radial-gradient(circle, rgba(0,255,255,0.09) 1px, transparent 1px), #060d18"
    : `radial-gradient(circle, color-mix(in srgb, var(--color-accent-primary) 8%, transparent) 1px, transparent 1px), var(--color-surface)`;

  return (
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Zip"
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
        <GamePageSchema slug="zip" />

        {/* Progress counter */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.07em", color: "var(--color-text-secondary)" }}>
          <span>
            PATH{" "}
            <span style={{ color: completed ? "var(--color-accent-secondary)" : "var(--color-accent-primary)", fontWeight: 700 }}>
              {userPath.length}
            </span>
            <span style={{ opacity: 0.5 }}>/{totalCells}</span>
          </span>
          <span style={{ opacity: 0.3 }}>│</span>
          <span>
            WAYPOINTS <span style={{ opacity: 0.5 }}>1→{board.waypoints.size}</span>
          </span>
        </div>

        {solutionRevealed && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: "8px 20px", borderRadius: 12, background: "color-mix(in srgb, var(--color-error) 8%, transparent)", border: "0.5px solid color-mix(in srgb, var(--color-error) 20%, transparent)", fontSize: 13, fontWeight: 600, color: "var(--color-error)" }}>
            Solution revealed · XP set to 1 · Retry to score properly
          </motion.div>
        )}

        {/* Board panel — dot-grid shows through the 10px cell gaps */}
        <div style={{
          padding: 10,
          borderRadius: 16,
          background: boardBg,
          backgroundSize: "18px 18px",
          border: "1px solid color-mix(in srgb, var(--color-accent-primary) 16%, transparent)",
          boxShadow: theme === "dark"
            ? "0 0 0 1px rgba(0,255,255,0.03), 0 20px 64px rgba(0,0,0,0.5)"
            : "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          <div style={{ position: "relative" }}>
            {/* SVG path overlay with glow filter */}
            <svg
              style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}
              width={svgSize} height={svgSize}
            >
              {theme === "dark" && (
                <defs>
                  <filter id="glow-path" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              )}
              {userPath.slice(1).map(([r, c], i) => {
                const [pr, pc] = userPath[i];
                const step = cellSize + gap, cx = cellSize / 2;
                return (
                  <line key={i}
                    x1={pc * step + cx} y1={pr * step + cx}
                    x2={c * step + cx} y2={r * step + cx}
                    stroke={pathLineColor}
                    strokeWidth={completed ? 5 : 4}
                    strokeLinecap="round"
                    opacity={completed ? 0.9 : 0.7}
                    filter={theme === "dark" ? "url(#glow-path)" : "none"}
                  />
                );
              })}
            </svg>

            {/* Cell grid */}
            <div
              ref={boardRef}
              style={{ display: "grid", gridTemplateColumns: `repeat(${board.size},${cellSize}px)`, gap, position: "relative", zIndex: 2, touchAction: "none" }}
              onTouchStart={e => { isDragging.current = true; const cell = getCellFromTouch(e.touches[0]); if (cell) handleCellInteraction(cell[0], cell[1]); }}
              onTouchMove={e => { if (!isDragging.current) return; const cell = getCellFromTouch(e.touches[0]); if (cell) handleCellInteraction(cell[0], cell[1]); }}
              onTouchEnd={() => { isDragging.current = false; }}
              onMouseLeave={() => { isDragging.current = false; }}
            >
              {Array.from({ length: board.size }, (_, r) => Array.from({ length: board.size }, (_, c) => {
                const key = `${r},${c}`;
                const inPath = pathSet.has(key);
                const isLast = last[0] === r && last[1] === c;
                const wp = board.waypoints.get(key);
                const isVisitedWp = wp !== undefined && pathSet.has(key);
                const check = checkState?.get(key);

                const cellBg = check === "correct" ? "var(--color-accent-secondary)"
                  : check === "incorrect" ? "var(--color-error)"
                  : completed ? "color-mix(in srgb, var(--color-accent-secondary) 14%, var(--color-surface))"
                  : isLast ? (solutionRevealed ? "color-mix(in srgb, var(--color-error) 10%, var(--color-surface))" : "color-mix(in srgb, var(--color-accent-primary) 14%, var(--color-surface))")
                  : isVisitedWp ? "color-mix(in srgb, var(--color-accent-secondary) 16%, var(--color-surface))"
                  : inPath ? (solutionRevealed ? "color-mix(in srgb, var(--color-error) 5%, var(--color-surface))" : "color-mix(in srgb, var(--color-accent-primary) 6%, var(--color-surface))")
                  : "var(--color-surface-2)";

                const cellBorder = check ? "transparent"
                  : completed ? "var(--color-accent-secondary)"
                  : isLast ? (solutionRevealed ? "var(--color-error)" : "var(--color-accent-primary)")
                  : isVisitedWp ? "var(--color-accent-secondary)"
                  : inPath ? (solutionRevealed ? "color-mix(in srgb, var(--color-error) 30%, transparent)" : "color-mix(in srgb, var(--color-accent-primary) 50%, transparent)")
                  : "var(--color-border)";

                const cellColor = check ? "var(--color-on-accent)"
                  : completed ? "var(--color-accent-secondary)"
                  : isLast ? (solutionRevealed ? "var(--color-error)" : "var(--color-accent-primary)")
                  : isVisitedWp ? "var(--color-accent-secondary)"
                  : wp ? "var(--color-accent-primary)"
                  : "var(--color-text-secondary)";

                return (
                  <motion.div key={key}
                    onMouseDown={() => { isDragging.current = true; handleCellInteraction(r, c); }}
                    onMouseEnter={() => { if (isDragging.current) handleCellInteraction(r, c); }}
                    onMouseUp={() => { isDragging.current = false; }}
                    onClick={() => handleCellInteraction(r, c)}
                    style={{
                      width: cellSize, height: cellSize,
                      borderRadius: Math.round(cellSize * 0.22),
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: `1.5px solid ${cellBorder}`,
                      transition: "background 0.2s, border-color 0.2s",
                      background: cellBg,
                      cursor: solutionRevealed ? "default" : "pointer",
                      fontSize: Math.round(cellSize * 0.34), fontWeight: 700, fontFamily: "var(--font-mono)",
                      color: cellColor,
                      userSelect: "none",
                      WebkitUserSelect: "none",
                    }}>
                    {wp ?? ""}
                  </motion.div>
                );
              }))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
          <span style={{ opacity: 0.6 }}>DRAG OR TAP TO TRACE</span>
          {!solutionRevealed && (
            <button onClick={() => board && setUserPath([board.path[0]])}
              style={{ color: "var(--color-accent-primary)", background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              RESET
            </button>
          )}
        </div>

      </GameShell>

      {showResume && resumeData && (
        <ResumeModal
          gameSlug="zip"
          stageNumber={resumeData.stage as number}
          savedAt={resumeData.savedAt as number}
          onDismiss={() => { setShowResume(false); setResumeData(null); }}
          onResume={() => {
            const s = resumeData!;
            setShowResume(false); setResumeData(null);
            setStage(s.stage as number);
            if (s.userPath) setTimeout(() => setUserPath(s.userPath as Pos[]), 150);
          }}
          onStartFresh={() => {
            clearGameState("zip"); setShowResume(false); setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
      {showMap && <StageMap gameSlug="zip" totalStages={100} currentStage={stage} onSelectStage={s => setStage(s)} onClose={() => setShowMap(false)} />}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={() => loadStage(stage)} onNext={() => { setCompleted(false); setStage(s => s + 1); }}
        onShare={() => { const text = `MindElement · Zip Stage ${stage} · ${finalXP} XP · ${finalElapsed}`; if (navigator.share) navigator.share({ title: "MindElement", text, url: "https://mindelement.app" }).catch(() => {}); else window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), "_blank"); }} />
      <GameCompleteModal
        open={showGameComplete}
        gameName="Zip"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function ZipGame() { return <ErrorBoundary game="zip"><Suspense fallback={<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100dvh",background:"var(--color-bg)",color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)",fontSize:14}}>Loading...</div>}><ZipGameInner /></Suspense></ErrorBoundary>; }
