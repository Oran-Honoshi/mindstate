"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,CheckCircle,ChevronRight,Share2,Lightbulb}from"lucide-react";
import Link from"next/link";
import{Navbar}from"@/components/nav/Navbar";
import{generatePattern,type PatternBoard}from"@/lib/games/patternGenerator";
import{createXPState,calculateXP,useHint as applyHint,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";

function getDifficulty(s:number):Difficulty{return s<=300?"easy":s<=700?"medium":"hard";}
function shareResult(stage:number,xp:number,elapsed:string){const text=`🔷 MindState · Pattern Match Stage ${stage} · ${xp} XP · ${elapsed}`;const url="https://mindstate.vercel.app";if(navigator.share)navigator.share({title:"MindState",text,url}).catch(()=>{});else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text+" "+url),"_blank");}
function XPBar({xpState}:{xpState:XPState}){const[snap,setSnap]=useState(()=>calculateXP(xpState));useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"#F1EDE8",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"#94A3B8"}}>XP</span></div>);}

export default function PatternMatchGame(){
  const{user}=useAuthStore();
  const[stage,setStage]=useState(1);
  const[board,setBoard]=useState<PatternBoard|null>(null);
  const[selected,setSelected]=useState<string|null>(null);
  const[correct,setCorrect]=useState<boolean|null>(null);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const[hintFlash,setHintFlash]=useState(false);
  const[showRule,setShowRule]=useState(false);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const b=generatePattern(`pattern-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setSelected(null);setCorrect(null);setShowRule(false);
    setXpState(xp);setCompleted(false);setFinalXP(0);setElapsed("00:00");
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user)consumeToken(user.id);
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function handleAnswer(opt:{value:string;color?:string}){
    if(!board||completed||selected!==null)return;
    const key=`${opt.value}-${opt.color??""}`;
    const ansKey=`${board.answer.value}-${board.answer.color??""}`;
    const isCorrect=key===ansKey;
    setSelected(key);setCorrect(isCorrect);
    if(isCorrect){
      playSuccess();
      setTimeout(()=>{
        if(xpState){const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);if(timerRef.current)clearInterval(timerRef.current);setTimeout(()=>triggerConfetti(),80);}
        if(user)saveScore({user_id:user.id,game_slug:"pattern-match",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:xpState?finalizeXP(xpState):0,time_taken:Math.floor((Date.now()-(xpState?.startTime??Date.now()))/1000)});
      },600);
    } else {
      playError();
      setTimeout(()=>setSelected(null),1200);
    }
    playClick();
  }

  function handleHint(){
    if(!xpState||completed||xpState.hintsUsed>=xpState.maxHints)return;
    setXpState(applyHint(xpState));setShowRule(true);
    setHintFlash(true);setTimeout(()=>setHintFlash(false),1400);
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"#FDFCFB",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"#94A3B8",fontSize:13}}>Generating puzzle...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const hintsLeft=xpState.maxHints-xpState.hintsUsed;

  return(
    <div style={{minHeight:"100vh",background:"#FDFCFB",display:"flex",flexDirection:"column"}}>
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:20}}>
        <div style={{width:"100%",maxWidth:560,background:"white",borderRadius:20,border:"0.5px solid rgba(0,0,0,0.07)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Link href="/games" style={{color:"#94A3B8",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:20,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"#94A3B8",fontFamily:"monospace"}}>{elapsed}</span>
              <GameInstructions game="pattern-match"/>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid #E2E8F0",background:"white",cursor:"pointer",color:"#94A3B8",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {/* Sequence */}
        <div style={{background:"white",borderRadius:20,border:"0.5px solid rgba(0,0,0,0.07)",padding:"24px 28px",width:"100%",maxWidth:560,boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <p style={{fontSize:11,fontWeight:600,color:"#94A3B8",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:16}}>What comes next?</p>
          <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
            {board.sequence.map((item,i)=>(
              <motion.div key={i} initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{delay:i*0.08,type:"spring",stiffness:400,damping:25}}
                style={{width:60,height:60,borderRadius:16,background:"#F8F7F5",border:"1.5px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:item.color?28:18,fontWeight:700,color:item.color??"#1C1917"}}>
                {item.value}
              </motion.div>
            ))}
            <motion.div initial={{scale:0}} animate={{scale:1}} transition={{delay:board.sequence.length*0.08,type:"spring"}}
              style={{width:60,height:60,borderRadius:16,border:"2.5px dashed #4F6EF7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:"#C7D2FE"}}>
              ?
            </motion.div>
          </div>
          {showRule&&(
            <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
              style={{marginTop:16,padding:"10px 14px",background:"rgba(245,158,11,0.08)",borderRadius:12,border:"0.5px solid rgba(245,158,11,0.3)"}}>
              <p style={{fontSize:12,color:"#B45309",fontWeight:600}}>Hint: {board.rule}</p>
            </motion.div>
          )}
        </div>

        {/* Options */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,width:"100%",maxWidth:560}}>
          {board.options.map((opt,i)=>{
            const key=`${opt.value}-${opt.color??""}`;
            const ansKey=`${board.answer.value}-${board.answer.color??""}`;
            const isSelected=selected===key;
            const isAnswer=key===ansKey;
            const bg=isSelected?(correct?"#F0FDF4":"#FEF2F2"):"white";
            const border=isSelected?(correct?"#86EFAC":"#FCA5A5"):"#E2E8F0";
            return(
              <motion.button key={i} onClick={()=>handleAnswer(opt)}
                whileTap={{scale:0.96}}
                animate={isSelected&&!correct?{x:[-4,4,-4,4,0]}:{}}
                transition={{duration:0.3}}
                style={{padding:"18px",borderRadius:16,border:`1.5px solid ${border}`,background:bg,cursor:selected?"default":"pointer",outline:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:10,transition:"all 0.2s"}}>
                <span style={{fontSize:opt.color?32:20,fontWeight:700,color:opt.color??"#1C1917"}}>{opt.value}</span>
                {isSelected&&correct&&<span style={{fontSize:16}}>✓</span>}
                {isSelected&&!correct&&<span style={{fontSize:16}}>✗</span>}
              </motion.button>
            );
          })}
        </div>

        {/* Hint */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={handleHint} disabled={hintsLeft===0||completed||selected!==null}
            style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",borderRadius:14,border:"0.5px solid #E2E8F0",background:"white",cursor:hintsLeft>0?"pointer":"not-allowed",fontSize:12,fontWeight:600,color:hintsLeft>0?"#374151":"#C4C0B8",opacity:hintsLeft===0?0.5:1}}>
            <Lightbulb size={14}/> Hint ({hintsLeft})
          </button>
          <AnimatePresence>
            {hintFlash&&<motion.span initial={{opacity:0,x:-4}} animate={{opacity:1,x:0}} exit={{opacity:0}} style={{fontSize:11,color:"#F59E0B",fontWeight:600}}>−25% XP</motion.span>}
          </AnimatePresence>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid #E2E8F0",background:"white",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"#64748B",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"#94A3B8"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid #E2E8F0",background:"white",cursor:"pointer",fontSize:12,color:"#374151",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      <AnimatePresence>
        {completed&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
          <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} style={{background:"white",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
            <CheckCircle size={48} color="#22C55E" style={{margin:"0 auto 16px"}}/>
            <h2 style={{fontSize:26,fontWeight:700,color:"#1C1917",fontFamily:"Georgia,serif",marginBottom:4}}>Stage {stage} Complete</h2>
            <p style={{fontSize:13,color:"#94A3B8",marginBottom:24}}>{elapsed} · {diff}</p>
            <div style={{background:"#F8F7F5",borderRadius:16,padding:20,marginBottom:20}}><p style={{fontSize:11,color:"#94A3B8",fontWeight:600,marginBottom:4}}>XP EARNED</p><p style={{fontSize:48,fontWeight:700,color:"#4F6EF7",fontFamily:"Georgia,serif"}}>{finalXP}</p></div>
            <button onClick={()=>shareResult(stage,finalXP,elapsed)} style={{width:"100%",marginBottom:12,padding:"11px",borderRadius:14,border:"0.5px solid #E2E8F0",background:"white",fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Share2 size={14}/> Share Result</button>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>loadStage(stage)} style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid #E2E8F0",background:"white",fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer"}}>Retry</button>
              <button onClick={()=>{setCompleted(false);setStage(s=>s+1);}} style={{flex:2,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",fontSize:13,fontWeight:700,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>Next Stage <ChevronRight size={14}/></button>
            </div>
          </motion.div>
        </motion.div>)}
      </AnimatePresence>
    </div>
  );
}
