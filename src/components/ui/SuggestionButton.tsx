"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { SuggestionModal } from "@/components/modals/SuggestionModal";
import { motion } from "framer-motion";

export function SuggestionButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 40,
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 16px", borderRadius: 20,
          background: "white", border: "0.5px solid rgba(0,0,0,0.1)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151",
        }}>
        <Lightbulb size={14} color="#F59E0B" />
        Suggest a feature
      </motion.button>
      <SuggestionModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
