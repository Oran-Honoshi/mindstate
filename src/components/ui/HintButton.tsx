"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface HintButtonProps {
  hintsLeft: number;
  xpCost: number;
  onUseHint: () => void;
  disabled?: boolean;
}

export function HintButton({ hintsLeft, xpCost, onUseHint, disabled }: HintButtonProps) {
  const [flash, setFlash] = useState(false);

  function handle() {
    if (hintsLeft <= 0 || disabled) return;
    onUseHint();
    setFlash(true);
    setTimeout(() => setFlash(false), 1400);
  }

  return (
    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
      <button onClick={handle} disabled={hintsLeft <= 0 || disabled}
        style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 14px", borderRadius:20, border:"0.5px solid rgba(245,158,11,0.35)", background:"rgba(245,158,11,0.06)", cursor:hintsLeft > 0 && !disabled ? "pointer" : "not-allowed", fontSize:12, fontWeight:600, color:"#B45309", opacity:hintsLeft <= 0 ? 0.4 : 1 }}>
        <Lightbulb size={13} color="#F59E0B"/>
        Hint ({hintsLeft} left)
      </button>
      <AnimatePresence>
        {flash && (
          <motion.span initial={{opacity:0,x:-4}} animate={{opacity:1,x:0}} exit={{opacity:0}}
            style={{fontSize:11,color:"#F59E0B",fontWeight:600,display:"flex",alignItems:"center",gap:3}}>
            <Lightbulb size={10} color="#F59E0B"/> -{xpCost} XP
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
