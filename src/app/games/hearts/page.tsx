"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "hearts";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef, Suspense }from"react";
import{useSearchParams}from"next/navigation";
import{motion,AnimatePresence}from"framer-motion";
import{ChevronRight}from"lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { updateStreak } from "@/lib/supabase/streaks";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import{createXPState,calculateXP,finalizeXP,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { GameShell } from "@/components/game";
import { useSettingsStore } from "@/store/settingsStore";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function getDifficulty(s:number):Difficulty{if(s===1)return"medium";const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;return h<20?"easy":h<70?"medium":"hard";}
type Suit="♥"|"♦"|"♣"|"♠";
type Card={suit:Suit;value:number;label:string};
function makeDecks():Card[]{const suits:Suit[]=["♥","♦","♣","♠"];const labels=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];return suits.flatMap(suit=>labels.map((label,i)=>({suit,value:i+2,label})));}
function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}
function shuffleCards(cards:Card[],seed:number):Card[]{const rng=mulberry32(seed);const a=[...cards];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function cardPoints(card:Card):number{if(card.suit==="♥")return 1;if(card.suit==="♠"&&card.label==="Q")return 13;return 0;}
function cardColor(suit:Suit):string{return suit==="♥"||suit==="♦"?"#DC2626":"var(--color-text-primary)";}
function isDangerous(card:Card):boolean{return card.suit==="♥"||(card.suit==="♠"&&card.label==="Q");}

function CardUI({card,selected,onClick,faceDown,isDark}:{card:Card;selected?:boolean;onClick?:()=>void;faceDown?:boolean;isDark?:boolean}){
  const danger = !faceDown && isDangerous(card);
  const cardBg = faceDown
    ? "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-secondary))"
    : isDark
      ? selected ? "color-mix(in srgb, var(--color-accent-primary) 10%, rgba(8,16,28,0.97))" : "rgba(14,24,40,0.95)"
      : selected ? "color-mix(in srgb, var(--color-accent-primary) 12%, var(--color-surface))" : "var(--color-surface)";
  const cardBorder = faceDown
    ? "1.5px solid rgba(255,255,255,0.25)"
    : isDark
      ? selected ? "1.5px solid rgba(0,255,255,0.85)" : danger ? "1px solid rgba(220,38,38,0.25)" : "1px solid rgba(255,255,255,0.1)"
      : `2px solid ${selected?"var(--color-accent-primary)":"var(--color-border)"}`;
  const cardShadow = isDark && !faceDown
    ? selected ? "0 0 0 1px rgba(0,255,255,0.45), 0 0 14px rgba(0,255,255,0.18), 0 4px 14px rgba(0,0,0,0.5)"
      : danger ? "0 0 8px rgba(220,38,38,0.18), 0 2px 8px rgba(0,0,0,0.4)"
      : "0 2px 6px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)"
    : selected ? "0 4px 12px rgba(0,255,255,0.2)" : "0 2px 6px rgba(0,0,0,0.06)";
  return(<motion.button onClick={onClick} whileHover={onClick?{y:-6}:{}} whileTap={onClick?{scale:0.95}:{}}
    style={{width:52,height:76,borderRadius:8,border:cardBorder,background:cardBg,cursor:onClick?"pointer":"default",outline:"none",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"flex-start",padding:"4px 5px",boxShadow:cardShadow,flexShrink:0}}>
    {!faceDown&&<><span style={{fontSize:13,fontWeight:700,color:cardColor(card.suit),lineHeight:1,fontFamily:"var(--font-mono)"}}>{card.label}</span><span style={{fontSize:18,color:cardColor(card.suit),lineHeight:1,marginTop:2}}>{card.suit}</span></>}
  </motion.button>);
}

function HeartsPageInner(){
  const{user}=useAuthStore();
  const{theme}=useSettingsStore();
  const searchParams=useSearchParams();
  const isDaily=searchParams.get("daily")==="1";
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const[completed,setCompleted]=useState(false);
  const[showMap,setShowMap]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[hand,setHand]=useState<Card[]>([]);
  const[cpuHand,setCpuHand]=useState<Card[]>([]);
  const[trick,setTrick]=useState<{player:Card|null;cpu:Card|null}>({player:null,cpu:null});
  const[playerScore,setPlayerScore]=useState(0);
  const[cpuScore,setCpuScore]=useState(0);
  const[selected,setSelected]=useState<number|null>(null);
  const[phase,setPhase]=useState<"play"|"result"|"done">("play");
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsedSeconds,setElapsedSeconds]=useState(0);
  const[liveXP,setLiveXP]=useState(1000);
  const[finalElapsed,setFinalElapsed]=useState("0:00");
  const[finalXP,setFinalXP]=useState(0);
  const[message,setMessage]=useState("");
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const[history,setHistory]=useState<{hand:Card[];cpuHand:Card[];playerScore:number;cpuScore:number}[]>([]);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  usePageVisibility(
    ()=>{if(timerRef.current)clearInterval(timerRef.current);},
    ()=>{if(xpState&&!completed){timerRef.current=setInterval(()=>{setElapsedSeconds(Math.floor((Date.now()-xpState.startTime)/1000));setLiveXP(calculateXP(xpState).currentXP);},500);}}
  );

  const loadStage=useCallback((s:number)=>{
    saveGameState("hearts",{stage:s,savedAt:Date.now()});
    const diff=getDifficulty(s);
    const rng=mulberry32(seedToNum(`hearts-${diff}-${s}`));
    const deck=shuffleCards(makeDecks(),Math.floor(rng()*999999));
    setHand(deck.slice(0,13));setCpuHand(deck.slice(13,26));
    setTrick({player:null,cpu:null});setPlayerScore(0);setCpuScore(0);setSelected(null);setPhase("play");setMessage("");
    const xp=createXPState(diff);
    setXpState(xp);setFinalXP(0);setElapsedSeconds(0);setLiveXP(1000);setFinalElapsed("0:00");setHintsUsed(0);setSolutionRevealed(false);
    setHistory([]);
    setNextUncompleted(null);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{setElapsedSeconds(Math.floor((Date.now()-xp.startTime)/1000));setLiveXP(calculateXP(xp).currentXP);},500);
    if(user&&!isDaily)consumeToken(user.id);
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleRevealSolution(){
    if(!xpState)return;
    setSolutionRevealed(true);
    setXpState(prev=>prev?{...prev,startTime:Date.now()-prev.decayDuration*1000}:prev);
    if(timerRef.current)clearInterval(timerRef.current);
    setMessage("Strategy: Avoid ♥ and Q♠. Lead low cards. Pass high ♥ and Q♠ to CPU.");
  }

  function playCard(){
    if(selected===null||phase!=="play"||solutionRevealed)return;
    const playerCard=hand[selected];
    const cpuIdx=Math.floor(Math.random()*cpuHand.length);
    const cpuCard=cpuHand[cpuIdx];
    setHistory(h=>[...h.slice(-19),{hand:[...hand],cpuHand:[...cpuHand],playerScore,cpuScore}]);
    setTrick({player:playerCard,cpu:cpuCard});setPhase("result");playClick();
    const playerWins=playerCard.value>cpuCard.value;
    const trickPts=[playerCard,cpuCard].reduce((s,c)=>s+cardPoints(c),0);
    setTimeout(()=>{
      const newHand=hand.filter((_,i)=>i!==selected);
      const newCpuHand=cpuHand.filter((_,i)=>i!==cpuIdx);
      if(playerWins){setPlayerScore(s=>s+trickPts);setMessage(trickPts>0?`You took ${trickPts} point${trickPts>1?"s":""}!`:"You won the trick.");}
      else{setCpuScore(s=>s+trickPts);setMessage(trickPts>0?`CPU took ${trickPts} point${trickPts>1?"s":""}!`:"CPU won the trick.");}
      setHand(newHand);setCpuHand(newCpuHand);setTrick({player:null,cpu:null});setSelected(null);
      if(newHand.length===0){
        setTimeout(()=>{
          setPhase("done");if(timerRef.current)clearInterval(timerRef.current);
          const fp=playerScore+(playerWins?trickPts:0),fc=cpuScore+(!playerWins?trickPts:0);
          const won=fp<fc;
          if(won&&xpState){
            const earned=finalizeXP(xpState);setFinalXP(earned);
            setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));
            playSuccess();setTimeout(()=>triggerConfetti(),80);markStageCompleted("hearts",stage);
            if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"hearts",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000),hints_used:hintsUsed});}
          }
          else playError();
        },800);
      } else setPhase("play");
    },1200);
  }

  function handleUndo(){
    if(history.length===0||phase!=="play")return;
    const last=history[history.length-1];
    setHand(last.hand);setCpuHand(last.cpuHand);setPlayerScore(last.playerScore);setCpuScore(last.cpuScore);
    setSelected(null);setMessage("");setHistory(h=>h.slice(0,-1));
    playClick();
  }

  function handleHint(){
    if(!xpState||hintsUsed>=3||phase!=="play"||solutionRevealed)return;
    const safe=hand.filter(c=>c.suit!=="♥"&&!(c.suit==="♠"&&c.label==="Q"));
    const suggested=(safe.length>0?safe:hand).reduce((a,b)=>a.value<b.value?a:b);
    const idx=hand.findIndex(c=>c.suit===suggested.suit&&c.label===suggested.label);
    setSelected(idx);setHintsUsed(h=>h+1);setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);playError();
  }

  if(!xpState)return(<div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--color-text-secondary)",fontSize:13}}>Dealing cards...</p></div>);

  const isDark = theme === "dark";
  const won=phase==="done"&&playerScore<=cpuScore;
  const boardBg = isDark
    ? {background:`radial-gradient(circle, rgba(0,255,255,0.06) 1px, transparent 1px), #060d18`, backgroundSize:"18px 18px"}
    : theme === "paper"
    ? {background:`radial-gradient(circle, rgba(60,80,60,0.10) 1px, transparent 1px), #1a3a28`, backgroundSize:"18px 18px"}
    : {background:`linear-gradient(135deg, #0F4C2A, #1A6B3A)`};
  const boardShadow = isDark
    ? "0 0 0 1px color-mix(in srgb, var(--color-accent-primary) 13%, transparent), 0 20px 60px rgba(0,0,0,0.6)"
    : "0 8px 32px rgba(0,0,0,0.2)";
  const emptySlotBorder = isDark ? "2px dashed rgba(0,255,255,0.12)" : "2px dashed rgba(255,255,255,0.2)";
  const overlayColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.5)";
  const labelColor = isDark ? "rgba(0,255,255,0.45)" : "rgba(255,255,255,0.6)";

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Hearts"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
      >
        <GamePageSchema slug={GAME_SLUG} />
        <div style={{...boardBg,minHeight:"100%",padding:"16px 16px 32px",display:"flex",flexDirection:"column",alignItems:"center",gap:16,borderRadius:20,width:"100%",maxWidth:560,boxShadow:boardShadow,border:isDark?"1px solid color-mix(in srgb, var(--color-accent-primary) 12%, transparent)":"none"}}>
          <div style={{display:"flex",gap:12,width:"100%",maxWidth:500}}>
            {[{label:"YOU",score:playerScore,isPlayer:true},{label:"CPU",score:cpuScore,isPlayer:false}].map(s=>(
              <div key={s.label} style={{flex:1,
                background:isDark?"rgba(6,13,24,0.8)":"rgba(255,255,255,0.1)",
                borderRadius:16,padding:"12px 16px",
                backdropFilter:"blur(8px)",
                border:isDark?"1px solid rgba(0,255,255,0.1)":"0.5px solid rgba(255,255,255,0.15)",
                boxShadow:isDark?"inset 0 1px 0 rgba(255,255,255,0.03)":"none"}}>
                <p style={{fontSize:10,color:labelColor,marginBottom:4,fontFamily:"var(--font-mono)",letterSpacing:"0.1em"}}>{s.label}</p>
                <p style={{fontSize:24,fontWeight:700,color:isDark?"var(--color-text-primary)":"white",fontFamily:"var(--font-mono)",letterSpacing:"-0.02em"}}>{s.score}<span style={{fontSize:12,color:"var(--color-error)",marginLeft:4}}>pts</span></p>
              </div>
            ))}
          </div>

          {solutionRevealed&&(
            <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
              style={{padding:"10px 20px",borderRadius:12,background:"color-mix(in srgb, var(--color-error) 10%, transparent)",border:"0.5px solid color-mix(in srgb, var(--color-error) 30%, transparent)",fontSize:11,fontWeight:600,color:"var(--color-error)",textAlign:"center",maxWidth:400,fontFamily:"var(--font-mono)",letterSpacing:"0.05em"}}>
              STRATEGY: AVOID ♥ AND Q♠ · PLAY LOW CARDS · XP SET TO 1
            </motion.div>
          )}

          <div style={{display:"flex",gap:-8,justifyContent:"center"}}>
            {cpuHand.slice(0,Math.min(7,cpuHand.length)).map((_,i)=>(<div key={i} style={{marginLeft:i>0?-20:0,zIndex:i}}><CardUI card={{suit:"♠",value:0,label:""}} faceDown isDark={isDark}/></div>))}
            {cpuHand.length>7&&<span style={{color:labelColor,fontSize:11,alignSelf:"center",marginLeft:8,fontFamily:"var(--font-mono)"}}>+{cpuHand.length-7}</span>}
          </div>

          <div style={{background:isDark?"rgba(0,0,0,0.35)":"rgba(0,0,0,0.2)",borderRadius:20,padding:"20px 32px",display:"flex",gap:32,alignItems:"center",minHeight:120,
            border:isDark?"1px solid rgba(255,255,255,0.05)":"none",
            backdropFilter:isDark?"blur(4px)":"none"}}>
            <div style={{textAlign:"center"}}>
              <p style={{fontSize:10,color:labelColor,marginBottom:8,fontFamily:"var(--font-mono)",letterSpacing:"0.1em"}}>CPU</p>
              {trick.cpu?<CardUI card={trick.cpu} isDark={isDark}/>:<div style={{width:52,height:76,borderRadius:8,border:emptySlotBorder}}/>}
            </div>
            <div style={{fontSize:18,color:isDark?"rgba(0,255,255,0.2)":"rgba(255,255,255,0.3)",fontFamily:"var(--font-mono)",fontWeight:700}}>VS</div>
            <div style={{textAlign:"center"}}>
              <p style={{fontSize:10,color:labelColor,marginBottom:8,fontFamily:"var(--font-mono)",letterSpacing:"0.1em"}}>YOU</p>
              {trick.player?<CardUI card={trick.player} isDark={isDark}/>:<div style={{width:52,height:76,borderRadius:8,border:emptySlotBorder}}/>}
            </div>
          </div>

          {message&&<motion.p initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} style={{fontSize:13,color:overlayColor,fontWeight:600,textAlign:"center",fontFamily:"var(--font-mono)",letterSpacing:"0.05em"}}>{message}</motion.p>}

          <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",maxWidth:420}}>
            {hand.map((card,i)=>(<CardUI key={`${card.suit}${card.label}`} card={card} isDark={isDark} selected={selected===i} onClick={phase==="play"&&!solutionRevealed?()=>setSelected(selected===i?null:i):undefined}/>))}
          </div>

          {selected!==null&&phase==="play"&&!solutionRevealed&&(
            <motion.button onClick={playCard} whileHover={{scale:1.04,boxShadow:isDark?"0 0 18px rgba(57,255,20,0.22)":"none"}}
              style={{padding:"12px 32px",borderRadius:14,border:isDark?"1px solid rgba(57,255,20,0.3)":"none",
                background:isDark?"rgba(57,255,20,0.1)":"var(--color-surface)",
                fontSize:12,fontWeight:700,color:isDark?"var(--color-accent-secondary)":"var(--color-accent-secondary)",cursor:"pointer",
                fontFamily:"var(--font-mono)",letterSpacing:"0.08em",textTransform:"uppercase",
                boxShadow:isDark?"0 0 10px rgba(57,255,20,0.08)":"0 4px 12px rgba(0,0,0,0.2)"}}>
              PLAY {hand[selected].label}{hand[selected].suit}
            </motion.button>
          )}

          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>{ if(stage>1){ clearGameState(GAME_SLUG); setStage(s=>s-1); } }} disabled={stage===1} style={{padding:"8px 16px",borderRadius:10,border:"0.5px solid rgba(255,255,255,0.15)",background:isDark?"rgba(6,13,24,0.7)":"rgba(255,255,255,0.1)",cursor:stage>1?"pointer":"not-allowed",fontSize:11,color:labelColor,opacity:stage===1?0.4:1,fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:600}}>← PREV</button>
            <span style={{fontSize:11,color:labelColor,fontFamily:"var(--font-mono)",letterSpacing:"0.06em"}}>STAGE {stage} / {TOTAL_STAGES}</span>
            <button onClick={()=>{ clearGameState(GAME_SLUG); setStage(s=>s+1); }} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:10,border:"0.5px solid rgba(255,255,255,0.15)",background:isDark?"rgba(6,13,24,0.7)":"rgba(255,255,255,0.1)",cursor:"pointer",fontSize:11,color:labelColor,fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:600}}>NEXT <ChevronRight size={13}/></button>
          </div>
        </div>
      </GameShell>

      <AnimatePresence>
        {phase==="done"&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
          <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} transition={{type:"spring",stiffness:380,damping:28}}
            style={{background:isDark?"rgba(8,16,28,0.97)":"var(--color-surface)",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",
              boxShadow:isDark
                ?won?"0 0 0 1px rgba(57,255,20,0.22), 0 32px 80px rgba(0,0,0,0.65), 0 0 40px rgba(57,255,20,0.07)":"0 0 0 1px rgba(255,68,68,0.15), 0 32px 80px rgba(0,0,0,0.65)"
                :"0 32px 80px rgba(0,0,0,0.3)",
              border:isDark?"none":"0.5px solid var(--color-border)"}}>
            <div style={{fontSize:40,marginBottom:12,fontFamily:"var(--font-mono)"}}>{won?"♠":"♥"}</div>
            <h2 style={{fontSize:24,fontWeight:700,color:isDark?(won?"var(--color-accent-secondary)":"var(--color-error)"):"var(--color-text-primary)",fontFamily:"var(--font-mono)",marginBottom:6,letterSpacing:"0.04em"}}>{won?"YOU WIN":"CPU WINS"}</h2>
            <p style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:24,fontFamily:"var(--font-mono)",letterSpacing:"0.06em"}}>YOU {playerScore}pts · CPU {cpuScore}pts</p>
            {won&&<div style={{background:isDark?"rgba(57,255,20,0.06)":"var(--color-surface-2)",border:isDark?"1px solid rgba(57,255,20,0.18)":"none",borderRadius:16,padding:20,marginBottom:20,boxShadow:isDark?"0 0 20px rgba(57,255,20,0.06)":"none"}}>
              <p style={{fontSize:10,color:"var(--color-text-secondary)",fontWeight:600,marginBottom:4,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"var(--font-mono)"}}>XP EARNED</p>
              <p style={{fontSize:48,fontWeight:700,color:isDark?"var(--color-accent-secondary)":"var(--color-accent-primary)",fontFamily:"var(--font-mono)"}}>{finalXP}</p>
            </div>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>loadStage(stage)} style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",fontSize:11,fontWeight:600,color:"var(--color-text-secondary)",cursor:"pointer",fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase"}}>RETRY</button>
              <button onClick={()=>{ clearGameState(GAME_SLUG); setStage(s=>s+1); }} style={{flex:2,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-secondary))",fontSize:11,fontWeight:700,color:"#060d18",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase",boxShadow:isDark?"0 0 16px rgba(0,255,255,0.18)":"none"}}>NEXT <ChevronRight size={13}/></button>
            </div>
          </motion.div>
        </motion.div>)}
      </AnimatePresence>

      {showMap&&<StageMap gameSlug="hearts" totalStages={TOTAL_STAGES} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
    </>
  );
}
export default function HeartsPage(){return<ErrorBoundary game="hearts"><Suspense fallback={<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100dvh",background:"var(--color-bg)",color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)",fontSize:14}}>Loading...</div>}><HeartsPageInner/></Suspense></ErrorBoundary>;}