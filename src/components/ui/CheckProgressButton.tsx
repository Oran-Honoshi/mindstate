"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanEye, X, Zap } from "lucide-react";

interface CheckProgressButtonProps {
  onCheck: () => void;
  disabled?: boolean;
  xpCost?: number;
}

export function CheckProgressButton({ onCheck, disabled, xpCost = 50 }: CheckProgressButtonProps) {
  const [confirm, setConfirm] = useState(false);
  const [flash, setFlash] = useState(false);

  function handleConfirm() {
    setConfirm(false);
    onCheck();
    setFlash(true);
    setTimeout(() => setFlash(false), 2200);
  }

  return (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <button
          onClick={() => !disabled && setConfirm(true)}
          disabled={disabled}
          style={{
            display:"flex", alignItems:"center", gap:5,
            padding:"6px 14px", borderRadius:20,
            border:"0.5px solid rgba(34,197,94,0.35)",
            background:"rgba(34,197,94,0.06)",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize:12, fontWeight:600, color:"#15803D",
            opacity: disabled ? 0.4 : 1,
          }}>
          <ScanEye size={13} color="#22C55E"/>
          Check Progress
          <span style={{
            fontSize:10, fontWeight:700, color:"#EF4444",
            background:"rgba(239,68,68,0.1)", padding:"1px 5px",
            borderRadius:6, marginLeft:2,
          }}>
            -{xpCost} XP
          </span>
        </button>

        <AnimatePresence>
          {flash && (
            <motion.span
              initial={{ opacity:0, x:-4 }}
              animate={{ opacity:1, x:0 }}
              exit={{ opacity:0 }}
              style={{ fontSize:11, color:"#22C55E", fontWeight:600,
                display:"flex", alignItems:"center", gap:3 }}>
              <ScanEye size={10} color="#22C55E"/> 2s preview
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
              style={{ background:"var(--surface)", borderRadius:24, padding:26,
                maxWidth:320, width:"100%", boxShadow:"0 32px 80px rgba(0,0,0,0.2)" }}>

              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ width:44, height:44, borderRadius:14,
                  background:"rgba(34,197,94,0.08)",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <ScanEye size={22} color="#22C55E"/>
                </div>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text1)", marginBottom:2 }}>
                    Check Progress
                  </h3>
                  <p style={{ fontSize:12, color:"var(--text4)" }}>
                    Highlights correct cells for 2 seconds
                  </p>
                </div>
              </div>

              <div style={{ background:"rgba(239,68,68,0.06)", borderRadius:14,
                padding:"12px 14px", marginBottom:18,
                border:"0.5px solid rgba(239,68,68,0.15)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <Zap size={13} color="#EF4444"/>
                    <p style={{ fontSize:13, color:"var(--text2)", fontWeight:600 }}>
                      XP cost
                    </p>
                  </div>
                  <span style={{ fontSize:18, fontWeight:700, color:"#EF4444",
                    fontFamily:"Georgia,serif" }}>
                    -{xpCost} XP
                  </span>
                </div>
                <p style={{ fontSize:11, color:"var(--text4)", marginTop:8, lineHeight:1.5 }}>
                  Green cells are correct. No cell positions are revealed — only correctness.
                  Auto-hides after 2 seconds.
                </p>
              </div>

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => setConfirm(false)}
                  style={{ flex:1, padding:"11px", borderRadius:12,
                    border:"0.5px solid var(--border2)", background:"var(--bg2)",
                    fontSize:13, fontWeight:600, color:"var(--text2)", cursor:"pointer" }}>
                  Cancel
                </button>
                <button onClick={handleConfirm}
                  style={{ flex:2, padding:"11px", borderRadius:12, border:"none",
                    background:"linear-gradient(135deg,#22C55E,#16A34A)",
                    fontSize:13, fontWeight:700, color:"white", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <ScanEye size={14}/> Check Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
