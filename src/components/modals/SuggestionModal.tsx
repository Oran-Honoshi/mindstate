"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Lightbulb, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

interface SuggestionModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: "game_request",   label: "New Game Idea" },
  { value: "feature",        label: "Feature Request" },
  { value: "bug",            label: "Bug Report" },
  { value: "other",          label: "Other" },
];

export function SuggestionModal({ open, onClose }: SuggestionModalProps) {
  const { user } = useAuthStore();
  const [category, setCategory] = useState("game_request");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!content.trim() || loading) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from("suggestions").insert({
      user_id: user?.id ?? null,
      content: content.trim(),
      category,
    });
    setSent(true);
    setLoading(false);
    setTimeout(() => { setSent(false); setContent(""); onClose(); }, 2000);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)", display: "flex",
            alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: 24,
          }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              background: "white", borderRadius: 28, padding: 32,
              maxWidth: 420, width: "100%", position: "relative",
              boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
            }}
          >
            <button onClick={onClose}
              style={{ position: "absolute", top: 14, right: 14, padding: 6, borderRadius: 8, background: "#F8F7F5", border: "none", cursor: "pointer", display: "flex" }}>
              <X size={14} color="#94A3B8" />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "#FFFBEB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lightbulb size={22} color="#F59E0B" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1C1917", fontFamily: "Georgia,serif" }}>Share an Idea</h2>
                <p style={{ fontSize: 12, color: "#94A3B8" }}>We read every suggestion</p>
              </div>
            </div>

            {sent ? (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                  <Check size={26} color="#22C55E" />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#1C1917", marginBottom: 4 }}>Thank you!</p>
                <p style={{ fontSize: 13, color: "#64748B" }}>Your idea has been sent to our team.</p>
              </motion.div>
            ) : (
              <>
                {/* Category */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} onClick={() => setCategory(cat.value)}
                      style={{
                        padding: "6px 14px", borderRadius: 20, border: "0.5px solid", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                        background: category === cat.value ? "linear-gradient(135deg,#4F6EF7,#9C6BE8)" : "white",
                        color: category === cat.value ? "white" : "#64748B",
                        borderColor: category === cat.value ? "transparent" : "#E2E8F0",
                      }}>
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Text area */}
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={
                    category === "game_request" ? "e.g. I'd love a word search game, or a nonogram with larger grids..."
                    : category === "feature" ? "e.g. I wish I could set a daily reminder..."
                    : category === "bug" ? "Describe what happened and on which game/stage..."
                    : "Tell us anything on your mind..."
                  }
                  rows={4}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 14,
                    border: "0.5px solid #E2E8F0", fontSize: 13, color: "#1C1917",
                    background: "#FDFCFB", outline: "none", resize: "none",
                    lineHeight: 1.6, fontFamily: "inherit",
                  }}
                />
                <p style={{ fontSize: 11, color: "#CBD5E1", marginTop: 6, marginBottom: 20 }}>
                  {content.length}/500 characters
                </p>

                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || loading}
                  style={{
                    width: "100%", padding: 13, borderRadius: 14, border: "none",
                    background: content.trim() ? "linear-gradient(135deg,#4F6EF7,#9C6BE8)" : "#E2E8F0",
                    fontSize: 13, fontWeight: 700,
                    color: content.trim() ? "white" : "#94A3B8",
                    cursor: content.trim() ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                  <Send size={14} />
                  {loading ? "Sending..." : "Send Suggestion"}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
