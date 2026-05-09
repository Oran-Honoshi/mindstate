"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Lock, ChevronRight, Zap, Star, Trophy } from "lucide-react";
import Link from "next/link";

const GAMES = [
  {
    slug: "tango",
    label: "Tango",
    desc: "Balance each row and column with equal Suns and Moons. No three in a row.",
    longDesc: "A grid logic game where every row and column must contain equal symbols. Constraint clues guide your deductions.",
    free: true,
    stages: 100,
    difficulties: ["Easy 4×4", "Medium 6×6", "Hard 8×8"],
    color: "#00FFFF",
    icon: "◐",
  },
  {
    slug: "memory",
    label: "Memory",
    desc: "Flip cards and find matching pairs. Speed and recall are rewarded.",
    longDesc: "Classic concentration game with escalating grid sizes and shorter reveal windows as difficulty increases.",
    free: true,
    stages: 100,
    difficulties: ["Easy 4×4", "Medium 6×6", "Hard 8×8"],
    color: "#39FF14",
    icon: "◈",
  },
  {
    slug: "sudoku",
    label: "Mini Sudoku",
    desc: "Fill the grid so every row, column, and box contains each number once.",
    longDesc: "Classic Sudoku scaled to 6×6 for quick sessions, with full 9×9 unlocked at hard difficulty.",
    free: false,
    stages: 100,
    difficulties: ["Easy 6×6", "Medium 6×6", "Hard 9×9"],
    color: "#FFD700",
    icon: "⊞",
  },
  {
    slug: "queens",
    label: "Queens",
    desc: "Place one queen per row, column, and color region — none attacking another.",
    longDesc: "A constraint-satisfaction puzzle inspired by N-Queens. Each colored region must contain exactly one queen.",
    free: false,
    stages: 100,
    difficulties: ["Easy 6×6", "Medium 8×8", "Hard 10×10"],
    color: "#FF6B9D",
    icon: "♛",
  },
  {
    slug: "zip",
    label: "Zip",
    desc: "Connect the dots in order, filling every cell in the grid exactly once.",
    longDesc: "Trace a continuous path through a numbered grid, visiting every cell. Plan ahead — dead ends are punishing.",
    free: false,
    stages: 100,
    difficulties: ["Easy 5×5", "Medium 7×7", "Hard 9×9"],
    color: "#A78BFA",
    icon: "⟡",
  },
  {
    slug: "minesweeper",
    label: "Minesweeper",
    desc: "Deduce mine locations from number clues. One wrong click ends it.",
    longDesc: "Pure logic minesweeper — no luck required. Every board is guaranteed solvable without guessing.",
    free: false,
    stages: 100,
    difficulties: ["Easy 8×8", "Medium 12×12", "Hard 16×16"],
    color: "#FB923C",
    icon: "◉",
  },
];

export default function GamesPage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 border-b border-neutral-800/60 backdrop-blur-md bg-[#121212]/80">
        <Link href="/" className="flex items-center gap-2">
          <Brain size={20} className="text-cyan-400" />
          <span className="font-mono font-bold tracking-widest text-sm">MINDSTATE</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/auth/signin" className="text-xs font-mono tracking-wider text-neutral-300 hover:text-white transition-colors">SIGN IN</Link>
          <Link href="/auth/signup" className="text-xs font-mono tracking-wider px-4 py-1.5 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all rounded">START FREE</Link>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-xs font-mono tracking-[0.3em] text-neutral-500 uppercase mb-3">The Suite</p>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Six Games.</h1>
          <p className="text-neutral-400 max-w-xl">
            Each game has 100 stages — 30 Easy, 40 Medium, 30 Hard. XP decays with time. Use hints wisely.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-6 mb-10 p-4 bg-neutral-900 border border-neutral-800 rounded-xl"
        >
          {[
            { icon: Star,   label: "Total Stages",  value: "600" },
            { icon: Zap,    label: "XP Per Stage",  value: "1000" },
            { icon: Trophy, label: "Leaderboards",  value: "Global + Family" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <stat.icon size={15} className="text-cyan-400" />
              <div>
                <p className="text-xs text-neutral-500 font-mono">{stat.label}</p>
                <p className="text-sm font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Games grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onMouseEnter={() => setHovered(game.slug)}
              onMouseLeave={() => setHovered(null)}
              className="relative"
            >
              <Link
                href={game.free ? `/games/${game.slug}` : "/pricing"}
                className="block"
              >
                <div
                  className="relative p-6 bg-neutral-900 border rounded-xl transition-all duration-300 overflow-hidden"
                  style={{
                    borderColor: hovered === game.slug ? game.color + "60" : "#262626",
                    boxShadow: hovered === game.slug ? `0 0 30px ${game.color}10` : "none",
                  }}
                >
                  {/* Glow bg on hover */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-300 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${game.color}08 0%, transparent 70%)`,
                      opacity: hovered === game.slug ? 1 : 0,
                    }}
                  />

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold border"
                        style={{ borderColor: game.color + "40", color: game.color, background: game.color + "10" }}
                      >
                        {game.icon}
                      </div>
                      <div>
                        <h2 className="font-bold text-base tracking-wide">{game.label}</h2>
                        <p className="text-[10px] font-mono text-neutral-500">{game.stages} stages</p>
                      </div>
                    </div>
                    {game.free ? (
                      <span
                        className="text-[10px] font-mono font-bold tracking-wider px-2 py-1 rounded border"
                        style={{ color: game.color, borderColor: game.color + "40", background: game.color + "10" }}
                      >
                        FREE
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <Lock size={12} />
                        <span className="text-[10px] font-mono">PRO</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-400 leading-relaxed mb-5">
                    {hovered === game.slug ? game.longDesc : game.desc}
                  </p>

                  {/* Difficulty pills */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {game.difficulties.map((d) => (
                      <span key={d} className="text-[10px] font-mono text-neutral-500 border border-neutral-800 px-2 py-0.5 rounded-full">
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Progress bar (placeholder) */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-600 mb-1">
                      <span>Progress</span>
                      <span>0 / 100</span>
                    </div>
                    <div className="h-1 bg-neutral-800 rounded-full">
                      <div className="h-1 rounded-full w-0" style={{ background: game.color }} />
                    </div>
                  </div>

                  {/* CTA */}
                  <div
                    className="flex items-center justify-between text-xs font-mono tracking-wider transition-colors"
                    style={{ color: hovered === game.slug ? game.color : "#525252" }}
                  >
                    <span>{game.free ? "PLAY NOW" : "UNLOCK WITH PRO"}</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Pro banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 border border-cyan-400/20 bg-cyan-400/5 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <h3 className="font-bold mb-1">Unlock all 6 games</h3>
            <p className="text-sm text-neutral-400">Individual plan — $2/mo. Family plan from $5/mo.</p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 px-6 py-2.5 bg-cyan-400 text-black font-mono font-bold text-xs tracking-wider rounded hover:bg-green-400 transition-colors"
          >
            VIEW PLANS
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
