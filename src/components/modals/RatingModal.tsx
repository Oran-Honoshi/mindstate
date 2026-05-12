"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";

export function RatingModal() {
  const { user } = useAuthStore();
  const [show, setShow] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [step, setStep] = useState<"rate"|"feedback"|"done">("rate");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!user) return;
    const key = `mindstate-rated-${user.id}`;
    const stagesKey = `mindstate-stages-${user.id}`;
    if (localStorage.getItem(key)) return;
    // Show after 10 completed stages
    const stages = parseInt(localStorage.getItem(stagesKey) ?? "0");
    if (stages >= 10) {
      setTimeout(() => setShow(true), 2000);
    }
  }, [user]);

  async function handleRating(r: number) {
    setRating(r);
    if (r >= 4) {
      // Happy path → send to Trustpilot
      setStep("feedback");
    } else {
      // Unhappy → collect internal feedback
      setStep("feedback");
    }
  }

  async function handleSubmit() {
    const supabase = createClient();
    if (user) {
      await supabase.from("suggestions").insert({
        user_id: user.id,
        category: "rating",
        content: `Rating: ${rating}/5. Feedback: ${feedback}`,
      });
    }
    localStorage.setItem(`mindstate-rated-${user?.id}`, "1");
    if (rating >= 4) {
      // Open Trustpilot
      window.open("https://www.trustpilot.com/review/mindstate.vercel.app", "_blank");
    }
    setStep("done");
    setTimeout(() => setShow(false), 2500);
  }

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(8px)", display: "flex",
          alignItems: "flex-end", justifyContent: "center",
          zIndex: 200, padding: "0 16px 32px",
        }}
        onClick={e => { if (e.target === e.currentTarget) setShow(false); }}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          style={{
            background: "white", borderRadius: 24, padding: 28,
            maxWidth: 400, width: "100%", position: "relative",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
          }}
        >
          <button onClick={() => setShow(false)}
            style={{ position: "absolute", top: 14, right: 14, padding: 6, borderRadius: 8, background: "#F8F7F5", border: "none", cursor: "pointer", display: "flex" }}>
            <X size={14} color="#94A3B8" />
          </button>

          {step === "rate" && (
            <>
              <p style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Quick question</p>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1C1917", fontFamily: "Georgia,serif", marginBottom: 6 }}>
                Enjoying MindState?
              </h2>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
                How would you rate your experience so far?
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => handleRating(i)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                    <Star
                      size={36}
                      fill={(hovered || rating) >= i ? "#F59E0B" : "none"}
                      color={(hovered || rating) >= i ? "#F59E0B" : "#E2E8F0"}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </>
          )}

          {step === "feedback" && (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1C1917", fontFamily: "Georgia,serif", marginBottom: 6 }}>
                {rating >= 4 ? "Glad you're enjoying it! " : "Sorry to hear that"}
              </h2>
              <p style={{ fontSize: 13, color: "#64748B", marginBottom: 14 }}>
                {rating >= 4
                  ? "Would you share your experience on Trustpilot? It helps us grow."
                  : "What could we do better? Your feedback shapes the product."}
              </p>
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder={rating >= 4 ? "Optional: tell us your favourite game..." : "Tell us what's missing or broken..."}
                rows={3}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "0.5px solid #E2E8F0", fontSize: 13, color: "#1C1917", background: "#FDFCFB", outline: "none", resize: "none", marginBottom: 14, fontFamily: "inherit" }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShow(false)}
                  style={{ flex: 1, padding: 11, borderRadius: 12, border: "0.5px solid #E2E8F0", background: "white", fontSize: 12, fontWeight: 600, color: "#64748B", cursor: "pointer" }}>
                  Skip
                </button>
                <button onClick={handleSubmit}
                  style={{ flex: 2, padding: 11, borderRadius: 12, border: "none", background: "linear-gradient(135deg,#4F6EF7,#9C6BE8)", fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {rating >= 4 ? <><ExternalLink size={13}/> Review on Trustpilot</> : "Send Feedback"}
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#1C1917", marginBottom: 4 }}>Thank you!</p>
              <p style={{ fontSize: 13, color: "#64748B" }}>Your feedback means a lot to us.</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
