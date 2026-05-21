// src/components/ui/RateUsButton.tsx
// Floating "Rate Us" button — can be placed in nav, profile, or settings
"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { TrustpilotReviewModal } from "@/components/ui/TrustpilotReviewModal";

interface RateUsButtonProps {
  variant?: "pill" | "icon" | "full";
}

export function RateUsButton({ variant = "pill" }: RateUsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center",
          gap: variant === "icon" ? 0 : 6,
          padding: variant === "full" ? "12px 20px" : variant === "pill" ? "7px 14px" : "8px",
          borderRadius: variant === "full" ? 14 : 20,
          background: "transparent",
          border: "1.5px solid #00B67A",
          color: "#00B67A",
          fontSize: 13, fontWeight: 700,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "rgba(0,182,122,0.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        <Star size={14} fill="#00B67A" color="#00B67A" />
        {variant !== "icon" && "Rate MindElement"}
      </button>

      <TrustpilotReviewModal
        open={open}
        onClose={() => setOpen(false)}
        context="manual"
      />
    </>
  );
}