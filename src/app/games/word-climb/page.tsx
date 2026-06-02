"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "word-climb";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { createXPState, calculateXP, finalizeXP, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { clearGameState } from "@/lib/games/gameStateStorage";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { GameShell } from "@/components/game";
import { useSettingsStore } from "@/store/settingsStore";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getDifficulty(s: number): Difficulty {
  if (s === 1) return "easy";
  const h = Math.abs(Math.imul(s * 2654435761, s ^ 0x9e3779b9)) % 100;
  return h < 30 ? "easy" : h < 70 ? "medium" : "hard";
}

const PUZZLES: Record<Difficulty, [string, string, string[]][]> = {
  easy: [
    ["CAT",  "DOG",  ["CAT","COT","DOT","DOG"]],
    ["HOT",  "COP",  ["HOT","HOP","COP"]],
    ["SAME", "CAME", ["SAME","CAME"]],
    ["COLD", "WARM", ["COLD","CORD","WORD","WARD","WARM"]],
    ["LEAD", "GOLD", ["LEAD","LOAD","GOAD","GOLD"]],
    ["HATE", "LOVE", ["HATE","HAVE","CAVE","CAVE","LOVE"]],
    ["FAST", "SLOW", ["FAST","LAST","LASH","LASH","SLOW"]],
    ["HARD", "EASY", ["HARD","HARE","BARE","BASE","EASE","EASY"]],
  ],
  medium: [
    ["STONE", "MONEY", ["STONE","STORE","SCORE","MORE","MOLE","MOLE","MONEY"]],
    ["BLACK", "WHITE", ["BLACK","SLACK","SLICK","SLICE","SPICE","SPIRE","SHIRE","SHARE","SHAME","SHALE","WHALE","WHILE","WHITE"]],
    ["BREAD", "TOAST", ["BREAD","BEAD","BEAT","PEAT","PEST","PAST","MAST","MAST","TOAST"]],
    ["FLOOR", "BRAIN", ["FLOOR","FLOOD","BLOOD","BROOD","BROAD","BREAD","BRAID","BRAIN"]],
  ],
  hard: [
    ["WINTER", "SUMMER", ["WINTER","WINNER","SINNER","SINGER","LINGER","LINGER","LONGER","LOUDER","LOUVER","LOUVRE","LOUTRE","LOUTRE","SUMMER"]],
    ["PLANET", "ROCKET", ["PLANET","PLANES","PLANED","PLANER","PLATER","PLATED","PLATES","SLATES","STATES","STATES","ROCKET"]],
  ],
};

function getPuzzle(stage: number, diff: Difficulty): [string, string, string[]] {
  const bank = PUZZLES[diff];
  return bank[stage % bank.length];
}

function isOneLetterAway(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diffs = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) diffs++;
  }
  return diffs === 1;
}

function WordClimbInner() {
  const { user } = useAuthStore();
  const { theme } = useSettingsStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveXP, setLiveXP] = useState(1000);
  const [finalElapsed, setFinalElapsed] = useState("0:00");
  const [completed, setCompleted] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [userPath, setUserPath] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[][]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const diff = getDifficulty(stage);
  const [startWord, endWord, solution] = getPuzzle(stage, diff);
  const wordLen = startWord.length;

  const loadStage = useCallback((s: number) => {
    const d = getDifficulty(s);
    const xp = createXPState(d);
    const [sw] = getPuzzle(s, d);
    setXpState(xp);
    setUserPath([sw]);
    setCurrent("");
    setCompleted(false);
    setFinalXP(0);
    setHintsUsed(0);
    setHistory([]);
    setError("");
    setElapsedSeconds(0);
    setLiveXP(1000);
    setFinalElapsed("0:00");
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - xp.startTime) / 1000));
      if (!useSettingsStore.getState().isPracticeMode) setLiveXP(calculateXP(xp).currentXP);
    }, 500);
  }, []);

  useEffect(() => {
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleSubmit() {
    if (!xpState || completed) return;
    const word = current.toUpperCase().trim();
    if (word.length !== wordLen) { setError(`Must be ${wordLen} letters`); return; }
    const last = userPath[userPath.length - 1];
    if (!isOneLetterAway(word, last)) { setError("Must differ by exactly one letter"); playError(); return; }
    setHistory(h => [...h.slice(-19), [...userPath]]);
    const newPath = [...userPath, word];
    setUserPath(newPath);
    setCurrent("");
    setError("");
    playClick();
    if (word === endWord) {
      const earned = finalizeXP(xpState);
      setFinalXP(earned);
      setFinalElapsed(formatTime(Math.floor((Date.now() - xpState.startTime) / 1000)));
      setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess();
      setTimeout(() => triggerConfetti(), 80);
      markStageCompleted("word-climb", stage);
      if (user) {
        updateStreak(user.id);
        saveScore({ user_id: user.id, game_slug: "word-climb", stage_number: stage,
          difficulty: getDifficulty(stage), xp_earned: earned,
          time_taken: Math.floor((Date.now() - xpState.startTime) / 1000),
          hints_used: hintsUsed });
      }
    }
  }

  function handleUndo() {
    if (history.length === 0 || completed) return;
    setUserPath(history[history.length - 1]);
    setCurrent("");
    setError("");
    setHistory(h => h.slice(0, -1));
    playClick();
  }

  function handleHint() {
    if (!xpState || hintsUsed >= 3 || completed) return;
    const nextIdx = userPath.length;
    if (nextIdx < solution.length) {
      setUserPath(prev => [...prev, solution[nextIdx]]);
      setCurrent("");
    }
    setHintsUsed(h => h + 1);
    setXpState(prev => prev ? {...prev, hintsUsed: Math.min(prev.hintsUsed + 1, prev.maxHints)} : prev);
    playError();
  }

  if (!xpState) return null;

  const isDark = theme === "dark";

  return (
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Word Climb"
        stageNumber={stage}
        difficulty={getDifficulty(stage)}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3 - hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
      >
        <GamePageSchema slug="word-climb" />

        <div style={{ display:"flex", alignItems:"center", gap:16, fontSize:13, color:"var(--color-text-secondary)" }}>
          <span style={{ fontWeight:700, fontSize:20, color:"var(--color-text-primary)", fontFamily:"var(--font-mono)", letterSpacing:"0.1em" }}>{startWord}</span>
          <span style={{ color:isDark?"rgba(0,255,255,0.4)":"var(--color-text-secondary)", fontFamily:"var(--font-mono)" }}>→</span>
          <span style={{ fontWeight:700, fontSize:20, color:"var(--color-accent-secondary)", fontFamily:"var(--font-mono)", letterSpacing:"0.1em",
            textShadow:isDark?"0 0 12px rgba(57,255,20,0.5)":"none" }}>{endWord}</span>
        </div>
        <p style={{ fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)", letterSpacing:"0.04em" }}>CHANGE ONE LETTER AT A TIME · EACH STEP MUST BE A REAL WORD</p>

        <div style={{ display:"flex", flexDirection:"column", gap:6, width:"100%", maxWidth:340, alignItems:"center" }}>
          {userPath.map((word, i) => {
            const isEnd = word === endWord;
            const isStart = i === 0;
            const isLast = i === userPath.length - 1 && !isEnd;
            const tileBg = isDark
              ? isEnd ? "rgba(57,255,20,0.07)" : isStart ? "rgba(0,255,255,0.05)" : "rgba(10,18,32,0.8)"
              : isEnd ? "color-mix(in srgb, var(--color-accent-secondary) 10%, var(--color-surface))" : isStart ? "var(--color-surface-2)" : "var(--color-surface)";
            const tileBorder = isDark
              ? isEnd ? "1.5px solid rgba(57,255,20,0.6)" : isLast ? "1.5px solid rgba(0,255,255,0.4)" : isStart ? "1px solid rgba(0,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)"
              : `1.5px solid ${isEnd ? "var(--color-accent-secondary)" : "var(--color-border)"}`;
            const tileShadow = isDark
              ? isEnd ? "0 0 16px rgba(57,255,20,0.2), inset 0 0 8px rgba(57,255,20,0.06)" : isLast ? "0 0 10px rgba(0,255,255,0.1)" : "none"
              : "none";
            const tileColor = isDark
              ? isEnd ? "var(--color-accent-secondary)" : isStart ? "var(--color-accent-primary)" : "var(--color-text-primary)"
              : isEnd ? "var(--color-accent-secondary)" : "var(--color-text-primary)";
            return (
              <motion.div key={i}
                initial={i > 0 ? {scale:0.85, opacity:0} : {}}
                animate={isEnd ? {scale:[1,1.06,1], opacity:1} : {scale:1, opacity:1}}
                transition={isEnd ? {duration:0.4, ease:"easeOut"} : {type:"spring", stiffness:380, damping:25}}
                style={{ padding:"10px 24px", borderRadius:12, fontSize:18, fontWeight:700,
                  fontFamily:"var(--font-mono)", letterSpacing:"0.12em",
                  background:tileBg, border:tileBorder, color:tileColor, boxShadow:tileShadow,
                  width:"100%", textAlign:"center" }}>
                {word.split("").map((ch, ci) => {
                  const prevWord = i > 0 ? userPath[i-1] : null;
                  const changed = prevWord && ch !== prevWord[ci];
                  return (
                    <span key={ci} style={{ color: changed && isDark ? "var(--color-accent-primary)" : tileColor }}>
                      {ch}
                    </span>
                  );
                })}
              </motion.div>
            );
          })}

          {!completed && (
            <motion.div animate={error ? {x:[-5,5,-5,5,0]} : {}} transition={{duration:0.3}}
              style={{ display:"flex", gap:8, width:"100%", justifyContent:"center" }}>
              <input
                value={current}
                onChange={e => { setCurrent(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
                maxLength={wordLen}
                placeholder={`${wordLen} LETTERS`}
                style={{
                  padding:"10px 16px", borderRadius:12,
                  border: isDark ? `1.5px solid ${error ? "rgba(255,68,68,0.6)" : "rgba(0,255,255,0.3)"}` : `1.5px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
                  background: isDark ? "rgba(6,13,24,0.9)" : "var(--color-surface)",
                  fontSize:16, fontWeight:700, fontFamily:"var(--font-mono)", letterSpacing:"0.12em",
                  textAlign:"center", color:"var(--color-text-primary)", outline:"none", width:160,
                  textTransform:"uppercase",
                  boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "none",
                  transition:"border-color 0.2s",
                }}
                onFocus={e => { if(isDark) e.currentTarget.style.borderColor="rgba(0,255,255,0.75)"; }}
                onBlur={e => { if(isDark) e.currentTarget.style.borderColor=error?"rgba(255,68,68,0.6)":"rgba(0,255,255,0.3)"; }}
              />
              <motion.button onClick={handleSubmit} whileHover={{scale:1.05,boxShadow:isDark?"0 0 14px rgba(0,255,255,0.22)":"none"}}
                style={{ padding:"10px 16px", borderRadius:12, border:"none",
                  background:"linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-secondary))",
                  color:"#060d18", fontSize:11, fontWeight:700, cursor:"pointer",
                  fontFamily:"var(--font-mono)", letterSpacing:"0.08em", textTransform:"uppercase",
                  boxShadow:isDark?"0 0 10px rgba(0,255,255,0.18)":"none" }}>
                GO
              </motion.button>
            </motion.div>
          )}
          {error && <p style={{ fontSize:11, color:"var(--color-error)", fontWeight:600, fontFamily:"var(--font-mono)", letterSpacing:"0.05em" }}>{error.toUpperCase()}</p>}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => { if (stage > 1) { clearGameState(GAME_SLUG); setStage(s => s - 1); } }} disabled={stage === 1}
            style={{ padding:"8px 16px", borderRadius:10, border:"0.5px solid var(--color-border)", background:"var(--color-surface)", cursor:stage>1?"pointer":"not-allowed", fontSize:11, color:"var(--color-text-secondary)", opacity:stage===1?0.4:1, fontFamily:"var(--font-mono)", letterSpacing:"0.06em", textTransform:"uppercase", fontWeight:600 }}>← PREV</button>
          <span style={{ fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)", letterSpacing:"0.06em" }}>STAGE {stage} / {TOTAL_STAGES}</span>
          <button onClick={() => { clearGameState(GAME_SLUG); setStage(s => s + 1); }}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 16px", borderRadius:10, border:"0.5px solid var(--color-border)", background:"var(--color-surface)", cursor:"pointer", fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)", letterSpacing:"0.06em", textTransform:"uppercase", fontWeight:600 }}>
            NEXT <ChevronRight size={13}/>
          </button>
        </div>
      </GameShell>

      {completed && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(16px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:24 }}>
          <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} transition={{type:"spring",stiffness:380,damping:28}}
            style={{ background:isDark?"rgba(8,16,28,0.97)":"var(--color-surface)", borderRadius:28, padding:36, maxWidth:340, width:"100%", textAlign:"center",
              boxShadow:isDark?"0 0 0 1px rgba(57,255,20,0.22), 0 32px 80px rgba(0,0,0,0.7), 0 0 40px rgba(57,255,20,0.07)":"0 32px 80px rgba(0,0,0,0.2)",
              border:isDark?"none":"0.5px solid var(--color-border)" }}>
            <div style={{ fontSize:32, marginBottom:12, fontFamily:"var(--font-mono)", color:"var(--color-accent-secondary)", textShadow:isDark?"0 0 20px rgba(57,255,20,0.5)":"none" }}>✓</div>
            <h2 style={{ fontSize:18, fontWeight:700, color:isDark?"var(--color-accent-secondary)":"var(--color-text-primary)", fontFamily:"var(--font-mono)", marginBottom:6, letterSpacing:"0.08em" }}>
              {startWord} → {endWord}
            </h2>
            <p style={{ fontSize:11, color:"var(--color-text-secondary)", marginBottom:24, fontFamily:"var(--font-mono)", letterSpacing:"0.06em" }}>
              {userPath.length - 1} STEPS · {finalElapsed}
            </p>
            <div style={{ background:isDark?"rgba(57,255,20,0.06)":"var(--color-surface-2)", border:isDark?"1px solid rgba(57,255,20,0.18)":"none", borderRadius:16, padding:20, marginBottom:20, boxShadow:isDark?"0 0 20px rgba(57,255,20,0.06)":"none" }}>
              <p style={{ fontSize:10, color:"var(--color-text-secondary)", fontWeight:600, marginBottom:4, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"var(--font-mono)" }}>XP EARNED</p>
              <p style={{ fontSize:52, fontWeight:700, color:isDark?"var(--color-accent-secondary)":"var(--color-accent-primary)", fontFamily:"var(--font-mono)" }}>{finalXP}</p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => loadStage(stage)}
                style={{ flex:1, padding:13, borderRadius:14, border:"0.5px solid var(--color-border)", background:"var(--color-surface)", fontSize:11, fontWeight:600, color:"var(--color-text-secondary)", cursor:"pointer", fontFamily:"var(--font-mono)", letterSpacing:"0.06em", textTransform:"uppercase" }}>
                RETRY
              </button>
              <button onClick={() => { setCompleted(false); setStage(s => s + 1); }}
                style={{ flex:2, padding:13, borderRadius:14, border:"none", background:"linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-secondary))", fontSize:11, fontWeight:700, color:"#060d18", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontFamily:"var(--font-mono)", letterSpacing:"0.06em", textTransform:"uppercase", boxShadow:isDark?"0 0 16px rgba(0,255,255,0.2)":"none" }}>
                NEXT →
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <GameCompleteModal
        open={showGameComplete}
        gameName="Word Climb"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function WordClimbPage() {
  return (
    <ErrorBoundary game="word-climb">
      <WordClimbInner/>
    </ErrorBoundary>
  );
}