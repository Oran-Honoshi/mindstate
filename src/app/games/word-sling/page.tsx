"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,ChevronRight,Share2,Delete,Check,X}from"lucide-react";
import Link from"next/link";
import{Navbar}from"@/components/nav/Navbar";
import{generateWordBoard,isValidWord,scoreWord,type WordBoard}from"@/lib/games/wordSlingGenerator";
import{createXPState,calculateXP,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";
import{GameInstructions}from"@/components/ui/GameInstructions";
import{ShowSolution}from"@/components/ui/ShowSolution";

function getDifficulty(s:number):Difficulty{return s<=300?"easy":s<=700?"medium":"hard";}
function shareResult(stage:number,score:number,words:number){
  const text=`📝 MindState · Word Sling Stage ${stage} · ${score} pts · ${words} words found`;
  const url="https://mindstate.vercel.app";
  if(navigator.share)navigator.share({title:"MindState",text,url}).catch(()=>{});
  else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text+" "+url),"_blank");
}

function XPBar({xpState}:{xpState:XPState}){
  const[snap,setSnap]=useState(()=>calculateXP(xpState));
  useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);
  const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";
  return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"var(--bg3)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"var(--text4)"}}>XP</span></div>);
}

export default function WordSlingPage(){
  const{user}=useAuthStore();
  const[stage,setStage]=useState(1);
  const[board,setBoard]=useState<WordBoard|null>(null);
  const[current,setCurrent]=useState<string[]>([]);
  const[found,setFound]=useState<string[]>([]);
  const[totalScore,setTotalScore]=useState(0);
  const[feedback,setFeedback]=useState<{text:string;ok:boolean}|null>(null);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const b=generateWordBoard(`words-${diff}-${s}`,diff);
    const xp=createXPState(diff);
    setBoard(b);setCurrent([]);setFound([]);setTotalScore(0);setFeedback(null);
    setXpState(xp);setCompleted(false);setFinalXP(0);setElapsed("00:00");
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user)consumeToken(user.id);
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function addLetter(letter:string,idx:number){
    if(current.includes(`${letter}-${idx}`))return;
    setCurrent(prev=>[...prev,`${letter}-${idx}`]);
    playClick();
  }

  function submitWord(){
    if(!board||current.length<board.minLength)return;
    const word=current.map(l=>l.split("-")[0]).join("").toLowerCase();
    if(found.includes(word)){
      setFeedback({text:"Already found!",ok:false});
      setTimeout(()=>setFeedback(null),1200);
      playError();setCurrent([]);return;
    }
    if(isValidWord(word,board)){
      const pts=scoreWord(word);
      const newFound=[...found,word];
      const newScore=totalScore+pts;
      setFound(newFound);setTotalScore(newScore);
      setFeedback({text:`+${pts} pts · ${word.toUpperCase()}`,ok:true});
      setTimeout(()=>setFeedback(null),1400);
      playSuccess();setCurrent([]);
      // Complete when all solutions found OR enough score
      const target=board.solutions.length;
      if(newFound.length>=target&&xpState){
        const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);
        if(timerRef.current)clearInterval(timerRef.current);
        setTimeout(()=>triggerConfetti(),80);
        if(user){updateStreak(user.id); saveScore({user_id:user.id,game_slug:"word-sling",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}
      }
    } else {
      setFeedback({text:"Not a word",ok:false});
      setTimeout(()=>setFeedback(null),1200);
      playError();setCurrent([]);
    }
  }

  if(!board||!xpState)return(<div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"var(--text4)",fontSize:13}}>Generating board...</p></div>);

  const diff=getDifficulty(stage);
  const diffColor=diff==="easy"?"#22C55E":diff==="medium"?"#F59E0B":"#EF4444";
  const wordDisplay=current.map(l=>l.split("-")[0]).join("");

  return(
    <div className="game-page">
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 16px 32px",gap:18}}>
        <div style={{width:"100%",maxWidth:520,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <Link href="/games" style={{color:"var(--text4)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:13}}><ArrowLeft size={14}/> Games</Link>
              <div style={{width:1,height:16,background:"#E2E8F0"}}/>
              <span style={{fontSize:20,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:`${diffColor}15`,color:diffColor}}>{diff.toUpperCase()}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:12,color:"#4F6EF7",fontWeight:700}}>{totalScore} pts</span>
              <span style={{fontSize:11,color:"var(--text4)"}}>{found.length}/{board.solutions.length} words</span>
              <span style={{fontSize:12,color:"var(--text4)",fontFamily:"monospace"}}>{elapsed}</span>
              <GameInstructions game="word-sling" onOpen={()=>{if(timerRef.current){clearInterval(timerRef.current);}}} onClose={()=>{if(xpState&&!completed){timerRef.current=setInterval(()=>setElapsed(formatElapsed(xpState.startTime)),1000);}}}/>
              <button onClick={()=>loadStage(stage)} style={{padding:7,borderRadius:9,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",color:"var(--text4)",display:"flex"}}><RotateCcw size={13}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {/* Current word display */}
        <div style={{width:"100%",maxWidth:520,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"20px 24px",minHeight:80,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
          <div style={{flex:1}}>
            {feedback ? (
              <motion.p initial={{scale:0.9}} animate={{scale:1}}
                style={{fontSize:20,fontWeight:700,color:feedback.ok?"#22C55E":"#EF4444",fontFamily:"Georgia,serif"}}>
                {feedback.text}
              </motion.p>
            ) : (
              <p style={{fontSize:28,fontWeight:700,color:wordDisplay?"#1C1917":"#CBD5E1",fontFamily:"monospace",letterSpacing:"0.1em",minHeight:40}}>
                {wordDisplay||"—"}
              </p>
            )}
            <p style={{fontSize:11,color:"var(--text4)",marginTop:4}}>
              {current.length>0?`${current.length} letters`:`Min ${board.minLength} letters`}
            </p>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setCurrent([])} style={{padding:10,borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",display:"flex",alignItems:"center"}}>
              <Delete size={16} color="#94A3B8"/>
            </button>
            <button onClick={submitWord} disabled={current.length<board.minLength}
              style={{padding:"10px 20px",borderRadius:12,border:"none",background:current.length>=board.minLength?"linear-gradient(135deg,#4F6EF7,#9C6BE8)":"#E2E8F0",cursor:current.length>=board.minLength?"pointer":"not-allowed",fontSize:13,fontWeight:700,color:"white",display:"flex",alignItems:"center",gap:6}}>
              <Check size={14}/> Submit
            </button>
          </div>
        </div>

        {/* Letter tiles */}
        <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center",maxWidth:400}}>
          {board.letters.map((letter,i)=>{
            const key=`${letter}-${i}`;
            const isUsed=current.includes(key);
            return(
              <motion.button key={key} onClick={()=>addLetter(letter,i)}
                whileTap={{scale:0.88}}
                disabled={isUsed}
                style={{width:52,height:52,borderRadius:14,border:"1.5px solid",
                  background:isUsed?"#F8F7F5":"white",
                  borderColor:isUsed?"#E2E8F0":"#DDD6F8",
                  fontSize:20,fontWeight:700,color:isUsed?"#CBD5E1":"#1C1917",
                  cursor:isUsed?"not-allowed":"pointer",outline:"none",
                  boxShadow:isUsed?"none":"0 4px 12px rgba(79,110,247,0.1)",
                  transform:isUsed?"scale(0.92)":"scale(1)",
                  transition:"all 0.15s"}}>
                {letter}
              </motion.button>
            );
          })}
        </div>

        {/* Found words */}
        {found.length>0&&(
          <div style={{width:"100%",maxWidth:520,background:"var(--surface)",borderRadius:20,border:"0.5px solid var(--border)",padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
            <p style={{fontSize:11,fontWeight:600,color:"var(--text4)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Found Words</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {found.map(word=>(
                <motion.div key={word} initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}}
                  style={{padding:"4px 12px",borderRadius:20,background:"#F0FDF4",border:"0.5px solid #86EFAC",fontSize:13,fontWeight:600,color:"#15803D"}}>
                  {word.toUpperCase()} +{scoreWord(word)}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Solutions hint */}
        <div style={{width:"100%",maxWidth:520}}>
          <p style={{fontSize:11,color:"var(--text4)",textAlign:"center"}}>
            Find all {board.solutions.length} hidden words to complete the stage
          </p>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:stage>1?"pointer":"not-allowed",fontSize:12,color:"var(--text3)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:12,color:"var(--text4)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:4,padding:"8px 16px",borderRadius:12,border:"0.5px solid var(--border2)",background:"var(--surface)",cursor:"pointer",fontSize:12,color:"var(--text2)",fontWeight:600}}>Next <ChevronRight size={13}/></button>
        </div>
      </main>

      <AnimatePresence>
        {completed&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:24}}>
          <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} style={{background:"var(--surface)",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
            <div style={{fontSize:48,marginBottom:16}}>📝</div>
            <h2 style={{fontSize:26,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif",marginBottom:4}}>Stage {stage} Complete</h2>
            <p style={{fontSize:13,color:"var(--text4)",marginBottom:24}}>{found.length} words · {totalScore} pts · {elapsed}</p>
            <div style={{background:"var(--bg2)",borderRadius:16,padding:20,marginBottom:20}}><p style={{fontSize:11,color:"var(--text4)",fontWeight:600,marginBottom:4}}>XP EARNED</p><p style={{fontSize:48,fontWeight:700,color:"#4F6EF7",fontFamily:"Georgia,serif"}}>{finalXP}</p></div>
            <button onClick={()=>shareResult(stage,totalScore,found.length)} style={{width:"100%",marginBottom:12,padding:"11px",borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Share2 size={14}/> Share Result</button>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>loadStage(stage)} style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>Retry</button>
              <button onClick={()=>{setCompleted(false);setStage(s=>s+1);}} style={{flex:2,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",fontSize:13,fontWeight:700,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>Next Stage <ChevronRight size={14}/></button>
            </div>
          </motion.div>
        </motion.div>)}
      </AnimatePresence>
    </div>
  );
}
