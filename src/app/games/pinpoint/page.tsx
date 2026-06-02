"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "pinpoint";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

interface Puzzle {
  answer: string;
  clues: string[];
}

const PUZZLES: Puzzle[] = [
  { answer: "CHESS", clues: ["Invented in India around 600 AD", "Has 64 squares", "Each side starts with 16 pieces", "Kings, queens, bishops, knights", "Strategy board game"] },
  { answer: "PIZZA", clues: ["Originated in Naples", "Margherita is the classic variety", "Mozzarella is a key ingredient", "Circular baked dough", "Popular Italian dish"] },
  { answer: "PIANO", clues: ["Invented by Bartolomeo Cristofori", "Has 88 keys", "Strings are struck by hammers", "Both percussion and string instrument", "Musical keyboard instrument"] },
  { answer: "SHARK", clues: ["Has no bones, only cartilage", "Some species have 7 rows of teeth", "Hammerhead is a well-known species", "Apex ocean predator", "Cartilaginous fish"] },
  { answer: "TOKYO", clues: ["Hosts more Michelin stars than any other city", "Was formerly called Edo", "Population exceeds 13 million", "Located on Honshu island", "Capital of Japan"] },
  { answer: "COFFEE", clues: ["Second most traded commodity after oil", "Originated in Ethiopia", "Contains chlorogenic acids", "Made from roasted beans", "Popular caffeinated drink"] },
  { answer: "DIAMOND", clues: ["Hardest natural substance on Earth", "Made of pure carbon", "Takes billions of years to form", "Used in engagement rings", "Precious gemstone"] },
  { answer: "SOCCER", clues: ["Has 17 laws of the game", "Played with a spherical ball", "Each team has 11 players", "Goal is 8 yards wide", "World's most popular sport"] },
  { answer: "AMAZON", clues: ["Carries 20% of all fresh water to the ocean", "Home to over 3,000 fish species", "Named after female warriors", "Flows through Brazil", "Largest river by discharge"] },
  { answer: "GUITAR", clues: ["Descended from the lute", "Standard tuning is EADGBE", "Has 6 strings typically", "Frets define pitch", "Popular stringed instrument"] },
  { answer: "PENGUIN", clues: ["Only found in the Southern Hemisphere naturally", "Has a layer of fat called blubber", "Emperor species can dive 1,800 feet", "Cannot fly", "Flightless seabird"] },
  { answer: "VOLCANO", clues: ["Named after Vulcan, Roman god of fire", "Hawaii has the world's most active", "Magma becomes lava on the surface", "Can create new land", "Geological opening in the Earth's crust"] },
  { answer: "BITCOIN", clues: ["Created by Satoshi Nakamoto", "Limited to 21 million units", "Uses blockchain technology", "Mined by solving math problems", "First decentralized cryptocurrency"] },
  { answer: "LIBRARY", clues: ["Alexandria's was among the largest in antiquity", "Dewey Decimal System organizes books", "Lending is its primary function", "Houses books and media", "Public repository of knowledge"] },
  { answer: "CHOCOLATE", clues: ["Derived from cacao pods", "First consumed as a bitter drink", "Belgium and Switzerland are famous producers", "Contains theobromine", "Sweet confection loved worldwide"] },
  { answer: "MARATHON", clues: ["Distance is 26.2 miles", "Named after a Greek battle", "First modern Olympic event in 1896", "Pheidippides is the mythical origin", "Long-distance running race"] },
  { answer: "ECLIPSE", clues: ["Saros cycle predicts them every 18 years", "Corona is visible only during totality", "Path of totality is about 100 miles wide", "Moon blocks the sun", "Celestial alignment event"] },
  { answer: "OPERA", clues: ["La Scala in Milan is a famous venue", "Libretto is the text", "Can last 5 hours or more", "Combines singing and orchestra", "Theatrical art form"] },
  { answer: "PYRAMID", clues: ["Giza's is the only ancient wonder still standing", "Built as royal tombs", "Great Sphinx guards the most famous one", "Built by ancient Egyptians", "Iconic triangular monument"] },
  { answer: "TORNADO", clues: ["Fujita scale measures intensity", "Tornado Alley in the US is most active zone", "Can travel up to 300 mph", "Funnel-shaped cloud", "Violent rotating column of air"] },
];

function getDifficulty(s: number): Difficulty {
  if (s <= 30) return "easy";
  if (s <= 70) return "medium";
  return "hard";
}

function getPuzzle(stage: number): Puzzle {
  return PUZZLES[stage % PUZZLES.length];
}

function getInitialClues(diff: Difficulty): number {
  return diff === "easy" ? 2 : diff === "medium" ? 1 : 1;
}

function PinpointInner() {
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
  const [lost, setLost] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedClues, setRevealedClues] = useState(1);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const [history, setHistory] = useState<{guesses: string[]; revealedClues: number}[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const diff = getDifficulty(stage);
  const puzzle = getPuzzle(stage);
  const maxGuesses = diff === "easy" ? 5 : diff === "medium" ? 4 : 3;

  const loadStage = useCallback((s: number) => {
    const d = getDifficulty(s);
    const xp = createXPState(d);
    setXpState(xp);
    setRevealedClues(getInitialClues(d));
    setGuess("");
    setGuesses([]);
    setCompleted(false);
    setLost(false);
    setFinalXP(0);
    setHintsUsed(0);
    setHistory([]);
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

  function handleGuess() {
    if (!xpState || completed || lost) return;
    const g = guess.trim().toUpperCase();
    if (!g) return;
    setHistory(h => [...h.slice(-19), {guesses: [...guesses], revealedClues}]);
    const newGuesses = [...guesses, g];
    setGuesses(newGuesses);
    setGuess("");
    playClick();

    if (g === puzzle.answer.toUpperCase()) {
      const earned = finalizeXP(xpState);
      setFinalXP(earned);
      setFinalElapsed(formatTime(Math.floor((Date.now() - xpState.startTime) / 1000)));
      setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess();
      setTimeout(() => triggerConfetti(), 80);
      markStageCompleted("pinpoint", stage);
      if (user) {
        updateStreak(user.id);
        saveScore({ user_id: user.id, game_slug: "pinpoint", stage_number: stage,
          difficulty: getDifficulty(stage), xp_earned: earned,
          time_taken: Math.floor((Date.now() - xpState.startTime) / 1000),
          hints_used: hintsUsed });
      }
    } else {
      playError();
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (revealedClues < puzzle.clues.length) {
        setRevealedClues(r => r + 1);
      }
      if (newGuesses.length >= maxGuesses) {
        setLost(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  }

  function handleUndo() {
    if (history.length === 0 || completed || lost) return;
    const last = history[history.length - 1];
    setGuesses(last.guesses);
    setRevealedClues(last.revealedClues);
    setHistory(h => h.slice(0, -1));
    playClick();
  }

  function handleHint() {
    if (!xpState || hintsUsed >= 3 || completed || lost) return;
    setRevealedClues(r => Math.min(r + 1, puzzle.clues.length));
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
        gameName="Pinpoint"
        stageNumber={stage}
        difficulty={getDifficulty(stage)}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3 - hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
      >
        <GamePageSchema slug="pinpoint" />

        <p style={{ fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)", letterSpacing:"0.05em" }}>
          {guesses.length}/{maxGuesses} GUESSES · {revealedClues}/{puzzle.clues.length} CLUES
        </p>

        <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", gap:8 }}>
          {puzzle.clues.slice(0, revealedClues).map((clue, i) => (
            <motion.div key={i}
              initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: i * 0.06, type:"spring", stiffness:320, damping:28 }}
              style={{
                padding:"12px 16px", borderRadius:14,
                background: isDark
                  ? i === 0 ? "rgba(0,255,255,0.05)" : "rgba(10,20,36,0.8)"
                  : i === 0 ? "var(--color-surface-2)" : "var(--color-surface)",
                border: isDark
                  ? i === 0 ? "1px solid rgba(0,255,255,0.18)" : "0.5px solid rgba(255,255,255,0.07)"
                  : "0.5px solid var(--color-border)",
                boxShadow: isDark && i === 0 ? "0 0 14px rgba(0,255,255,0.08)" : "none",
                display:"flex", alignItems:"flex-start", gap:10,
              }}>
              <span style={{ fontSize:11, fontWeight:700, color:"var(--color-accent-primary)", minWidth:20, paddingTop:1, fontFamily:"var(--font-mono)" }}>
                {puzzle.clues.length - i}
              </span>
              <p style={{ fontSize:14, color:"var(--color-text-primary)", lineHeight:1.5 }}>{clue}</p>
            </motion.div>
          ))}
          {revealedClues < puzzle.clues.length && !completed && !lost && (
            <div style={{ padding:"12px 16px", borderRadius:14,
              background: isDark ? "rgba(6,13,24,0.6)" : "var(--color-surface-2)",
              border: isDark ? "1px dashed rgba(0,255,255,0.1)" : "0.5px dashed var(--color-border)",
              textAlign:"center" }}>
              <p style={{ fontSize:11, color:"var(--color-text-secondary)", fontFamily:"var(--font-mono)", letterSpacing:"0.05em" }}>
                {puzzle.clues.length - revealedClues} MORE CLUE{puzzle.clues.length - revealedClues > 1 ? "S" : ""} · GUESS WRONG TO REVEAL
              </p>
            </div>
          )}
        </div>

        {guesses.length > 0 && (
          <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", gap:6 }}>
            {guesses.map((g, i) => (
              <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                style={{ padding:"8px 16px", borderRadius:10,
                  background: isDark
                    ? "color-mix(in srgb, var(--color-error) 10%, rgba(6,13,24,0.9))"
                    : "color-mix(in srgb, var(--color-error) 10%, var(--color-surface))",
                  border:"0.5px solid color-mix(in srgb, var(--color-error) 22%, transparent)",
                  fontSize:12, fontWeight:700, color:"var(--color-error)", fontFamily:"var(--font-mono)", letterSpacing:"0.08em" }}>
                ✕ {g}
              </motion.div>
            ))}
          </div>
        )}

        {lost && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ padding:"12px 24px", borderRadius:14,
              background: isDark ? "color-mix(in srgb, var(--color-error) 10%, rgba(6,13,24,0.95))" : "color-mix(in srgb, var(--color-error) 10%, var(--color-surface))",
              border:"1px solid color-mix(in srgb, var(--color-error) 25%, transparent)",
              fontSize:14, fontWeight:700, color:"var(--color-error)", fontFamily:"var(--font-mono)", letterSpacing:"0.08em" }}>
            ANSWER: {puzzle.answer}
          </motion.div>
        )}

        {!completed && !lost && (
          <motion.div animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}} transition={{ duration:0.3 }}
            style={{ display:"flex", gap:8, width:"100%", maxWidth:480 }}>
            <input
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleGuess(); }}
              placeholder="TYPE YOUR ANSWER..."
              style={{
                flex:1, padding:"12px 16px", borderRadius:12,
                border: isDark ? "1.5px solid rgba(0,255,255,0.25)" : "1.5px solid var(--color-border)",
                background: isDark ? "rgba(6,13,24,0.9)" : "var(--color-surface)",
                fontSize:14, color:"var(--color-text-primary)", outline:"none",
                textTransform:"uppercase", fontFamily:"var(--font-mono)", letterSpacing:"0.1em",
                boxShadow: isDark ? "inset 0 1px 0 rgba(255,255,255,0.04), 0 0 0 0 rgba(0,255,255,0)" : "none",
                transition:"border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={e => {
                if(isDark){e.currentTarget.style.borderColor="rgba(0,255,255,0.7)";e.currentTarget.style.boxShadow="0 0 0 3px rgba(0,255,255,0.08)";}
              }}
              onBlur={e => {
                if(isDark){e.currentTarget.style.borderColor="rgba(0,255,255,0.25)";e.currentTarget.style.boxShadow="inset 0 1px 0 rgba(255,255,255,0.04)";}
              }}
            />
            <button onClick={handleGuess}
              style={{ padding:"12px 20px", borderRadius:12, border:"none",
                background:"linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-secondary))",
                color:"#060d18", fontSize:12, fontWeight:700, cursor:"pointer",
                fontFamily:"var(--font-mono)", letterSpacing:"0.08em", textTransform:"uppercase",
                boxShadow: isDark ? "0 0 14px rgba(0,255,255,0.25)" : "none" }}>
              GUESS
            </button>
          </motion.div>
        )}

      </GameShell>

      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(16px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:24 }}>
            <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }}
              transition={{ type:"spring", stiffness:380, damping:28 }}
              style={{ background: isDark ? "rgba(8,16,28,0.97)" : "var(--color-surface)",
                borderRadius:28, padding:36, maxWidth:340, width:"100%", textAlign:"center",
                boxShadow: isDark
                  ? "0 0 0 1px rgba(57,255,20,0.25), 0 32px 80px rgba(0,0,0,0.6), 0 0 40px rgba(57,255,20,0.08)"
                  : "0 32px 80px rgba(0,0,0,0.2)",
                border: isDark ? "none" : "0.5px solid var(--color-border)" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✓</div>
              <h2 style={{ fontSize:28, fontWeight:700, color: isDark ? "var(--color-accent-secondary)" : "var(--color-text-primary)", fontFamily:"var(--font-mono)", marginBottom:4, letterSpacing:"0.05em" }}>
                {puzzle.answer}
              </h2>
              <p style={{ fontSize:11, color:"var(--color-text-secondary)", marginBottom:24, fontFamily:"var(--font-mono)", letterSpacing:"0.06em" }}>
                {guesses.length} GUESS{guesses.length !== 1 ? "ES" : ""} · {revealedClues} CLUE{revealedClues !== 1 ? "S" : ""} · {finalElapsed}
              </p>
              <div style={{ background: isDark ? "rgba(57,255,20,0.06)" : "var(--color-surface-2)",
                border: isDark ? "1px solid rgba(57,255,20,0.2)" : "none",
                borderRadius:16, padding:20, marginBottom:20,
                boxShadow: isDark ? "0 0 20px rgba(57,255,20,0.07)" : "none" }}>
                <p style={{ fontSize:11, color:"var(--color-text-secondary)", fontWeight:600, marginBottom:4, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"var(--font-mono)" }}>XP EARNED</p>
                <p style={{ fontSize:52, fontWeight:700, color: isDark ? "var(--color-accent-secondary)" : "var(--color-accent-primary)", fontFamily:"var(--font-mono)" }}>{finalXP}</p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => loadStage(stage)}
                  style={{ flex:1, padding:13, borderRadius:14, border:"0.5px solid var(--color-border)", background:"var(--color-surface)", fontSize:11, fontWeight:600, color:"var(--color-text-secondary)", cursor:"pointer", fontFamily:"var(--font-mono)", letterSpacing:"0.06em", textTransform:"uppercase" }}>
                  RETRY
                </button>
                <button onClick={() => { setCompleted(false); setStage(s => s + 1); }}
                  style={{ flex:2, padding:13, borderRadius:14, border:"none",
                    background:"linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-secondary))",
                    fontSize:11, fontWeight:700, color:"#060d18", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                    fontFamily:"var(--font-mono)", letterSpacing:"0.06em", textTransform:"uppercase",
                    boxShadow: isDark ? "0 0 18px rgba(0,255,255,0.22)" : "none" }}>
                  NEXT STAGE →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <GameCompleteModal
        open={showGameComplete}
        gameName="Pinpoint"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function PinpointPage() {
  return (
    <ErrorBoundary game="pinpoint">
      <PinpointInner/>
    </ErrorBoundary>
  );
}