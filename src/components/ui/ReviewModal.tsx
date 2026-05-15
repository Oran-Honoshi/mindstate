"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ExternalLink, X, Heart } from "lucide-react";

const TRUSTPILOT_URL = "https://www.trustpilot.com/review/mindstate.vercel.app";

interface ReviewModalProps {
  trigger: "first_win" | "subscription" | "milestone";
  onClose: () => void;
}

export function ReviewModal({ trigger, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [phase, setPhase] = useState<"rate"|"thanks"|"prompt">("rate");

  const titles = {
    first_win: "Enjoying MindState?",
    subscription: "Welcome to MindState Pro!",
    milestone: "You're on a roll!",
  };
  const subtitles = {
    first_win: "You just completed your first puzzle. How are we doing?",
    subscription: "Thanks for subscribing. We'd love your feedback.",
    milestone: "You've completed 10 stages. Tell us what you think!",
  };

  function handleRating(r: number) {
    setRating(r);
    if (r >= 4) {
      setPhase("prompt");
    } else {
      setPhase("thanks");
    }
  }

  function copyAndOpen() {
    const text = `Really enjoying MindState — the brain training games are addictive and beautifully designed. Highly recommend!`;
    navigator.clipboard?.writeText(text).catch(() => {});
    window.open(TRUSTPILOT_URL, "_blank");
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.88, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 24 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{
          background: "var(--surface)", borderRadius: 28, padding: 36,
          maxWidth: 360, width: "100%", position: "relative",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
          textAlign: "center",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "var(--bg2)", border: "none", borderRadius: "50%",
            width: 28, height: 28, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={14} color="var(--text4)" />
        </button>

        <AnimatePresence mode="wait">
          {phase === "rate" && (
            <motion.div key="rate" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
              <h2 style={{
                fontSize: 20, fontWeight: 700, color: "var(--text1)",
                fontFamily: "Georgia,serif", marginBottom: 8,
              }}>
                {titles[trigger]}
              </h2>
              <p style={{ fontSize: 13, color: "var(--text4)", marginBottom: 24, lineHeight: 1.6 }}>
                {subtitles[trigger]}
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                {[1,2,3,4,5].map(s => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => handleRating(s)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    <Star
                      size={36}
                      fill={(hover || rating) >= s ? "#F59E0B" : "none"}
                      color={(hover || rating) >= s ? "#F59E0B" : "var(--border2)"}
                      strokeWidth={1.5}
                    />
                  </motion.button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "var(--text4)" }}>Tap a star to rate</p>
            </motion.div>
          )}

          {phase === "thanks" && (
            <motion.div key="thanks" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💙</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text1)", fontFamily: "Georgia,serif", marginBottom: 8 }}>
                Thanks for the feedback
              </h2>
              <p style={{ fontSize: 13, color: "var(--text4)", marginBottom: 24, lineHeight: 1.6 }}>
                We really appreciate it. We're constantly working to make MindState better.
              </p>
              <button
                onClick={onClose}
                style={{
                  width: "100%", padding: 13, borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                  fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer",
                }}
              >
                Keep Playing
              </button>
            </motion.div>
          )}

          {phase === "prompt" && (
            <motion.div key="prompt" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text1)", fontFamily: "Georgia,serif", marginBottom: 8 }}>
                You made our day!
              </h2>
              <p style={{ fontSize: 13, color: "var(--text4)", marginBottom: 20, lineHeight: 1.6 }}>
                A quick review on Trustpilot would mean the world to us and help other brain-training fans discover MindState.
              </p>
              <div style={{
                background: "var(--bg2)", borderRadius: 14, padding: "12px 16px",
                marginBottom: 20, border: "0.5px solid var(--border)",
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text4)", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Ready-to-paste review
                </p>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6, fontStyle: "italic" }}>
                  "Really enjoying MindState — the brain training games are addictive and beautifully designed. Highly recommend!"
                </p>
              </div>
              <button
                onClick={copyAndOpen}
                style={{
                  width: "100%", padding: 13, borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                  fontSize: 14, fontWeight: 700, color: "white", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginBottom: 10,
                }}
              >
                Copy & Open Trustpilot <ExternalLink size={14}/>
              </button>
              <button
                onClick={onClose}
                style={{
                  width: "100%", padding: 11, borderRadius: 14,
                  border: "0.5px solid var(--border2)", background: "var(--surface)",
                  fontSize: 13, fontWeight: 600, color: "var(--text3)", cursor: "pointer",
                }}
              >
                Maybe later
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// Hook to manage when to show the review modal
export function useReviewPrompt() {
  const [show, setShow] = useState(false);
  const [trigger, setTrigger] = useState<"first_win"|"subscription"|"milestone">("first_win");

  function checkAndShow(t: typeof trigger) {
    if (typeof window === "undefined") return;
    const key = `mindstate-review-shown-${t}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    setTrigger(t);
    // Small delay so it doesn't interrupt the win animation
    setTimeout(() => setShow(true), 2000);
  }

  function onFirstWin() { checkAndShow("first_win"); }
  function onSubscription() { checkAndShow("subscription"); }
  function onMilestone() {
    const key = "mindstate-stages-completed";
    const count = parseInt(localStorage.getItem(key) ?? "0") + 1;
    localStorage.setItem(key, String(count));
    if (count === 10) checkAndShow("milestone");
  }

  return { show, trigger, setShow, onFirstWin, onSubscription, onMilestone };
}
