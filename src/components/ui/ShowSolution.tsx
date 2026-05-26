"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, AlertTriangle } from "lucide-react";

interface ShowSolutionProps {
  onReveal: () => void;
  currentXP: number;
  disabled?: boolean;
}

export function ShowSolution({ onReveal, currentXP, disabled }: ShowSolutionProps) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <button onClick={() => setConfirm(true)} disabled={disabled}
        style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:20, border:"0.5px solid rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.05)", cursor:disabled?"not-allowed":"pointer", fontSize:12, fontWeight:600, color:"var(--color-error)", opacity:disabled?0.4:1 }}>
        <Eye size={13}/> Show Solution
      </button>
      <AnimatePresence>
        {confirm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:24}}
            onClick={e=>{if(e.target===e.currentTarget)setConfirm(false)}}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} exit={{scale:0.9,y:20}}
              style={{background:"var(--color-surface)",borderRadius:24,padding:28,maxWidth:340,width:"100%",boxShadow:"0 32px 80px rgba(0,0,0,0.2)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
                <div style={{width:44,height:44,borderRadius:14,background:"rgba(239,68,68,0.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <AlertTriangle size={22} color="var(--color-error)"/>
                </div>
                <div>
                  <h3 style={{fontSize:16,fontWeight:700,color:"var(--color-text-primary)",marginBottom:2}}>Reveal Solution?</h3>
                  <p style={{fontSize:12,color:"var(--color-text-secondary)"}}>This cannot be undone</p>
                </div>
              </div>
              <div style={{background:"rgba(239,68,68,0.06)",borderRadius:14,padding:"12px 14px",marginBottom:18,border:"0.5px solid rgba(239,68,68,0.15)"}}>
                <p style={{fontSize:13,color:"var(--color-text-secondary)",lineHeight:1.6}}>
                  Revealing the solution reduces your XP to <strong style={{color:"var(--color-error)"}}>1 point</strong>. Use it to learn — then retry for a real score.
                </p>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:"0.5px solid rgba(239,68,68,0.15)"}}>
                  <span style={{fontSize:11,color:"var(--color-text-secondary)"}}>Your XP</span>
                  <span style={{fontSize:16,fontWeight:700,color:"var(--color-text-primary)",fontFamily:"var(--font-sans)"}}>{currentXP} <span style={{color:"var(--color-error)"}}>→ 1</span></span>
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setConfirm(false)}
                  style={{flex:1,padding:"11px",borderRadius:12,border:"0.5px solid var(--color-border)",background:"var(--color-surface-2)",fontSize:13,fontWeight:600,color:"var(--color-text-secondary)",cursor:"pointer"}}>
                  Cancel
                </button>
                <button onClick={()=>{setConfirm(false);onReveal();}}
                  style={{flex:2,padding:"11px",borderRadius:12,border:"none",background:"linear-gradient(135deg,var(--color-error),#DC2626)",fontSize:13,fontWeight:700,color:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <Eye size={14}/> Reveal Solution
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
