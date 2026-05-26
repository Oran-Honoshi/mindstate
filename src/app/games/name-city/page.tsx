"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "name-city";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { updateStreak } from "@/lib/supabase/streaks";
import { generateCityGame, scoreGuess, type CityGameBoard, type LetterResult } from "@/lib/games/cityGameGenerator";
import { createXPState, calculateXP, finalizeXP, type XPState, type Difficulty } from "@/lib/games/xpEngine";
import { playClick, playSuccess, playError } from "@/lib/audio/soundEngine";
import { triggerConfetti } from "@/components/effects/Confetti";
import { saveScore } from "@/lib/supabase/scores";
import { useAuthStore } from "@/store/authStore";
import { consumeToken } from "@/lib/games/tokenEngine";
import { useBoardWidth } from "@/hooks/useScreenWidth";
import { GamePageSchema } from "@/components/seo/GamePageSchema";
import { GameShell } from "@/components/game";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

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
const KB=[["Q","W","E","R","T","Y","U","I","O","P"],["A","S","D","F","G","H","J","K","L"],["ENTER","Z","X","C","V","B","N","M","⌫"]];

function NameCityInner(){
  const{user}=useAuthStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const[board,setBoard]=useState<CityGameBoard|null>(null);
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
  const[elapsedSeconds,setElapsedSeconds]=useState(0);
  const[liveXP,setLiveXP]=useState(1000);
  const[finalElapsed,setFinalElapsed]=useState("0:00");
  const[finalXP,setFinalXP]=useState(0);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const[history,setHistory]=useState<{guesses:string[];results:LetterResult[][]}[]>([]);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const gridAreaWidth=useBoardWidth(32,480);

  usePageVisibility(
    ()=>{if(timerRef.current)clearInterval(timerRef.current);},
    ()=>{
      if(xpState&&!completed){
        timerRef.current=setInterval(()=>{
          setElapsedSeconds(Math.floor((Date.now()-xpState.startTime)/1000));
          setLiveXP(calculateXP(xpState).currentXP);
        },500);
      }
    }
  );

  const loadStage=useCallback((s:number)=>{
    saveGameState("name-city",{stage:s,savedAt:Date.now()});
    const diff=getDifficulty(s);
    const b=generateCityGame(`city-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setGuesses([]);setResults([]);setCurrent("");
    setCompleted(false);setLost(false);setFinalXP(0);
    setHintsUsed(0);setShownHints([]);setElapsedSeconds(0);setLiveXP(1000);setFinalElapsed("0:00");setXpState(xp);
    setSolutionRevealed(false);
    setHistory([]);
    setNextUncompleted(null);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{
      setElapsedSeconds(Math.floor((Date.now()-xp.startTime)/1000));
      setLiveXP(calculateXP(xp).currentXP);
    },500);
    if(user){const ok=consumeToken(user.id);if(!ok)return;}
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

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
    setHistory(h=>[...h.slice(-19),{guesses:[...guesses],results:results.map(r=>[...r])}]);
    const ng=[...guesses,current];const nr=[...results,res];
    setGuesses(ng);setResults(nr);setCurrent("");
    const won=res.every(r=>r==="correct");
    const out=ng.length>=board.maxGuesses&&!won;
    if(won){
      setTimeout(()=>{
        const earned=finalizeXP(xpState);
        setFinalXP(earned);
        setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));
        setCompleted(true);
        clearGameState("name-city");
        if(timerRef.current)clearInterval(timerRef.current);
        playSuccess();
        triggerConfetti();
        if(user){
          updateStreak(user.id);
          saveScore({user_id:user.id,game_slug:"name-city",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000),hints_used:hintsUsed});
        }
      },board.wordLength*100+400);
    }
    else if(out){setTimeout(()=>{setLost(true);if(timerRef.current)clearInterval(timerRef.current);playError();},board.wordLength*100+400);}
  }

  function handleUndo(){
    if(history.length===0||completed||lost)return;
    const last=history[history.length-1];
    setGuesses(last.guesses);setResults(last.results);setCurrent("");
    setHistory(h=>h.slice(0,-1));
    playClick();
  }

  function handleHint(){
    if(!board||!xpState||hintsUsed>=3||completed||solutionRevealed)return;
    const hints=[`Continent: ${board.continent}`,`Country: ${(board as any).country}`,board.hint1];
    const next=hints[hintsUsed];
    if(next){setShownHints(h=>[...h,next]);setHintsUsed(h=>h+1);setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);}
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><p>Loading...</p></div>);

  const cellSize=Math.min(52,Math.floor((gridAreaWidth-(board.wordLength-1)*6)/board.wordLength));

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Name the City"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
        onCheck={()=>{}}
      >
        <GamePageSchema slug="name-city" />

        <AnimatePresence>
          {(completed||lost)&&(
            <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:300,damping:20}}
              style={{fontSize:80,textAlign:"center",lineHeight:1}}>{board.flag}</motion.div>
          )}
        </AnimatePresence>

        {lost&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}}
            style={{padding:"10px 20px",borderRadius:14,background:solutionRevealed?"rgba(255,68,68,0.08)":"#FEF2F2",border:`1px solid ${solutionRevealed?"rgba(255,68,68,0.2)":"#FECACA"}`,fontSize:14,fontWeight:700,color:"var(--color-error)",textAlign:"center"}}>
            {solutionRevealed?"Solution: ":"It was: "}{board.flag} {board.answer} · {(board as any).country}
          </motion.div>
        )}

        {shownHints.length>0&&!solutionRevealed&&(
          <div style={{width:"100%",maxWidth:480,display:"flex",flexDirection:"column",gap:6}}>
            {shownHints.map((hint,i)=>(
              <motion.div key={i} initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
                style={{padding:"8px 16px",borderRadius:12,background:"#FFFBEB",border:"1px solid #FDE68A",fontSize:13,fontWeight:600,color:"#92400E"}}>
                💡 {hint}
              </motion.div>
            ))}
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:5,width:"100%",maxWidth:480,alignItems:"center"}}>
          {Array.from({length:board.maxGuesses},(_,gi)=>{
            const guess=gi<guesses.length?guesses[gi]:gi===guesses.length?current:"";
            const res=results[gi];
            return(
              <motion.div key={gi} animate={shake&&gi===guesses.length?{x:[-6,6,-4,4,0]}:{}} style={{display:"flex",gap:5}}>
                {Array.from({length:board.wordLength},(_,li)=>{
                  const letter=guess[li]??"";
                  const result=res?.[li];
                  const color=result?TILE[result]:null;
                  return(
                    <motion.div key={li} animate={result?{rotateX:[0,-90,0]}:{}} transition={{delay:li*0.1,duration:0.3}}
                      style={{width:cellSize,height:cellSize,borderRadius:7,border:`2px solid ${color?color.border:letter?"var(--color-accent-primary)":"var(--color-border)"}`,background:color?color.bg:"var(--color-surface)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(cellSize*0.4),fontWeight:700,color:color?color.text:"var(--color-text-primary)",fontFamily:"var(--font-sans)"}}>
                      {letter}
                    </motion.div>
                  );
                })}
              </motion.div>
            );
          })}
        </div>

        {!lost&&(
          <div style={{display:"flex",flexDirection:"column",gap:6,width:"100%",maxWidth:480}}>
            {KB.map((row,ri)=>(
              <div key={ri} style={{display:"flex",justifyContent:"center",gap:5}}>
                {row.map(key=>{
                  const state=letterStates.get(key);const color=state?TILE[state]:null;const isWide=key==="ENTER"||key==="⌫";
                  return(<motion.button key={key} whileTap={{scale:0.9}} onClick={()=>handleKey(key==="⌫"?"Backspace":key==="ENTER"?"Enter":key)} style={{width:isWide?58:34,height:46,borderRadius:8,border:"none",background:color?color.bg:"var(--color-surface-2)",color:color?color.text:"var(--color-text-secondary)",fontSize:isWide?11:13,fontWeight:700,cursor:"pointer"}}>{key}</motion.button>);
                })}
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--color-text-secondary)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>Stage {stage} of 100</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:"pointer",fontSize:12,color:"var(--color-text-secondary)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </GameShell>

      {showMap&&<StageMap gameSlug="name-city" totalStages={100} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Name the City Stage ${stage} · ${finalXP} XP`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
    </>
  );
}
export default function NameCityPage(){return<ErrorBoundary game="name-city"><NameCityInner/></ErrorBoundary>;}