"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,ChevronRight,Share2,Trophy}from"lucide-react";
import Link from"next/link";
import{Navbar}from"@/components/nav/Navbar";
import{createXPState,calculateXP,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";

function getDifficulty(s:number):Difficulty{return s<=300?"easy":s<=700?"medium":"hard";}

type Suit="♥"|"♦"|"♣"|"♠";
type Card={suit:Suit;value:number;label:string};

function makeDecks():Card[]{
  const suits:Suit[]=["♥","♦","♣","♠"];
  const labels=["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  return suits.flatMap(suit=>labels.map((label,i)=>({suit,value:i+2,label})));
}

function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

function shuffleCards(cards:Card[],seed:number):Card[]{
  const rng=mulberry32(seed);
  const a=[...cards];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

function cardPoints(card:Card):number{
  if(card.suit==="♥")return 1;
  if(card.suit==="♠"&&card.label==="Q")return 13;
  return 0;
}

function cardColor(suit:Suit):string{
  return suit==="♥"||suit==="♦"?"#DC2626":"#1C1917";
}

function XPBar({xpState}:{xpState:XPState}){
  const[snap,setSnap]=useState(()=>calculateXP(xpState));
  useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);
  const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";
  return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);
}

function CardUI({card,selected,onClick,faceDown}:{card:Card;selected?:boolean;onClick?:()=>void;faceDown?:boolean}){
  return(
    <motion.button onClick={onClick} whileHover={onClick?{y:-6}:{}} whileTap={onClick?{scale:0.95}:{}}
      style={{width:52,height:76,borderRadius:8,border:`2px solid ${selected?"#4F6EF7":"#E2E8F0"}`,
        background:faceDown?"linear-gradient(135deg,#4F6EF7,#9C6BE8)":selected?"#EEF2FF":"white",
        cursor:onClick?"pointer":"default",outline:"none",display:"flex",flexDirection:"column",
        alignItems:"flex-start",justifyContent:"flex-start",padding:"4px 5px",
        boxShadow:selected?"0 4px 12px rgba(79,110,247,0.2)":"0 2px 6px rgba(0,0,0,0.06)",
        flexShrink:0}}>
      {!faceDown&&<>
        <span style={{fontSize:13,fontWeight:700,color:cardColor(card.suit),lineHeight:1}}>{card.label}</span>
        <span style={{fontSize:18,color:cardColor(card.suit),lineHeight:1,marginTop:2}}>{card.suit}</span>
      </>}
    </motion.button>
  );
}

export default function HeartsPage(){
  const{user}=useAuthStore();
  const[stage,setStage]=useState(1);
  const[hand,setHand]=useState<Card[]>([]);
  const[cpuHand,setCpuHand]=useState<Card[]>([]);
  const[trick,setTrick]=useState<{player:Card|null;cpu:Card|null}>({player:null,cpu:null});
  const[playerScore,setPlayerScore]=useState(0);
  const[cpuScore,setCpuScore]=useState(0);
  const[selected,setSelected]=useState<number|null>(null);
  const[phase,setPhase]=useState<"play"|"result"|"done">("play");
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[finalXP,setFinalXP]=useState(0);
  const[message,setMessage]=useState("");
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const rng=mulberry32(seedToNum(`hearts-${diff}-${s}`));
    const deck=shuffleCards(makeDecks(),Math.floor(rng()*999999));
    // Deal 13 cards each
    setHand(deck.slice(0,13));
    setCpuHand(deck.slice(13,26));
    setTrick({player:null,cpu:null});
    setPlayerScore(0);setCpuScore(0);setSelected(null);setPhase("play");setMessage("");
    const xp=createXPState(diff);
    setXpState(xp);setFinalXP(0);setElapsed("00:00");
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user)consumeToken(user.id);
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function playCard(){
    if(selected===null||phase!=="play")return;
    const playerCard=hand[selected];
    // CPU plays a random card
    const cpuIdx=Math.floor(Math.random()*cpuHand.length);
    const cpuCard=cpuHand[cpuIdx];
    setTrick({player:playerCard,cpu:cpuCard});
    setPhase("result");
    playClick();

    // Determine winner (simplified: higher value in led suit wins)
    const playerWins=playerCard.value>cpuCard.value;
    const trickPts=[playerCard,cpuCard].reduce((s,c)=>s+cardPoints(c),0);

    setTimeout(()=>{
      const newHand=hand.filter((_,i)=>i!==selected);
      const newCpuHand=cpuHand.filter((_,i)=>i!==cpuIdx);

      if(playerWins){
        setPlayerScore(s=>s+trickPts);
        setMessage(trickPts>0?`You took ${trickPts} point${trickPts>1?"s":""}! 😬`:"You won the trick — no points.");
      } else {
        setCpuScore(s=>s+trickPts);
        setMessage(trickPts>0?`CPU took ${trickPts} point${trickPts>1?"s":""}! 😌`:"CPU won the trick.");
      }

      setHand(newHand);setCpuHand(newCpuHand);
      setTrick({player:null,cpu:null});setSelected(null);

      if(newHand.length===0){
        // Game over
        setTimeout(()=>{
          setPhase("done");
          if(playerWins||playerScore<cpuScore){
            // Player wins if fewer points
          }
          if(xpState){
            const won=playerScore<=cpuScore;
            if(won){const earned=finalizeXP(xpState);setFinalXP(earned);playSuccess();setTimeout(()=>triggerConfetti(),80);if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"hearts",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}
            else playError();
          }
        },800);
      } else {
        setPhase("play");
      }
    },1200);
  }

  if(!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Dealing cards...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const won=phase==="done"&&playerScore<=cpuScore;

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0F4C2A,#1A6B3A)",display:"flex",flexDirection:"column"}}>
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:16}}>
        {/* Header */}
        <div style={{width:"100%",maxWidth:540,background:"rgba(255,255,255,0.1)",borderRadius:20,border:"0.5px solid rgba(255,255,255,0.2)",padding:"16px 20px",backdropFilter:"blur(12px)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Link href="/games" style={{color:"rgba(255,255,255,0.7)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"rgba(255,255,255,0.2)"}}/>
              <span style={{fontSize:20,fontWeight:700,color:"white",fontFamily:"Georgia,serif"}}>{stage}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:12,color:"rgba(255,255,255,0.7)",fontFamily:"monospace"}}>{elapsed}</span>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",cursor:"pointer",color:"rgba(255,255,255,0.7)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {/* Scores */}
        <div style={{display:"flex",gap:16,width:"100%",maxWidth:540}}>
          {[{label:"You",score:playerScore,color:"#EF4444"},{label:"CPU",score:cpuScore,color:"var(--text4)"}].map(s=>(
            <div key={s.label} style={{flex:1,background:"rgba(255,255,255,0.1)",borderRadius:16,padding:"12px 16px",backdropFilter:"blur(8px)",border:"0.5px solid rgba(255,255,255,0.15)"}}>
              <p style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:4}}>{s.label}</p>
              <p style={{fontSize:24,fontWeight:700,color:"white",fontFamily:"Georgia,serif"}}>{s.score} <span style={{fontSize:14,color:s.color}}>pts</span></p>
            </div>
          ))}
        </div>

        {/* CPU hand (face down) */}
        <div style={{display:"flex",gap:-8,justifyContent:"center"}}>
          {cpuHand.slice(0,Math.min(7,cpuHand.length)).map((_,i)=>(
            <div key={i} style={{marginLeft:i>0?-20:0,zIndex:i}}>
              <CardUI card={{suit:"♠",value:0,label:""}} faceDown/>
            </div>
          ))}
          {cpuHand.length>7&&<span style={{color:"rgba(255,255,255,0.5)",fontSize:12,alignSelf:"center",marginLeft:8}}>+{cpuHand.length-7}</span>}
        </div>

        {/* Current trick */}
        <div style={{background:"rgba(0,0,0,0.2)",borderRadius:20,padding:"20px 32px",display:"flex",gap:32,alignItems:"center",minHeight:120}}>
          <div style={{textAlign:"center"}}>
            <p style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:8}}>CPU plays</p>
            {trick.cpu?<CardUI card={trick.cpu}/>:<div style={{width:52,height:76,borderRadius:8,border:"2px dashed rgba(255,255,255,0.2)"}}/>}
          </div>
          <div style={{fontSize:24,color:"rgba(255,255,255,0.3)"}}>VS</div>
          <div style={{textAlign:"center"}}>
            <p style={{fontSize:10,color:"rgba(255,255,255,0.5)",marginBottom:8}}>Your play</p>
            {trick.player?<CardUI card={trick.player}/>:<div style={{width:52,height:76,borderRadius:8,border:"2px dashed rgba(255,255,255,0.2)"}}/>}
          </div>
        </div>

        {/* Message */}
        {message&&<motion.p initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} style={{fontSize:14,color:"rgba(255,255,255,0.85)",fontWeight:600,textAlign:"center"}}>{message}</motion.p>}

        {/* Player hand */}
        <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",maxWidth:400}}>
          {hand.map((card,i)=>(
            <CardUI key={`${card.suit}${card.label}`} card={card}
              selected={selected===i}
              onClick={phase==="play"?()=>setSelected(selected===i?null:i):undefined}/>
          ))}
        </div>

        {selected!==null&&phase==="play"&&(
          <button onClick={playCard}
            style={{padding:"12px 32px",borderRadius:14,border:"none",background:"var(--surface)",fontSize:14,fontWeight:700,color:"#1A6B3A",cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.2)"}}>
            Play {hand[selected].label}{hand[selected].suit}
          </button>
        )}

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"rgba(255,255,255,0.6)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",cursor:"pointer",fontSize:12,color:"rgba(255,255,255,0.7)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      <AnimatePresence>
        {phase==="done"&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
          <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} style={{background:"var(--surface)",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.3)"}}>
            <div style={{fontSize:48,marginBottom:16}}>{won?"🏆":"😔"}</div>
            <h2 style={{fontSize:26,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif",marginBottom:4}}>{won?"You Win!":"CPU Wins"}</h2>
            <p style={{fontSize:13,color:"var(--text3)",marginBottom:24}}>Your score: {playerScore} · CPU: {cpuScore}</p>
            {won&&<><div style={{background:"var(--bg2)",borderRadius:16,padding:20,marginBottom:20}}><p style={{fontSize:11,color:"var(--text4)",fontWeight:600,marginBottom:4}}>XP EARNED</p><p style={{fontSize:48,fontWeight:700,color:"#4F6EF7",fontFamily:"Georgia,serif"}}>{finalXP}</p></div><button onClick={()=>{const text=`♥ MindState · Hearts Stage ${stage} · ${playerScore} pts (CPU: ${cpuScore})`;if(navigator.share)navigator.share({title:"MindState",text,url:"https://mindstate.vercel.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}} style={{width:"100%",marginBottom:12,padding:"11px",borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Share2 size={14}/> Share Result</button></>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>loadStage(stage)} style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>Retry</button>
              <button onClick={()=>{setStage(s=>s+1);}} style={{flex:2,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",fontSize:13,fontWeight:700,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>Next Stage <ChevronRight size={14}/></button>
            </div>
          </motion.div>
        </motion.div>)}
      </AnimatePresence>
    </div>
  );
}
