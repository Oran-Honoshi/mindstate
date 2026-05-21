"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "word-climb";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { Navbar } from "@/components/nav/Navbar";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { HintButton } from "@/components/ui/HintButton";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { createXPState, calculateXP, finalizeXP, formatElapsed, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";

// ── Word ladder data ──────────────────────────────────────────────────────────
// Each puzzle: start word → end word, with a known solution path length
// Words differ by exactly one letter at each step, all steps must be valid words

function getDifficulty(s: number): Difficulty {
  if (s === 1) return "easy";
  const h = Math.abs(Math.imul(s * 2654435761, s ^ 0x9e3779b9)) % 100;
  return h < 30 ? "easy" : h < 70 ? "medium" : "hard";
}

// Seeded puzzle bank — easy (3 steps), medium (4 steps), hard (5+ steps)
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

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap, setSnap] = useState(() => calculateXP(xpState));
  useEffect(() => {
    const iv = setInterval(() => setSnap(calculateXP(xpState)), 500);
    return () => clearInterval(iv);
  }, [xpState]);
  const pct = snap.percentRemaining;
  const color = pct > 0.6 ? "#22C55E" : pct > 0.3 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, height:4, background:"var(--bg3)", borderRadius:2, overflow:"hidden" }}>
        <motion.div animate={{ width:`${pct*100}%` }} transition={{ duration:0.5 }}
          style={{ height:"100%", background:color, borderRadius:2 }}/>
      </div>
      <span style={{ fontSize:13, fontWeight:700, color, fontFamily:"monospace", minWidth:36 }}>{snap.currentXP}</span>
      <span style={{ fontSize:11, color:"var(--text4)" }}>XP</span>
    </div>
  );
}

function WordClimbInner() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [userPath, setUserPath] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const diff = getDifficulty(stage);
  const [startWord, endWord, solution] = getPuzzle(stage, diff);
  const wordLen = startWord.length;
  const diffColor = diff === "easy" ? "#22C55E" : diff === "medium" ? "#F59E0B" : "#EF4444";

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
    setError("");
    setElapsed("00:00");
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
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
    const newPath = [...userPath, word];
    setUserPath(newPath);
    setCurrent("");
    setError("");
    playClick();
    if (word === endWord) {
      const earned = finalizeXP(xpState);
      setFinalXP(earned);
      setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess();
      setTimeout(() => triggerConfetti(), 80);
      markStageCompleted("word-climb", stage);
      if (user) {
        updateStreak(user.id);
        saveScore({ user_id: user.id, game_slug: "word-climb", stage_number: stage,
          difficulty: getDifficulty(stage), xp_earned: earned,
          time_taken: Math.floor((Date.now() - xpState.startTime) / 1000) });
      }
    }
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

  return (
    <div className="game-page">
      <Navbar/>
      <GamePageSchema slug="word-climb" />
      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"76px 16px 32px", gap:18 }}>

        {/* Header */}
        <div style={{ width:"100%", maxWidth:480, background:"var(--surface)", borderRadius:20, border:"0.5px solid var(--border)", padding:"16px 20px", boxShadow:"var(--shadow-sm)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Link href="/games" style={{ color:"var(--text4)", textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13 }}><ArrowLeft size={14}/> Games</Link>
              <div style={{ width:1, height:16, background:"var(--border2)" }}/>
              <span style={{ fontSize:12, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif" }}>Word Climb</span>
              <div style={{ width:1, height:16, background:"var(--border2)" }}/>
              <span style={{ fontSize:18, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif" }}>{stage}</span>
              <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10, background:`${diffColor}15`, color:diffColor }}>{diff.toUpperCase()}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:12, color:"var(--text4)", fontFamily:"monospace" }}>{elapsed}</span>
              <button onClick={() => loadStage(stage)} style={{ padding:7, borderRadius:9, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", color:"var(--text4)", display:"flex" }}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {/* Goal */}
        <div style={{ display:"flex", alignItems:"center", gap:16, fontSize:13, color:"var(--text3)" }}>
          <span style={{ fontWeight:700, fontSize:20, color:"var(--text1)", fontFamily:"Georgia,serif", letterSpacing:"0.08em" }}>{startWord}</span>
          <span>→</span>
          <span style={{ fontWeight:700, fontSize:20, color:"#4F6EF7", fontFamily:"Georgia,serif", letterSpacing:"0.08em" }}>{endWord}</span>
        </div>
        <p style={{ fontSize:11, color:"var(--text4)" }}>Change one letter at a time · Each step must be a valid word</p>

        {/* Path so far */}
        <div style={{ display:"flex", flexDirection:"column", gap:6, width:"100%", maxWidth:320, alignItems:"center" }}>
          {userPath.map((word, i) => (
            <div key={i} style={{
              padding:"10px 24px", borderRadius:12, fontSize:18, fontWeight:700,
              fontFamily:"Georgia,serif", letterSpacing:"0.1em",
              background: word === endWord ? "#F0FDF4" : i === 0 ? "var(--bg2)" : "var(--surface)",
              border: `1.5px solid ${word === endWord ? "#86EFAC" : "var(--border)"}`,
              color: word === endWord ? "#16A34A" : "var(--text1)",
            }}>
              {word}
            </div>
          ))}

          {/* Input */}
          {!completed && (
            <div style={{ display:"flex", gap:8, width:"100%", justifyContent:"center" }}>
              <input
                value={current}
                onChange={e => { setCurrent(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
                maxLength={wordLen}
                placeholder={`${wordLen}-letter word`}
                style={{
                  padding:"10px 16px", borderRadius:12, border:"1.5px solid var(--border2)",
                  background:"var(--surface)", fontSize:16, fontWeight:700,
                  fontFamily:"Georgia,serif", letterSpacing:"0.1em", textAlign:"center",
                  color:"var(--text1)", outline:"none", width:160,
                  textTransform:"uppercase",
                }}
              />
              <button onClick={handleSubmit}
                style={{ padding:"10px 16px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                Go
              </button>
            </div>
          )}
          {error && <p style={{ fontSize:12, color:"#EF4444", fontWeight:600 }}>{error}</p>}
        </div>

        {/* Controls */}
        <HintButton hintsLeft={3 - hintsUsed} xpCost={100} onUseHint={handleHint} disabled={completed}/>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => stage > 1 && setStage(s => s - 1)} disabled={stage === 1}
            style={{ padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:stage>1?"pointer":"not-allowed", fontSize:12, color:"var(--text3)", opacity:stage===1?0.4:1 }}>← Prev</button>
          <span style={{ fontSize:12, color:"var(--text4)" }}>Stage {stage} of 100</span>
          <button onClick={() => setStage(s => s + 1)}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--border2)", background:"var(--surface)", cursor:"pointer", fontSize:12, color:"var(--text2)", fontWeight:600 }}>
            Next <ChevronRight size={13}/>
          </button>
        </div>
      </main>

      {/* Completion */}
      {completed && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:24 }}>
          <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }}
            style={{ background:"var(--surface)", borderRadius:28, padding:36, maxWidth:340, width:"100%", textAlign:"center", boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
            <h2 style={{ fontSize:26, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", marginBottom:4 }}>
              {startWord} → {endWord}
            </h2>
            <p style={{ fontSize:13, color:"var(--text4)", marginBottom:24 }}>{userPath.length - 1} steps · {elapsed}</p>
            <div style={{ background:"var(--bg2)", borderRadius:16, padding:20, marginBottom:20 }}>
              <p style={{ fontSize:11, color:"var(--text4)", fontWeight:600, marginBottom:4, letterSpacing:"0.1em", textTransform:"uppercase" }}>XP Earned</p>
              <p style={{ fontSize:52, fontWeight:700, color:"#4F6EF7", fontFamily:"Georgia,serif" }}>{finalXP}</p>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => loadStage(stage)}
                style={{ flex:1, padding:13, borderRadius:14, border:"0.5px solid var(--border2)", background:"var(--surface)", fontSize:13, fontWeight:600, color:"var(--text2)", cursor:"pointer" }}>
                Retry
              </button>
              <button onClick={() => { setCompleted(false); setStage(s => s + 1); }}
                style={{ flex:2, padding:13, borderRadius:14, border:"none", background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", fontSize:13, fontWeight:700, color:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                Next Stage →
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

    </div>
  );
}
export default function WordClimbPage() {
  return (
    <ErrorBoundary game="word-climb">
      <WordClimbInner/>
    </ErrorBoundary>
  );
}