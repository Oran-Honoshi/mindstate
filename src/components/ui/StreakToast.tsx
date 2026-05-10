"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, X } from "lucide-react";

interface StreakToastProps {
  streak: number;
  bonusAwarded: boolean;
  onDismiss: () => void;
}

export function StreakToast({ streak, bonusAwarded, onDismiss }: StreakToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity:0, y:-20, scale:0.95 }}
      animate={{ opacity:1, y:0, scale:1 }}
      exit={{ opacity:0, y:-20, scale:0.95 }}
      transition={{ type:"spring", stiffness:400, damping:28 }}
      style={{
        position:"fixed", top:80, left:"50%", transform:"translateX(-50%)",
        zIndex:9999, background:"white", borderRadius:20,
        padding:"14px 20px", boxShadow:"0 16px 48px rgba(0,0,0,0.14)",
        border:"0.5px solid rgba(0,0,0,0.08)",
        display:"flex", alignItems:"center", gap:12, minWidth:280,
      }}
      onClick={onDismiss}
    >
      <div style={{ width:44, height:44, borderRadius:14,
        background:bonusAwarded?"linear-gradient(135deg,#F59E0B,#EF4444)":"linear-gradient(135deg,#F97316,#F59E0B)",
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Flame size={22} color="white" fill="white"/>
      </div>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:14, fontWeight:700, color:"#1C1917", marginBottom:2 }}>
          {bonusAwarded ? "🎉 7-Day Streak! Bonus earned!" : `${streak}-Day Streak! 🔥`}
        </p>
        <p style={{ fontSize:12, color:"#64748B" }}>
          {bonusAwarded
            ? "+10 bonus plays added to your account"
            : streak >= 3
              ? `${7 - (streak % 7)} more days for bonus plays`
              : "Keep playing daily to build your streak"}
        </p>
      </div>
      {bonusAwarded && (
        <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:20,
          background:"rgba(79,110,247,0.1)", color:"#4F6EF7", fontSize:12, fontWeight:700, flexShrink:0 }}>
          <Zap size={12}/> +10
        </div>
      )}
    </motion.div>
  );
}
