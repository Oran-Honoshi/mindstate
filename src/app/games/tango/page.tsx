"use client";
import { saveGameState, loadGameState, clearGameState } from "@/lib/games/gameStateStorage";
import { ResumeModal } from "@/components/ui/ResumeModal";
import { StageMap } from "@/components/ui/StageMap";
import {
  getLastStage,
  getLastStageRemote,
  markStageCompleted,
  getNextUncompletedStage,
  shouldShowGameCompleteModal,
} from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import {
  generateTangoBoard, validateBoard, buildSeed,
  type Cell, type TangoBoard, type CellStatus,
} from "@/lib/games/tangoGenerator";
import {
  createXPState, calculateXP, finalizeXP,
  type XPState, type Difficulty,
} from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { SunIcon, MoonIcon } from "@/components/icons/GameIcons";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { GameInstructions } from "@/components/ui/GameInstructions";
import { OutOfTokensModal } from "@/components/ui/OutOfTokensModal";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { useBoardWidth } from "@/hooks/useScreenWidth";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { GameShell } from "@/components/game";

const TOTAL_STAGES = 100;
const GAME_SLUG = "tango";

function getDifficulty(stage: number): Difficulty {
  if (stage === 1) return "medium";
  const h = Math.abs(Math.imul(stage * 2654435761, stage ^ 0x9e3779b9)) % 100;
  return h < 20 ? "easy" : h < 70 ? "medium" : "hard";
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function TangoGameInner() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [board, setBoard] = useState<TangoBoard | null>(null);
  const [playerGrid, setPlayerGrid] = useState<Cell[][]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveXP, setLiveXP] = useState(1000);
  const [finalElapsed, setFinalElapsed] = useState("0:00");
  const [completed, setCompleted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string, unknown> | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [history, setHistory] = useState<typeof playerGrid[]>([]);
  const [squish, setSquish] = useState<string | null>(null);
  const [errorRows, setErrorRows] = useState<Set<number>>(new Set());
  const [errorCols, setErrorCols] = useState<Set<number>>(new Set());
  const [errorCells, setErrorCells] = useState<Set<string>>(new Set());
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeChecked = useRef(false);
  const maxW = useBoardWidth(48, 560);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => {
      if (xpState && !completed) {
        timerRef.current = setInterval(() => {
          setElapsedSeconds(Math.floor((Date.now() - xpState.startTime) / 1000));
          setLiveXP(calculateXP(xpState).currentXP);
        }, 500);
      }
    }
  );

  useEffect(() => {
    let cancelled = false;
    getLastStageRemote(GAME_SLUG).then((remote) => {
      if (cancelled) return;
      if (remote > 0 && remote > stage) setStage(remote);
    });
    return () => { cancelled = true; };
  }, []);

  const loadStage = useCallback((s: number) => {
    saveGameState(GAME_SLUG, { stage: s, savedAt: Date.now() });
    const diff = getDifficulty(s);
    const seed = buildSeed(GAME_SLUG, diff, s);
    const b = generateTangoBoard(seed, diff);
    const xp = createXPState(diff);
    setBoard(b);
    setPlayerGrid(b.puzzle.map((r) => [...r]));
    setXpState(xp);
    setCompleted(false);
    setFinalXP(0);
    setElapsedSeconds(0);
    setLiveXP(1000);
    setFinalElapsed("0:00");
    setHintsUsed(0);
    setHistory([]);
    setErrorRows(new Set());
    setErrorCols(new Set());
    setErrorCells(new Set());
    setSolutionRevealed(false);
    setNextUncompleted(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - xp.startTime) / 1000));
      setLiveXP(calculateXP(xp).currentXP);
    }, 500);
  }, []);

  useEffect(() => {
    if (!resumeChecked.current) {
      resumeChecked.current = true;
      const saved = loadGameState(GAME_SLUG);
      if (saved && (saved.stage as number) > 1) {
        setResumeData(saved);
        setShowResume(true);
      }
    }
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleRevealSolution() {
    if (!board || !xpState) return;
    setPlayerGrid(board.solution.map((r) => [...r]));
    setXpState((prev) =>
      prev ? { ...prev, startTime: Date.now() - prev.decayDuration * 1000 } : prev
    );
    setSolutionRevealed(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function checkRowColErrors(grid: Cell[][], size: number) {
    const newErrorRows = new Set<number>();
    const newErrorCols = new Set<number>();
    const newErrorCells = new Set<string>();
    for (let r = 0; r < size; r++) {
      const row = grid[r];
      if (!row.every((c) => c !== null)) continue;
      const suns = row.filter((c) => c === "S").length;
      const moons = row.filter((c) => c === "M").length;
      for (let c = 0; c <= size - 3; c++) {
        if (row[c] !== null && row[c] === row[c + 1] && row[c] === row[c + 2]) {
          newErrorCells.add(`${r},${c}`);
          newErrorCells.add(`${r},${c + 1}`);
          newErrorCells.add(`${r},${c + 2}`);
          playError();
        }
      }
      if (suns !== size / 2 || moons !== size / 2) newErrorRows.add(r);
    }
    for (let c = 0; c < size; c++) {
      const col = grid.map((r) => r[c]);
      if (!col.every((v) => v !== null)) continue;
      const suns = col.filter((v) => v === "S").length;
      const moons = col.filter((v) => v === "M").length;
      for (let r = 0; r <= size - 3; r++) {
        if (col[r] !== null && col[r] === col[r + 1] && col[r] === col[r + 2]) {
          newErrorCells.add(`${r},${c}`);
          newErrorCells.add(`${r + 1},${c}`);
          newErrorCells.add(`${r + 2},${c}`);
          playError();
        }
      }
      if (suns !== size / 2 || moons !== size / 2) newErrorCols.add(c);
    }
    setErrorRows(newErrorRows);
    setErrorCols(newErrorCols);
    setErrorCells(newErrorCells);
    if (newErrorCells.size > 0) setTimeout(() => { setErrorCells(new Set()); }, 3000);
  }

  function handleCellClick(r: number, c: number) {
    if (!board || completed || solutionRevealed) return;
    const given = board.puzzle[r][c];
    if (given !== null) return;
    const cur = playerGrid[r][c];
    const next: Cell = cur === null ? "S" : cur === "S" ? "M" : null;
    const key = `${r}-${c}`;
    setSquish(key);
    setTimeout(() => setSquish(null), 340);
    setHistory((h) => [...h.slice(-19), playerGrid.map((r) => [...r])]);
    const ng = playerGrid.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? next : cell))
    );
    setPlayerGrid(ng);
    saveGameState(GAME_SLUG, {
      stage,
      playerGrid: ng,
      hintsUsed,
      startTime: xpState?.startTime,
      savedAt: Date.now(),
    });
    checkRowColErrors(ng, board.size);
    playClick();
    const ns = validateBoard(board.puzzle, ng, board.solution);
    const done = ns.every((row) => row.every((s) => s === "correct" || s === "given"));

    if (done && xpState) {
      const earned = finalizeXP(xpState);
      setFinalXP(earned);
      setCompleted(true);
      setFinalElapsed(formatTime(Math.floor((Date.now() - xpState.startTime) / 1000)));
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess();
      setTimeout(() => triggerConfetti(), 80);

      markStageCompleted(GAME_SLUG, stage);
      const next = getNextUncompletedStage(GAME_SLUG, TOTAL_STAGES);
      setNextUncompleted(next);

      if (shouldShowGameCompleteModal(GAME_SLUG, TOTAL_STAGES)) {
        setTimeout(() => setShowGameComplete(true), 1800);
      }

      if (user) {
        updateStreak(user.id);
        saveScore({
          user_id: user.id,
          game_slug: GAME_SLUG,
          stage_number: stage,
          difficulty: getDifficulty(stage),
          xp_earned: earned,
          time_taken: Math.floor((Date.now() - xpState.startTime) / 1000),
        });
      }
    }
  }

  function handleUndo() {
    if (history.length === 0) return;
    setPlayerGrid(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setErrorRows(new Set());
    setErrorCols(new Set());
    setErrorCells(new Set());
  }

  function handleHint() {
    if (!board || !xpState || completed || hintsUsed >= 3 || solutionRevealed) return;
    for (let r = 0; r < board.size; r++) {
      for (let c = 0; c < board.size; c++) {
        if (playerGrid[r][c] === null) {
          const ng = playerGrid.map((row) => [...row]);
          ng[r][c] = board.solution[r][c];
          setPlayerGrid(ng);
          setHintsUsed((h) => h + 1);
          setXpState((prev) =>
            prev ? { ...prev, hintsUsed: Math.min((prev.hintsUsed || 0) + 1, prev.maxHints) } : prev
          );
          playError();
          return;
        }
      }
    }
  }

  function handleCheck() {
    if (!board) return;
    checkRowColErrors(playerGrid, board.size);
  }

  if (!board || !xpState) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>Generating board...</p>
    </div>
  );

  const diff = getDifficulty(stage);
  const cellSize = Math.floor((maxW - (board.size - 1) * 10) / board.size);

  const cm = new Map<string, "same" | "diff">();
  board.constraints.forEach((c) =>
    cm.set(`${c.row1}-${c.col1}-${c.row2}-${c.col2}`, c.type)
  );

  return (
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Tango"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3 - hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
        onCheck={handleCheck}
      >
        <GamePageSchema slug={GAME_SLUG} />

        {solutionRevealed && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: "8px 20px", borderRadius: "var(--radius)", background: "rgba(255,68,68,0.08)", border: "0.5px solid rgba(255,68,68,0.2)", fontSize: 13, fontWeight: 600, color: "var(--color-error)", marginBottom: 8 }}>
            Solution revealed · XP set to 1 · Retry to score properly
          </motion.div>
        )}

        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><SunIcon size={13} /> Sun</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MoonIcon size={13} /> Moon</span>
          <span>· Equal per row & col · No 3 in a row</span>
        </div>

        <div style={{ width: "100%", maxWidth: maxW, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${board.size},${cellSize}px)`, gap: 10 }}>
            {board.puzzle.map((_, r) =>
              board.puzzle[r].map((_, c) => {
                const given = board.puzzle[r][c];
                const isGiven = given !== null;
                const value = playerGrid[r][c];
                const key = `${r}-${c}`;
                const hasError = errorRows.has(r) || errorCols.has(c);
                const isSolution = solutionRevealed && !isGiven;
                const rightC = cm.get(`${r}-${c}-${r}-${c + 1}`);
                const bottomC = cm.get(`${r}-${c}-${r + 1}-${c}`);
                return (
                  <div key={key} style={{ position: "relative", width: cellSize, height: cellSize }}>
                    <motion.button
                      onClick={() => handleCellClick(r, c)}
                      whileTap={!isGiven && !solutionRevealed ? { scale: 0.88 } : {}}
                      animate={squish === key ? { scaleX: [1, 0.86, 1.08, 1], scaleY: [1, 1.1, 0.94, 1] } : {}}
                      transition={{ duration: 0.32 }}
                      style={{
                        width: "100%", height: "100%",
                        borderRadius: Math.round(cellSize * 0.22),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1.5px solid",
                        background: isSolution ? "rgba(255,68,68,0.06)" : isGiven ? "#F8F7F5" : hasError ? "rgba(255,68,68,0.08)" : "white",
                        borderColor: isSolution ? "rgba(255,68,68,0.3)" : isGiven ? "#EDE9E4" : value ? "#DDD6F8" : "#EDE9E4",
                        cursor: isGiven || solutionRevealed ? "default" : "pointer",
                        outline: "none",
                      }}>
                      {value === "S" && <SunIcon size={Math.round(cellSize * 0.48)} />}
                      {value === "M" && <MoonIcon size={Math.round(cellSize * 0.48)} />}
                      {!value && <div style={{ width: Math.round(cellSize * 0.14), height: Math.round(cellSize * 0.14), borderRadius: "50%", background: isGiven ? "#CCC7BE" : "#E8E4DE" }} />}
                    </motion.button>
                    {rightC && c < board.size - 1 && (
                      <div style={{
                        position: "absolute",
                        right: -(Math.max(6, Math.round(cellSize * 0.2))),
                        top: "50%", transform: "translateY(-50%)",
                        zIndex: 10,
                        fontSize: Math.max(8, Math.round(cellSize * 0.22)),
                        fontWeight: 800,
                        color: rightC === "same" ? "var(--color-accent-primary)" : "#F87171",
                        lineHeight: 1,
                        pointerEvents: "none",
                      }}>
                        {rightC === "same" ? "=" : "×"}
                      </div>
                    )}
                    {bottomC && r < board.size - 1 && (
                      <div style={{
                        position: "absolute",
                        bottom: -(Math.max(6, Math.round(cellSize * 0.2))),
                        left: "50%", transform: "translateX(-50%)",
                        zIndex: 10,
                        fontSize: Math.max(8, Math.round(cellSize * 0.22)),
                        fontWeight: 800,
                        color: bottomC === "same" ? "var(--color-accent-primary)" : "#F87171",
                        lineHeight: 1,
                        pointerEvents: "none",
                      }}>
                        {bottomC === "same" ? "=" : "×"}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <button onClick={() => stage > 1 && setStage((s) => s - 1)} disabled={stage === 1}
            style={{ padding: "7px 14px", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-surface)", cursor: stage > 1 ? "pointer" : "not-allowed", fontSize: 12, color: "var(--color-text-secondary)", opacity: stage === 1 ? 0.4 : 1 }}>
            ← Prev
          </button>
          <button onClick={() => loadStage(stage)}
            style={{ padding: "7px 12px", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-surface)", cursor: "pointer", fontSize: 11, color: "var(--color-text-secondary)" }}>
            Restart
          </button>
          <button onClick={() => setShowMap(true)}
            style={{ padding: "7px 12px", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-surface)", cursor: "pointer", fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 600 }}>
            Map
          </button>
          <button onClick={() => setStage((s) => s + 1)}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", background: "var(--color-surface)", cursor: "pointer", fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 600 }}>
            Next <ChevronRight size={13} />
          </button>
        </div>
      </GameShell>

      <OutOfTokensModal gameName="Tango" open={showTokenModal} onClose={() => setShowTokenModal(false)} />

      {showResume && resumeData && (
        <ResumeModal
          gameSlug={GAME_SLUG}
          stageName={`Stage ${resumeData.stage}`}
          savedAt={resumeData.savedAt as number}
          onResume={() => {
            const s = resumeData!;
            setShowResume(false); setResumeData(null);
            setStage(s.stage as number);
            if (s.playerGrid) setTimeout(() => setPlayerGrid(s.playerGrid as Cell[][]), 150);
          }}
          onStartFresh={() => {
            clearGameState(GAME_SLUG); setShowResume(false); setResumeData(null);
            loadStage(stage);
          }}
        />
      )}

      {showMap && (
        <StageMap
          gameSlug={GAME_SLUG}
          totalStages={TOTAL_STAGES}
          currentStage={stage}
          onSelectStage={(s) => setStage(s)}
          onClose={() => setShowMap(false)}
        />
      )}

      <CompletionPopup
        open={completed}
        stage={stage}
        difficulty={getDifficulty(stage)}
        xpEarned={finalXP}
        elapsed={finalElapsed}
        onRetry={() => loadStage(stage)}
        onNext={() => { setCompleted(false); setStage((s) => s + 1); }}
        onGoToLatest={
          nextUncompleted != null
            ? () => { setCompleted(false); setStage(nextUncompleted!); }
            : undefined
        }
        nextUncompletedStage={nextUncompleted ?? undefined}
        onShare={() => {
          const text = `Mind Element · Tango Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;
          if (navigator.share) navigator.share({ title: "Mind Element", text, url: "https://mindelement.app" }).catch(() => {});
          else window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), "_blank");
        }}
      />

      <GameCompleteModal
        open={showGameComplete}
        gameName="Tango"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}

export default function TangoGame() {
  return (
    <ErrorBoundary game={GAME_SLUG}>
      <TangoGameInner />
    </ErrorBoundary>
  );
}