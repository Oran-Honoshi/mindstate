"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "sudoku";
import { saveGameState, loadGameState, clearGameState } from "@/lib/games/gameStateStorage";
import { ResumeModal } from "@/components/ui/ResumeModal";
import { StageMap } from "@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Delete } from "lucide-react";
import { createXPState, calculateXP, finalizeXP, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { buildSeed } from "@/lib/games/tangoGenerator";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { OutOfTokensModal } from "@/components/ui/OutOfTokensModal";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { GameShell } from "@/components/game";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type SudokuCell = number | null;
type SudokuBoard = SudokuCell[][];

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

function SudokuGameInner() {
  const { user } = useAuthStore();
  const { theme } = useSettingsStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [puzzleData, setPuzzleData] = useState<ReturnType<typeof generateSudoku> | null>(null);
  const [playerBoard, setPlayerBoard] = useState<SudokuBoard>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<Set<string>>(new Set());
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
  const [wrongCells, setWrongCells] = useState<Set<string>>(new Set());
  const [boardHistory, setBoardHistory] = useState<typeof playerBoard[]>([]);
  const [feedbackCells, setFeedbackCells] = useState<Set<string>>(new Set());
  const [flashSections, setFlashSections] = useState<Set<string>>(new Set());
  const [showFeedback, setShowFeedback] = useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [checkState, setCheckState] = useState<Map<string, "correct" | "incorrect"> | null>(null);
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeChecked = useRef(false);

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

  const loadStage = useCallback((s: number) => {
    saveGameState("sudoku", { stage: s, savedAt: Date.now() });
    const diff = getDifficulty(s);
    const seed = buildSeed("sudoku", diff, s);
    const data = generateSudoku(seed, diff);
    const xp = createXPState(diff);
    setPuzzleData(data);
    setPlayerBoard(data.puzzle.map(r => [...r]));
    setBoardHistory([]);
    setSelected(null); setErrors(new Set());
    setXpState(xp); setCompleted(false); setFinalXP(0);
    setHintsUsed(0); setShowFeedback(false);
    setElapsedSeconds(0); setLiveXP(1000); setFinalElapsed("0:00");
    setSolutionRevealed(false);
    setCheckState(null);
    if (checkTimerRef.current) { clearTimeout(checkTimerRef.current); checkTimerRef.current = null; }
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
      const saved = loadGameState("sudoku");
      if (saved && (saved.stage as number) > 1) {
        setResumeData(saved);
        setShowResume(true);
        return;
      }
    }
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleRevealSolution() {
    if (!puzzleData || !xpState) return;
    setPlayerBoard(puzzleData.solution.map(r => [...r]));
    setErrors(new Set());
    setSelected(null);
    setSolutionRevealed(true);
    setXpState(prev => prev ? { ...prev, startTime: Date.now() - prev.decayDuration * 1000 } : prev);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function handleInput(num: number | null) {
    if (!puzzleData || !selected || completed || solutionRevealed) return;
    const [r, c] = selected;
    if (puzzleData.puzzle[r][c] !== null) return;
    setBoardHistory(h => [...h.slice(-19), playerBoard.map(r => [...r])]);
    const nb = playerBoard.map(row => [...row]);
    nb[r][c] = num;
    setPlayerBoard(nb);
    saveGameState("sudoku", { stage, playerBoard: nb, hintsUsed, startTime: xpState?.startTime, savedAt: Date.now() });
    const errs = new Set<string>();
    nb.forEach((row, ri) => row.forEach((v, ci) => {
      if (puzzleData.puzzle[ri][ci] !== null || v === null) return;
      if (v !== puzzleData.solution[ri][ci]) errs.add(`${ri}-${ci}`);
    }));
    if (errs.size > 0) { setErrors(errs); playError(); } else { setErrors(new Set()); }
    if (num !== null) {
      const br2 = puzzleData.br, bc2 = puzzleData.bc;
      const boxR = Math.floor(r / br2) * br2, boxC = Math.floor(c / bc2) * bc2;
      const boxFull = (() => { for (let ri = boxR; ri < boxR + br2; ri++) for (let ci = boxC; ci < boxC + bc2; ci++) if (nb[ri][ci] === null) return false; return true; })();
      const boxCorrect = (() => { for (let ri = boxR; ri < boxR + br2; ri++) for (let ci = boxC; ci < boxC + bc2; ci++) if (nb[ri][ci] !== puzzleData.solution[ri][ci]) return false; return true; })();
      if (boxFull && boxCorrect) {
        const key2 = `${Math.floor(r / br2)},${Math.floor(c / bc2)}`;
        setFlashSections(prev => new Set([...prev, key2]));
        setTimeout(() => setFlashSections(prev => { const ns = new Set(prev); ns.delete(key2); return ns; }), 800);
      }
    }
    const allCorrect = nb.every((row, ri) => row.every((v, ci) => puzzleData.puzzle[ri][ci] !== null || v === puzzleData.solution[ri][ci]));
    const allFilled = nb.every(row => row.every(v => v !== null));
    const emptyCount = puzzleData.puzzle.flat().filter(v => v === null).length;
    const userFilledCount = nb.flat().filter((v, i) => { const ri = Math.floor(i / nb[0].length), ci = i % nb[0].length; return puzzleData.puzzle[ri][ci] === null && v !== null; }).length;
    if (allCorrect && allFilled && userFilledCount >= emptyCount && xpState) {
      const earned = finalizeXP(xpState); setFinalXP(earned);
      setFinalElapsed(formatTime(Math.floor((Date.now() - xpState.startTime) / 1000)));
      setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess(); setTimeout(() => triggerConfetti(), 80);
      markStageCompleted("sudoku", stage);
      if (typeof window !== "undefined") { const w = parseInt(localStorage.getItem("mindstate-wins") ?? "0") + 1; localStorage.setItem("mindstate-wins", String(w)); }
      if (user) saveScore({ user_id: user.id, game_slug: "sudoku", stage_number: stage, difficulty: getDifficulty(stage), xp_earned: earned, time_taken: Math.floor((Date.now() - xpState.startTime) / 1000), hints_used: hintsUsed });
    }
  }

  function handleUndo() {
    if (boardHistory.length === 0) return;
    setPlayerBoard(boardHistory[boardHistory.length - 1]);
    setBoardHistory(h => h.slice(0, -1));
    setErrors(new Set());
  }

  function handleHint() {
    if (!puzzleData || !xpState || completed || hintsUsed >= 3 || solutionRevealed) return;
    for (let r = 0; r < puzzleData.size; r++) {
      for (let c = 0; c < puzzleData.size; c++) {
        if (puzzleData.puzzle[r][c] === null && playerBoard[r][c] === null) {
          const nb = playerBoard.map(row => [...row]);
          nb[r][c] = puzzleData.solution[r][c];
          setPlayerBoard(nb);
          setHintsUsed(h => h + 1);
          setXpState(prev => prev ? { ...prev, hintsUsed: Math.min((prev.hintsUsed || 0) + 1, prev.maxHints) } : prev);
          playError();
          return;
        }
      }
    }
  }

  function handleCheck() {
    if (!puzzleData || completed || solutionRevealed) return;
    const result = new Map<string, "correct" | "incorrect">();
    for (let r = 0; r < puzzleData.size; r++) {
      for (let c = 0; c < puzzleData.size; c++) {
        if (puzzleData.puzzle[r][c] === null && playerBoard[r][c] !== null) {
          result.set(`${r},${c}`, playerBoard[r][c] === puzzleData.solution[r][c] ? "correct" : "incorrect");
        }
      }
    }
    setCheckState(result);
    playClick();
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
    checkTimerRef.current = setTimeout(() => setCheckState(null), 2000);
  }

  if (!puzzleData || !xpState) return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 13, fontFamily: "var(--font-mono)" }}>GENERATING PUZZLE...</p>
    </div>
  );

  const maxW = typeof window !== "undefined" ? Math.min(window.innerWidth - 48, 480) : 400;
  const cellSize = Math.floor(maxW / puzzleData.size);
  const nums = Array.from({ length: puzzleData.size }, (_, i) => i + 1);

  return (
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Sudoku"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3 - hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
        onCheck={handleCheck}
      >
        <GamePageSchema slug="sudoku" />

        {solutionRevealed && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: "8px 20px", borderRadius: 12, background: "color-mix(in srgb, var(--color-error) 8%, transparent)", border: "0.5px solid color-mix(in srgb, var(--color-error) 20%, transparent)", fontSize: 13, fontWeight: 600, color: "var(--color-error)" }}>
            Solution revealed · XP set to 1 · Retry to score properly
          </motion.div>
        )}

        {/* Board panel */}
        <div style={{
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid color-mix(in srgb, var(--color-accent-primary) 16%, transparent)",
          boxShadow: theme === "dark"
            ? "0 0 0 1px rgba(0,255,255,0.04), 0 20px 64px rgba(0,0,0,0.5)"
            : "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${puzzleData.size},${cellSize}px)` }}>
            {puzzleData.puzzle.map((row, r) => row.map((given, c) => {
              const value = playerBoard[r][c];
              const isGiven = given !== null;
              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const isError = errors.has(`${r}-${c}`);
              const isSolution = solutionRevealed && !isGiven;
              const sameVal = selected && value !== null && playerBoard[selected[0]][selected[1]] === value && !isSelected;
              const rightBox = (c + 1) % puzzleData.bc === 0 && c < puzzleData.size - 1;
              const bottomBox = (r + 1) % puzzleData.br === 0 && r < puzzleData.size - 1;
              const check = checkState?.get(`${r},${c}`);
              const boxKey = `${Math.floor(r / puzzleData.br)},${Math.floor(c / puzzleData.bc)}`;
              const isFlashing = flashSections.has(boxKey);

              return (
                <motion.button key={`${r}-${c}`}
                  onClick={() => { if (!isGiven && !solutionRevealed) { setSelected([r, c]); playClick(); } }}
                  animate={isError ? { x: [-2, 2, -2, 2, 0] } : {}}
                  transition={{ duration: 0.25 }}
                  style={{
                    width: cellSize, height: cellSize,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: puzzleData.size === 6 ? 18 : 14, fontWeight: 700, fontFamily: "var(--font-mono)",
                    outline: "none", cursor: isGiven || solutionRevealed ? "default" : "pointer",
                    transition: "background 0.2s",
                    background: check === "correct" ? "var(--color-accent-secondary)"
                      : check === "incorrect" ? "var(--color-error)"
                      : isSolution ? "color-mix(in srgb, var(--color-error) 4%, var(--color-surface))"
                      : isFlashing ? "color-mix(in srgb, var(--color-accent-secondary) 18%, var(--color-surface))"
                      : showFeedback && feedbackCells.has(`${r}-${c}`) ? "color-mix(in srgb, var(--color-accent-secondary) 10%, var(--color-surface))"
                      : showFeedback && wrongCells.has(`${r}-${c}`) ? "color-mix(in srgb, var(--color-error) 10%, var(--color-surface))"
                      : isSelected ? "color-mix(in srgb, var(--color-accent-primary) 14%, var(--color-surface))"
                      : isError ? "color-mix(in srgb, var(--color-error) 10%, var(--color-surface))"
                      : sameVal ? "color-mix(in srgb, var(--color-accent-primary) 6%, var(--color-surface))"
                      : isGiven ? "var(--color-surface-2)" : "var(--color-surface)",
                    color: check ? "var(--color-on-accent)"
                      : isSolution ? "var(--color-error)"
                      : isGiven ? "var(--color-text-primary)"
                      : isError ? "var(--color-error)"
                      : value ? "var(--color-accent-primary)" : "var(--color-border)",
                    borderRight: rightBox ? "2px solid var(--color-text-secondary)" : "0.5px solid var(--color-border)",
                    borderBottom: bottomBox ? "2px solid var(--color-text-secondary)" : "0.5px solid var(--color-border)",
                    borderTop: "none", borderLeft: "none",
                    boxShadow: isSelected
                      ? "inset 0 0 0 2px var(--color-accent-primary)"
                      : isError
                      ? "inset 0 0 0 1.5px color-mix(in srgb, var(--color-error) 55%, transparent)"
                      : check === "correct"
                      ? "inset 0 0 0 1.5px var(--color-accent-secondary)"
                      : "none",
                  }}>
                  {value ?? ""}
                </motion.button>
              );
            }))}
          </div>
        </div>

        {/* Number pad — glass pill buttons */}
        {!solutionRevealed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            {nums.map(n => (
              <motion.button key={n} onClick={() => handleInput(n)}
                whileHover={{ scale: 1.06, boxShadow: theme === "dark" ? "0 0 12px 2px rgba(0,255,255,0.18)" : "0 4px 12px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.92 }}
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  border: "1px solid color-mix(in srgb, var(--color-accent-primary) 20%, var(--color-border))",
                  background: theme === "dark"
                    ? "color-mix(in srgb, rgba(0,255,255,1) 5%, var(--color-surface))"
                    : "var(--color-surface)",
                  fontSize: 16, fontWeight: 700,
                  color: "var(--color-text-primary)",
                  cursor: "pointer", fontFamily: "var(--font-mono)",
                  outline: "none",
                  boxShadow: theme === "dark" ? "0 0 0 1px rgba(0,255,255,0.04)" : "0 2px 6px rgba(0,0,0,0.04)",
                }}>
                {n}
              </motion.button>
            ))}
            <motion.button onClick={() => handleInput(null)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              style={{
                width: 44, height: 44, borderRadius: 12,
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                cursor: "pointer", outline: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              <Delete size={16} color="var(--color-text-secondary)" />
            </motion.button>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => stage > 1 && setStage(s => s - 1)} disabled={stage === 1}
            style={{ padding: "8px 16px", borderRadius: 10, border: "0.5px solid var(--color-border)", background: "var(--color-surface)", cursor: stage > 1 ? "pointer" : "not-allowed", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", opacity: stage === 1 ? 0.4 : 1 }}>
            ← PREV
          </button>
          <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)" }}>
            STAGE <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{stage}</span>
            <span style={{ opacity: 0.5 }}>/100</span>
          </span>
          <button onClick={() => setStage(s => s + 1)}
            style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 16px", borderRadius: 10, border: "0.5px solid var(--color-border)", background: "var(--color-surface)", cursor: "pointer", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--color-text-secondary)", fontWeight: 600 }}>
            NEXT <ChevronRight size={13} />
          </button>
        </div>
      </GameShell>

      <OutOfTokensModal gameName="Sudoku" open={showTokenModal} onClose={() => setShowTokenModal(false)} />

      {showResume && resumeData && (
        <ResumeModal
          gameSlug="sudoku"
          stageName={`Stage ${resumeData.stage}`}
          savedAt={resumeData.savedAt as number}
          onResume={() => {
            const s = resumeData!;
            const stageNum = s.stage as number;
            setShowResume(false); setResumeData(null);
            setStage(stageNum);
            if (s.playerBoard) {
              setTimeout(() => setPlayerBoard(s.playerBoard as (number | null)[][]), 150);
            }
          }}
          onStartFresh={() => {
            clearGameState("sudoku");
            setShowResume(false); setResumeData(null);
            loadStage(stage);
          }}
        />
      )}

      {showMap && (
        <StageMap gameSlug="sudoku" totalStages={100} currentStage={stage}
          onSelectStage={s => setStage(s)} onClose={() => setShowMap(false)} />
      )}

      <CompletionPopup open={completed} stage={stage} elapsed={finalElapsed} difficulty={getDifficulty(stage)}
        xpEarned={finalXP} onRetry={() => loadStage(stage)} onNext={() => { setCompleted(false); setStage(s => s + 1); }}
        onShare={() => {
          const text = `MindElement · Sudoku Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;
          if (navigator.share) navigator.share({ title: "MindElement", text, url: "https://mindelement.app" }).catch(() => {});
          else window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), "_blank");
        }} />
    </>
  );
}

function CompletionPopup({ open, stage, elapsed, difficulty, xpEarned, onRetry, onNext, onShare }: {
  open?: boolean; stage: number; elapsed: string; difficulty: string;
  xpEarned?: number; onRetry: () => void; onNext: () => void; onShare?: () => void;
}) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 380, damping: 28 }}
          style={{ background: "var(--color-surface)", borderRadius: 28, padding: 36, maxWidth: 340, width: "100%", textAlign: "center", boxShadow: "0 32px 80px rgba(0,0,0,0.2)" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", marginBottom: 4 }}>Stage {stage} Complete!</h2>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 24 }}>{elapsed} · {difficulty}</p>
          <div style={{ background: "var(--color-surface-2)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: "var(--color-text-secondary)", fontWeight: 600, marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>XP Earned</p>
            <p style={{ fontSize: 52, fontWeight: 700, color: "var(--color-accent-primary)", fontFamily: "var(--font-sans)" }}>{xpEarned ?? 0}</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onRetry} style={{ flex: 1, padding: 13, borderRadius: 14, border: "0.5px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", cursor: "pointer" }}>Retry</button>
            <button onClick={onNext} style={{ flex: 2, padding: 13, borderRadius: 14, border: "none", background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-secondary))", fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>Next Stage →</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function SudokuGame() { return <ErrorBoundary game="sudoku"><SudokuGameInner /></ErrorBoundary>; }
