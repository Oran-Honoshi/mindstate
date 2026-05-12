"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle, ChevronRight, Share2 } from "lucide-react";
import {
  Leaf, Flame, Droplets, Star, Moon, Sun, Cloud, Zap,
  Heart, Crown, Gem, Snowflake, Feather,
  Fish, Bird, TreePine, Mountain, Waves,
  Globe, Compass, Atom, Brain, Eye,
  Music, Camera, Palette, Coffee,
  Triangle, Circle, Square, Pentagon,
  Flower, Sparkles, Wind, Anchor,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import{CheckProgressButton}from"@/components/ui/CheckProgressButton";
import{CompletionPopup}from"@/components/ui/CompletionPopup";
import{HintButton}from"@/components/ui/HintButton";

import { GameInstructions } from "@/components/ui/GameInstructions";
import {
  createXPState, calculateXP, finalizeXP,
  formatElapsed, xpColor, type XPState, type Difficulty
} from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { updateStreak } from "@/lib/supabase/streaks";
import { markDailyCompleted, getDailySeed } from "@/lib/games/dailyChallenge";
import { consumeToken, getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";
import { TokenHUD } from "@/components/ui/TokenGate";

function getDifficulty(stage: number): Difficulty {
  if (stage <= 300) return "easy";
  if (stage <= 700) return "medium";
  return "hard";
}

const CARD_ICONS = [
  { icon: Leaf,      color:"#16A34A", bg:"#DCFCE7" },
  { icon: Flame,     color:"#EA580C", bg:"#FED7AA" },
  { icon: Droplets,  color:"#0284C7", bg:"#E0F2FE" },
  { icon: Star,      color:"#CA8A04", bg:"#FEF9C3" },
  { icon: Moon,      color:"#7C3AED", bg:"#EDE9FE" },
  { icon: Sun,       color:"#D97706", bg:"#FEF3C7" },
  { icon: Cloud,     color:"#475569", bg:"#F1F5F9" },
  { icon: Zap,       color:"#CA8A04", bg:"#FFFBEB" },
  { icon: Heart,     color:"#E11D48", bg:"#FFE4E6" },
  { icon: Crown,     color:"#B45309", bg:"#FEF3C7" },
  { icon: Gem,       color:"#0891B2", bg:"#CFFAFE" },
  { icon: Snowflake, color:"#0284C7", bg:"#DBEAFE" },
  { icon: Feather,   color:"#059669", bg:"#D1FAE5" },
  { icon: Fish,      color:"#0369A1", bg:"#E0F2FE" },
  { icon: Bird,      color:"#65A30D", bg:"#ECFCCB" },
  { icon: TreePine,  color:"#15803D", bg:"#DCFCE7" },
  { icon: Mountain,  color:"var(--text2)", bg:"#F3F4F6" },
  { icon: Waves,     color:"#0891B2", bg:"#CFFAFE" },
  { icon: Globe,     color:"#2563EB", bg:"#DBEAFE" },
  { icon: Compass,   color:"#B45309", bg:"#FEF9C3" },
  { icon: Atom,      color:"#7C3AED", bg:"#EDE9FE" },
  { icon: Brain,     color:"#BE185D", bg:"#FCE7F3" },
  { icon: Music,     color:"#7C3AED", bg:"#F5F3FF" },
  { icon: Camera,    color:"var(--text2)", bg:"#F9FAFB" },
  { icon: Palette,   color:"#DB2777", bg:"#FDF2F8" },
  { icon: Coffee,    color:"#92400E", bg:"#FEF3C7" },
  { icon: Wind,      color:"#0284C7", bg:"#EFF6FF" },
  { icon: Anchor,    color:"#1E40AF", bg:"#DBEAFE" },
];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]; let s = seed;
  for (let i = a.length-1; i > 0; i--) {
    s = (s*1664525+1013904223)&0xffffffff;
    const j = Math.abs(s)%(i+1);
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

type Card = { id:number; iconIdx:number; flipped:boolean; matched:boolean };

function makeCards(stage: number): Card[] {
  const diff = getDifficulty(stage);
  const pairs = diff==="easy"?8:diff==="medium"?12:16;
  const shuffled = seededShuffle(CARD_ICONS.map((_,i)=>i), stage*31337);
  const selected = shuffled.slice(0, pairs);
  return seededShuffle([...selected,...selected], stage*99991)
    .map((iconIdx,id) => ({id, iconIdx, flipped:false, matched:false}));
}

function XPBar({ xpState }: { xpState:XPState }) {
  const [snap,setSnap] = useState(()=>calculateXP(xpState));
  useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);
  const pct = snap.percentRemaining;
  const color = pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";
  return (
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}>
        <motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/>
      </div>
      <span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span>
      <span style={{fontSize:11,color:"var(--text4)"}}>XP</span>
    </div>
  );
}

function MemoryCard({ card, onClick, cellSize }: { card:Card; onClick:()=>void; cellSize:number }) {
  const cfg = CARD_ICONS[card.iconIdx % CARD_ICONS.length];
  const IconComp = cfg.icon;
  const iconSize = Math.round(cellSize * 0.42);
  return (
    <motion.button onClick={onClick} whileTap={{scale:0.92}}
      style={{width:cellSize,height:cellSize,background:"transparent",border:"none",padding:0,cursor:card.matched?"default":"pointer",perspective:800}}>
      <motion.div
        animate={{rotateY:card.flipped||card.matched?0:180}}
        transition={{duration:0.4,ease:[0.16,1,0.3,1]}}
        style={{width:"100%",height:"100%",transformStyle:"preserve-3d",position:"relative"}}>
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",borderRadius:Math.round(cellSize*0.2),display:"flex",alignItems:"center",justifyContent:"center",
          background:card.matched?cfg.bg:"white",border:`2px solid ${card.matched?cfg.color+"40":"#EDE9E4"}`,
          boxShadow:card.matched?`0 0 0 3px ${cfg.color}20, 0 4px 16px rgba(0,0,0,0.06)`:"0 4px 16px rgba(0,0,0,0.08)"}}>
          <IconComp size={iconSize} color={cfg.color} strokeWidth={1.5}/>
        </div>
        <div style={{position:"absolute",inset:0,backfaceVisibility:"hidden",transform:"rotateY(180deg)",borderRadius:Math.round(cellSize*0.2),
          display:"flex",alignItems:"center",justifyContent:"center",
          background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",border:"2px solid rgba(255,255,255,0.2)",boxShadow:"0 4px 16px rgba(79,110,247,0.2)"}}>
          <svg width={cellSize*0.5} height={cellSize*0.5} viewBox="0 0 40 40" fill="none" opacity={0.3}>
            <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="1.5"/>
            <circle cx="20" cy="20" r="12" stroke="white" strokeWidth="1.5"/>
            <circle cx="20" cy="20" r="6" stroke="white" strokeWidth="1.5"/>
            <line x1="20" y1="2" x2="20" y2="38" stroke="white" strokeWidth="1"/>
            <line x1="2" y1="20" x2="38" y2="20" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
      </motion.div>
    </motion.button>
  );
}

// Social share helper
function shareResult(game: string, stage: number, xp: number, elapsed: string) {
  const text = ` I just completed ${game} Stage ${stage} on MindState with ${xp} XP in ${elapsed}! Can you beat it? `;
  const url = `https://mindstate.vercel.app/games/${game.toLowerCase()}`;
  if (navigator.share) {
    navigator.share({ title: "MindState", text, url }).catch(()=>{});
  } else {
    const encoded = encodeURIComponent(`${text}\n${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");
  }
}

export default function MemoryGame() {
  const {user} = useAuthStore();
  const [stage,setStage] = useState(1);
  const [cards,setCards] = useState<Card[]>([]);
  const [selected,setSelected] = useState<number[]>([]);
  const [xpState,setXpState] = useState<XPState|null>(null);
  const [elapsed,setElapsed] = useState("00:00");
  const [moves,setMoves] = useState(0);
  const [completed,setCompleted] = useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[showFeedback,setShowFeedback]=useState(false);
  const [finalXP,setFinalXP] = useState(0);
  const [mismatch,setMismatch] = useState<Set<number>>(new Set());
  const checking = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage = useCallback((s:number)=>{
    const diff = getDifficulty(s);
    const xp = createXPState(diff);
    setCards(makeCards(s)); setSelected([]); setMoves(0);
    setCompleted(false); setFinalXP(0); setHintsUsed(0); setShowFeedback(false); setElapsed("00:00");
    setXpState(xp); checking.current=false;
    if(timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
  },[]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleFlip(id:number){
    if(checking.current||completed)return;
    const card=cards.find(c=>c.id===id);
    if(!card||card.flipped||card.matched||selected.length===2)return;
    playClick();
    const nc=cards.map(c=>c.id===id?{...c,flipped:true}:c);
    const ns=[...selected,id];
    setCards(nc); setSelected(ns);
    if(ns.length===2){
      checking.current=true; setMoves(m=>m+1);
      const [a,b]=ns.map(sid=>nc.find(c=>c.id===sid)!);
      if(a.iconIdx===b.iconIdx){
        const mc=nc.map(c=>c.id===a.id||c.id===b.id?{...c,matched:true}:c);
        setCards(mc); setSelected([]); checking.current=false;
        if(mc.every(c=>c.matched)&&xpState){
          const earned=finalizeXP(xpState); setFinalXP(earned); setCompleted(true);
          if(timerRef.current)clearInterval(timerRef.current);
          playSuccess(); setTimeout(()=>triggerConfetti(),80);
          if(user) saveScore({user_id:user.id,game_slug:"memory",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});
          const k=`mindstate-stages-${user?.id??"guest"}`;
          if(typeof window!=="undefined") localStorage.setItem(k,String((parseInt(localStorage.getItem(k)??"0"))+1));
        }
      } else {
        playError(); setMismatch(new Set([a.id,b.id]));
        setTimeout(()=>{setCards(prev=>prev.map(c=>c.id===a.id||c.id===b.id?{...c,flipped:false}:c));setSelected([]);setMismatch(new Set());checking.current=false;},1000);
      }
    }
  }

  if(!xpState||cards.length===0) return(
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"var(--text4)",fontSize:13}}>Generating board...</p>
    </div>
  );

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const pairs=diff==="easy"?8:diff==="medium"?12:16;
  const cols=4;
  const maxW=typeof window!=="undefined"?Math.min(window.innerWidth-48,520):440;
  const cellSize=Math.floor((maxW-(cols-1)*12)/cols);
  const matched=cards.filter(c=>c.matched).length/2;

  return(
    <div className="game-page">
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:18}}>
        <div style={{width:"100%",maxWidth:580,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}>
                <ArrowLeft size={14}/> Games
              </Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:11,color:"var(--text4)"}}>Stage</span>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>
                {diff.toUpperCase()}
              </span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,fontSize:12,color:"var(--text4)"}}>
              <span>Moves: <strong style={{color:"var(--text1)"}}>{moves}</strong></span>
              <span style={{fontFamily:"monospace"}}>{elapsed}</span>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}>
                <RotateCcw size={13}/>
              </button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div style={{fontSize:12,color:"var(--text4)"}}>{matched} / {pairs} pairs found</div>

        <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},${cellSize}px)`,gap:12}}>
          {cards.map(card=>(
            <motion.div key={card.id} animate={mismatch.has(card.id)?{x:[-4,4,-4,4,0]}:{}} transition={{duration:0.3}}>
              <MemoryCard card={card} onClick={()=>handleFlip(card.id)} cellSize={cellSize}/>
            </motion.div>
          ))}
        </div>


        {/* Controls */}
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <HintButton
            hintsLeft={{3-hintsUsed}}
            xpCost={100}
            onUseHint={{()=>{
              if(!xpState||hintsUsed>=3)return;
              setHintsUsed(h=>h+1);
              xpState.startTime=xpState.startTime-60000;
            }}}
            disabled={{completed}}/>
          <CheckProgressButton
            onCheck={{()=>{
              if(!xpState||completed)return;
              xpState.startTime=xpState.startTime-30000;
              setShowFeedback(true);
              setTimeout(()=>setShowFeedback(false),2000);
            }}}
            disabled={{completed}}
            xpCost={50}/>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1}
            style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>
            ← Prev
          </button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)}
            style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>
            Next <ChevronRight size={13}/>
          </button>
        </div>
      </main>

      
      <CompletionPopup
        open={completed}
        stage={stage}
        difficulty={getDifficulty(stage)}
        xpEarned={finalXP}
        maxXP={xpState?.maxXP??1000}
        elapsed={elapsed}
        onRetry={()=>loadStage(stage)}
        onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{
          const text=`MindState · Memory Stage ${stage} · ${finalXP} XP · ${elapsed}`;
          if(navigator.share)navigator.share({title:"MindState",text,url:"https://mindstate.vercel.app"}).catch(()=>{});
          else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");
        }}/>

    </div>
  );
}
