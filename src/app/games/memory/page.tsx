"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { createXPState, calculateXP, finalizeXP, formatElapsed, xpColor, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";

function getDifficulty(stage: number): Difficulty {
  return stage<=30?"easy":stage<=70?"medium":"hard";
}

const SYMBOLS = ["△","○","□","◇","★","♦","◈","⬡","⟡","◉","⊞","◐","◑","▲","●","■","◆","☆","⬟","⊕","⊗","⊘","⊙","◎","⬠","⬢","⟢","⊛","◍","◌","◫","◪","◩","◨","◧","⬣","⬤","⭕","✦","✧"];

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a=[...arr]; let s=seed;
  for(let i=a.length-1;i>0;i--){s=(s*1664525+1013904223)&0xffffffff;const j=Math.abs(s)%(i+1);[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

type Card = { id:number; value:string; flipped:boolean; matched:boolean };

function makeCards(stage: number): Card[] {
  const diff = getDifficulty(stage);
  const pairs = diff==="easy"?8:18;
  const syms = seededShuffle(SYMBOLS, stage*31337).slice(0,pairs);
  return seededShuffle([...syms,...syms], stage*99991).map((v,i)=>({id:i,value:v,flipped:false,matched:false}));
}

function XPBar({ xpState }: { xpState:XPState }) {
  const [snap,setSnap]=useState(()=>calculateXP(xpState));
  useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);
  const pct=snap.percentRemaining;
  const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{flex:1,height:4,background:"#F1EDE8",borderRadius:2,overflow:"hidden"}}>
        <motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/>
      </div>
      <span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:40}}>{snap.currentXP}</span>
      <span style={{fontSize:11,color:"#94A3B8"}}>XP</span>
    </div>
  );
}

export default function MemoryGame() {
  const {user}=useAuthStore();
  const [stage,setStage]=useState(1);
  const [cards,setCards]=useState<Card[]>([]);
  const [selected,setSelected]=useState<number[]>([]);
  const [xpState,setXpState]=useState<XPState|null>(null);
  const [elapsed,setElapsed]=useState("00:00");
  const [moves,setMoves]=useState(0);
  const [completed,setCompleted]=useState(false);
  const [finalXP,setFinalXP]=useState(0);
  const checking=useRef(false);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const xp=createXPState(diff);
    setCards(makeCards(s)); setSelected([]); setMoves(0);
    setCompleted(false); setFinalXP(0); setElapsed("00:00");
    setXpState(xp); checking.current=false;
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
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
      if(a.value===b.value){
        const mc=nc.map(c=>c.id===a.id||c.id===b.id?{...c,matched:true}:c);
        setCards(mc); setSelected([]); checking.current=false;
        if(mc.every(c=>c.matched)&&xpState){
          const earned=finalizeXP(xpState); setFinalXP(earned); setCompleted(true);
          if(timerRef.current)clearInterval(timerRef.current);
          playSuccess(); setTimeout(()=>triggerConfetti(),80);
          if(user) saveScore({user_id:user.id,game_slug:"memory",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});
        }
      } else {
        playError();
        setTimeout(()=>{
          setCards(prev=>prev.map(c=>c.id===a.id||c.id===b.id?{...c,flipped:false}:c));
          setSelected([]); checking.current=false;
        },900);
      }
    }
  }

  if(!xpState||cards.length===0)return(
    <div style={{minHeight:"100vh",background:"#FDFCFB",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <p style={{color:"#94A3B8",fontFamily:"monospace"}}>Generating board...</p>
    </div>
  );

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const cols=getDifficulty(stage)==="easy"?4:6;
  const cellSize=getDifficulty(stage)==="easy"?70:56;

  return(
    <div style={{minHeight:"100vh",background:"#FDFCFB"}}>
      <Navbar/>
      <main style={{maxWidth:600,margin:"0 auto",padding:"88px 24px 48px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <Link href="/games" style={{display:"flex",alignItems:"center",gap:6,color:"#94A3B8",textDecoration:"none",fontSize:13}}>
            <ArrowLeft size={15}/> Games
          </Link>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>loadStage(stage)} style={{padding:8,borderRadius:10,border:"0.5px solid #E2E8F0",background:"white",cursor:"pointer",color:"#94A3B8"}}><RotateCcw size={14}/></button>
          </div>
        </div>

        <div style={{background:"white",borderRadius:20,border:"0.5px solid rgba(0,0,0,0.08)",padding:"18px 20px",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:13,color:"#94A3B8"}}>Stage</span>
              <span style={{fontSize:20,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()}</span>
            </div>
            <div style={{display:"flex",gap:16,fontSize:12,color:"#94A3B8"}}>
              <span>Moves: <strong style={{color:"#1C1917"}}>{moves}</strong></span>
              <span style={{fontFamily:"monospace"}}>{elapsed}</span>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},${cellSize}px)`,gap:8}}>
            {cards.map(card=>(
              <motion.button key={card.id} onClick={()=>handleFlip(card.id)} whileTap={{scale:0.9}}
                style={{width:cellSize,height:cellSize,borderRadius:14,border:"1.5px solid",cursor:card.matched||card.flipped?"default":"pointer",outline:"none",perspective:600,background:"transparent",padding:0}}>
                <motion.div animate={{rotateY:card.flipped||card.matched?0:180}} transition={{duration:0.26}}
                  style={{transformStyle:"preserve-3d",position:"relative",width:"100%",height:"100%"}}>
                  {/* Front */}
                  <div style={{backfaceVisibility:"hidden",position:"absolute",inset:0,borderRadius:12,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:cellSize*0.38,
                    background:card.matched?"#F0FDF4":"white",
                    border:`1.5px solid ${card.matched?"#86EFAC":"#E8E4DE"}`}}>
                    {card.value}
                  </div>
                  {/* Back */}
                  <div style={{backfaceVisibility:"hidden",transform:"rotateY(180deg)",position:"absolute",inset:0,borderRadius:12,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    background:"linear-gradient(135deg,#EEF2FF,#E0E7FF)",border:"1.5px solid #C7D2FE"}}>
                    <div style={{width:cellSize*0.22,height:cellSize*0.22,borderRadius:"50%",background:"rgba(79,110,247,0.2)"}}/>
                  </div>
                </motion.div>
              </motion.button>
            ))}
          </div>
        </div>

        <div style={{background:"white",borderRadius:20,border:"0.5px solid rgba(0,0,0,0.08)",padding:"16px 18px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <p style={{fontSize:10,fontWeight:600,color:"#94A3B8",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>Stage Select</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {Array.from({length:100},(_,i)=>i+1).map(s=>{
              const d=getDifficulty(s); const c=d==="easy"?"#22C55E":d==="medium"?"#F59E0B":"#EF4444"; const active=s===stage;
              return(<button key={s} onClick={()=>setStage(s)} style={{width:24,height:24,borderRadius:6,fontSize:9,fontWeight:600,cursor:"pointer",background:active?c:"#F8F7F5",color:active?"white":"#94A3B8",border:`0.5px solid ${active?c:"#EDE9E4"}`,transition:"all 0.15s"}}>{s}</button>);
            })}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {completed&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}}
              style={{background:"white",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
              <CheckCircle size={44} color="#22C55E" style={{margin:"0 auto 16px"}}/>
              <h2 style={{fontSize:24,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif",marginBottom:4}}>Stage {stage} Complete</h2>
              <p style={{fontSize:13,color:"#94A3B8",marginBottom:24}}>{moves} moves · {elapsed}</p>
              <div style={{background:"#F8F7F5",borderRadius:16,padding:20,marginBottom:24}}>
                <p style={{fontSize:11,color:"#94A3B8",fontWeight:600,marginBottom:4}}>XP EARNED</p>
                <p style={{fontSize:44,fontWeight:700,color:"#4F6EF7",fontFamily:"Georgia,serif"}}>{finalXP}</p>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>loadStage(stage)} style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid #E2E8F0",background:"white",fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer"}}>Retry</button>
                {stage<100&&<button onClick={()=>setStage(s=>s+1)} style={{flex:1,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",fontSize:13,fontWeight:700,color:"white",cursor:"pointer"}}>Next Stage</button>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
