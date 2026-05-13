"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import{useState,useEffect,useCallback,useRef}from"react";
import{motion,AnimatePresence}from"framer-motion";
import{ArrowLeft,RotateCcw,ChevronRight,Share2,Trophy,RefreshCw}from"lucide-react";
import Link from"next/link";
import { updateStreak } from "@/lib/supabase/streaks";
import{Navbar}from"@/components/nav/Navbar";
import{GameInstructions}from"@/components/ui/GameInstructions";
import{OutOfTokensModal}from"@/components/ui/OutOfTokensModal";
import{CompletionPopup}from"@/components/ui/CompletionPopup";
import{HintButton}from"@/components/ui/HintButton";
import{CheckProgressButton}from"@/components/ui/CheckProgressButton";

import{createXPState,calculateXP,finalizeXP,formatElapsed,type XPState,type Difficulty}from"@/lib/games/xpEngine";
import{playClick,playSuccess,playError}from"@/lib/audio/soundEngine";
import{triggerConfetti}from"@/components/effects/Confetti";
import{saveScore}from"@/lib/supabase/scores";
import{useAuthStore}from"@/store/authStore";
import{consumeToken}from"@/lib/games/tokenEngine";

function getDifficulty(s:number):Difficulty{return s<=300?"easy":s<=700?"medium":"hard";}

type Suit="♥"|"♦"|"♣"|"♠";
type Card={suit:Suit;value:number;label:string;faceUp:boolean};

function mulberry32(seed:number){return function(){seed|=0;seed=(seed+0x6d2b79f5)|0;let t=Math.imul(seed^(seed>>>15),1|seed);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function seedToNum(s:string):number{let h=0;for(let i=0;i<s.length;i++)h=(Math.imul(31,h)+s.charCodeAt(i))|0;return Math.abs(h);}

function makeDeck(seed:number):Card[]{
  const suits:Suit[]=["♥","♦","♣","♠"];
  const labels=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const deck=suits.flatMap(suit=>labels.map((label,i)=>({suit,value:i+1,label,faceUp:false})));
  const rng=mulberry32(seed);
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return deck;
}

function isRed(suit:Suit){return suit==="♥"||suit==="♦";}
function canStack(card:Card,onto:Card|null):boolean{
  if(!onto)return card.value===13; // King on empty
  return isRed(card.suit)!==isRed(onto.suit)&&card.value===onto.value-1;
}
function canFoundation(card:Card,top:Card|null):boolean{
  if(!top)return card.value===1; // Ace
  return card.suit===top.suit&&card.value===top.value+1;
}
function cardColor(suit:Suit){return suit==="♥"||suit==="♦"?"#DC2626":"#1C1917";}

function XPBar({xpState}:{xpState:XPState}){
  const[snap,setSnap]=useState(()=>calculateXP(xpState));
  useEffect(()=>{const iv=setInterval(()=>setSnap(calculateXP(xpState)),500);return()=>clearInterval(iv);},[xpState]);
  const pct=snap.percentRemaining;const color=pct>0.6?"#22C55E":pct>0.3?"#F59E0B":"#EF4444";
  return(<div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:4,background:"rgba(255,255,255,0.2)",borderRadius:2,overflow:"hidden"}}><motion.div animate={{width:`${pct*100}%`}} transition={{duration:0.5}} style={{height:"100%",background:color,borderRadius:2}}/></div><span style={{fontSize:13,fontWeight:700,color,fontFamily:"monospace",minWidth:36}}>{snap.currentXP}</span><span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>XP</span></div>);
}

function CardUI({card,small,onClick,selected}:{card:Card;small?:boolean;onClick?:()=>void;selected?:boolean}){
  const w=small?36:48,h=small?52:68;
  if(!card.faceUp)return(
    <div style={{width:w,height:h,borderRadius:6,background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",border:"1.5px solid rgba(255,255,255,0.3)",flexShrink:0}}/>
  );
  return(
    <motion.div onClick={onClick} whileHover={onClick?{y:-3}:{}}
      style={{width:w,height:h,borderRadius:6,background:selected?"#EEF2FF":"white",border:`1.5px solid ${selected?"#4F6EF7":"#E2E8F0"}`,
        cursor:onClick?"pointer":"default",display:"flex",flexDirection:"column",padding:"3px 4px",
        boxShadow:selected?"0 0 0 2px #4F6EF7":"0 2px 4px rgba(0,0,0,0.08)",flexShrink:0}}>
      <span style={{fontSize:small?11:12,fontWeight:700,color:cardColor(card.suit),lineHeight:1}}>{card.label}</span>
      <span style={{fontSize:small?14:16,color:cardColor(card.suit),lineHeight:1}}>{card.suit}</span>
    </motion.div>
  );
}

export default function SolitairePage(){
  const{user}=useAuthStore();
  const[stage,setStage]=useState(1);
  const[tableau,setTableau]=useState<Card[][]>([]);
  const[stock,setStock]=useState<Card[]>([]);
  const[waste,setWaste]=useState<Card[]>([]);
  const[foundations,setFoundations]=useState<Card[][]>([[],[],[],[]]);
  const[selected,setSelected]=useState<{pile:"tableau"|"waste"|"foundation";col:number;idx:number}|null>(null);
  const[moves,setMoves]=useState(0);
  const[xpState,setXpState]=useState<XPState|null>(null);
  const[elapsed,setElapsed]=useState("00:00");
  const[completed,setCompleted]=useState(false);
  const[showTokenModal,setShowTokenModal]=useState(false);
  const[hintsUsed,setHintsUsed]=useState(0);
  const[showFeedback,setShowFeedback]=useState(false);
  const[finalXP,setFinalXP]=useState(0);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const loadStage=useCallback((s:number)=>{
    const diff=getDifficulty(s);
    const deck=makeDeck(seedToNum(`solitaire-${diff}-${s}`));
    // Deal tableau
    const tab:Card[][]=[];
    let idx=0;
    for(let col=0;col<7;col++){
      const pile:Card[]=[];
      for(let row=0;row<=col;row++){pile.push({...deck[idx++],faceUp:row===col});}
      tab.push(pile);
    }
    setTableau(tab);
    setStock(deck.slice(idx).map(c=>({...c,faceUp:false})));
    setWaste([]);setFoundations([[],[],[],[]]);setSelected(null);setMoves(0);
    const xp=createXPState(diff);
    setXpState(xp);setCompleted(false);setFinalXP(0);setHintsUsed(0);setShowFeedback(false);setElapsed("00:00");
    if(timerRef.current)clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setElapsed(formatElapsed(xp.startTime)),1000);
    if(user){
      const ok=consumeToken(user.id);
      if(!ok){setShowTokenModal(true);return;}
    }
  },[user]);

  useEffect(()=>{loadStage(stage);return()=>{if(timerRef.current)clearInterval(timerRef.current);};},[stage,loadStage]);

  function drawCard(){
    if(stock.length===0){setStock([...waste].reverse().map(c=>({...c,faceUp:false})));setWaste([]);return;}
    const card={...stock[stock.length-1],faceUp:true};
    setStock(s=>s.slice(0,-1));setWaste(w=>[...w,card]);
    setSelected(null);playClick();
  }

  function checkWin(f:Card[][]){return f.every(pile=>pile.length===13);}

  function handleFoundationClick(fi:number){
    const top=foundations[fi][foundations[fi].length-1]??null;
    if(selected){
      // Try to move selected card here
      let card:Card|null=null;
      if(selected.pile==="waste"){card=waste[waste.length-1]??null;}
      else if(selected.pile==="tableau"){const pile=tableau[selected.col];card=pile[selected.idx]??null;}
      if(card&&canFoundation(card,top)){
        const nf=foundations.map((p,i)=>i===fi?[...p,card!]:p);
        if(selected.pile==="waste")setWaste(w=>w.slice(0,-1));
        else setTableau(t=>{const nt=t.map(p=>[...p]);nt[selected.col]=nt[selected.col].slice(0,selected.idx);if(nt[selected.col].length>0)nt[selected.col][nt[selected.col].length-1].faceUp=true;return nt;});
        setFoundations(nf);setSelected(null);setMoves(m=>m+1);playSuccess();
        if(checkWin(nf)&&xpState){const earned=finalizeXP(xpState);setFinalXP(earned);setCompleted(true);if(timerRef.current)clearInterval(timerRef.current);setTimeout(()=>triggerConfetti(),80);if(user){updateStreak(user.id); saveScore({user_id:user.id,game_slug:"solitaire",stage_number:stage,difficulty:getDifficulty(stage),xp_earned:earned,time_taken:Math.floor((Date.now()-xpState.startTime)/1000)});}}
        return;
      }
    }
    setSelected({pile:"foundation",col:fi,idx:foundations[fi].length-1});
    playClick();
  }

  function handleTableauClick(col:number,idx:number){
    const pile=tableau[col];
    const card=pile[idx];
    if(!card||!card.faceUp){
      if(idx===pile.length-1&&!card.faceUp){
        // Flip card
        const nt=tableau.map(p=>[...p]);
        nt[col][idx]={...nt[col][idx],faceUp:true};
        setTableau(nt);setMoves(m=>m+1);playClick();
      }
      return;
    }
    if(selected){
      const onto=pile[pile.length-1];
      const movingCards=selected.pile==="tableau"?tableau[selected.col].slice(selected.idx):selected.pile==="waste"?[waste[waste.length-1]]:[];
      if(movingCards.length===0){setSelected(null);return;}
      const topMoving=movingCards[0];
      if(canStack(topMoving,pile.length>0&&idx===pile.length-1?onto:null)||(!onto&&topMoving.value===13)){
        const nt=tableau.map(p=>[...p]);
        nt[col]=[...nt[col],...movingCards];
        if(selected.pile==="tableau"){nt[selected.col]=nt[selected.col].slice(0,selected.idx);if(nt[selected.col].length>0)nt[selected.col][nt[selected.col].length-1].faceUp=true;}
        else if(selected.pile==="waste")setWaste(w=>w.slice(0,-1));
        setTableau(nt);setSelected(null);setMoves(m=>m+1);playClick();
        return;
      }
      setSelected(null);
    }
    setSelected({pile:"tableau",col,idx});playClick();
  }

  function handleWasteClick(){
    if(waste.length===0)return;
    if(selected?.pile==="waste"){setSelected(null);return;}
    setSelected({pile:"waste",col:0,idx:waste.length-1});playClick();
  }

  if(!xpState)return(<div style={{minHeight:"100vh",background:"#0F4C2A",display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>Dealing cards...</p></div>);

  const diff=getDifficulty(stage);

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0F4C2A,#1A6B3A)",display:"flex",flexDirection:"column"}}>
      <Navbar/>
      <main style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"76px 8px 24px",gap:12}}>
        {/* Header */}
        <div style={{width:"100%",maxWidth:600,background:"rgba(255,255,255,0.1)",borderRadius:16,border:"0.5px solid rgba(255,255,255,0.15)",padding:"12px 16px",backdropFilter:"blur(12px)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Link href="/games" style={{color:"rgba(255,255,255,0.7)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,fontSize:12}}><ArrowLeft size={13}/> Games</Link>
              <div style={{width:1,height:14,background:"rgba(255,255,255,0.2)"}}/>
              <span style={{fontSize:16,fontWeight:700,color:"white",fontFamily:"Georgia,serif"}}>{stage}</span>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>Moves: {moves}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontFamily:"monospace"}}>{elapsed}</span>
              <button onClick={()=>loadStage(stage)} style={{padding:6,borderRadius:8,border:"0.5px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",cursor:"pointer",color:"rgba(255,255,255,0.7)",display:"flex"}}><RotateCcw size={12}/></button>
            </div>
          </div>
          <XPBar xpState={xpState}/>
        </div>

        {/* Top row: stock, waste, spacers, foundations */}
        <div style={{display:"flex",gap:6,alignItems:"flex-start",width:"100%",maxWidth:600,padding:"0 4px"}}>
          {/* Stock */}
          <div onClick={drawCard} style={{width:48,height:68,borderRadius:6,cursor:"pointer",border:"2px dashed rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {stock.length>0?<CardUI card={stock[stock.length-1]}/>:
              <RefreshCw size={18} color="rgba(255,255,255,0.4)"/>}
          </div>
          {/* Waste */}
          <div onClick={handleWasteClick} style={{width:48,height:68,flexShrink:0}}>
            {waste.length>0?<CardUI card={waste[waste.length-1]} selected={selected?.pile==="waste"} onClick={handleWasteClick}/>:
              <div style={{width:48,height:68,borderRadius:6,border:"2px dashed rgba(255,255,255,0.2)"}}/>}
          </div>
          <div style={{flex:1}}/>
          {/* Foundations */}
          {foundations.map((pile,i)=>{
            const top=pile[pile.length-1];
            const suits:Suit[]=["♥","♦","♣","♠"];
            return(
              <div key={i} onClick={()=>handleFoundationClick(i)}
                style={{width:48,height:68,borderRadius:6,border:`2px solid ${selected?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.2)"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {top?<CardUI card={top} onClick={()=>handleFoundationClick(i)}/>:
                  <span style={{fontSize:20,color:"rgba(255,255,255,0.3)"}}>{suits[i]}</span>}
              </div>
            );
          })}
        </div>

        {/* Tableau */}
        <div style={{display:"flex",gap:4,alignItems:"flex-start",width:"100%",maxWidth:600,padding:"0 4px",overflowX:"auto"}}>
          {tableau.map((pile,col)=>(
            <div key={col} style={{flex:1,minWidth:44,position:"relative",minHeight:80}}>
              {pile.length===0?(
                <div onClick={()=>handleTableauClick(col,0)}
                  style={{width:"100%",height:68,borderRadius:6,border:"2px dashed rgba(255,255,255,0.2)",cursor:"pointer"}}/>
              ):(
                <div style={{position:"relative"}}>
                  {pile.map((card,i)=>(
                    <div key={`${card.suit}${card.label}${i}`}
                      style={{position:"absolute",top:i*18,left:0,right:0,zIndex:i}}>
                      <CardUI card={card} small selected={selected?.pile==="tableau"&&selected.col===col&&selected.idx<=i&&card.faceUp}
                        onClick={()=>handleTableauClick(col,i)}/>
                    </div>
                  ))}
                  <div style={{height:68+Math.max(0,pile.length-1)*18}}/>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}>
          <button onClick={()=>stage>1&&setStage(s=>s-1)} disabled={stage===1} style={{padding:"7px 14px",borderRadius:10,border:"0.5px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",cursor:stage>1?"pointer":"not-allowed",fontSize:11,color:"rgba(255,255,255,0.6)",opacity:stage===1?0.4:1}}>← Prev</button>
          <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>Stage {stage} of 1000</span>
          <button onClick={()=>setStage(s=>s+1)} style={{display:"flex",alignItems:"center",gap:3,padding:"7px 14px",borderRadius:10,border:"0.5px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",cursor:"pointer",fontSize:11,color:"rgba(255,255,255,0.6)",fontWeight:600}}>Next <ChevronRight size={12}/></button>
        </div>
      </main>

      
      
      <OutOfTokensModal
        gameName="Solitaire"
        open={showTokenModal}
        onClose={()=>setShowTokenModal(false)}/>
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
          const text=`MindState · Solitaire Stage ${stage} · ${finalXP} XP · ${elapsed}`;
          if(navigator.share)navigator.share({title:"MindState",text,url:"https://mindstate.vercel.app"}).catch(()=>{});
          else window.open("https://twitter.com/intent/tweet?text="+encodeURIComponent(text),"_blank");
        }}/>

    
      <AnimatePresence>
        {completed&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:24}}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} transition={{type:"spring",stiffness:380,damping:28}}
              style={{background:"var(--surface)",borderRadius:28,padding:36,maxWidth:340,width:"100%",textAlign:"center",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
              <div style={{fontSize:56,marginBottom:12}}>🎉</div>
              <h2 style={{fontSize:26,fontWeight:700,color:"var(--text1)",fontFamily:"Georgia,serif",marginBottom:4}}>Stage Complete!</h2>
              <p style={{fontSize:13,color:"var(--text4)",marginBottom:24}}>{elapsed} · {getDifficulty(stage)}</p>
              <div style={{background:"var(--bg2)",borderRadius:16,padding:20,marginBottom:20}}>
                <p style={{fontSize:11,color:"var(--text4)",fontWeight:600,marginBottom:4,letterSpacing:"0.1em",textTransform:"uppercase"}}>XP Earned</p>
                <p style={{fontSize:52,fontWeight:700,color:"#4F6EF7",fontFamily:"Georgia,serif"}}>{finalXP}</p>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>loadStage(stage)}
                  style={{flex:1,padding:13,borderRadius:14,border:"0.5px solid var(--border2)",background:"var(--surface)",fontSize:13,fontWeight:600,color:"var(--text2)",cursor:"pointer"}}>
                  Retry
                </button>
                <button onClick={()=>{setCompleted(false);setStage(s=>s+1);}}
                  style={{flex:2,padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",fontSize:13,fontWeight:700,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  Next Stage →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
</div>
  );
}
