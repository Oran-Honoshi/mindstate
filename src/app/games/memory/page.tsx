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
import { ArrowLeft, RotateCcw, ChevronRight, Leaf, Flame, Droplets, Star, Moon, Sun, Cloud, Zap, Heart, Crown, Gem, Snowflake, Feather, Fish, Bird, Music, Palette, Coffee, Globe, Compass, Atom } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { HintButton } from "@/components/ui/HintButton";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { OutOfTokensModal } from "@/components/ui/OutOfTokensModal";
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
  { icon: Leaf,      color:"#16A34A", bg:"#DCFCE7", darkColor:"#4ADE80", darkBg:"rgba(34,197,94,0.15)" },
  { icon: Flame,     color:"#EA580C", bg:"#FED7AA", darkColor:"#FB923C", darkBg:"rgba(249,115,22,0.15)" },
  { icon: Droplets,  color:"#0284C7", bg:"#E0F2FE", darkColor:"#38BDF8", darkBg:"rgba(14,165,233,0.15)" },
  { icon: Star,      color:"#CA8A04", bg:"#FEF9C3", darkColor:"#FDE047", darkBg:"rgba(234,179,8,0.15)"  },
  { icon: Moon,      color:"#7C3AED", bg:"#EDE9FE", darkColor:"#C084FC", darkBg:"rgba(168,85,247,0.15)" },
  { icon: Sun,       color:"#D97706", bg:"#FEF3C7", darkColor:"#FBBF24", darkBg:"rgba(245,158,11,0.15)" },
  { icon: Cloud,     color:"#475569", bg:"#F1F5F9", darkColor:"#94A3B8", darkBg:"rgba(71,85,105,0.2)"   },
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

function useIsDark(){
  const[dark,setDark]=useState(false);
  useEffect(()=>{
    const check=()=>setDark(document.documentElement.classList.contains("dark"));
    check();
    const obs=new MutationObserver(check);
    obs.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
    return()=>obs.disconnect();
  },[]);
  return dark;
}

function XPBar({ xpState }: { xpState: XPState }) {
  const [snap, setSnap] = useState(() => calculateXP(xpState));
  useEffect(() => {
    const iv = setInterval(() => setSnap(calculateXP(xpState)), 500);
    return () => clearInterval(iv);
  }, [xpState]);
  const pct = snap.percentRemaining;
  const color = pct > 0.6 ? "#22C55E" : pct > 0.3 ? "#F59E0B" : "var(--color-error)";
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-1 h-1 rounded-sm overflow-hidden" style={{ background: "var(--color-surface-2)" }}>
        <motion.div
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-sm"
          style={{ background: color }}
        />
      </div>
      <span className="text-[13px] font-bold font-mono min-w-[36px]" style={{ color }}>{snap.currentXP}</span>
      <span className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>XP</span>
    </div>
  );
}

function MemoryGameInner() {
  const { user } = useAuthStore();
  const isDark = useIsDark();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [xpState, setXpState] = useState<XPState | null>(null);
  const [elapsed, setElapsed] = useState("00:00");
  const [completed, setCompleted] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeData, setResumeData] = useState<Record<string,unknown>|null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [finalXP, setFinalXP] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockRef = useRef(false);
  const boardWidth = useBoardWidth(32, 520);

  usePageVisibility(
    () => { if (timerRef.current) clearInterval(timerRef.current); },
    () => { if (xpState && !completed) timerRef.current = setInterval(() => setElapsed(formatElapsed(xpState.startTime)), 1000); }
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
    setElapsed("00:00");
    setHintsUsed(0);
    setNextUncompleted(null);
    lockRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(formatElapsed(xp.startTime)), 1000);
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
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => triggerConfetti(), 80);
          markStageCompleted(GAME_SLUG, stage);
          const next = getNextUncompletedStage(GAME_SLUG, TOTAL_STAGES);
          setNextUncompleted(next);
          if (shouldShowGameCompleteModal(GAME_SLUG, TOTAL_STAGES)) setTimeout(() => setShowGameComplete(true), 1800);
          if (user) {
            updateStreak(user.id);
            saveScore({ user_id: user.id, game_slug: GAME_SLUG, stage_number: stage, difficulty: getDifficulty(stage), xp_earned: earned, time_taken: Math.floor((Date.now() - xpState.startTime) / 1000) });
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
  const diffColor = diff === "easy" ? "#22C55E" : diff === "medium" ? "#F59E0B" : "var(--color-error)";
  const cols = diff === "easy" ? 4 : diff === "medium" ? 5 : 6;
  const matched = cards.filter(c => c.matched).length / 2;
  const total = cards.length / 2;
  const gap = 8;
  const cellSize = Math.min(
    diff === "easy" ? 80 : diff === "medium" ? 72 : 62,
    Math.floor((boardWidth - (cols - 1) * gap) / cols)
  );

  if (!xpState) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <p className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>Generating board...</p>
    </div>
  );

  return (
    <div className="game-page">
      <Navbar/>
      <main className="flex-1 flex flex-col items-center gap-4" style={{ padding: "76px 16px 32px" }}>

        {/* HUD Header — glassmorphic in dark mode via .game-header CSS class */}
        <div className="game-header w-full max-w-[560px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center flex-shrink min-w-0 overflow-hidden" style={{ gap: 6, flexWrap: "nowrap" }}>
              <Link href="/games" className="flex items-center no-underline flex-shrink-0" style={{ color: "var(--color-text-secondary)", gap: 3, fontSize: 12 }}>
                <ArrowLeft size={13}/> Games
              </Link>
              <div className="flex-shrink-0" style={{ width: 1, height: 14, background: "var(--color-border)" }}/>
              <span className="text-[12px] font-bold flex-shrink-0" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>Memory</span>
              <div className="flex-shrink-0" style={{ width: 1, height: 14, background: "var(--color-border)" }}/>
              <span className="text-[18px] font-bold flex-shrink-0" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>{stage}</span>
              <span className="flex-shrink-0 whitespace-nowrap" style={{
                fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10,
                background: isDark ? `${diffColor}25` : `${diffColor}15`,
                color: diffColor,
                ...(isDark ? { boxShadow: `0 0 8px ${diffColor}40` } : {}),
              }}>
                {diff.toUpperCase()}
              </span>
              <span className="text-[11px] flex-shrink-0 whitespace-nowrap" style={{ color: "var(--color-text-secondary)" }}>{matched}/{total}</span>
            </div>
            <div className="flex items-center flex-shrink-0" style={{ gap: 4 }}>
              <span
                className={`text-[11px] font-mono whitespace-nowrap${isDark ? " neon-cyan" : ""}`}
                style={!isDark ? { color: "var(--color-text-secondary)" } : undefined}
              >{elapsed}</span>
              <button
                onClick={() => loadStage(stage)}
                className="game-control-btn flex items-center justify-center cursor-pointer"
                style={{ padding: 6, borderRadius: 8, border: "0.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-secondary)" }}
              >
                <RotateCcw size={12}/>
              </button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div className="flex items-center" style={{ gap: 10 }}>
          <HintButton hintsLeft={3 - hintsUsed} xpCost={100} onUseHint={handleHint} disabled={completed}/>
        </div>

        {/* Card grid — dynamic column/size values stay as inline style */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap,
          width: "100%",
          maxWidth: cols * cellSize + (cols - 1) * gap,
          overflow: "hidden",
        }}>
          {cards.map(card => {
            const iconData = ICONS[card.iconIdx];
            const Icon = iconData.icon;
            const cardColor = isDark ? iconData.darkColor : iconData.color;
            const cardBg = isDark ? iconData.darkBg : iconData.bg;
            const isRevealed = card.flipped || card.matched;
            return (
              <motion.button
                key={card.id}
                onClick={() => handleFlip(card.id)}
                whileTap={!card.flipped && !card.matched ? { scale: 0.92 } : {}}
                className={[
                  "flex items-center justify-center outline-none",
                  card.matched ? "cursor-default" : "cursor-pointer",
                  // Dark mode: CSS classes handle bg / border / blur / shadow via html.dark selectors
                  isDark && !isRevealed              ? "memory-card-back"                        : "",
                  isDark && isRevealed && !card.matched ? "memory-card-front"                   : "",
                  isDark && card.matched             ? "memory-card-matched memory-card-front"  : "",
                ].filter(Boolean).join(" ")}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 12,
                  // Light-mode visual styles only; dark mode is handled entirely by CSS classes above
                  ...(!isDark && {
                    border: card.matched
                      ? "2px solid #86EFAC"
                      : card.flipped
                        ? `2px solid ${iconData.bg}`
                        : "2px solid transparent",
                    background: isRevealed
                      ? cardBg
                      : "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }),
                }}
              >
                {isRevealed && (
                  <Icon
                    size={Math.round(cellSize * 0.45)}
                    color={cardColor}
                    strokeWidth={isDark ? 1.5 : 1.8}
                    style={isDark ? {
                      filter: card.matched
                        ? `drop-shadow(0 0 10px ${cardColor}) drop-shadow(0 0 20px ${cardColor}60)`
                        : `drop-shadow(0 0 6px ${cardColor}A0)`,
                    } : {}}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Stage navigation */}
        <div className="flex items-center" style={{ gap: 12 }}>
          <button
            onClick={() => stage > 1 && setStage(s => s - 1)}
            disabled={stage === 1}
            className="text-[12px] rounded-xl"
            style={{
              padding: "8px 16px",
              border: isDark ? "1px solid rgba(255,255,255,0.08)" : "0.5px solid var(--color-border)",
              background: isDark ? "rgba(255,255,255,0.05)" : "var(--color-surface)",
              cursor: stage > 1 ? "pointer" : "not-allowed",
              color: "var(--color-text-secondary)",
              opacity: stage === 1 ? 0.4 : 1,
            }}
          >
            ← Prev
          </button>
          <span className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>Stage {stage} of {TOTAL_STAGES}</span>
          <button
            onClick={() => setStage(s => s + 1)}
            className="flex items-center gap-1 text-[12px] font-semibold rounded-xl cursor-pointer"
            style={{
              padding: "8px 16px",
              border: isDark ? "1px solid rgba(34,211,238,0.25)" : "0.5px solid var(--color-border)",
              background: isDark ? "rgba(34,211,238,0.1)" : "var(--color-surface)",
              color: isDark ? "rgba(34,211,238,0.9)" : "var(--color-text-secondary)",
            }}
          >
            Next <ChevronRight size={13}/>
          </button>
        </div>
      </main>

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
        xpEarned={finalXP} elapsed={elapsed}
        onRetry={() => loadStage(stage)}
        onNext={() => { setCompleted(false); setStage(s => s+1); }}
        onGoToLatest={nextUncompleted != null ? () => { setCompleted(false); setStage(nextUncompleted!); } : undefined}
        nextUncompletedStage={nextUncompleted ?? undefined}
        onShare={() => {
          const text = `MindElement · Memory Stage ${stage} · ${finalXP} XP · ${elapsed}`;
          if (navigator.share) navigator.share({ title:"MindElement", text, url:"https://mindelement.app" }).catch(()=>{});
          else window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), "_blank");
        }}/>

      <GameCompleteModal open={showGameComplete} gameName="Memory" totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}/>
    </div>
  );
}

export default function MemoryGame() {
  return <ErrorBoundary game={GAME_SLUG}><MemoryGameInner/></ErrorBoundary>;
}
