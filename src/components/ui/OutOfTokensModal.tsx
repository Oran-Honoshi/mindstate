"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, ChevronRight, X, Brain } from "lucide-react";
import Link from "next/link";
import { getTokensRemaining, secondsUntilReset, formatCountdown, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";
import { useAuthStore } from "@/store/authStore";

interface OutOfTokensModalProps {
  gameName: string;
  open: boolean;
  onClose: () => void;
  onContinueAnyway?: () => void; // for demo/free games
}

export function OutOfTokensModal({ gameName, open, onClose, onContinueAnyway }: OutOfTokensModalProps) {
  const { user, profile } = useAuthStore();
  const [countdown, setCountdown] = useState("00:00:00");
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;

  useEffect(() => {
    if (!open) return;
    const iv = setInterval(() => setCountdown(formatCountdown(secondsUntilReset())), 1000);
    setCountdown(formatCountdown(secondsUntilReset()));
    return () => clearInterval(iv);
  }, [open]);

  if (isPro) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          exit={{ opacity:0 }}
          style={{
            position:"fixed", inset:0,
            background:"rgba(0,0,0,0.55)",
            backdropFilter:"blur(16px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            zIndex:500, padding:20,
          }}>
          <motion.div
            initial={{ scale:0.88, y:28 }}
            animate={{ scale:1, y:0 }}
            exit={{ scale:0.88, y:28 }}
            transition={{ type:"spring", stiffness:380, damping:26 }}
            style={{
              background:"var(--surface)", borderRadius:28,
              padding:"28px 24px", maxWidth:380, width:"100%",
              boxShadow:"0 32px 80px rgba(0,0,0,0.3)",
              position:"relative",
            }}>

            <button onClick={onClose}
              style={{ position:"absolute", top:14, right:14, padding:6, borderRadius:8,
                background:"var(--bg2)", border:"none", cursor:"pointer", display:"flex" }}>
              <X size={14} color="var(--text4)"/>
            </button>

            {/* Icon */}
            <div style={{ textAlign:"center", marginBottom:20 }}>
              <div style={{ width:64, height:64, borderRadius:20,
                background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 14px", boxShadow:"0 8px 24px rgba(79,110,247,0.3)" }}>
                <Brain size={30} color="white"/>
              </div>
              <h2 style={{ fontSize:21, fontWeight:700, color:"var(--text1)",
                fontFamily:"Georgia,serif", marginBottom:6 }}>
                Keep your mind sharp?
              </h2>
              <p style={{ fontSize:14, color:"var(--text3)", lineHeight:1.6 }}>
                You've used all {FREE_DAILY_TOKENS} free plays today.
                Your tokens reset in <strong style={{ color:"var(--text1)", fontFamily:"monospace" }}>{countdown}</strong>.
              </p>
            </div>

            {/* Value prop */}
            <div style={{ background:"linear-gradient(135deg,rgba(79,110,247,0.06),rgba(156,107,232,0.08))",
              borderRadius:16, padding:"16px 18px", marginBottom:18,
              border:"0.5px solid rgba(79,110,247,0.15)" }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#4F6EF7", marginBottom:8 }}>
                Pro — Less than a cup of coffee
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[
                  "Unlimited plays across all 20 games",
                  "1,000 stages per game — never runs out",
                  "Family leaderboards for up to 7 members",
                  "Early access to new games and stages",
                ].map((f,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:16, height:16, borderRadius:"50%",
                      background:"rgba(79,110,247,0.12)",
                      display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Zap size={9} color="#4F6EF7"/>
                    </div>
                    <p style={{ fontSize:12, color:"var(--text2)" }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link href="/pricing" onClick={onClose}
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                width:"100%", padding:"14px", borderRadius:16, border:"none",
                background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                fontSize:15, fontWeight:700, color:"white", textDecoration:"none",
                marginBottom:10, boxShadow:"0 6px 20px rgba(79,110,247,0.3)" }}>
              Start Pro — $2/mo <ChevronRight size={15}/>
            </Link>

            <div style={{ display:"flex", gap:8 }}>
              <button onClick={onClose}
                style={{ flex:1, padding:"11px", borderRadius:14,
                  border:"0.5px solid var(--border2)", background:"var(--bg2)",
                  fontSize:13, fontWeight:600, color:"var(--text3)", cursor:"pointer" }}>
                <Clock size={12} style={{ display:"inline", marginRight:4 }}/>
                Wait for reset
              </button>
              {onContinueAnyway && (
                <button onClick={onContinueAnyway}
                  style={{ flex:1, padding:"11px", borderRadius:14,
                    border:"0.5px solid var(--border2)", background:"var(--bg2)",
                    fontSize:13, fontWeight:600, color:"var(--text3)", cursor:"pointer" }}>
                  Watch an ad
                </button>
              )}
            </div>

            {!user && (
              <p style={{ textAlign:"center", fontSize:12, color:"var(--text4)", marginTop:12 }}>
                <Link href="/auth/signin" style={{ color:"#4F6EF7", textDecoration:"none" }}>
                  Sign in
                </Link> to track your progress and streaks
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
