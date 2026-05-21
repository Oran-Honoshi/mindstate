// src/components/ui/ShareModal.tsx
// Smart share modal — two contexts:
// 1. after-purchase: "You just upgraded — invite a friend"
// 2. after-game: "Enjoying MindElement? Share it"
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, MessageCircle, Mail, Send } from "lucide-react";

const LANDING_URL = "https://mindelement.app";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  context?: "after-purchase" | "after-game";
  gameSlug?: string;
  xpEarned?: number;
}

const MESSAGES = {
  "after-purchase": {
    headline: "You're in. Invite someone who deserves it.",
    sub: "Share MindElement with a friend — they get 5 free daily sessions to try it out.",
    whatsapp: `Hey! I just upgraded to MindElement Pro — it's a beautiful brain-training app with 24 logic puzzles (Sudoku, Tango, Nonogram and more). No ads, no fluff, just genuinely good puzzles. Try it free here: ${LANDING_URL}`,
    sms: `Just started using MindElement — brain training that actually feels good. Try it free: ${LANDING_URL}`,
    email_subject: "You'll love this brain training app",
    email_body: `Hey,\n\nI just started using MindElement and I think you'd really enjoy it.\n\nIt's a clean, ad-free app with 24 different logic games — Sudoku, Tango, Nonogram, Minesweeper and more. Each one has its own challenge progression. You get 5 free plays every day to try it out.\n\nCheck it out here: ${LANDING_URL}\n\nLet me know what you think!`,
    tweet: `Just discovered @MindElement — genuinely great brain training. 24 logic games, no ads, beautiful design. Highly recommend 🧠 ${LANDING_URL}`,
    link_caption: "Copy invite link",
  },
  "after-game": {
    headline: "Enjoying it? Let someone else in.",
    sub: "The best way to grow a brain-training habit is with someone else doing it alongside you.",
    whatsapp: `Are you into logic puzzles? I've been playing MindElement lately — it has Sudoku, Tango, Nonogram, Minesweeper and more. All in one clean app with no ads. You get 5 free plays a day. Try it: ${LANDING_URL}`,
    sms: `Check out MindElement — great logic puzzle app, free to try: ${LANDING_URL}`,
    email_subject: "A brain training app I think you'd like",
    email_body: `Hey,\n\nI've been playing MindElement lately and thought you'd enjoy it.\n\nIt's a minimalist brain-training app with 24 logic games — everything from Sudoku and Nonogram to Tango and Minesweeper. No ads, no nonsense. Free to try with 5 plays per day.\n\n${LANDING_URL}\n\nWorth a look!`,
    tweet: `Been playing MindElement — 24 logic games in one beautiful app. No ads, no nonsense. Free to try 🧠 ${LANDING_URL}`,
    link_caption: "Copy link",
  },
};

export function ShareModal({ open, onClose, context = "after-game", gameSlug, xpEarned }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const msg = MESSAGES[context];

  function copyLink() {
    navigator.clipboard.writeText(LANDING_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function shareWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg.whatsapp)}`, "_blank", "noopener");
  }

  function shareSMS() {
    window.open(`sms:?body=${encodeURIComponent(msg.sms)}`, "_blank");
  }

  function shareEmail() {
    window.open(
      `mailto:?subject=${encodeURIComponent(msg.email_subject)}&body=${encodeURIComponent(msg.email_body)}`,
      "_blank"
    );
  }

  function shareTweet() {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(msg.tweet)}`, "_blank", "noopener");
  }

  function shareTelegram() {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(LANDING_URL)}&text=${encodeURIComponent(msg.whatsapp)}`, "_blank", "noopener");
  }

  function nativeShare() {
    if (navigator.share) {
      navigator.share({
        title: "MindElement — Brain Training",
        text: msg.whatsapp,
        url: LANDING_URL,
      }).catch(() => {});
    }
  }

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
          maxWidth: 420,
          width: "100%",
          position: "relative",
          boxShadow: "0 32px 80px rgba(0,0,0,0.3)",
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16,
          padding: 8, borderRadius: 10, border: "none",
          background: "var(--bg2)", cursor: "pointer",
          display: "flex", color: "var(--text4)",
        }}>
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {context === "after-purchase" ? (
            <div style={{
              fontSize: 44, marginBottom: 12, lineHeight: 1,
            }}>🎉</div>
          ) : (
            <div style={{
              width: 52, height: 52, borderRadius: 18,
              background: "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Send size={22} color="white" />
            </div>
          )}

          <h2 style={{
            fontSize: 22, fontWeight: 700, fontFamily: "Georgia,serif",
            color: "var(--text1)", marginBottom: 8, lineHeight: 1.25,
          }}>
            {msg.headline}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text3)", lineHeight: 1.6 }}>
            {msg.sub}
          </p>
        </div>

        {/* Share buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>

          {/* WhatsApp — primary */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={shareWhatsApp}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px", borderRadius: 16,
              background: "#25D366", border: "none",
              color: "white", fontSize: 15, fontWeight: 700,
              cursor: "pointer", textAlign: "left",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Send via WhatsApp
          </motion.button>

          {/* Telegram */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={shareTelegram}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px", borderRadius: 16,
              background: "#2AABEE", border: "none",
              color: "white", fontSize: 15, fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Send size={20} color="white" />
            Send via Telegram
          </motion.button>

          {/* Row: SMS + Email + Twitter */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={shareSMS}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 6, padding: "14px 10px", borderRadius: 16,
                background: "var(--bg2)", border: "0.5px solid var(--border2)",
                color: "var(--text2)", fontSize: 12, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <MessageCircle size={20} />
              SMS
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={shareEmail}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 6, padding: "14px 10px", borderRadius: 16,
                background: "var(--bg2)", border: "0.5px solid var(--border2)",
                color: "var(--text2)", fontSize: 12, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Mail size={20} />
              Email
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={shareTweet}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 6, padding: "14px 10px", borderRadius: 16,
                background: "var(--bg2)", border: "0.5px solid var(--border2)",
                color: "var(--text2)", fontSize: 12, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Tweet
            </motion.button>
          </div>

          {/* Native share (mobile) */}
          {hasNativeShare && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={nativeShare}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: "13px", borderRadius: 16,
                background: "transparent", border: "0.5px solid var(--border2)",
                color: "var(--text2)", fontSize: 14, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Send size={16} />
              More options...
            </motion.button>
          )}
        </div>

        {/* Copy link */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 14px", borderRadius: 14,
          background: "var(--bg2)", border: "0.5px solid var(--border2)",
        }}>
          <span style={{
            flex: 1, fontSize: 13, color: "var(--text4)",
            fontFamily: "monospace", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {LANDING_URL}
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyLink}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "7px 12px", borderRadius: 10,
              background: copied ? "#22C55E" : "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
              border: "none", color: "white",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap", transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
          </motion.button>
        </div>

      </motion.div>
    </div>
  );
}