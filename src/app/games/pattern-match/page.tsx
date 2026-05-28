"use client";
const TOTAL_STAGES = 100;
const GAME_SLUG = "pattern-match";
import{saveGameState,loadGameState,clearGameState}from"@/lib/games/gameStateStorage";
import{ResumeModal}from"@/components/ui/ResumeModal";
import{StageMap}from"@/components/ui/StageMap";
import { getLastStage, markStageCompleted, getLastStageRemote, getNextUncompletedStage, shouldShowGameCompleteModal } from "@/lib/games/stageProgress";
import { usePageVisibility } from "@/hooks/usePageVisibility";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ChevronRight,Lightbulb}from"lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { updateStreak } from "@/lib/supabase/streaks";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import { CompletionPopup } from "@/components/ui/CompletionPopup";
import { GameCompleteModal } from "@/components/ui/GameCompleteModal";
import { useBoardWidth } from "@/hooks/useScreenWidth";
import{generatePattern,type PatternBoard}from"@/lib/games/patternGenerator";
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

function getDifficulty(s:number):Difficulty{
  if(s===1)return"medium";
  const h=Math.abs(Math.imul(s*2654435761,s^0x9e3779b9))%100;
  return h<20?"easy":h<70?"medium":"hard";
}

function PatternMatchGameInner(){
  const{user}=useAuthStore();
  const{theme}=useSettingsStore();
  const [stage, setStage] = useState(() => Math.max(1, getLastStage(GAME_SLUG)));
  const [hintsUsed, setHintsUsed] = useState(0);
  const[board,setBoard]=useState<PatternBoard|null>(null);
  const[selected,setSelected]=useState<string|null>(null);
  const[correct,setCorrect]=useState<boolean|null>(null);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsedSeconds,setElapsedSeconds]=useState(0);
  const[liveXP,setLiveXP]=useState(1000);
  const[finalElapsed,setFinalElapsed]=useState("0:00");
  const[completed,setCompleted]=useState(false);
  const[showMap,setShowMap]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const[hintFlash,setHintFlash]=useState(false);
  const[showRule,setShowRule]=useState(false);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [nextUncompleted, setNextUncompleted] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const[showResume,setShowResume]=useState(false);
  const[resumeData,setResumeData]=useState<Record<string,unknown>|null>(null);
  const[history,setHistory]=useState<{selected:string|null;correct:boolean|null}[]>([]);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const boardWidth = useBoardWidth(32, 520);

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
    saveGameState("pattern-match",{stage:s,savedAt:Date.now()});
    const diff=getDifficulty(s);
    const b=generatePattern(`pattern-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setSelected(null);setCorrect(null);setShowRule(false);setHintsUsed(0);
    setXpState(xp);setCompleted(false);setFinalXP(0);
    setElapsedSeconds(0);setLiveXP(1000);setFinalElapsed("0:00");
    setSolutionRevealed(false);
    setHistory([]);
    setNextUncompleted(null);
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{
      setElapsedSeconds(Math.floor((Date.now()-xp.startTime)/1000));
      setLiveXP(calculateXP(xp).currentXP);
    },500);
    if(user){const ok=consumeToken(user.id);if(!ok){setShowTokenModal(true);return;}}
  },[user]);

  const resumeChecked = useRef(false);

  useEffect(()=>{
    if(!resumeChecked.current){
      resumeChecked.current=true;
      const saved=loadGameState("pattern-match");
      if(saved&&(saved.stage as number)>1){setResumeData(saved);setShowResume(true);return;}
    }
    loadStage(stage);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[stage,loadStage]);

  function handleRevealSolution(){
    if(!board||!xpState)return;
    const ansKey=`${board.answer.value}-${board.answer.color??""}`;
    setSelected(ansKey);
    setCorrect(false);
    setSolutionRevealed(true);
    setShowRule(true);
    setXpState(prev=>prev?{...prev,startTime:Date.now()-prev.decayDuration*1000}:prev);
    if(timerRef.current)clearInterval(timerRef.current);
  }

  function handleAnswer(opt:{value:string;color?:string}){
    if(!board||completed||selected!==null||solutionRevealed)return;
    const key=`${opt.value}-${opt.color??""}`;
    const ansKey=`${board.answer.value}-${board.answer.color??""}`;
    const isCorrect=key===ansKey;
    setHistory(h=>[...h.slice(-19),{selected,correct}]);
    setSelected(key);setCorrect(isCorrect);
    if(isCorrect){
      playSuccess();
      setTimeout(()=>{
        if(xpState){
          const earned=finalizeXP(xpState);
          setFinalXP(earned);
          setFinalElapsed(formatTime(Math.floor((Date.now()-xpState.startTime)/1000)));
          setCompleted(true);
          if(timerRef.current)clearInterval(timerRef.current);
          setTimeout(()=>triggerConfetti(),80);
          markStageCompleted("pattern-match",stage);
        }
        if(user){
          updateStreak(user.id);
          saveScore({user_id:user.id,game_slug:"pattern-match",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:xpState?finalizeXP(xpState):0,time_taken:Math.floor((Date.now()-(xpState?.startTime??Date.now()))/1000),hints_used:hintsUsed});
        }
      },600);
    } else {
      playError();
      setTimeout(()=>setSelected(null),1200);
    }
    playClick();
  }

  function handleUndo(){
    if(history.length===0||completed||correct===true||solutionRevealed)return;
    const last=history[history.length-1];
    setSelected(last.selected);setCorrect(last.correct);
    setHistory(h=>h.slice(0,-1));
    playClick();
  }

  function handleHint(){
    if(!xpState||completed||hintsUsed>=3||solutionRevealed)return;
    setShowRule(true);setHintFlash(true);
    setHintsUsed(h=>h+1);
    setXpState(prev=>prev?{...prev,hintsUsed:Math.min(prev.hintsUsed+1,prev.maxHints)}:prev);
    setTimeout(()=>setHintFlash(false),1400);
    setTimeout(()=>setShowRule(false),4000);
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--color-bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--color-text-secondary)",fontSize:13}}>Generating puzzle...</p></div>);

  const isDark = theme === "dark";
  const panelBg = isDark
    ? {background:`radial-gradient(circle, rgba(0,255,255,0.07) 1px, transparent 1px), rgba(6,13,24,0.92)`, backgroundSize:"18px 18px"}
    : theme === "paper"
    ? {background:`radial-gradient(circle, rgba(100,80,60,0.10) 1px, transparent 1px), var(--color-surface)`, backgroundSize:"18px 18px"}
    : {background:"var(--color-surface)"};
  const panelShadow = isDark
    ? "0 0 0 1px color-mix(in srgb, var(--color-accent-primary) 13%, transparent), 0 16px 48px rgba(0,0,0,0.5)"
    : "0 2px 8px rgba(0,0,0,0.04)";
  const panelBorder = isDark ? "none" : "0.5px solid var(--color-border)";

  const hintsLeft=xpState.maxHints-xpState.hintsUsed;
  const totalItems=board.sequence.length+1;
  const seqGap=10;
  const itemSize=Math.min(60,Math.floor((boardWidth-(totalItems-1)*seqGap-24)/totalItems));

  return(
    <>
      <GameShell
        slug={GAME_SLUG}
        gameName="Pattern Match"
        stageNumber={stage}
        xp={liveXP}
        maxXp={1000}
        elapsedSeconds={elapsedSeconds}
        hintsRemaining={3-hintsUsed}
        onUndo={handleUndo}
        onHint={handleHint}
      >
        <GamePageSchema slug="pattern-match" />

        <div style={{...panelBg,borderRadius:20,border:panelBorder,padding:"24px 20px",width:"100%",maxWidth:560,boxShadow:panelShadow}}>
          <p style={{fontSize:11,fontWeight:600,color:"var(--color-text-secondary)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:16,fontFamily:"var(--font-mono)"}}>What comes next?</p>
          <div style={{display:"flex",alignItems:"center",gap:seqGap,flexWrap:"wrap",justifyContent:"center"}}>
            {board.sequence.map((item,i)=>(
              <motion.div key={i} initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:i*0.08,type:"spring",stiffness:400,damping:25}}
                style={{width:itemSize,height:itemSize,borderRadius:14,
                  background:isDark?"rgba(10,20,36,0.85)":"var(--color-surface-2)",
                  border:isDark?"1.5px solid rgba(0,255,255,0.12)":"1.5px solid var(--color-border)",
                  boxShadow:isDark?"inset 0 1px 0 rgba(255,255,255,0.04)":"none",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:item.color?Math.round(itemSize*0.5):Math.round(itemSize*0.3),
                  fontWeight:700,color:item.color??"var(--color-text-primary)",flexShrink:0,fontFamily:"var(--font-mono)"}}>
                {item.value}
              </motion.div>
            ))}
            <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:board.sequence.length*0.08,type:"spring"}}
              style={{width:itemSize,height:itemSize,borderRadius:14,
                border:`2.5px dashed ${solutionRevealed?"var(--color-error)":"var(--color-accent-primary)"}`,
                boxShadow:isDark&&!solutionRevealed?"0 0 10px rgba(0,255,255,0.15)":"none",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:Math.round(itemSize*0.4),color:solutionRevealed?"var(--color-error)":"var(--color-accent-primary)",flexShrink:0,fontFamily:"var(--font-mono)",fontWeight:700}}>
              {solutionRevealed?board.answer.value:"?"}
            </motion.div>
          </div>
          {(showRule||solutionRevealed)&&(
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
              style={{marginTop:16,padding:"10px 14px",background:solutionRevealed?"color-mix(in srgb, var(--color-error) 6%, transparent)":"color-mix(in srgb, var(--color-accent-secondary) 8%, transparent)",borderRadius:12,border:`0.5px solid ${solutionRevealed?"color-mix(in srgb, var(--color-error) 20%, transparent)":"color-mix(in srgb, var(--color-accent-secondary) 30%, transparent)"}`}}>
              <p style={{fontSize:12,color:solutionRevealed?"var(--color-error)":"var(--color-accent-secondary)",fontWeight:600,fontFamily:"var(--font-mono)"}}>
                {solutionRevealed?"SOLUTION: ":"HINT: "}{board.rule}
              </p>
            </motion.div>
          )}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,width:"100%",maxWidth:560}}>
          {board.options.map((opt,i)=>{
            const key=`${opt.value}-${opt.color??""}`;
            const ansKey=`${board.answer.value}-${board.answer.color??""}`;
            const isSelected=selected===key;
            const isAnswer=key===ansKey;
            const isCorrectSel = isSelected && correct === true;
            const isWrongSel = isSelected && correct === false && !solutionRevealed;
            const bg=solutionRevealed
              ?(isAnswer
                ? isDark?"color-mix(in srgb, var(--color-accent-secondary) 10%, rgba(6,13,24,0.92))":"color-mix(in srgb, var(--color-accent-secondary) 10%, var(--color-surface))"
                : isDark?"rgba(10,18,32,0.7)":"var(--color-surface-2)")
              :isCorrectSel
                ?(isDark?"color-mix(in srgb, var(--color-accent-secondary) 10%, rgba(6,13,24,0.92))":"color-mix(in srgb, var(--color-accent-secondary) 10%, var(--color-surface))")
                :isWrongSel
                  ?(isDark?"color-mix(in srgb, var(--color-error) 12%, rgba(6,13,24,0.92))":"color-mix(in srgb, var(--color-error) 10%, var(--color-surface))")
                  :(isDark?"rgba(10,18,32,0.75)":"var(--color-surface)");
            const border=solutionRevealed
              ?(isAnswer?"var(--color-accent-secondary)":isDark?"rgba(255,255,255,0.07)":"var(--color-border)")
              :isCorrectSel?"var(--color-accent-secondary)"
              :isWrongSel?"color-mix(in srgb, var(--color-error) 40%, transparent)"
              :(isDark?"rgba(0,255,255,0.1)":"var(--color-border)");
            const btnShadow = isDark
              ? isCorrectSel || (solutionRevealed && isAnswer)
                ? "0 0 16px rgba(57,255,20,0.25), 0 0 0 1px rgba(57,255,20,0.5)"
                : isWrongSel
                  ? "0 0 12px rgba(255,68,68,0.2)"
                  : "0 2px 8px rgba(0,0,0,0.35)"
              : "none";
            return(
              <motion.button key={i} onClick={()=>handleAnswer(opt)}
                whileTap={solutionRevealed?{}:{scale:0.96}}
                whileHover={solutionRevealed?{}:{boxShadow: isDark?"0 0 0 1.5px rgba(0,255,255,0.35), 0 0 16px rgba(0,255,255,0.12)":"0 4px 12px rgba(0,0,0,0.08)", scale:1.02}}
                animate={isWrongSel?{x:[-4,4,-4,4,0]}:{}}
                transition={{duration:0.3}}
                style={{padding:"18px",borderRadius:16,border:`1.5px solid ${border}`,background:bg,cursor:solutionRevealed?"default":"pointer",outline:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"background 0.2s, border-color 0.2s",opacity:solutionRevealed&&!isAnswer?0.4:1,boxShadow:btnShadow}}>
                <span style={{fontSize:opt.color?32:20,fontWeight:700,color:opt.color??(isCorrectSel||(solutionRevealed&&isAnswer)?"var(--color-accent-secondary)":"var(--color-text-primary)"),fontFamily:"var(--font-mono)"}}>{opt.value}</span>
                {(solutionRevealed&&isAnswer)||isCorrectSel?<span style={{fontSize:14,color:"var(--color-accent-secondary)"}}>✓</span>:null}
                {isWrongSel&&<span style={{fontSize:14,color:"var(--color-error)"}}>✗</span>}
              </motion.button>
            );
          })}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <motion.button onClick={handleHint} disabled={hintsLeft===0||completed||selected!==null||solutionRevealed}
            whileHover={hintsLeft>0&&!solutionRevealed?{boxShadow:isDark?"0 0 10px rgba(57,255,20,0.18)":"none"}:{}}
            style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",borderRadius:14,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:hintsLeft>0&&!solutionRevealed?"pointer":"not-allowed",fontSize:11,fontWeight:600,color:hintsLeft>0?"var(--color-text-primary)":"var(--color-text-secondary)",opacity:hintsLeft===0||solutionRevealed?0.5:1,fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase"}}>
            <Lightbulb size={13}/> HINT ({hintsLeft})
          </motion.button>
          <AnimatePresence>
            {hintFlash&&<motion.span initial={{opacity:0,x:-4}} animate={{opacity:1,x:0}} exit={{opacity:0}} style={{fontSize:11,color:"var(--color-accent-secondary)",fontWeight:600,fontFamily:"var(--font-mono)"}}>−25% XP</motion.span>}
          </AnimatePresence>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:10,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:11,color:"var(--color-text-secondary)",opacity:stage===1?0.4:1,fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:600}}>← PREV</button>
          <span style={{fontSize:11,color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)",letterSpacing:"0.06em"}}>STAGE {stage} / {TOTAL_STAGES}</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:10,border:"0.5px solid var(--color-border)",background:"var(--color-surface)",cursor:"pointer",fontSize:11,color:"var(--color-text-secondary)",fontFamily:"var(--font-mono)",letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:600}}>NEXT <ChevronRight size={13}/></button>
        </div>
      </GameShell>

      <OutOfTokensModal gameName="Pattern Match" open={showTokenModal} onClose={()=>setShowTokenModal(false)}/>
      {showResume && resumeData && (
        <ResumeModal
          gameSlug="pattern-match"
          stageName={`Stage ${resumeData.stage}`}
          savedAt={resumeData.savedAt as number}
          onResume={()=>{
            const s=resumeData!;
            setShowResume(false);setResumeData(null);
            setStage(s.stage as number);
          }}
          onStartFresh={()=>{
            clearGameState("pattern-match");setShowResume(false);setResumeData(null);
            loadStage(stage);
          }}
        />
      )}
      {showMap&&<StageMap gameSlug="pattern-match" totalStages={100} currentStage={stage} onSelectStage={s=>setStage(s)} onClose={()=>setShowMap(false)}/>}
      <CompletionPopup open={completed} stage={stage} difficulty={getDifficulty(stage)} xpEarned={finalXP} elapsed={finalElapsed}
        onRetry={()=>loadStage(stage)} onNext={()=>{setCompleted(false);setStage(s=>s+1);}}
        onShare={()=>{const text=`MindElement · Pattern Match Stage ${stage} · ${finalXP} XP · ${finalElapsed}`;if(navigator.share)navigator.share({title:"MindElement",text,url:"https://mindelement.app"}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");}}/>
      <GameCompleteModal
        open={showGameComplete}
        gameName="Pattern Match"
        totalStages={TOTAL_STAGES}
        onPlayAgain={() => { setShowGameComplete(false); setStage(1); }}
        onClose={() => setShowGameComplete(false)}
      />
    </>
  );
}
export default function PatternMatchGame(){return<ErrorBoundary game="pattern-match"><PatternMatchGameInner/></ErrorBoundary>;}