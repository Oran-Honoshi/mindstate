"use client";
import { useState } from "react";
import { BoardPreview } from "@/components/ui/BoardPreview";
import { GameIcon } from "@/components/ui/GameIcon";
import type { GameId } from "@/components/ui/GameIcon";

const GAMES: [GameId, string][] = [
  ["tango","Tango"],["memory","Memory"],["queens","Queens"],["sudoku","Mini Sudoku"],
  ["zip","Zip"],["flow","Flow"],["bridges","Bridges"],["kakuro","Kakuro"],
  ["logicpath","Logic Path"],["lightup","Light Up"],["nonogram","Nonogram"],["patternmatch","Pattern Match"],
  ["patches","Patches"],["2048","2048 Pro"],["gravity","Gravity Sort"],["hexmerge","Hex Merge"],
  ["wordsling","Word Sling"],["hearts","Hearts"],["solitaire","Solitaire"],["minesweeper","Minesweeper"],
  ["wordclimb","Word Climb"],["pinpoint","Pinpoint"],["namecountry","Name the Country"],["namecity","Name the City"],
];

function GameTile({ id, name }: { id: GameId; name: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        aspectRatio: "1", position: "relative",
        borderRadius: "var(--r-card)", overflow: "hidden",
        background: "var(--surf)",
        border: `1px solid ${hovered ? "var(--accent)" : "var(--border)"}`,
        cursor: "pointer", transition: "border-color 150ms",
      }}
    >
      {/* BoardPreview background */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: hovered ? 0.6 : 0.35, transition: "opacity 150ms",
        transform: "scale(0.7)", overflow: "hidden",
      }}>
        <BoardPreview game={id} size={18} gap={3} />
      </div>
      {/* Game icon top-left */}
      <div style={{ position: "absolute", top: 8, left: 8, zIndex: 1 }}>
        <GameIcon game={id} size={28} />
      </div>
      {/* Name bottom-left */}
      <div style={{
        position: "absolute", bottom: 8, left: 8, zIndex: 1,
        fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11,
        color: "var(--text)",
      }}>
        {name}
      </div>
    </div>
  );
}

export function GamesSection() {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? GAMES : GAMES.slice(0, 12);

  return (
    <section id="games" style={{ padding: "80px var(--screen-pad, 16px)", background: "var(--surf2)" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(28px,4vw,36px)", color: "var(--text)", marginBottom: 8 }}>
            24 Games. Never the Same Twice.
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--muted)" }}>
            Every game is generated algorithmically — infinite variety, zero repetition.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 12,
        }} className="lp-game-grid">
          {visible.map(([id, name]) => <GameTile key={id} id={id} name={name} />)}
        </div>

        {!expanded && (
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button onClick={() => setExpanded(true)} style={{
              fontFamily: "var(--font-body)", fontSize: 14, color: "var(--accent)",
              background: "transparent", border: "1px solid var(--accent)",
              borderRadius: "var(--r-pill)", padding: "10px 24px", cursor: "pointer",
            }}>
              View all 24 games
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
