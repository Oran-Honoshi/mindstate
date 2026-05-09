"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Brain, Zap, Trophy, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export function WelcomeModal() {
  const { user, profile } = useAuthStore();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    const key = `mindstate-welcomed-${user.id}`;
    if (!localStorage.getItem(key)) {
      setTimeout(() => setShow(true), 800);
      localStorage.setItem(key, "1");
    }
  }, [user]);

  const steps = [
    {
      icon: Brain,
      color: "#4F6EF7",
      bg: "#EEF2FF",
      title: `Welcome, ${profile?.username ?? "friend"}!`,
      body: "You've joined MindState — an elegant brain-training suite designed for the modern mind. Here's what to expect.",
      cta: "Let's go →",
    },
    {
      icon: Zap,
      color: "#F59E0B",
      bg: "#FFFBEB",
      title: "How XP works",
      body: "Every stage starts with 1,000 XP. It decays in real time — the faster you solve, the more you earn. Use hints wisely: each costs 25% XP. Choose Practice Mode for zero pressure (no leaderboard points).",
      cta: "Got it →",
    },
    {
      icon: Trophy,
      color: "#22C55E",
      bg: "#F0FDF4",
      title: "Daily Challenges",
      body: "Every game has a free Daily Challenge — a randomly selected stage from any difficulty. Complete it to maintain your streak. Missed challenges are always available for practice, never for points.",
      cta: "Nice →",
    },
    {
      icon: Users,
      color: "#9C6BE8",
      bg: "#F5F3FF",
      title: "Family & Friends",
      body: "Create a Family Group and invite up to 6 friends. Compete on a private leaderboard and get real-time notifications when someone breaks a record.",
      cta: "Start playing",
    },
  ];

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(12px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 200, padding: 24,
        }}
      >
        <motion.div
          key={step}
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          style={{
            background: "white", borderRadius: 28, padding: 36,
            maxWidth: 400, width: "100%", position: "relative",
            boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
          }}
        >
          <button
            onClick={() => setShow(false)}
            style={{
              position: "absolute", top: 16, right: 16,
              padding: 6, borderRadius: 8, background: "#F8F7F5",
              border: "none", cursor: "pointer", display: "flex",
            }}
          >
            <X size={14} color="#94A3B8" />
          </button>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                height: 3, flex: 1, borderRadius: 2,
                background: i <= step ? current.color : "#E2E8F0",
                transition: "background 0.3s",
              }} />
            ))}
          </div>

          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: current.bg, display: "flex",
            alignItems: "center", justifyContent: "center", marginBottom: 20,
          }}>
            <Icon size={26} color={current.color} />
          </div>

          <h2 style={{
            fontSize: 22, fontWeight: 700, color: "#1C1917",
            fontFamily: "Georgia,serif", marginBottom: 10, lineHeight: 1.2,
          }}>
            {current.title}
          </h2>
          <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, marginBottom: 28 }}>
            {current.body}
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  flex: 1, padding: 13, borderRadius: 14,
                  border: "0.5px solid #E2E8F0", background: "white",
                  fontSize: 13, fontWeight: 600, color: "#64748B", cursor: "pointer",
                }}
              >
                Back
              </button>
            )}
            {isLast ? (
              <Link
                href="/games"
                onClick={() => setShow(false)}
                style={{
                  flex: 2, padding: 13, borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                  fontSize: 13, fontWeight: 700, color: "white",
                  textDecoration: "none", display: "flex",
                  alignItems: "center", justifyContent: "center", gap: 6,
                }}
              >
                Start Playing <ChevronRight size={14} />
              </Link>
            ) : (
              <button
                onClick={() => setStep(s => s + 1)}
                style={{
                  flex: 2, padding: 13, borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                  fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer",
                }}
              >
                {current.cta}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
