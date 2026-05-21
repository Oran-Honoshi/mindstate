"use client";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Navbar } from "@/components/nav/Navbar";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { HintButton } from "@/components/ui/HintButton";
import { ShowSolution } from "@/components/ui/ShowSolution";
import { updateStreak } from "@/lib/supabase/streaks";
import { generateCountryGame, scoreGuess, type CountryGameBoard, type LetterResult } from "@/lib/games/countryGameGenerator";
import { createXPState, calculateXP, finalizeXP, formatElapsed, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { consumeToken } from "@/lib/games/tokenEngine";
import { useBoardWidth } from "@/hooks/useScreenWidth";
import { GamePageSchema } from "@/components/seo/GamePageSchema";

function getDifficulty(s:number):Difficulty{
  if(s===1)return"easy";
  const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;
  return h<30?"easy":h<70?"medium":"hard";
}
const TILE:Record<LetterResult,{bg:string;border:string;text:string}>={
  correct:{bg:"#22C55E",border:"#16A34A",text:"white"},
  present:{bg:"#F59E0B",border:"#D97706",text:"white"},
  absent: {bg:"#4B5563",border:"#374151",text:"white"},
};
const KB=[["Q","W","E","R","T","Y","U","I","O","P"],["A","S","D","F","G","H","J","K","L"],["ENTER","Z","X","C","V","B","N","M","\u232b"]];

function XPBar({xpState}:{xpState:XPState}){
  const[snap,setSnap]=useState(()=>calculateXP(xpState));
  useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);
  const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";
  return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);
}

function NameCountryInner(){
  const{user}=useAuthStore();
  const [stage, setStage] = useState(() => getLastStage("name-country"));
  const[board,setBoard]=useState<CountryGameBoard|null>(null);
  const[guesses,setGuesses]=useState<string[]>([]);
  const[results,setResults]=useState<LetterResult[][]>([]);
  const[current,setCurrent]=useState("");
  const[shake,setShake]=useState(false);
  const[completed,setCompleted]=useState(false);
  const[showMap,setShowMap]=useState(false);
  const[lost,setLost]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[shownHints,setShownHints]=useState<string[]>([]);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[finalXP,setFinalXP]=useState(0);
  const[solutionRevealed,setSolutionRevealed]=useState(false);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const gridAreaWidth=useBoardWidth(32,480);

  usePageVisibility(
    ()=>{if(timerRef.current)clearInterval(timerRef.current);},
    ()=>{if(xpState&&!completed)timerRef.current=setInterval(()=>setElapsed(formatElapsed(xpState.startTime)),1000);}
  );

  const loadStage=useCallback((s:number)=>{
    saveGameState("name-country",{stage:s,savedAt:Date.now()});
    const diff=getDifficulty(s);
    const b=generateCountryGame(`country-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setGuesses([]);setResults([]);setCurrent("");
    setCompleted(false);setLost(false);setFinalXP(0);
    setHintsUsed(0);setShownHints([]);setElapsed("00:00");setXpState(xp);
    setSolutionRevealed(false);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user){const ok=consumeToken(user.id);if(!ok)return;}
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  // \u2500\u2500 Show Solution \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  function handleRevealSolution(){
    if(!board||!xpState)return;
    setLost(true);
    setSolutionRevealed(true);
    setXpState(prev=>prev?{...prev,startTime:Date.now()-prev.decayDuration*1000}:prev);
    if(timerRef.current)clearInterval(timerRef.current);
  }

  const letterStates=new Map<string,LetterResult>();
  results.forEach((res,gi)=>{res.forEach((r,li)=>{const letter=guesses[gi][li];const prev=letterStates.get(letter);if(prev==="correct")return;if(prev==="present"&&r==="absent")return;letterStates.set(letter,r);});});

  function handleKey(key:string){
    if(!board||completed||lost)return;
    if(key==="Enter"){submitGuess();return;}
    if(key==="Backspace"){setCurrent(c=>c.slice(0,-1));return;}
    if(/^[A-Za-z]$/.test(key)&&current.length<board.wordLength){setCurrent(c=>c+key.toUpperCase());playClick();}
  }
  useEffect(()=>{function onKey(e:KeyboardEvent){handleKey(e.key);}window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);},[board,current,completed,lost]);

  function submitGuess(){
    if(!board||!xpState||current.length!==board.wordLength){setShake(true);setTimeout(()=>setShake(false),500);playError();return;}
    const res=scoreGuess(current,board.answer);
    const ng=[...guesses,current];const nr=[...results,res];
    setGuesses(ng);setResults(nr);setCurrent("");
    const won=res.every(r=>r==="correct");
    const out=ng.length>=board.maxGuesses&&!won;
    if(won){setTimeout(()=>{const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);clearGameState("name-country");if(timerRef.current)clearInterval(timerRef.current);playSuccess();triggerConfetti();if(user){updateStreak(user.id);saveScore({user_id:user.id,game_slug:"name-country",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}},board.wordLength*100+400);}
    else if(out){setTimeout(()=>{setLost(true);if(timerRef.current)clearInterval(timerRef.current);playError();},board.wordLength*100+400);}
  }

  function handleHint(){
    if(!board||!xpState||hintsUsed>=3||completed||solutionRevealed)return;
    const hints=[`Continent: ${board.continent}`,`Capital: ${board.capital}`,board.hint1];
    const next=hints[hintsUsed];
    if(next){setShownHints(h=>[...h,next]);setHintsUsed(h=>h+1);setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);}
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><p>Loading...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const cellSize=Math.min(52,Math.floor((gridAreaWidth-(board.wordLength-1)*6)/board.wordLength));
  const currentXP=calculateXP(xpState).currentXP;

  return(
    <div className="game-page">
      <Navbar/>
      <GamePageSchema slug="name-country" />
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:16}}>
        <div style={{width:"100%",maxWidth:480,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:12,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>Name the Country</span>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:18,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        <AnimatePresence>
          {(completed||lost)&&(<motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:300,damping:20}} style={{fontSize:80,textAlign:"center",lineHeight:1}}>{board.flag}</motion.div>)}
        </AnimatePresence>

        {lost&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            style={{padding:"10px 20px",borderRadius:14,background:solutionRevealed?"rgba(239,68,68,0.08)":"#FEF2F2",border:`1px solid ${solutionRevealed?"rgba(239,68,68,0.2)":"#FECACA"}`,fontSize:14,fontWeight:700,color:"#EF4444",textAlign:"center"}}>
            {solutionRevealed?"Solution: ":"It was: "}{board.flag} {board.answer} \u00b7 Capital: {board.capital}
          </motion.div>
        )}

        {shownHints.length>0&&!solutionRevealed&&(
          <div style={{width:"100%",maxWidth:480,display:"flex",flexDirection:"column",gap:6}}>
            {shownHints.map((hint,i)=>(<motion.div key={i} initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{padding:"8px 16px",borderRadius:12,background:"#FFFBEB",border:"1px solid #FDE68A",fontSize:13,fontWeight:600,color:"#92400E"}}>\ud83d\udca1 {hint}</motion.div>))}
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:5,width:"100%",maxWidth:480,alignItems:"center"}}>
          {Array.from({length:board.maxGuesses},(_,gi)=>{
            const guess=gi<guesses.length?guesses[gi]:gi===guesses.length?current:"";
            const res=results[gi];
            return(
              <motion.div key={gi} animate={shake&&gi===guesses.length?{x:[-6,6,-4,4,0]}:{}} style={{display:"flex",gap:5}}>
                {Array.from({length:board.wordLength},(_,li)=>{
                  const letter=guess[li]??"";const result=res?.[li];const color=result?TILE[result]:null;
                  return(<motion.div key={li} animate={result?{rotateX:[0,-90,0]}:{}} transition={{delay:li*0.1,duration:0.3}} style={{width:cellSize,height:cellSize,borderRadius:7,border:`2px solid ${color?color.border:letter?"#4F6EF7":"var(--border2)"}`,background:color?color.bg:"var(--surface)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(cellSize*0.4),fontWeight:700,color:color?color.text:"var(--text1)",fontFamily:"Georgia,serif"}}>{letter}</motion.div>);
                })}
              </motion.div>
            );
          })}
        </div>

        {!lost&&(
          <div style={{display:"flex",flexDirection:"column",gap:6,width:"100%",maxWidth:480}}>
            {KB.map((row,ri)=>(
              <div key={ri} style={{display:"flex",justifyContent:"center",gap:5}}>
                {row.map(key=>{const state=letterStates.get(key);const color=state?TILE[state]:null;const isWide=key==="ENTER"||key==="\u232b";return(<motion.button key={key} whileTap={{scale:0.9}} onClick={()=>handleKey(key==="\u232b"?"Backspace":key==="ENTER"?"Enter":key)} style={{width:isWide?58:34,height:46,borderRadius:8,border:"none",background:color?color.bg:"var(--bg3)",color:color?color.text:"var(--text2)",fontSize:isWide?11:13,fontWeight:700,cursor:"pointer"}}>{key}</motion.button>);})}
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap",justifyContent:"center"}}>
          <HintButton hintsLeft={3-hintsUsed} xpCost={100} onUseHint={handleHint} disabled={completed||lost}/>
          <ShowSolution onReveal={handleRevealSolution} currentXP={currentXP} disabled={completed||lost||solutionRevealed}/>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>\u2190 Prev</button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 100</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      {showMap&&<StageMap gameSlug="name-country" totalStages={100} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={elapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement \u00b7 Name the Country Stage ${stage} \u00b7 ${finalXP} XP`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
    </div>
  );
}
export default function NameCountryPage(){return<ErrorBoundary game="name-country"><NameCountryInner/></ErrorBoundary>;}