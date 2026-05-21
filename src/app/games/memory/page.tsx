"use client";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";

import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, ChevronRight,
         Leaf, Flame, Droplets, Star, Moon, Sun, Cloud, Zap,
         Heart, Crown, Gem, Snowflake, Feather, Fish, Bird,
         Music, Palette, Coffee, Globe, Compass, Atom } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { HintButton } from "@/components/ui/HintButton";
import { GameInstructions } from "@/components/ui/GameInstructions";
import { createXPState, calculateXP, finalizeXP, formatElapsed, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { useBoardWidth } from "@/hooks/useScreenWidth";

function getDifficulty(stage: number): Difficulty {
  if (stage === 1) return "medium";
  const h = Math.abs(Math.imul(stage * 2654435761, stage ^ 0x9e3779b9)) % 100;
  return h < 20 ? "easy" : h < 70 ? "medium" : "hard";
}

const ICONS = [
  { icon: Leaf,     color:"#16A34A", bg:"#DCFCE7" },
  { icon: Flame,    color:"#EA580C", bg:"#FED7AA" },
  { icon: Droplets, color:"#0284C7", bg:"#E0F2FE" },
  { icon: Star,     color:"#CA8A04", bg:"#FEF9C3" },
  { icon: Moon,     color:"#7C3AED", bg:"#EDE9FE" },
  { icon: Sun,      color:"#D97706", bg:"#FEF3C7" },
  { icon: Cloud,    color:"#475569", bg:"#F1F5F9" },
  { icon: Zap,      color:"#CA8A04", bg:"#FFFBEB" },
  { icon: Heart,    color:"#E11D48", bg:"#FFE4E6" },
  { icon: Crown,    color:"#B45309", bg:"#FEF3C7" },
  { icon: Gem,      color:"#0891B2", bg:"#CFFAFE" },
  { icon: Snowflake,color:"#0284C7", bg:"#DBEAFE" },
  { icon: Feather,  color:"#059669", bg:"#D1FAE5" },
  { icon: Fish,     color:"#0369A1", bg:"#E0F2FE" },
  { icon: Bird,     color:"#0891B2", bg:"#CFFAFE" },
  { icon: Music,    color:"#7C3AED", bg:"#EDE9FE" },
  { icon: Palette,  color:"#BE185D", bg:"#FCE7F3" },
  { icon: Coffee,   color:"#92400E", bg:"#FEF3C7" },
  { icon: Globe,    color:"#0369A1", bg:"#DBEAFE" },
  { icon: Compass,  color:"#065F46", bg:"#D1FAE5" },
  { icon: Atom,     color:"#6D28D9", bg:"#EDE9FE" },
];

type Card = { id: number; iconIdx: number; flipped: boolean; matched: boolean };

function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedToNum(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function makeBoard(seed: string, diff: Difficulty): Card[] {
  const pairCount = diff === "easy" ? 6 : diff === "medium" ? 10 : 15;
  const rng = mulberry32(seedToNum(seed));
  const indices = Array.from({length: ICONS.length}, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const chosen = indices.slice(0, pairCount);
  const arr = [...chosen, ...chosen];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.map((iconIdx, id) => ({ id, iconIdx, flipped: false, matched: false }));
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

function MemoryGameInner() {
  const { user } = useAuthStore();
  const [stage, setStage] = useState(() => getLastStage("memory"));
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string,unknown>|null>(null);
  const [showMap, setShowMap] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef = useRef(false);

  // Responsive: calculate cell size from viewport
  const boardWidth = useBoardWidth(32, 520);

  const loadStage = useCallback((s: number) => {
    saveGameState("memory", {stage: s, savedAt: Date.now()});
    const diff = getDifficulty(s);
    const xp = createXPState(diff);
    setCards(makeBoard(`memory-${diff}-${s}`, diff));
    setSelected([]);
    setXpState(xp);
    setCompleted(false);
    setFinalXP(0);
    setElapsed("00:00");
    setHintsUsed(0);
    lockRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
    if (user) consumeToken(user.id);
  }, [user]);

  const resumeChecked = useRef(false);

  useEffect(() => {
    if (!resumeChecked.current) {
      resumeChecked.current = true;
      const saved = loadGameState("memory");
      if (saved && (saved.stage as number) > 1) { setResumeData(saved); setShowResume(true); return; }
    }
    loadStage(stage);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, loadStage]);

  function handleFlip(id: number) {
    if (lockRef.current || completed) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;
    if (selected.length === 2) return;

    const newCards = cards.map(c => c.id === id ? {...c, flipped: true} : c);
    const newSel = [...selected, id];
    setCards(newCards);
    setSelected(newSel);
    playClick();

    if (newSel.length === 2) {
      lockRef.current = true;
      const [a, b] = newSel.map(sid => newCards.find(c => c.id === sid)!);
      if (a.iconIdx === b.iconIdx) {
        const matched = newCards.map(c => c.id === a.id || c.id === b.id ? {...c, matched: true} : c);
        setCards(matched);
        saveGameState("memory", {stage, cards: matched, hintsUsed, startTime: xpState?.startTime, savedAt: Date.now()});
        setSelected([]);
        lockRef.current = false;
        playSuccess();
        if (matched.every(c => c.matched) && xpState) {
          const earned = finalizeXP(xpState);
          setFinalXP(earned);
          setCompleted(true);
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => triggerConfetti(), 80);
          markStageCompleted("memory",stage);
          if(typeof window!=="undefined"){const w=parseInt(localStorage.getItem("mindstate-wins")??"0")+1;localStorage.setItem("mindstate-wins",String(w));}
          if (user) {
            updateStreak(user.id);
            saveScore({ user_id: user.id, game_slug: "memory", stage_number: stage,
              difficulty: getDifficulty(stage), xp_earned: earned,
              time_taken: Math.floor((Date.now() - xpState.startTime) / 1000) });
          }
        }
      } else {
        playError();
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === a.id || c.id === b.id ? {...c, flipped: false} : c));
          setSelected([]);
          lockRef.current = false;
        }, 900);
      }
    }
  }

  function handleHint() {
    if (!xpState || completed || hintsUsed >= 3) return;
    setCards(prev => prev.map(c => c.matched ? c : {...c, flipped: true}));
    setHintsUsed(h => h + 1);
    setXpState(prev => prev ? {...prev, hintsUsed: Math.min((prev.hintsUsed||0)+1, prev.maxHints)} : prev);
    playError();
    setTimeout(() => {
      setCards(prev => prev.map(c => c.matched ? c : (selected.includes(c.id) ? c : {...c, flipped: false})));
    }, 1200);
  }

  const diff = getDifficulty(stage);
  const diffColor = diff === "easy" ? "#22C55E" : diff === "medium" ? "#F59E0B" : "#EF4444";
  const cols = diff === "easy" ? 4 : diff === "medium" ? 5 : 6;
  const matched = cards.filter(c => c.matched).length / 2;
  const total = cards.length / 2;
  const gap = 8;
  // Responsive cell size: distribute board width across columns
  const cellSize = Math.min(
    diff === "easy" ? 80 : diff === "medium" ? 72 : 62,
    Math.floor((boardWidth - (cols - 1) * gap) / cols)
  );

  if (!xpState) return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"var(--text4)", fontSize:13 }}>Loading...</p>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", flexDirection:"column" }}>
      <Navbar/>
      <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"76px 16px 32px", gap:16 }}>

        <div style={{ width:"100%", maxWidth:560, background:"var(--surface)", borderRadius:20,
          border:"0.5px solid var(--border)", padding:"16px 20px", boxShadow:"var(--shadow-sm)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
              <Link href="/games" style={{ color:"var(--text4)", textDecoration:"none", display:"flex", alignItems:"center", gap:4, fontSize:13 }}>
                <ArrowLeft size={14}/> Games
              </Link>
              <div style={{ width:1, height:16, background:"var(--border2)" }}/>
              <span style={{ fontSize:12, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif" }}>Memory</span>
              <div style={{ width:1, height:16, background:"var(--border2)" }}/>
              <span style={{ fontSize:20, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif" }}>{stage}</span>
              <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:10,
                background:`${diffColor}15`, color:diffColor }}>
                {diff.toUpperCase()} \u00b7 {total} pairs
              </span>
              <span style={{ fontSize:12, color:"var(--text4)" }}>{matched}/{total} found</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
              <span style={{ fontSize:12, color:"var(--text4)", fontFamily:"monospace" }}>{elapsed}</span>
              <button onClick={() => loadStage(stage)}
                style={{ padding:7, borderRadius:9, border:"0.5px solid var(--border2)",
                  background:"var(--surface)", cursor:"pointer", color:"var(--text4)", display:"flex" }}>
                <RotateCcw size={13}/>
              </button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <HintButton hintsLeft={3 - hintsUsed} xpCost={100} onUseHint={handleHint} disabled={completed}/>
        </div>

        {showFeedback && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
            style={{ background:"var(--surface)", border:"0.5px solid var(--border)", borderRadius:12,
              padding:"8px 16px", fontSize:12, fontWeight:600, color:"var(--text2)" }}>
            {matched}/{total} pairs found \u00b7 {total - matched} remaining
          </motion.div>
        )}

        {/* Card grid \u2014 responsive */}
        <div style={{
          display:"grid",
          gridTemplateColumns:`repeat(${cols}, ${cellSize}px)`,
          gap,
          width:"100%",
          maxWidth: cols * cellSize + (cols - 1) * gap,
          overflow:"hidden",
        }}>
          {cards.map(card => {
            const iconData = ICONS[card.iconIdx];
            const Icon = iconData.icon;
            return (
              <motion.button key={card.id}
                onClick={() => handleFlip(card.id)}
                whileTap={!card.flipped && !card.matched ? {scale: 0.92} : {}}
                style={{
                  width: cellSize, height: cellSize, borderRadius: 12,
                  border: `2px solid ${card.matched ? "#86EFAC" : card.flipped ? iconData.bg : "transparent"}`,
                  background: card.flipped || card.matched ? iconData.bg
                    : "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                  cursor: card.matched ? "default" : "pointer",
                  outline: "none", display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow: card.matched ? `0 0 0 2px #86EFAC` : "0 2px 8px rgba(0,0,0,0.15)",
                }}>
                {(card.flipped || card.matched) && (
                  <Icon size={Math.round(cellSize * 0.45)} color={iconData.color} strokeWidth={1.8}/>
                )}
              </motion.button>
            );
          })}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => stage > 1 && setStage(s => s-1)} disabled={stage === 1}
            style={{ padding:"8px 16px", borderRadius:12, border:"0.5px solid var(--border2)",
              background:"var(--surface)", cursor:stage>1?"pointer":"not-allowed",
              fontSize:12, color:"var(--text3)", opacity:stage===1?0.4:1 }}>
            \u2190 Prev
          </button>
          <span style={{ fontSize:12, color:"var(--text4)" }}>Stage {stage} of 100</span>
          <button onClick={() => setStage(s => s+1)}
            style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 16px", borderRadius:12,
              border:"0.5px solid var(--border2)", background:"var(--surface)",
              cursor:"pointer", fontSize:12, color:"var(--text2)", fontWeight:600 }}>
            Next <ChevronRight size={13}/>
          </button>
        </div>
      </main>

      <AnimatePresence>
        {completed && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)",
              backdropFilter:"blur(14px)", display:"flex", alignItems:"center",
              justifyContent:"center", zIndex:200, padding:24 }}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
              transition={{type:"spring",stiffness:380,damping:28}}
              style={{ background:"var(--surface)", borderRadius:28, padding:36,
                maxWidth:340, width:"100%", textAlign:"center",
                boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize:56, marginBottom:12 }}>\ud83c\udf89</div>
              <h2 style={{ fontSize:26, fontWeight:700, color:"var(--text1)",
                fontFamily:"Georgia,serif", marginBottom:4 }}>All Pairs Found!</h2>
              <p style={{ fontSize:13, color:"var(--text4)", marginBottom:24 }}>
                {elapsed} \u00b7 {total} pairs \u00b7 {diff}
              </p>
              <div style={{ background:"var(--bg2)", borderRadius:16, padding:20, marginBottom:20 }}>
                <p style={{ fontSize:11, color:"var(--text4)", fontWeight:600, marginBottom:4,
                  letterSpacing:"0.1em", textTransform:"uppercase" }}>XP Earned</p>
                <p style={{ fontSize:52, fontWeight:700, color:"#4F6EF7",
                  fontFamily:"Georgia,serif" }}>{finalXP}</p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => loadStage(stage)}
                  style={{ flex:1, padding:13, borderRadius:14, border:"0.5px solid var(--border2)",
                    background:"var(--surface)", fontSize:13, fontWeight:600,
                    color:"var(--text2)", cursor:"pointer" }}>
                  Retry
                </button>
                <button onClick={() => { setCompleted(false); setStage(s => s+1); }}
                  style={{ flex:2, padding:13, borderRadius:14, border:"none",
                    background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                    fontSize:13, fontWeight:700, color:"white", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  Next Stage \u2192
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showResume && resumeData && (
        <ResumeModal
          gameSlug="memory"
          stageName={`Stage ${resumeData.stage}`}
          savedAt={resumeData.savedAt as number}
          onResume={() => {
            const s = resumeData!;
            setShowResume(false); setResumeData(null);
            setStage(s.stage as number);
            if (s.cards) setTimeout(() => setCards(s.cards as Card[]), 150);
          }}
          onStartFresh={() => {
            clearGameState("memory"); setShowResume(false); setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
    </div>
  );
}
export default function MemoryGame() {
  return (
    <ErrorBoundary game="memory">
      <MemoryGameInner/>
    </ErrorBoundary>
  );
}