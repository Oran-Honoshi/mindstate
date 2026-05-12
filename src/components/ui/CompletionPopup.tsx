"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Share2, ChevronRight, RotateCcw, Star, Zap, Trophy, Flame } from "lucide-react";

const MESSAGES_BY_XP = {
  high: [
    "Flawless. You barely broke a sweat.",
    "That was surgical. Impressive.",
    "Perfect execution. Top of the leaderboard material.",
    "Elite solve. Your brain is running hot.",
    "That's what mastery looks like.",
    "Clinical precision. Outstanding.",
  ],
  mid: [
    "Solid work. You're getting sharper.",
    "Good progress — your logic is tightening.",
    "Well played. Keep that momentum going.",
    "Nice solve. You're building real skill here.",
    "That's the way. Consistent and clean.",
    "Good thinking. One stage closer to mastery.",
  ],
  low: [
    "You got there — that's what matters.",
    "Tough stage, but you cracked it.",
    "Every solve makes the next one easier.",
    "Persistence paid off. Well done.",
    "Progress over perfection. Keep going.",
    "You finished it — that takes grit.",
  ],
};

const STREAK_MESSAGES = [
  "Streak extended! 🔥",
  "Another day, another win.",
  "Daily habit building — respect.",
  "Consistency is the secret weapon.",
];

interface CompletionPopupProps {
  open: boolean;
  stage: number;
  difficulty: string;
  xpEarned: number;
  maxXP: number;
  elapsed: string;
  streakDay?: number;
  bonusAwarded?: boolean;
  onRetry: () => void;
  onNext: () => void;
  onShare: () => void;
}

function pickMessage(xpEarned: number, maxXP: number): string {
  const ratio = xpEarned / maxXP;
  const pool = ratio >= 0.75 ? MESSAGES_BY_XP.high
             : ratio >= 0.4  ? MESSAGES_BY_XP.mid
             : MESSAGES_BY_XP.low;
  return pool[Math.floor(Math.random() * pool.length)];
}

function XPMeter({ xpEarned, maxXP }: { xpEarned: number; maxXP: number }) {
  const pct = Math.round((xpEarned / maxXP) * 100);
  const color = pct >= 75 ? "#22C55E" : pct >= 40 ? "#F59E0B" : "#EF4444";
  const label = pct >= 75 ? "Excellent" : pct >= 40 ? "Good" : "Completed";
  return (
    <div style={{ background:"var(--bg2)", borderRadius:16, padding:"18px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:10 }}>
        <div>
          <p style={{ fontSize:11, fontWeight:600, color:"var(--text4)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:2 }}>XP Earned</p>
          <p style={{ fontSize:44, fontWeight:700, color, fontFamily:"Georgia,serif", lineHeight:1 }}>{xpEarned}</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:10, background:`${color}18`, color }}>{label}</span>
          <p style={{ fontSize:12, color:"var(--text4)", marginTop:4 }}>of {maxXP} max</p>
        </div>
      </div>
      <div style={{ height:8, background:"var(--bg3)", borderRadius:4, overflow:"hidden" }}>
        <motion.div
          initial={{ width:0 }}
          animate={{ width:`${pct}%` }}
          transition={{ duration:0.8, ease:"easeOut", delay:0.3 }}
          style={{ height:"100%", borderRadius:4, background:color }}/>
      </div>
    </div>
  );
}

export function CompletionPopup({
  open, stage, difficulty, xpEarned, maxXP, elapsed,
  streakDay, bonusAwarded, onRetry, onNext, onShare
}: CompletionPopupProps) {
  const [message] = useState(() => pickMessage(xpEarned, maxXP));
  const [streakMsg] = useState(() => STREAK_MESSAGES[Math.floor(Math.random()*STREAK_MESSAGES.length)]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          exit={{ opacity:0 }}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:20 }}>
          <motion.div
            initial={{ scale:0.88, y:28 }}
            animate={{ scale:1, y:0 }}
            exit={{ scale:0.88, y:28 }}
            transition={{ type:"spring", stiffness:380, damping:26 }}
            style={{ background:"var(--surface)", borderRadius:28, padding:"28px 24px", maxWidth:360, width:"100%", boxShadow:"0 32px 80px rgba(0,0,0,0.22)" }}>

            {/* Header */}
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <motion.div
                initial={{ scale:0 }}
                animate={{ scale:1 }}
                transition={{ type:"spring", stiffness:400, damping:18, delay:0.1 }}
                style={{ width:60, height:60, borderRadius:"50%", background:"rgba(34,197,94,0.1)", border:"2px solid #86EFAC", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                <CheckCircle size={30} color="#22C55E"/>
              </motion.div>
              <h2 style={{ fontSize:22, fontWeight:700, color:"var(--text1)", fontFamily:"Georgia,serif", marginBottom:6 }}>
                Stage {stage} Complete
              </h2>
              <p style={{ fontSize:14, color:"var(--text3)", lineHeight:1.5, fontStyle:"italic" }}>
                "{message}"
              </p>
            </div>

            {/* XP meter */}
            <div style={{ marginBottom:14 }}>
              <XPMeter xpEarned={xpEarned} maxXP={maxXP}/>
            </div>

            {/* Stats row */}
            <div style={{ display:"flex", gap:10, marginBottom:14 }}>
              {[
                { icon:Zap, label:"Time", value:elapsed, color:"#4F6EF7" },
                { icon:Star, label:"Difficulty", value:difficulty, color:"#F59E0B" },
              ].map((s,i) => (
                <div key={i} style={{ flex:1, background:"var(--bg2)", borderRadius:12, padding:"10px 12px", display:"flex", alignItems:"center", gap:8 }}>
                  <s.icon size={14} color={s.color}/>
                  <div>
                    <p style={{ fontSize:10, color:"var(--text4)" }}>{s.label}</p>
                    <p style={{ fontSize:13, fontWeight:700, color:"var(--text1)", textTransform:"capitalize" }}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Streak bonus */}
            {bonusAwarded && (
              <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                style={{ background:"rgba(245,158,11,0.08)", borderRadius:12, padding:"10px 14px", marginBottom:14, border:"0.5px solid rgba(245,158,11,0.25)", display:"flex", alignItems:"center", gap:8 }}>
                <Flame size={16} color="#F59E0B" fill="#F59E0B"/>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:"#B45309" }}>7-Day Streak! +10 Bonus Plays</p>
                  <p style={{ fontSize:11, color:"var(--text4)" }}>{streakMsg}</p>
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
