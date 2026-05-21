// src/components/ui/TrustpilotReviewModal.tsx
// Smart review flow:
// 1. Show star rating
// 2. If 4-5 stars → show text area, pre-populate suggested review, open Trustpilot with text copied
// 3. If 1-3 stars → show internal feedback form, email to hello@mindelement.app
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, ExternalLink, Copy, Check, Send, MessageSquare } from "lucide-react";

const TRUSTPILOT_URL = "https://www.trustpilot.com/review/mindelement.app";

const SUGGESTED_REVIEWS = [
  "MindElement has become part of my daily routine. The puzzles are genuinely challenging and the variety keeps things fresh. Highly recommend for anyone who wants to keep their mind sharp.",
  "Beautifully designed brain training app. No ads, no gimmicks — just clean, elegant logic puzzles. The variety across 24 different games is impressive.",
  "Finally a brain training app that doesn't feel like a chore. The progression system is satisfying and the puzzles are actually challenging. Worth every penny.",
  "I play MindElement every morning before work. It genuinely helps me focus. The design is elegant, no distractions, just great puzzles.",
];

interface TrustpilotReviewModalProps {
  open: boolean;
  onClose: () => void;
  context?: "after-purchase" | "after-session" | "manual";
  gamesPlayed?: number;
}

export function TrustpilotReviewModal({
  open,
  onClose,
  context = "manual",
  gamesPlayed = 0,
}: TrustpilotReviewModalProps) {
  const [step, setStep] = useState<"stars" | "positive" | "negative" | "done">("stars");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Pick a suggested review deterministically
  const suggestedReview = SUGGESTED_REVIEWS[gamesPlayed % SUGGESTED_REVIEWS.length];

  function handleStarSelect(star: number) {
    setRating(star);
    if (star >= 4) {
      setReviewText(suggestedReview);
      setStep("positive");
    } else {
      setStep("negative");
    }
  }

  function handleCopyAndOpen() {
    const text = reviewText || suggestedReview;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => {
        window.open(TRUSTPILOT_URL, "_blank", "noopener");
        setStep("done");
      }, 800);
    }).catch(() => {
      // Clipboard failed — just open
      window.open(TRUSTPILOT_URL, "_blank", "noopener");
      setStep("done");
    });
  }

  async function handleNegativeSubmit() {
    if (!feedback.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "App Feedback",
          email: "feedback@mindelement.app",
          subject: `In-app feedback — ${rating} star${rating !== 1 ? "s" : ""}`,
          message: feedback,
        }),
      });
    } catch {}
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => setStep("done"), 1500);
  }

  function handleClose() {
    setStep("stars");
    setRating(0);
    setHovered(0);
    setReviewText("");
    setCopied(false);
    setFeedback("");
    setSubmitted(false);
    onClose();
  }

  const contextMessage = {
    "after-purchase": "Welcome to MindElement Pro! We'd love to hear your first impressions.",
    "after-session": "You've been training for a while — how are we doing?",
    "manual": "Your feedback helps us improve MindElement for everyone.",
  }[context];

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        style={{
          background: "var(--surface)",
          borderRadius: 28,
          border: "0.5px solid var(--border)",
          padding: "32px",
          maxWidth: 440,
          width: "100%",
          position: "relative",
          boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
        }}
      >
        {/* Close */}
        <button onClick={handleClose} style={{
          position: "absolute", top: 16, right: 16,
          padding: 8, borderRadius: 10, border: "none",
          background: "var(--bg2)", cursor: "pointer",
          display: "flex", color: "var(--text4)",
        }}>
          <X size={16} />
        </button>

        <AnimatePresence mode="wait">

          {/* Step 1 — Star Rating */}
          {step === "stars" && (
            <motion.div key="stars" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 18,
                  background: "linear-gradient(135deg,#00B67A,#00A368)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <Star size={24} color="white" fill="white" />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: "Georgia,serif", color: "var(--text1)", marginBottom: 8 }}>
                  How are we doing?
                </h2>
                <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.6 }}>
                  {contextMessage}
                </p>
              </div>

              {/* Stars */}
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => handleStarSelect(star)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    <Star
                      size={40}
                      color="#F59E0B"
                      fill={(hovered || rating) >= star ? "#F59E0B" : "transparent"}
                      strokeWidth={1.5}
                    />
                  </motion.button>
                ))}
              </div>

              <p style={{ textAlign: "center", fontSize: 12, color: "var(--text4)" }}>
                {hovered === 1 && "Poor"}
                {hovered === 2 && "Fair"}
                {hovered === 3 && "Good"}
                {hovered === 4 && "Great"}
                {hovered === 5 && "Excellent!"}
                {!hovered && "Tap to rate"}
              </p>
            </motion.div>
          )}

          {/* Step 2 — Positive (4-5 stars) */}
          {step === "positive" && (
            <motion.div key="positive" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 12 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={20} color="#F59E0B" fill={s <= rating ? "#F59E0B" : "transparent"} />
                  ))}
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Georgia,serif", color: "var(--text1)", marginBottom: 6 }}>
                  That means a lot — thank you!
                </h2>
                <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6 }}>
                  We've prepared a review for you. Edit it freely, then copy it and paste it on Trustpilot.
                </p>
              </div>

              {/* Editable review text */}
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={5}
                style={{
                  width: "100%", padding: "12px 14px",
                  borderRadius: 14, border: "0.5px solid var(--border2)",
                  background: "var(--bg2)", color: "var(--text1)",
                  fontSize: 14, lineHeight: 1.6, resize: "vertical",
                  fontFamily: "inherit", marginBottom: 16,
                  boxSizing: "border-box",
                }}
              />

              {/* CTA */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyAndOpen}
                style={{
                  width: "100%", padding: "14px",
                  borderRadius: 14, border: "none",
                  background: copied
                    ? "linear-gradient(135deg,#22C55E,#16A34A)"
                    : "linear-gradient(135deg,#00B67A,#00956A)",
                  color: "white", fontSize: 15, fontWeight: 700,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background 0.3s",
                }}
              >
                {copied
                  ? <><Check size={16} /> Copied — Opening Trustpilot...</>
                  : <><Copy size={16} /> Copy & Rate on Trustpilot</>
                }
              </motion.button>

              <p style={{ textAlign: "center", fontSize: 11, color: "var(--text4)", marginTop: 10 }}>
                Your review will be copied to clipboard, then Trustpilot opens — just paste and submit.
              </p>
            </motion.div>
          )}

          {/* Step 3 — Negative (1-3 stars) */}
          {step === "negative" && (
            <motion.div key="negative" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 16,
                  background: "rgba(79,110,247,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px",
                }}>
                  <MessageSquare size={22} color="#4F6EF7" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: "Georgia,serif", color: "var(--text1)", marginBottom: 6 }}>
                  We want to do better
                </h2>
                <p style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6 }}>
                  Tell us what's not working. Our team reads every message and responds within 24 hours.
                </p>
              </div>

              {submitted ? (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  style={{ textAlign: "center", padding: "24px 0", color: "#22C55E" }}>
                  <Check size={32} style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 15, fontWeight: 600 }}>Feedback received — thank you.</p>
                </motion.div>
              ) : (
                <>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What could we improve? What's not working as expected?"
                    rows={5}
                    style={{
                      width: "100%", padding: "12px 14px",
                      borderRadius: 14, border: "0.5px solid var(--border2)",
                      background: "var(--bg2)", color: "var(--text1)",
                      fontSize: 14, lineHeight: 1.6, resize: "vertical",
                      fontFamily: "inherit", marginBottom: 16,
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    onClick={handleNegativeSubmit}
                    disabled={!feedback.trim() || submitting}
                    style={{
                      width: "100%", padding: "14px",
                      borderRadius: 14, border: "none",
                      background: "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                      color: "white", fontSize: 15, fontWeight: 700,
                      cursor: !feedback.trim() || submitting ? "not-allowed" : "pointer",
                      opacity: !feedback.trim() || submitting ? 0.6 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    }}
                  >
                    <Send size={15} />
                    {submitting ? "Sending..." : "Send Feedback"}
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* Step 4 — Done */}
          {step === "done" && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: "center", padding: "16px 0" }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "linear-gradient(135deg,#22C55E,#16A34A)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Check size={28} color="white" />
              </motion.div>
              <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: "Georgia,serif", color: "var(--text1)", marginBottom: 8 }}>
                Thank you!
              </h2>
              <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.6, marginBottom: 24 }}>
                {rating >= 4
                  ? "Your review helps other players discover MindElement. We genuinely appreciate it."
                  : "Your feedback helps us build a better product. We'll get back to you soon."}
              </p>
              <button onClick={handleClose} style={{
                padding: "12px 28px", borderRadius: 14,
                border: "0.5px solid var(--border2)",
                background: "var(--surface)", color: "var(--text2)",
                fontWeight: 600, fontSize: 14, cursor: "pointer",
              }}>
                Back to training
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}