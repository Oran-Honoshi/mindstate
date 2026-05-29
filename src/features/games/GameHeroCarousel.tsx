"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  generateTangoBoard, validateBoard, buildSeed,
  type Cell, type TangoBoard, type CellStatus,
} from "@/lib/games/tangoGenerator";
import { playClick, playSuccess } from "@/lib/audio/soundEngine";
import { SunIcon, MoonIcon } from "@/components/icons/GameIcons";
import { triggerConfetti } from "@/components/effects/Confetti";

export const CAROUSEL_GAMES = [
  { key: "tango",  label: "Tango",  href: "/games/tango",  desc: "Balance rows & columns" },
  { key: "memory", label: "Memory", href: "/games/memory", desc: "Flip cards, find pairs"  },
  { key: "queens", label: "Queens", href: "/games/queens", desc: "One queen per region"    },
];

export const REGION_PALETTE_MINI = [
  { fill: "#DBEAFE", border: "#1D4ED8", queen: "#1E3A8A" },
  { fill: "#FED7AA", border: "#C2410C", queen: "#7C2D12" },
  { fill: "#BBF7D0", border: "#15803D", queen: "#14532D" },
  { fill: "#E9D5FF", border: "#7C3AED", queen: "#4C1D95" },
  { fill: "#FECDD3", border: "#BE123C", queen: "#881337" },
  { fill: "#FDE68A", border: "#B45309", queen: "#78350F" },
];

export function MiniMemoryHero() {
  const ICONS = ["🌿", "🔥", "💧", "⭐", "🌙", "☀️", "❄️", "💎"];
  const [cards] = useState(() => {
    const pairs = [...ICONS];
    const arr = [...pairs, ...pairs];
    let s = 777;
    for (let i = arr.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) & 0xffffffff; const j = Math.abs(s) % (i + 1); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr.map((v, i) => ({ id: i, value: v, flipped: false, matched: false }));
  });
  const [state, setState] = useState(cards);
  const [sel, setSel] = useState<number[]>([]);
  const CELL = 44;

  function flip(id: number) {
    const card = state.find(c => c.id === id);
    if (!card || card.flipped || card.matched || sel.length === 2) return;
    const ns = state.map(c => c.id === id ? { ...c, flipped: true } : c);
    const nsel = [...sel, id];
    setState(ns); setSel(nsel);
    if (nsel.length === 2) {
      const [a, b] = nsel.map(sid => ns.find(c => c.id === sid)!);
      if (a.value === b.value) {
        setState(prev => prev.map(c => c.id === a.id || c.id === b.id ? { ...c, matched: true } : c));
        setSel([]); playSuccess();
      } else {
        setTimeout(() => { setState(prev => prev.map(c => c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c)); setSel([]); }, 700);
      }
    }
  }
  const matched = state.filter(c => c.matched).length / 2;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {matched === 8 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 10, fontWeight: 700, color: "var(--color-accent-secondary)", background: "rgba(16,244,160,0.08)", border: "1px solid rgba(16,244,160,0.3)", padding: "2px 10px", borderRadius: 10 }}>All pairs found!</motion.div>}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(4,${CELL}px)`, gap: 6 }}>
        {state.map(card => (
          <motion.button key={card.id} onClick={() => flip(card.id)} whileTap={{ scale: 0.88 }}
            style={{ width: CELL, height: CELL, borderRadius: 10, border: "1.5px solid", outline: "none", cursor: card.matched ? "default" : "pointer", background: card.flipped || card.matched ? "var(--color-surface)" : "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", borderColor: card.matched ? "#86EFAC" : card.flipped ? "#DDD6F8" : "transparent", fontSize: card.flipped || card.matched ? 22 : 0, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: card.matched ? "0 0 0 2px #86EFAC" : "none" }}>
            {(card.flipped || card.matched) && card.value}
          </motion.button>
        ))}
      </div>
      <p style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{matched}/8 pairs found · tap to flip</p>
    </div>
  );
}

export function MiniQueensHero() {
  const SIZE = 6;
  const REGIONS = [
    [0, 0, 1, 1, 2, 2], [0, 0, 1, 1, 2, 2], [3, 3, 1, 4, 4, 2],
    [3, 3, 5, 4, 4, 2], [3, 5, 5, 5, 4, 2], [3, 5, 5, 5, 5, 2],
  ];
  const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: SIZE }, () => new Array(SIZE).fill(0)));
  const CELL = 40;

  function checkWon(g: number[][]) {
    const queens: [number, number][] = [];
    g.forEach((row, r) => row.forEach((v, c) => { if (v === 2) queens.push([r, c]); }));
    if (queens.length !== SIZE) return false;
    const rows = new Set(queens.map(([r]) => r));
    const cols = new Set(queens.map(([, c]) => c));
    const regions = new Set(queens.map(([r, c]) => REGIONS[r][c]));
    if (rows.size !== SIZE || cols.size !== SIZE || regions.size !== SIZE) return false;
    for (let i = 0; i < queens.length; i++) for (let j = i + 1; j < queens.length; j++) {
      const [r1, c1] = queens[i], [r2, c2] = queens[j];
      if (Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1) return false;
    }
    return true;
  }

  function toggle(r: number, c: number) {
    const cur = grid[r][c];
    const next = cur === 0 ? 1 : cur === 1 ? 2 : 0;
    const ng = grid.map((row, ri) => row.map((v, ci) => ri === r && ci === c ? next : v));
    setGrid(ng);
    if (checkWon(ng)) { playSuccess(); setTimeout(() => triggerConfetti(), 80); }
  }
  const won = checkWon(grid);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      {won && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 10, fontWeight: 700, color: "var(--color-accent-secondary)", background: "rgba(16,244,160,0.08)", border: "1px solid rgba(16,244,160,0.3)", padding: "2px 10px", borderRadius: 10 }}>Solved!</motion.div>}
      <div style={{ border: "2px solid #374151", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${SIZE},${CELL}px)` }}>
          {REGIONS.map((row, r) => row.map((rid, c) => {
            const val = grid[r][c];
            const pal = REGION_PALETTE_MINI[rid % REGION_PALETTE_MINI.length];
            const rd = c < SIZE - 1 && REGIONS[r][c + 1] !== rid;
            const bd = r < SIZE - 1 && REGIONS[r + 1][c] !== rid;
            return (
              <button key={`${r}-${c}`} onClick={() => toggle(r, c)}
                style={{ width: CELL, height: CELL, display: "flex", alignItems: "center", justifyContent: "center", background: pal.fill, cursor: "pointer", outline: "none", borderRight: rd ? `2.5px solid ${pal.border}` : "0.5px solid rgba(0,0,0,0.1)", borderBottom: bd ? `2.5px solid ${pal.border}` : "0.5px solid rgba(0,0,0,0.1)", borderTop: "none", borderLeft: "none", fontSize: CELL * 0.45 }}>
                {val === 1 && <span style={{ color: "#64748B", fontWeight: 700 }}>✕</span>}
                {val === 2 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: pal.queen }}>♛</motion.span>}
              </button>
            );
          }))}
        </div>
      </div>
      <p style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>tap once=✕ twice=♛ · one queen per region</p>
    </div>
  );
}

export function TangoDemo({ cellSize = 52 }: { cellSize?: number }) {
  const [board] = useState<TangoBoard>(() => generateTangoBoard("hero-hard-77", "hard"));
  const [playerGrid, setPlayerGrid] = useState<Cell[][]>(() => board.puzzle.map(r => [...r]));
  const [statuses, setStatuses] = useState<CellStatus[][]>(() =>
    board.puzzle.map(r => r.map(c => c !== null ? "given" : "empty"))
  );
  const [solved, setSolved] = useState(false);
  const [errorRows, setErrorRows] = useState<Set<number>>(new Set());
  const [errorCols, setErrorCols] = useState<Set<number>>(new Set());
  const [squish, setSquish] = useState<string | null>(null);
  const cm = new Map<string, "same" | "diff">();
  board.constraints.forEach(c => cm.set(`${c.row1}-${c.col1}-${c.row2}-${c.col2}`, c.type));

  function checkErrors(grid: Cell[][], size: number) {
    const er = new Set<number>(), ec = new Set<number>();
    for (let r = 0; r < size; r++) { const row = grid[r]; if (!row.every(c => c !== null)) continue; const s = row.filter(c => c === "S").length, m = row.filter(c => c === "M").length; const tri = row.some((c, i) => i <= size - 3 && c !== null && c === row[i + 1] && c === row[i + 2]); if (s !== size / 2 || m !== size / 2 || tri) er.add(r); }
    for (let c = 0; c < size; c++) { const col = grid.map(r => r[c]); if (!col.every(v => v !== null)) continue; const s = col.filter(v => v === "S").length, m = col.filter(v => v === "M").length; const tri = col.some((v, i) => i <= size - 3 && v !== null && v === col[i + 1] && v === col[i + 2]); if (s !== size / 2 || m !== size / 2 || tri) ec.add(c); }
    setErrorRows(er); setErrorCols(ec);
  }

  function handleClick(r: number, c: number) {
    if (solved || statuses[r][c] === "given") return;
    const cur = playerGrid[r][c];
    const next: Cell = cur === null ? "S" : cur === "S" ? "M" : null;
    const key = `${r}-${c}`;
    setSquish(key); setTimeout(() => setSquish(null), 340);
    const ng = playerGrid.map((row, ri) => row.map((cell, ci) => ri === r && ci === c ? next : cell));
    setPlayerGrid(ng); checkErrors(ng, board.size);
    const ns = validateBoard(board.puzzle, ng, board.solution);
    setStatuses(ns); playClick();
    if (ns.every(row => row.every(s => s === "correct" || s === "given"))) {
      setSolved(true); playSuccess(); setTimeout(() => triggerConfetti(), 80);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div>
          <p style={{ fontSize: 9, color: "var(--color-text-secondary)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 1 }}>Hard · {board.size}×{board.size} · Free Play</p>
          <p style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}>Tango</p>
        </div>
        <AnimatePresence>
          {solved && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 10, fontWeight: 700, color: "var(--color-accent-secondary)", background: "rgba(16,244,160,0.08)", border: "1px solid rgba(16,244,160,0.3)", padding: "2px 10px", borderRadius: 20 }}>Solved!</motion.span>}
        </AnimatePresence>
      </div>
      <div style={{ height: 3, background: "var(--color-surface-2)", borderRadius: 2, marginBottom: 12 }}>
        <motion.div style={{ height: 3, background: "linear-gradient(90deg,var(--color-accent-primary),var(--color-accent-primary))", borderRadius: 2 }} animate={{ width: solved ? "100%" : "28%" }} transition={{ duration: 0.8 }}/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${board.size},${cellSize}px)`, gap: 6, marginBottom: 10 }}>
        {board.puzzle.map((_, r) => board.puzzle[r].map((_, c) => {
          const isGiven = statuses[r][c] === "given";
          const value = playerGrid[r][c];
          const key = `${r}-${c}`;
          const hasError = errorRows.has(r) || errorCols.has(c);
          const rightC = cm.get(`${r}-${c}-${r}-${c + 1}`);
          const bottomC = cm.get(`${r}-${c}-${r + 1}-${c}`);
          return (
            <div key={key} style={{ position: "relative", width: cellSize, height: cellSize }}>
              <motion.button onClick={() => handleClick(r, c)}
                whileTap={!isGiven ? { scale: 0.85 } : {}}
                animate={squish === key ? { scaleX: [1, 0.86, 1.08, 1], scaleY: [1, 1.1, 0.94, 1] } : {}}
                transition={{ duration: 0.32 }}
                style={{ width: "100%", height: "100%", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid", background: hasError ? "rgba(239,68,68,0.07)" : isGiven ? "var(--color-surface-2)" : "var(--color-surface)", borderColor: isGiven ? "var(--color-border)" : value ? "#DDD6F8" : "var(--color-border)", cursor: isGiven ? "default" : "pointer", outline: "none" }}>
                {value === "S" && <SunIcon size={cellSize * 0.48}/>}
                {value === "M" && <MoonIcon size={cellSize * 0.48}/>}
                {!value && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-border)" }}/>}
              </motion.button>
              {rightC && c < board.size - 1 && (
                <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 12, height: 12, borderRadius: "50%", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, border: `1.5px solid ${rightC === "same" ? "var(--color-accent-primary)" : "#F87171"}`, color: rightC === "same" ? "var(--color-accent-primary)" : "#F87171" }}>
                  {rightC === "same" ? "=" : "×"}
                </div>
              )}
              {bottomC && r < board.size - 1 && (
                <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", zIndex: 10, width: 12, height: 12, borderRadius: "50%", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 700, border: `1.5px solid ${bottomC === "same" ? "var(--color-accent-primary)" : "#F87171"}`, color: bottomC === "same" ? "var(--color-accent-primary)" : "#F87171" }}>
                  {bottomC === "same" ? "=" : "×"}
                </div>
              )}
            </div>
          );
        }))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--color-text-secondary)" }}><SunIcon size={11}/> Sun</span>
        <span style={{ color: "var(--color-border)" }}>·</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--color-text-secondary)" }}><MoonIcon size={11}/> Moon</span>
        <span style={{ color: "var(--color-border)" }}>·</span>
        <button onClick={() => { setPlayerGrid(board.puzzle.map(r => [...r])); setStatuses(board.puzzle.map(r => r.map(c => c !== null ? "given" : "empty"))); setSolved(false); setErrorRows(new Set()); setErrorCols(new Set()); }}
          style={{ fontSize: 10, color: "var(--color-accent-primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Reset</button>
      </div>
    </div>
  );
}

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const game = CAROUSEL_GAMES[active];
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, justifyContent: "center" }}>
        {CAROUSEL_GAMES.map((g, i) => (
          <button key={g.key} onClick={() => setActive(i)}
            style={{ padding: "5px 14px", borderRadius: 20, border: "1.5px solid", fontSize: 11, fontWeight: 700, cursor: "pointer", outline: "none", transition: "all 0.15s", background: active === i ? "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))" : "var(--color-surface)", color: active === i ? "white" : "var(--color-text-secondary)", borderColor: active === i ? "transparent" : "var(--color-border)" }}>
            {g.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}>
          {active === 0 && <TangoDemo cellSize={42}/>}
          {active === 1 && <MiniMemoryHero/>}
          {active === 2 && <MiniQueensHero/>}
        </motion.div>
      </AnimatePresence>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{game.desc}</span>
        <Link href={game.href} style={{ fontSize: 11, fontWeight: 600, color: "var(--color-accent-primary)", display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
          Full game <ArrowRight size={10}/>
        </Link>
      </div>
    </div>
  );
}
