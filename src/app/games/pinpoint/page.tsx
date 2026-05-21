"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "pinpoint";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
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

// ── Puzzle bank ───────────────────────────────────────────────────────────────
// Each puzzle: answer + 5 clues ordered from hardest (most obscure) to easiest

interface Puzzle {
  answer: string;
  clues: string[]; // [hardest → easiest], 5 clues
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

// How many clues to reveal based on difficulty
function getInitialClues(diff: Difficulty): number {
  return diff === "easy" ? 2 : diff === "medium" ? 1 : 1;
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

function PinpointInner() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [lost, setLost] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedClues, setRevealedClues] = useState(1);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [shake, setShake] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const diff = getDifficulty(stage);
  const puzzle = getPuzzle(stage);
  const diffColor = diff === "easy" ? "#22C55E" : diff === "medium" ? "#F59E0B" : "#EF4444";
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
    setElapsed("00:00");
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
  }, []);

  useEffect(() => {
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleGuess() {
    if (!xpState || completed || lost) return;
    const g = guess.trim().toUpperCase();
    if (!g) return;
    const newGuesses = [...guesses, g];
    setGuesses(newGuesses);
    setGuess("");
    playClick();

    if (g === puzzle.answer.toUpperCase()) {
      const earned = finalizeXP(xpState);
      setFinalXP(earned);
      setCompleted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      playSuccess();
      setTimeout(() => triggerConfetti(), 80);
      markStageCompleted("pinpoint", stage);
      if (user) {
        updateStreak(user.id);
        saveScore({ user_id: user.id, game_slug: "pinpoint", stage_number: stage,
          difficulty: getDifficulty(stage), xp_earned: earned,
          time_taken: Math.floor((Date.now() - xpState.startTime) / 1000) });
      }
    } else {
      playError();
      setShake(true);
      setTimeout(() => setShake(false), 500);
      // Reveal next clue on wrong guess
      if (revealedClues < puzzle.clues.length) {
        setRevealedClues(r => r + 1);
      }
      if (newGuesses.length >= maxGuesses) {
        setLost(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  }

  function handleHint() {
    if (!xpState || hintsUsed >= 3 || completed || lost) return;
    setRevealedClues(r => Math.min(r + 1, puzzle.clues.length));
    setHintsUsed(h => h + 1);
    setXpState(prev => prev ? {...prev, hintsUsed: Math.min(prev.hintsUsed + 1, prev.maxHints)} : prev);
    playError();
  }

  if (!xpState) return null;

  return (
    <div className="game-page">
      <Navbar/>
      <GamePageSchema slug="pinpoint" />
      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"76px 16px 32px", gap:18 }}>

        {/* Header */}
        <div style={{ width:"100%", maxWidth:480, background:"var(--surface)", borderRadius:20, border:"0.5px solid var(--border)", padding:"16px 20px", boxShadow:"var(--shadow-sm)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Link href="/games" style={{ color:"var(--text4)", textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13 }}><ArrowLeft size={14}/> Games</Link>
              <div style={{ width:1, height:16, background:"var(--border2)" }}/>
              <span style={{ fontSize:12, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif" }}>Pinpoint</span>
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

        <p style={{ fontSize:11, color:"var(--text4)" }}>
          {guesses.length}/{maxGuesses} guesses · {revealedClues}/{puzzle.clues.length} clues revealed
        </p>

        {/* Clues */}
        <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", gap:8 }}>
          {puzzle.clues.slice(0, revealedClues).map((clue, i) => (
            <motion.div key={i}
              initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                padding:"12px 16px", borderRadius:14,
                background: i === 0 ? "var(--bg2)" : "var(--surface)",
                border: "0.5px solid var(--border)",
                display:"flex", alignItems:"flex-start", gap:10,
              }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#4F6EF7", minWidth:20, paddingTop:1 }}>
                {puzzle.clues.length - i}
              </span>
              <p style={{ fontSize:14, color:"var(--text1)", lineHeight:1.5 }}>{clue}</p>
            </motion.div>
          ))}
          {revealedClues < puzzle.clues.length && !completed && !lost && (
            <div style={{ padding:"12px 16px", borderRadius:14, background:"var(--bg3)", border:"0.5px dashed var(--border2)", textAlign:"center" }}>
              <p style={{ fontSize:12, color:"var(--text4)" }}>{puzzle.clues.length - revealedClues} more clue{puzzle.clues.length - revealedClues > 1 ? "s" : ""} available · guess wrong to reveal</p>
            </div>
          )}
        </div>

        {/* Previous guesses */}
        {guesses.length > 0 && (
          <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", gap:6 }}>
            {guesses.map((g, i) => (
              <div key={i} style={{ padding:"8px 16px", borderRadius:10, background:"#FEF2F2", border:"0.5px solid #FECACA", fontSize:13, fontWeight:600, color:"#EF4444" }}>
                ✕ {g}
              </div>
            ))}
          </div>
        )}

        {/* Answer reveal on loss */}
        {lost && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ padding:"12px 24px", borderRadius:14, background:"#FEF2F2", border:"1px solid #FECACA", fontSize:16, fontWeight:700, color:"#EF4444" }}>
            The answer was: {puzzle.answer}
          </motion.div>
        )}

        {/* Input */}
        {!completed && !lost && (
          <motion.div animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}} transition={{ duration:0.3 }}
            style={{ display:"flex", gap:8, width:"100%", maxWidth:480 }}>
            <input
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleGuess(); }}
              placeholder="Type your answer..."
              style={{
                flex:1, padding:"12px 16px", borderRadius:12,
                border:"1.5px solid var(--border2)", background:"var(--surface)",
                fontSize:15, color:"var(--text1)", outline:"none",
                textTransform:"uppercase",
              }}
            />
            <button onClick={handleGuess}
              style={{ padding:"12px 20px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", color:"white", fontSize:14, fontWeight:700, cursor:"pointer" }}>
              Guess
            </button>
          </motion.div>
        )}

        {/* Controls */}
        <HintButton hintsLeft={3 - hintsUsed} xpCost={100} onUseHint={handleHint} disabled={completed || lost}/>

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
      <AnimatePresence>
        {completed && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, padding:24 }}>
            <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }}
              transition={{ type:"spring", stiffness:380, damping:28 }}
              style={{ background:"var(--surface)", borderRadius:28, padding:36, maxWidth:340, width:"100%", textAlign:"center", boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize:56, marginBottom:12 }}>🎉</div>
              <h2 style={{ fontSize:26, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", marginBottom:4 }}>
                {puzzle.answer}
              </h2>
              <p style={{ fontSize:13, color:"var(--text4)", marginBottom:24 }}>
                {guesses.length} guess{guesses.length !== 1 ? "es" : ""} · {revealedClues} clue{revealedClues !== 1 ? "s" : ""} used · {elapsed}
              </p>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
      <GameCompleteModal
        open={showGameComplete}
        gameName="Pinpoint"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />


export default function PinpointPage() {
  return (
    <ErrorBoundary game="pinpoint">
      <PinpointInner/>
    </ErrorBoundary>
  );
}