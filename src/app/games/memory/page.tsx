"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "memory";
import { saveGameState, loadGameState, clearGameState } from "@/lib/games/gameStateStorage";
import { ResumeModal } from "@/components/ui/ResumeModal";
import { StageMap } from "@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useState, useEffect, useCallback, useRef } from "react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { motion } from "framer-motion";
import { ChevronRight, Leaf, Flame, Droplets, Star, Moon, Sun, Cloud, Zap, Heart, Crown, Gem, Snowflake, Feather, Fish, Bird, Music, Palette, Coffee, Globe, Compass, Atom } from "lucide-react";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { OutOfTokensModal } from "@/components/ui/OutOfTokensModal";
import { createXPState, calculateXP, finalizeXP, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { consumeToken } from "@/lib/games/tokenEngine";
import { useBoardWidth } from "@/hooks/useScreenWidth";
import { GameShell } from "@/components/game";

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

const ICONS = [
  { icon: Leaf,      color:"#16A34A", bg:"#DCFCE7", darkColor:"#4ADE80", darkBg:"rgba(34,197,94,0.15)" },
  { icon: Flame,     color:"#EA580C", bg:"#FED7AA", darkColor:"#FB923C", darkBg:"rgba(249,115,22,0.15)" },
  { icon: Droplets,  color:"#0284C7", bg:"#E0F2FE", darkColor:"#38BDF8", darkBg:"rgba(14,165,233,0.15)" },
  { icon: Star,      color:"#CA8A04", bg:"#FEF9C3", darkColor:"#FDE047", darkBg:"rgba(234,179,8,0.15)"  },
  { icon: Moon,      color:"#7C3AED", bg:"#EDE9FE", darkColor:"#C084FC", darkBg:"rgba(168,85,247,0.15)" },
  { icon: Sun,       color:"#D97706", bg:"#FEF3C7", darkColor:"#FBBF24", darkBg:"rgba(245,158,11,0.15)" },
  { icon: Cloud,     color:"#475569", bg:"var(--color-surface-2)", darkColor:"#94A3B8", darkBg:"rgba(71,85,105,0.2)"   },
  { icon: Zap,       color:"#CA8A04", bg:"#FFFBEB", darkColor:"#FDE047", darkBg:"rgba(234,179,8,0.15)"  },
  { icon: Heart,     color:"#E11D48", bg:"#FFE4E6", darkColor:"#FB7185", darkBg:"rgba(244,63,94,0.15)"  },
  { icon: Crown,     color:"#B45309", bg:"#FEF3C7", darkColor:"#FCD34D", darkBg:"rgba(245,158,11,0.15)" },
  { icon: Gem,       color:"#0891B2", bg:"#CFFAFE", darkColor:"var(--color-accent-primary)", darkBg:"rgba(6,182,212,0.15)"  },
  { icon: Snowflake, color:"#0284C7", bg:"#DBEAFE", darkColor:"#60A5FA", darkBg:"rgba(59,130,246,0.15)" },
  { icon: Feather,   color:"#059669", bg:"#D1FAE5", darkColor:"#34D399", darkBg:"rgba(16,185,129,0.15)" },
  { icon: Fish,      color:"#0369A1", bg:"#E0F2FE", darkColor:"#38BDF8", darkBg:"rgba(14,165,233,0.15)" },
  { icon: Bird,      color:"#0891B2", bg:"#CFFAFE", darkColor:"var(--color-accent-primary)", darkBg:"rgba(6,182,212,0.15)"  },
  { icon: Music,     color:"#7C3AED", bg:"#EDE9FE", darkColor:"#A78BFA", darkBg:"rgba(139,92,246,0.15)" },
  { icon: Palette,   color:"#BE185D", bg:"#FCE7F3", darkColor:"#F472B6", darkBg:"rgba(236,72,153,0.15)" },
  { icon: Coffee,    color:"#92400E", bg:"#FEF3C7", darkColor:"#D97706", darkBg:"rgba(180,83,9,0.15)"   },
  { icon: Globe,     color:"#0369A1", bg:"#DBEAFE", darkColor:"#60A5FA", darkBg:"rgba(59,130,246,0.15)" },
  { icon: Compass,   color:"#065F46", bg:"#D1FAE5", darkColor:"#34D399", darkBg:"rgba(16,185,129,0.15)" },
  { icon: Atom,      color:"#6D28D9", bg:"#EDE9FE", darkColor:"#A78BFA", darkBg:"rgba(139,92,246,0.15)" },
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

function MemoryGameInner() {
  const { user } = useAuthStore();
  const { theme } = useSettingsStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveXP, setLiveXP] = useState(1000);
  const [finalElapsed, setFinalElapsed] = useState("0:00");
  const [completed, setCompleted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string,unknown>|null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [history, setHistory] = useState<Card[][]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef = useRef(false);
  const boardWidth = useBoardWidth(32, 520);

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
    getLastStageRemote(GAME_SLUG).then(remote => {
      if (cancelled) return;
      if (remote > 0 && remote > stage) setStage(remote);
    });
    return () => { cancelled = true; };
  }, []);

  const loadStage = useCallback((s: number) => {
    const currentUser = useAuthStore.getState().user;
    if (currentUser) {
      const ok = consumeToken(currentUser.id);
      if (!ok) { setShowTokenModal(true); return; }
    }
    saveGameState(GAME_SLUG, { stage: s, savedAt: Date.now() });
    const diff = getDifficulty(s);
    const xp = createXPState(diff);
    setCards(makeBoard(`memory-${diff}-${s}`, diff));
    setSelected([]);
    setXpState(xp);
    setCompleted(false);
    setFinalXP(0);
    setElapsedSeconds(0);
    setLiveXP(1000);
    setFinalElapsed("0:00");
    setHintsUsed(0);
    setHistory([]);
    setNextUncompleted(null);
    lockRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - xp.startTime) / 1000));
      setLiveXP(calculateXP(xp).currentXP);
    }, 500);
  }, []);

  const resumeChecked = useRef(false);
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

  function handleFlip(id: number) {
    if (lockRef.current || completed) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;
    if (selected.length === 2) return;
    setHistory(h => [...h.slice(-19), cards.map(c => ({...c}))]);
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
        saveGameState(GAME_SLUG, { stage, cards: matched, hintsUsed, startTime: xpState?.startTime, savedAt: Date.now() });
        setSelected([]);
        lockRef.current = false;
        playSuccess();
        if (matched.every(c => c.matched) && xpState) {
          const earned = finalizeXP(xpState);
          setFinalXP(earned);
          setCompleted(true);
          setFinalElapsed(formatTime(Math.floor((Date.now() - xpState.startTime) / 1000)));
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => triggerConfetti(), 80);
          markStageCompleted(GAME_SLUG, stage);
          const next = getNextUncompletedStage(GAME_SLUG, TOTAL_STAGES);
          setNextUncompleted(next);
          if (shouldShowGameCompleteModal(GAME_SLUG, TOTAL_STAGES)) setTimeout(() => setShowGameComplete(true), 1800);
          if (user) {
            updateStreak(user.id);
            saveScore({ user_id: user.id, game_slug: GAME_SLUG, stage_number: stage, difficulty: getDifficulty(stage), xp_earned: earned, time_taken: Math.floor((Date.now() - xpState.startTime) / 1000), hints_used: hintsUsed });
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

  function handleUndo() {
    if (history.length === 0 || lockRef.current) return;
    setCards(history[history.length - 1]);
    setSelected([]);
    setHistory(h => h.slice(0, -1));
    playClick();
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
  const cols = diff === "easy" ? 4 : diff === "medium" ? 5 : 6;
  const gap = 8;
  const cellSize = Math.min(
    diff === "easy" ? 80 : diff === "medium" ? 72 : 62,
    Math.floor((boardWidth - (cols - 1) * gap) / cols)
  );

  const matchedPairs = Math.round(cards.filter(c => c.matched).length / 2);
  const totalPairs = cards.length / 2;

  const diffColor = diff === "hard"
    ? "var(--color-error)"
    : diff === "medium"
    ? "var(--color-accent-primary)"
    : "var(--color-accent-secondary)";

  const boardBg = theme === "dark"
    ? "radial-gradient(circle, rgba(0,255,255,0.09) 1px, transparent 1px), #060d18"
    : `radial-gradient(circle, color-mix(in srgb, var(--color-accent-primary) 8%, transparent) 1px, transparent 1px), var(--color-surface)`;

  const boardShadow = theme === "dark"
    ? "0 0 0 1px rgba(0,255,255,0.04), 0 20px 64px rgba(0,0,0,0.5)"
    : "0 4px 20px rgba(0,0,0,0.06)";

  if (!xpState) return (
    <div style={{ minHeight:"100vh", background:"var(--color-bg)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ color:"var(--color-text-secondary)", fontSize:13, fontFamily:"var(--font-mono)" }}>GENERATING BOARD...</p>
    </div>
  );

  return (
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Memory"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3 - hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
      >
        {/* Matrix board panel */}
        <div style={{
          padding: 14,
          borderRadius: 16,
          background: boardBg,
          backgroundSize: "18px 18px",
          border: "1px solid color-mix(in srgb, var(--color-accent-primary) 18%, transparent)",
          boxShadow: boardShadow,
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
            gap,
            width: cols * cellSize + (cols - 1) * gap,
          }}>
            {cards.map(card => {
              const iconData = ICONS[card.iconIdx];
              const Icon = iconData.icon;
              const cardColor = theme === "dark" ? iconData.darkColor : iconData.color;
              const isRevealed = card.flipped || card.matched;

              const glowAnimate = card.matched && theme === "dark"
                ? { boxShadow: [
                    "0 0 8px 1px rgba(57,255,20,0.28)",
                    "0 0 18px 3px rgba(57,255,20,0.52)",
                    "0 0 8px 1px rgba(57,255,20,0.28)",
                  ] }
                : card.flipped && !card.matched && theme === "dark"
                ? { boxShadow: [
                    "0 0 6px 1px rgba(0,255,255,0.18)",
                    "0 0 14px 2px rgba(0,255,255,0.36)",
                    "0 0 6px 1px rgba(0,255,255,0.18)",
                  ] }
                : { boxShadow: "0px 0px 0px 0px rgba(0,0,0,0)" };

              const glowTransition = card.matched && theme === "dark"
                ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const }
                : card.flipped && !card.matched && theme === "dark"
                ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" as const }
                : { duration: 0.25, ease: "easeOut" as const };

              return (
                <motion.button
                  key={card.id}
                  onClick={() => handleFlip(card.id)}
                  whileTap={!card.matched && !card.flipped ? { scale: 0.91 } : {}}
                  animate={glowAnimate}
                  transition={{ boxShadow: glowTransition, scale: { duration: 0.1, ease: "easeOut" } }}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    position: "relative",
                    background: "transparent",
                    border: "none",
                    borderRadius: 10,
                    padding: 0,
                    cursor: card.matched ? "default" : "pointer",
                    outline: "none",
                    flexShrink: 0,
                    perspective: "700px",
                  }}
                >
                  {/* 3D flip container */}
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    transformStyle: "preserve-3d",
                    transition: "transform 0.44s cubic-bezier(0.25,0.46,0.45,0.94)",
                    transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}>
                    {/* Back face: dot-matrix node */}
                    <div style={{
                      position: "absolute",
                      top: 0, left: 0, right: 0, bottom: 0,
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      borderRadius: 10,
                      background: theme === "dark"
                        ? "radial-gradient(circle, rgba(0,255,255,0.18) 1px, transparent 1px), #080f1c"
                        : `radial-gradient(circle, color-mix(in srgb, var(--color-accent-primary) 12%, transparent) 1px, transparent 1px), var(--color-surface-2)`,
                      backgroundSize: "7px 7px",
                      border: "1.5px solid color-mix(in srgb, var(--color-accent-primary) 24%, transparent)",
                    }} />

                    {/* Front face: icon */}
                    <div style={{
                      position: "absolute",
                      top: 0, left: 0, right: 0, bottom: 0,
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      borderRadius: 10,
                      background: card.matched
                        ? "color-mix(in srgb, var(--color-accent-secondary) 9%, var(--color-surface))"
                        : "var(--color-surface)",
                      border: card.matched
                        ? "1.5px solid var(--color-accent-secondary)"
                        : "1.5px solid var(--color-accent-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "border 0.3s ease-out, background 0.3s ease-out",
                    }}>
                      <Icon
                        size={Math.round(cellSize * 0.42)}
                        color={cardColor}
                        strokeWidth={1.5}
                        style={{
                          filter: `drop-shadow(0 0 ${card.matched ? "7px" : "4px"} ${cardColor}${card.matched ? "c0" : "70"})`,
                        }}
                      />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Scoreboard row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.07em",
          color: "var(--color-text-secondary)",
          marginTop: 4,
        }}>
          <span>
            PAIRS{" "}
            <span style={{ color: matchedPairs > 0 ? "var(--color-accent-secondary)" : "inherit", fontWeight: 700 }}>
              {matchedPairs}
            </span>
            <span style={{ opacity: 0.5 }}>/{totalPairs}</span>
          </span>
          <span style={{ opacity: 0.3 }}>│</span>
          <span>
            STAGE{" "}
            <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{stage}</span>
          </span>
          <span style={{ opacity: 0.3 }}>│</span>
          <span style={{ color: diffColor, fontWeight: 700 }}>{diff.toUpperCase()}</span>
        </div>

        {/* Nav controls */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:4 }}>
          <button onClick={() => stage > 1 && setStage(s => s-1)} disabled={stage === 1}
            style={{
              padding: "7px 14px", borderRadius: 10,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              cursor: stage > 1 ? "pointer" : "not-allowed",
              fontSize: 12, fontFamily: "var(--font-mono)",
              color: "var(--color-text-secondary)",
              opacity: stage === 1 ? 0.4 : 1,
            }}>
            ← PREV
          </button>
          <button onClick={() => loadStage(stage)}
            style={{
              padding: "7px 12px", borderRadius: 10,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              cursor: "pointer", fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-secondary)",
            }}>
            RESTART
          </button>
          <button onClick={() => setShowMap(true)}
            style={{
              padding: "7px 12px", borderRadius: 10,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              cursor: "pointer", fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-secondary)", fontWeight: 600,
            }}>
            MAP
          </button>
          <button onClick={() => setStage(s => s+1)}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "7px 14px", borderRadius: 10,
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              cursor: "pointer", fontSize: 12,
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-secondary)", fontWeight: 600,
            }}>
            NEXT <ChevronRight size={13}/>
          </button>
        </div>
      </GameShell>

      <OutOfTokensModal gameName="Memory" open={showTokenModal} onClose={() => setShowTokenModal(false)}/>

      {showResume && resumeData && (
        <ResumeModal gameSlug={GAME_SLUG} stageName={`Stage ${resumeData.stage}`} savedAt={resumeData.savedAt as number}
          onResume={() => { const s = resumeData!; setShowResume(false); setResumeData(null); setStage(s.stage as number); if (s.cards) setTimeout(() => setCards(s.cards as Card[]), 150); }}
          onStartFresh={() => { clearGameState(GAME_SLUG); setShowResume(false); setResumeData(null); loadStage(stage); }}/>
      )}

      {showMap && (
        <StageMap gameSlug={GAME_SLUG} totalStages={TOTAL_STAGES} currentStage={stage}
          onSelectStage={s => setStage(s)} onClose={() => setShowMap(false)}/>
      )}

      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)}
        xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={() => loadStage(stage)}
        onNext={() => { setCompleted(false); setStage(s => s+1); }}
        onGoToLatest={nextUncompleted != null ? () => { setCompleted(false); setStage(nextUncompleted!); } : undefined}
        nextUncompletedStage={nextUncompleted ?? undefined}
        onShare={() => {
          const text = `Mind Element · Memory Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;
          if (navigator.share) navigator.share({ title:"Mind Element", text, url:"https://mindelement.app" }).catch(()=>{});
          else window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), "_blank");
        }}/>

      <GameCompleteModal open={showGameComplete} gameName="Memory" totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}/>
    </>
  );
}

export default function MemoryGame() {
  return <ErrorBoundary game={GAME_SLUG}><MemoryGameInner/></ErrorBoundary>;
}
