"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "word-sling";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { OutOfTokensModal } from "@/components/ui/OutOfTokensModal";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { updateStreak } from "@/lib/supabase/streaks";
import { generateWordleBoard, scoreGuess, type WordleBoard, type LetterResult } from "@/lib/games/wordSlingGenerator";
import { createXPState, calculateXP, finalizeXP, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { consumeToken } from "@/lib/games/tokenEngine";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { GameShell } from "@/components/game";
import { useSettingsStore } from "@/store/settingsStore";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getDifficulty(s: number): Difficulty {
  if (s === 1) return "medium";
  const h = Math.abs(Math.imul(s * 2654435761, s ^ 0x9e3779b9)) % 100;
  return h < 20 ? "easy" : h < 70 ? "medium" : "hard";
}

const COLORS_LIGHT: Record<LetterResult, { bg: string; border: string; text: string; glow: string }> = {
  correct: { bg:"#22C55E", border:"#16A34A", text:"white", glow:"none" },
  present: { bg:"#F59E0B", border:"#D97706", text:"white", glow:"none" },
  absent:  { bg:"#4B5563", border:"#374151", text:"white", glow:"none" },
};
const COLORS_DARK: Record<LetterResult, { bg: string; border: string; text: string; glow: string }> = {
  correct: { bg:"rgba(57,255,20,0.15)", border:"rgba(57,255,20,0.8)", text:"var(--color-accent-secondary)", glow:"0 0 12px rgba(57,255,20,0.28), inset 0 0 6px rgba(57,255,20,0.08)" },
  present: { bg:"rgba(245,158,11,0.18)", border:"rgba(245,158,11,0.8)", text:"#F59E0B", glow:"0 0 10px rgba(245,158,11,0.25)" },
  absent:  { bg:"rgba(10,18,32,0.85)", border:"rgba(255,255,255,0.1)", text:"rgba(255,255,255,0.3)", glow:"none" },
};

const KEYBOARD_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

function WordSlingPageInner() {
  const { user } = useAuthStore();
  const { theme } = useSettingsStore();
  const isDark = theme === "dark";
  const COLORS = isDark ? COLORS_DARK : COLORS_LIGHT;
  const boardBg = isDark
    ? {background:`radial-gradient(circle, rgba(0,255,255,0.06) 1px, transparent 1px), #060d18`, backgroundSize:"18px 18px"}
    : theme==="paper"
    ? {background:`radial-gradient(circle, rgba(100,80,60,0.1) 1px, transparent 1px), var(--color-surface)`, backgroundSize:"18px 18px"}
    : {background:"var(--color-surface)"};
  const boardShadow = isDark
    ? "0 0 0 1px color-mix(in srgb, var(--color-accent-primary) 13%, transparent), 0 20px 60px rgba(0,0,0,0.55)"
    : "0 2px 8px rgba(0,0,0,0.04)";
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [board, setBoard] = useState<WordleBoard | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<LetterResult[][]>([]);
  const [current, setCurrent] = useState("");
  const [shake, setShake] = useState(false);
  const [reveal, setReveal] = useState<number | null>(null);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveXP, setLiveXP] = useState(1000);
  const [finalElapsed, setFinalElapsed] = useState("0:00");
  const [completed, setCompleted] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [lost, setLost] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [finalXP, setFinalXP] = useState(0);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string,unknown>|null>(null);
  const [hintLetters, setHintLetters] = useState<Set<number>>(new Set());
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [history, setHistory] = useState<{guesses: string[]; results: LetterResult[][]; hintLetters: Set<number>}[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    saveGameState("word-sling", {stage: s, savedAt: Date.now()});
    const diff = getDifficulty(s);
    const b = generateWordleBoard(`wordle-${diff}-${s}`, diff);
    const xp = createXPState(diff);
    setBoard(b); setGuesses([]); setResults([]); setCurrent("");
    setXpState(xp); setCompleted(false); setLost(false); setFinalXP(0);
    setHintsUsed(0); setHintLetters(new Set());
    setElapsedSeconds(0); setLiveXP(1000); setFinalElapsed("0:00");
    setSolutionRevealed(false);
    setHistory([]);
    setNextUncompleted(null);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - xp.startTime) / 1000));
      if (!useSettingsStore.getState().isPracticeMode) setLiveXP(calculateXP(xp).currentXP);
    }, 500);
    if (user) { const ok = consumeToken(user.id); if (!ok) { setShowTokenModal(true); return; } }
  }, [user]);

  const resumeChecked = useRef(false);

  useEffect(() => {
    if (!resumeChecked.current) {
      resumeChecked.current = true;
      const saved = loadGameState("word-sling");
      if (saved && (saved.stage as number) > 1) { setResumeData(saved); setShowResume(true); return; }
    }
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleRevealSolution() {
    if (!board || !xpState) return;
    setLost(true);
    setSolutionRevealed(true);
    setXpState(prev => prev ? { ...prev, startTime: Date.now() - prev.decayDuration * 1000 } : prev);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  const letterStates = new Map<string, LetterResult>();
  results.forEach((res, gi) => {
    res.forEach((r, li) => {
      const letter = guesses[gi][li];
      const prev = letterStates.get(letter);
      if (prev === "correct") return;
      if (prev === "present" && r === "absent") return;
      letterStates.set(letter, r);
    });
  });

  function handleKey(key: string) {
    if (!board || completed || lost) return;
    if (key === "ENTER" || key === "Enter") { submitGuess(); return; }
    if (key === "⌫" || key === "Backspace") { setCurrent(c => c.slice(0, -1)); return; }
    if (/^[A-Za-z]$/.test(key) && current.length < board.wordLength) { setCurrent(c => c + key.toUpperCase()); playClick(); }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) { handleKey(e.key); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [board, current, completed, lost]);

  function submitGuess() {
    if (!board || !xpState) return;
    if (current.length !== board.wordLength) { setShake(true); setTimeout(() => setShake(false), 500); playError(); return; }
    const res = scoreGuess(current, board.answer);
    setHistory(h => [...h.slice(-19), {guesses: [...guesses], results: results.map(r => [...r]), hintLetters: new Set(hintLetters)}]);
    const newGuesses = [...guesses, current];
    const newResults = [...results, res];
    setGuesses(newGuesses); setResults(newResults); setCurrent("");
    saveGameState("word-sling", {stage, guesses: newGuesses, results: newResults, hintsUsed, startTime: xpState?.startTime, savedAt: Date.now()});
    setReveal(newGuesses.length - 1);
    setTimeout(() => setReveal(null), board.wordLength * 120 + 200);
    const won = res.every(r => r === "correct");
    const outOfGuesses = newGuesses.length >= board.maxGuesses && !won;
    if (won) {
      setTimeout(() => {
        const earned = finalizeXP(xpState);
        setFinalXP(earned);
        setFinalElapsed(formatTime(Math.floor((Date.now() - xpState.startTime) / 1000)));
        setCompleted(true);
        if (timerRef.current) clearInterval(timerRef.current);
        playSuccess(); triggerConfetti();
        markStageCompleted("word-sling", stage);
        if (user) { updateStreak(user.id); saveScore({ user_id:user.id, game_slug:"word-sling", stage_number:stage, difficulty:getDifficulty(stage), xp_earned:earned, time_taken:Math.floor((Date.now()-xpState.startTime)/1000), hints_used:hintsUsed }); }
      }, board.wordLength * 120 + 400);
    } else if (outOfGuesses) {
      setTimeout(() => { setLost(true); if (timerRef.current) clearInterval(timerRef.current); playError(); }, board.wordLength * 120 + 400);
    }
  }

  function handleUndo() {
    if (history.length === 0 || completed || lost) return;
    const last = history[history.length - 1];
    setGuesses(last.guesses); setResults(last.results); setHintLetters(last.hintLetters);
    setCurrent("");
    setHistory(h => h.slice(0, -1));
    playClick();
  }

  function handleHint() {
    if (!board || !xpState || hintsUsed >= 3 || completed || solutionRevealed) return;
    const known = new Set(hintLetters);
    results.forEach(res => res.forEach((r, i) => { if (r === "correct") known.add(i); }));
    const unknown = Array.from({length:board.wordLength},(_,i)=>i).filter(i => !known.has(i));
    if (!unknown.length) return;
    const idx = unknown[Math.floor(Math.random() * unknown.length)];
    setHintLetters(prev => new Set([...prev, idx]));
    setHintsUsed(h => h + 1);
    setXpState(prev => prev ? { ...prev, hintsUsed: Math.min(prev.hintsUsed + 1, prev.maxHints) } : prev);
  }

  if (!board || !xpState) return (
    <div style={{ minHeight:"100vh", background:"var(--color-bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"var(--color-text-secondary)", fontSize:13 }}>Loading...</p>
    </div>
  );

  const cellSize = Math.min(56, Math.floor((Math.min(typeof window!=="undefined"?window.innerWidth:400,400)-32)/board.wordLength));

  return (
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Word Sling"
        stageNumber={stage}
        difficulty={getDifficulty(stage)}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
      >
        <GamePageSchema slug="word-sling" />

        {hintLetters.size > 0 && (
          <div style={{ fontSize:11, color:"var(--color-accent-secondary)", fontWeight:700, fontFamily:"var(--font-mono)", letterSpacing:"0.06em",
            textShadow:isDark?"0 0 10px rgba(57,255,20,0.4)":"none" }}>
            HINT: POS {[...hintLetters].map(i=>i+1).join(",")} = {[...hintLetters].map(i=>board.answer[i]).join(",")}
          </div>
        )}

        <div style={{...boardBg, borderRadius:16, padding:"12px 10px", boxShadow:boardShadow, border:isDark?"1px solid color-mix(in srgb, var(--color-accent-primary) 12%, transparent)":"none"}}>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {Array.from({length:board.maxGuesses},(_,gi)=>{
              const guess = gi<guesses.length?guesses[gi]:gi===guesses.length?current:"";
              const res = results[gi];
              const isRevealing = reveal===gi;
              const isActiveRow = gi === guesses.length && !completed && !lost;
              return (
                <motion.div key={gi} animate={shake&&gi===guesses.length?{x:[-6,6,-6,6,0]}:{}} transition={{duration:0.3}} style={{display:"flex",gap:6,justifyContent:"center"}}>
                  {Array.from({length:board.wordLength},(_,li)=>{
                    const letter = guess[li]??"";
                    const result = res?.[li];
                    const color = result ? COLORS[result] : null;
                    const emptyBg = isDark ? "rgba(6,13,24,0.85)" : "var(--color-surface)";
                    const emptyBorder = isDark
                      ? letter ? "2px solid rgba(0,255,255,0.55)" : isActiveRow ? "1.5px solid rgba(0,255,255,0.2)" : "1px solid rgba(255,255,255,0.07)"
                      : `2px solid ${letter ? "var(--color-accent-primary)" : "var(--color-border)"}`;
                    return (
                      <motion.div key={li}
                        animate={result&&isRevealing?{rotateX:[0,-90,0]}:{}}
                        transition={{delay:(reveal===gi?li*120:0)/1000,duration:0.3}}
                        style={{
                          width:cellSize, height:cellSize,
                          border: color ? `2px solid ${color.border}` : emptyBorder,
                          borderRadius:8,
                          background: color ? color.bg : emptyBg,
                          boxShadow: color ? color.glow : (isDark && letter) ? "0 0 8px rgba(0,255,255,0.1)" : "none",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:Math.round(cellSize*0.42), fontWeight:700,
                          color: color ? color.text : "var(--color-text-primary)",
                          fontFamily:"var(--font-mono)", letterSpacing:"0.05em",
                        }}>
                        {letter}
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
        </div>

        {(lost||solutionRevealed) && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
            style={{padding:"10px 20px",borderRadius:14,
              background:isDark?"color-mix(in srgb, var(--color-error) 10%, rgba(6,13,24,0.95))":"color-mix(in srgb, var(--color-error) 10%, var(--color-surface))",
              border:`1px solid color-mix(in srgb, var(--color-error) 22%, transparent)`,
              fontSize:12,fontWeight:700,color:"var(--color-error)",fontFamily:"var(--font-mono)",letterSpacing:"0.08em"}}>
            {solutionRevealed?"SOLUTION: ":"ANSWER: "}{board.answer}
          </motion.div>
        )}

        <div style={{ display:"flex", flexDirection:"column", gap:6, width:"100%", maxWidth:480 }}>
          {KEYBOARD_ROWS.map((row,ri)=>(
            <div key={ri} style={{ display:"flex", justifyContent:"center", gap:5 }}>
              {row.map(key=>{
                const state = letterStates.get(key);
                const color = state ? COLORS[state] : null;
                const isWide = key==="ENTER"||key==="⌫";
                const keyBg = color ? color.bg : (isDark ? "rgba(12,22,38,0.85)" : "var(--color-surface-2)");
                const keyBorder = color
                  ? `1px solid ${color.border}`
                  : isDark ? "1px solid rgba(255,255,255,0.08)" : "none";
                const keyGlow = color && isDark ? color.glow : "none";
                return (
                  <motion.button key={key} whileTap={{scale:0.9}}
                    onClick={()=>handleKey(key==="⌫"?"Backspace":key==="ENTER"?"Enter":key)}
                    style={{width:isWide?58:34,height:48,borderRadius:8,border:keyBorder,background:keyBg,
                      color:color?color.text:isDark?"rgba(255,255,255,0.75)":"var(--color-text-secondary)",
                      fontSize:isWide?10:13,fontWeight:700,cursor:"pointer",outline:"none",
                      boxShadow:keyGlow,
                      fontFamily:"var(--font-mono)",letterSpacing:isWide?"0.04em":"0.08em"}}>
                    {key}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={()=>{ if(stage>1){ clearGameState(GAME_SLUG); setStage(s=>s-1); } }} disabled={stage===1}
            style={{padding:"8px 16px",borderRadius:10,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:11,color:"var(--color-text-secondary)",opacity:stage===1?0.4:1,fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:600}}>← PREV</button>
          <span style={{fontSize:11,color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)",letterSpacing:"0.06em"}}>STAGE {stage} / {TOTAL_STAGES}</span>
          <button onClick={()=>{ clearGameState(GAME_SLUG); setStage(s=>s+1); }}
            style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:10,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:"pointer",fontSize:11,color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:600}}>NEXT <ChevronRight size={13}/></button>
        </div>
      </GameShell>

      <OutOfTokensModal gameName="Word Sling" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>
      {showResume && resumeData && (
        <ResumeModal
          gameSlug="word-sling"
          stageNumber={resumeData.stage as number}
          savedAt={resumeData.savedAt as number}
          onDismiss={() => { setShowResume(false); setResumeData(null); }}
          onResume={() => {
            const s = resumeData!;
            setShowResume(false); setResumeData(null);
            setStage(s.stage as number);
            if (s.guesses) setTimeout(() => { setGuesses(s.guesses as string[]); setResults(s.results as LetterResult[][]); }, 150);
          }}
          onStartFresh={() => {
            clearGameState("word-sling"); setShowResume(false); setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
      {showMap&&<StageMap gameSlug="word-sling" totalStages={100} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Word Sling Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
      <GameCompleteModal
        open={showGameComplete}
        gameName="Word Sling"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function WordSlingPage(){return<ErrorBoundary game="word-sling"><WordSlingPageInner/></ErrorBoundary>;}