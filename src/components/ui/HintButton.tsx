"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Zap, X } from "lucide-react";

interface HintButtonProps {
  hintsLeft: number;
  xpCost: number;
  onUseHint: () => void;
  disabled?: boolean;
}

export function HintButton({ hintsLeft, xpCost, onUseHint, disabled }: HintButtonProps) {
  const [confirm, setConfirm] = useState(false);
  const [flash, setFlash] = useState(false);

  function handleConfirm() {
    setConfirm(false);
    onUseHint();
    setFlash(true);
    setTimeout(() => setFlash(false), 1400);
  }

  const exhausted = hintsLeft <= 0;

  return (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <button
          onClick={() => !exhausted && !disabled && setConfirm(true)}
          disabled={exhausted || disabled}
          style={{
            display:"flex", alignItems:"center", gap:5,
            padding:"6px 14px", borderRadius:20,
            border:"0.5px solid rgba(245,158,11,0.35)",
            background:"rgba(245,158,11,0.06)",
            cursor: exhausted || disabled ? "not-allowed" : "pointer",
            fontSize:12, fontWeight:600, color:"#B45309",
            opacity: exhausted ? 0.4 : 1,
          }}>
          <Lightbulb size={13} color="#F59E0B"/>
          Hint ({hintsLeft} left)
          {!exhausted && (
            <span style={{
              fontSize:10, fontWeight:700, color:"var(--color-error)",
              background:"rgba(239,68,68,0.1)", padding:"1px 5px",
              borderRadius:6, marginLeft:2,
            }}>
              -{xpCost} XP
            </span>
          )}
        </button>

        <AnimatePresence>
          {flash && (
            <motion.span
              initial={{ opacity:0, x:-4 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
              style={{ fontSize:11, color:"#F59E0B", fontWeight:600,
                display:"flex", alignItems:"center", gap:3 }}>
              <Lightbulb size={10} color="#F59E0B"/> -{xpCost} XP used
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)",
              backdropFilter:"blur(12px)", display:"flex", alignItems:"center",
              justifyContent:"center", zIndex:300, padding:24 }}
            onClick={e => { if (e.target === e.currentTarget) setConfirm(false); }}>
            <motion.div
              initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9, y:20 }}
              style={{ background:"var(--color-surface)", borderRadius:24, padding:26,
                maxWidth:320, width:"100%", boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>

              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ width:44, height:44, borderRadius:14,
                  background:"rgba(245,158,11,0.08)",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Lightbulb size={22} color="#F59E0B"/>
                </div>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:"var(--color-text-primary)", marginBottom:2 }}>
                    Use a Hint?
                  </h3>
                  <p style={{ fontSize:12, color:"var(--color-text-secondary)" }}>
                    {hintsLeft} of 3 hints remaining this stage
                  </p>
                </div>
              </div>

              <div style={{ background:"rgba(239,68,68,0.06)", borderRadius:14,
                padding:"12px 14px", marginBottom:18,
                border:"0.5px solid rgba(239,68,68,0.15)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Zap size={13} color="var(--color-error)"/>
                    <p style={{ fontSize:13, color:"var(--color-text-secondary)", fontWeight:600 }}>XP cost</p>
                  </div>
                  <span style={{ fontSize:18, fontWeight:700, color:"var(--color-error)",
                    fontFamily:"var(--font-sans)" }}>
                    -{xpCost} XP
                  </span>
                </div>
                <p style={{ fontSize:11, color:"var(--color-text-secondary)", lineHeight:1.5 }}>
                  One incorrect cell will be corrected. The solution is not revealed — just one step forward.
                </p>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setConfirm(false)}
                  style={{ flex:1, padding:"11px", borderRadius:12,
                    border:"0.5px solid var(--color-border)", background:"var(--color-surface-2)",
                    fontSize:13, fontWeight:600, color:"var(--color-text-secondary)", cursor:"pointer" }}>
                  Cancel
                </button>
                <button onClick={handleConfirm}
                  style={{ flex:2, padding:"11px", borderRadius:12, border:"none",
                    background:"linear-gradient(135deg,#F59E0B,#D97706)",
                    fontSize:13, fontWeight:700, color:"white", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <Lightbulb size={14}/> Use Hint
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
