// src/components/ui/GameThumbnail.tsx
// Renders a game thumbnail with a pristine geometric fallback if no image is assigned

"use client";
import { Brain } from "lucide-react";

// Seeded color palette per slug — deterministic, no randomness
const SLUG_PALETTES: Record<string, { from: string; to: string; accent: string }> = {
  "tango":         { from:"var(--color-accent-primary)", to:"var(--color-accent-primary)", accent:"#00FFFF" },
  "memory":        { from:"#059669", to:"#0891B2", accent:"#39FF14" },
  "queens":        { from:"#7C3AED", to:"var(--color-accent-primary)", accent:"#F59E0B" },
  "sudoku":        { from:"#1D4ED8", to:"#7C3AED", accent:"#00FFFF" },
  "zip":           { from:"#0891B2", to:"#059669", accent:"#39FF14" },
  "flow":          { from:"var(--color-error)", to:"#F59E0B", accent:"#00FFFF" },
  "bridges":       { from:"#B45309", to:"#92400E", accent:"#FDE68A" },
  "kakuro":        { from:"#1D4ED8", to:"#1E40AF", accent:"#93C5FD" },
  "logic-path":    { from:"#0E7490", to:"#0891B2", accent:"#67E8F9" },
  "lightup":       { from:"#CA8A04", to:"#B45309", accent:"#FDE68A" },
  "nonogram":      { from:"#BE185D", to:"#9D174D", accent:"#FBCFE8" },
  "pattern-match": { from:"#7C3AED", to:"#6D28D9", accent:"#DDD6FE" },
  "patches":       { from:"#C2410C", to:"#9A3412", accent:"#FED7AA" },
  "2048-pro":      { from:"#92400E", to:"#78350F", accent:"#FDE68A" },
  "gravity-sort":  { from:"#C2410C", to:"#B91C1C", accent:"#FCA5A5" },
  "hex-merge":     { from:"#0F766E", to:"#0E7490", accent:"#99F6E4" },
  "word-sling":    { from:"#047857", to:"#065F46", accent:"#6EE7B7" },
  "hearts":        { from:"#BE123C", to:"#9F1239", accent:"#FDA4AF" },
  "solitaire":     { from:"#3730A3", to:"#312E81", accent:"#A5B4FC" },
  "minesweeper":   { from:"#374151", to:"#1F2937", accent:"#9CA3AF" },
  "word-climb":    { from:"#065F46", to:"#047857", accent:"#6EE7B7" },
  "pinpoint":      { from:"#1D4ED8", to:"#2563EB", accent:"#BFDBFE" },
  "name-country":  { from:"#0F766E", to:"#0E7490", accent:"#67E8F9" },
  "name-city":     { from:"#7C3AED", to:"#6D28D9", accent:"#C4B5FD" },
};

interface GameThumbnailProps {
  slug: string;
  imageUrl?: string | null;
  className?: string;
}

export function GameThumbnail({ slug, imageUrl, className = "" }: GameThumbnailProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={className}
        style={{ width:"100%", height:"100%", objectFit:"cover" }}
        loading="lazy"
      />
    );
  }

  const palette = SLUG_PALETTES[slug] ?? { from:"var(--color-accent-primary)", to:"var(--color-accent-primary)", accent:"#00FFFF" };

  return (
    <div style={{
      width:"100%", height:"100%",
      background:`linear-gradient(135deg, ${palette.from}18, ${palette.to}18)`,
      display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden",
    }}>
      {/* Geometric grid overlay */}
      <div style={{
        position:"absolute", inset:0, opacity:0.04,
        backgroundImage:`linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)`,
        backgroundSize:"14px 14px",
      }}/>
      {/* Accent glow */}
      <div style={{
        position:"absolute", top:"-30%", right:"-20%",
        width:80, height:80, borderRadius:"50%",
        background:palette.accent, opacity:0.08, filter:"blur(24px)",
      }}/>
      {/* Icon */}
      <div style={{
        width:48, height:48, borderRadius:16,
        background:`linear-gradient(135deg, ${palette.from}30, ${palette.to}20)`,
        border:`1px solid ${palette.accent}30`,
        display:"flex", alignItems:"center", justifyContent:"center",
        backdropFilter:"blur(4px)",
      }}>
        <Brain size={22} color={palette.accent} style={{ opacity:0.9 }}/>
      </div>
    </div>
  );
}