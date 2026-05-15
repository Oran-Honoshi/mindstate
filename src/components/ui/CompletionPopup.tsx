"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Share2, ChevronRight, RotateCcw, Zap, Clock, Flame, Trophy, TrendingUp } from "lucide-react";
import type { Difficulty } from "@/lib/games/xpEngine";

const MESSAGES_BY_TIER = {
  high: [
    "Flawless. You barely broke a sweat.",
    "That was surgical. Impressive.",
    "Perfect execution. Top of the leaderboard.",
    "Elite solve. Your brain is running hot.",
    "That is what mastery looks like.",
    "Clinical precision. Outstanding.",
  ],
  mid: [
    "Solid work. You are getting sharper.",
    "Good progress. Your logic is tightening.",
    "Well played. Keep that momentum going.",
    "Nice solve. You are building real skill here.",
    "That is the way. Consistent and clean.",
    "Good thinking. One stage closer to mastery.",
  ],
  low: [
    "You got there. That is what matters.",
    "Tough stage, but you cracked it.",
    "Every solve makes the next one easier.",
    "Persistence paid off. Well done.",
    "Progress over perfection. Keep going.",
    "You finished it. That takes grit.",
  ],
};

function pickMessage(xp: number, maxXP: number): string {
  const r = xp / maxXP;
  const pool = r >= 0.75 ? MESSAGES_BY_TIER.high : r >= 0.4 ? MESSAGES_BY_TIER.mid : MESSAGES_BY_TIER.low;
  return pool[Math.floor(Math.random() * pool.length)];
}

interface CompletionPopupProps {
  open: boolean;
  stage: number;
  difficulty: string;
  xpEarned: number;
  maxXP?: number;
  elapsed: string;
  bonusAwarded?: boolean;
  onRetry: () => void;
  onNext: () => void;
  onShare: () => void;
}

function XPMeter({ xpEarned, maxXP }: { xpEarned: number; maxXP: number }) {
  const pct = Math.min(100, Math.round((xpEarned / maxXP) * 100));
  const color = pct >= 75 ? "#22C55E" : pct >= 40 ? "#F59E0B" : "#EF4444";
  const label = pct >= 75 ? "Excellent" : pct >= 40 ? "Good" : "Completed";
  return (
    <div style={{ background:"var(--bg2)", borderRadius:16, padding:"16px 18px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:10 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:600, color:"var(--text4)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:2 }}>XP Earned</p>
          <p style={{ fontSize:40, fontWeight:700, color, fontFamily:"Georgia,serif", lineHeight:1 }}>{xpEarned}</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:10, background:`${color}18`, color }}>{label}</span>
          <p style={{ fontSize:11, color:"var(--text4)", marginTop:4 }}>of {maxXP} max</p>
        </div>
      </div>
      <div style={{ height:6, background:"var(--bg3)", borderRadius:3, overflow:"hidden" }}>
        <motion.div
          initial={{ width:0 }}
          animate={{ width:`${pct}%` }}
          transition={{ duration:0.9, ease:"easeOut", delay:0.2 }}
          style={{ height:"100%", borderRadius:3, background:color }}/>
      </div>
    </div>
  );
}

export function CompletionPopup({
  open, stage, difficulty, xpEarned, maxXP, elapsed,
  bonusAwarded, onRetry, onNext, onShare,
}: CompletionPopupProps) {
  const [message] = useState(() => pickMessage(xpEarned, maxXP));
  const pct = Math.round((xpEarned / maxXP) * 100);
  const isHigh = pct >= 75;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.48)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20 }}>
          <motion.div
            initial={{ scale:0.88, y:28 }} animate={{ scale:1, y:0 }} exit={{ scale:0.88, y:28 }}
            transition={{ type:"spring", stiffness:380, damping:26 }}
            style={{ background:"var(--surface)", borderRadius:28, padding:"26px 22px", maxWidth:360, width:"100%", boxShadow:"0 32px 80px rgba(0,0,0,0.22)" }}>

            {/* Icon */}
            <div style={{ textAlign:"center", marginBottom:18 }}>
              <motion.div
                initial={{ scale:0 }} animate={{ scale:1 }}
                transition={{ type:"spring", stiffness:400, damping:18, delay:0.1 }}
                style={{ width:56, height:56, borderRadius:"50%",
                  background: isHigh ? "rgba(34,197,94,0.1)" : "rgba(79,110,247,0.1)",
                  border: `2px solid ${isHigh ? "#86EFAC" : "#C7D2FE"}`,
                  display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
                {isHigh
                  ? <Trophy size={26} color="#F59E0B"/>
                  : <CheckCircle size={26} color="#4F6EF7"/>}
              </motion.div>
              <h2 style={{ fontSize:21, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", marginBottom:5 }}>
                Stage {stage} Complete
              </h2>
              <p style={{ fontSize:13, color:"var(--text3)", lineHeight:1.55, fontStyle:"italic", maxWidth:280, margin:"0 auto" }}>
                {message}
              </p>
            </div>

            {/* XP bar */}
            <div style={{ marginBottom:12 }}>
              <XPMeter xpEarned={xpEarned} maxXP={maxXP}/>
            </div>

            {/* Stats */}
            <div style={{ display:"flex", gap:10, marginBottom:12 }}>
              <div style={{ flex:1, background:"var(--bg2)", borderRadius:12, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
                <Clock size={14} color="#4F6EF7"/>
                <div>
                  <p style={{ fontSize:10, color:"var(--text4)" }}>Time</p>
                  <p style={{ fontSize:13, fontWeight:700, color:"var(--text1)", fontFamily:"monospace" }}>{elapsed}</p>
                </div>
              </div>
              <div style={{ flex:1, background:"var(--bg2)", borderRadius:12, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
                <TrendingUp size={14} color="#F59E0B"/>
                <div>
                  <p style={{ fontSize:10, color:"var(--text4)" }}>Difficulty</p>
                  <p style={{ fontSize:13, fontWeight:700, color:"var(--text1)", textTransform:"capitalize" }}>{difficulty}</p>
                </div>
              </div>
            </div>

            {/* Streak bonus */}
            {bonusAwarded && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                style={{ background:"rgba(245,158,11,0.08)", borderRadius:12, padding:"10px 14px", marginBottom:12, border:"0.5px solid rgba(245,158,11,0.25)", display:"flex", alignItems:"center", gap:8 }}>
                <Flame size={16} color="#F59E0B"/>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:"#B45309" }}>7-Day Streak — +10 Bonus Plays</p>
                  <p style={{ fontSize:11, color:"var(--text4)" }}>Consistency is the secret weapon.</p>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <button onClick={onShare}
              style={{ width:"100%", marginBottom:10, padding:"11px", borderRadius:14, border:"0.5px solid var(--border2)", background:"var(--bg2)", fontSize:13, fontWeight:600, color:"var(--text2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <Share2 size={14}/> Share Result
            </button>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={onRetry}
                style={{ flex:1, padding:12, borderRadius:14, border:"0.5px solid var(--border2)", background:"var(--bg2)", fontSize:13, fontWeight:600, color:"var(--text2)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <RotateCcw size={13}/> Retry
              </button>
              <button onClick={onNext}
                style={{ flex:2, padding:12, borderRadius:14, border:"none", background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)", fontSize:13, fontWeight:700, color:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                Next Stage <ChevronRight size={14}/>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
