"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Brain, ChevronRight, ArrowRight, Check, Volume2, VolumeX, Sun, Moon, Trophy, Zap, Users, Star } from "lucide-react";
import Link from "next/link";
import { generateTangoBoard, validateBoard, type Cell, type TangoBoard, type CellStatus } from "@/lib/games/tangoGenerator";
import { playClick, playSuccess } from "@/lib/audio/soundEngine";
import { useSettingsStore } from "@/store/settingsStore";
import { GameIcon, SunIcon, MoonIcon } from "@/components/icons/GameIcons";
import { triggerConfetti } from "@/components/effects/Confetti";

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  sage:     { from:"#7C9E87", to:"#4A7C59", bg:"rgba(124,158,135,0.1)",  text:"#3D6B4A" },
  terra:    { from:"#C4785A", to:"#A0522D", bg:"rgba(196,120,90,0.1)",   text:"#8B4513" },
  cobalt:   { from:"#3B6FE8", to:"#2D55B4", bg:"rgba(59,111,232,0.1)",  text:"#1E40AF" },
  lavender: { from:"#8B6FC0", to:"#6B4FA0", bg:"rgba(139,111,192,0.1)", text:"#5B21B6" },
  rose:     { from:"#E87070", to:"#C04040", bg:"rgba(232,112,112,0.1)", text:"#9F1239" },
  amber:    { from:"#E8A830", to:"#C07010", bg:"rgba(232,168,48,0.1)",  text:"#92400E" },
  teal:     { from:"#4DB6AC", to:"#2A7A70", bg:"rgba(77,182,172,0.1)",  text:"#0F766E" },
  indigo:   { from:"#6366F1", to:"#4338CA", bg:"rgba(99,102,241,0.1)",  text:"#3730A3" },
  pink:     { from:"#D946A8", to:"#9D2A70", bg:"rgba(217,70,168,0.1)",  text:"#831843" },
  emerald:  { from:"#22C55E", to:"#16A34A", bg:"rgba(34,197,94,0.1)",   text:"#14532D" },
};

const GAMES = [
  { slug:"tango",         name:"Tango",          desc:"Balance rows & columns with equal Sun and Moon symbols",    p:P.cobalt,   free:true  },
  { slug:"memory",        name:"Memory",          desc:"Flip cards and find matching pairs before XP fades",       p:P.sage,     free:true  },
  { slug:"queens",        name:"Queens",          desc:"Place one queen per row, column, and color region",        p:P.lavender, free:true  },
  { slug:"sudoku",        name:"Mini Sudoku",     desc:"Fill the grid — no repeats in any row, column, or box",   p:P.terra,    free:false },
  { slug:"zip",           name:"Zip",             desc:"Trace a path through every cell hitting all waypoints",    p:P.teal,     free:false },
  { slug:"minesweeper",   name:"Minesweeper",     desc:"Deduce every mine from clues. No guessing required",       p:P.rose,     free:false },
  { slug:"patches",       name:"Patches",         desc:"Tile the board perfectly with irregular polyomino shapes", p:P.amber,    free:false },
  { slug:"hearts",        name:"Hearts",          desc:"Classic trick-avoidance card game in solo mode",           p:P.rose,     free:false },
  { slug:"solitaire",     name:"Solitaire",       desc:"Classic Klondike with a polished modern twist",            p:P.indigo,   free:false },
  { slug:"word-sling",    name:"Word Sling",      desc:"Build the highest-scoring words from letter tiles",        p:P.sage,     free:false },
  { slug:"2048-pro",      name:"2048 Pro",        desc:"Merge tiles strategically to reach 2048 and beyond",       p:P.emerald,  free:false },
  { slug:"logic-path",    name:"Logic Path",      desc:"Connect matching pipe ends to fill every cell",            p:P.cobalt,   free:false },
  { slug:"pattern-match", name:"Pattern Match",   desc:"Identify the hidden rule and complete the sequence",       p:P.lavender, free:false },
  { slug:"hex-merge",     name:"Hex Merge",       desc:"Merge hexagonal tiles in chain reactions",                 p:P.teal,     free:false },
  { slug:"gravity-sort",  name:"Gravity Sort",    desc:"Sort falling blocks into correct columns",                 p:P.terra,    free:false },
  { slug:"bridges",       name:"Bridges",         desc:"Connect every island with exactly the right bridges",      p:P.amber,    free:false },
  { slug:"kakuro",        name:"Kakuro",          desc:"Crossword meets Sudoku — digit sums guide every entry",    p:P.indigo,   free:false },
  { slug:"nonogram",      name:"Nonogram",        desc:"Solve pixel puzzles from row and column number clues",     p:P.pink,     free:false },
  { slug:"flow",          name:"Flow",            desc:"Connect color dots without crossing paths",                p:P.emerald,  free:false },
  { slug:"lightup",       name:"Light Up",        desc:"Place bulbs to illuminate every cell exactly once",        p:P.rose,     free:false },
];

// ── Tablet Frame + Tango Demo ─────────────────────────────────────────────────
function TabletDemo() {
  const [board] = useState<TangoBoard>(() => generateTangoBoard("landing-easy-3", "easy"));
  const [playerGrid, setPlayerGrid] = useState<Cell[][]>(() => board.puzzle.map(r => [...r]));
  const [statuses, setStatuses] = useState<CellStatus[][]>(() =>
    board.puzzle.map(r => r.map(c => c !== null ? "given" : "empty"))
  );
  const [solved, setSolved] = useState(false);
  const [squishing, setSquishing] = useState<string | null>(null);

  const constraintMap = new Map<string,"same"|"diff">();
  board.constraints.forEach(c => constraintMap.set(`${c.row1}-${c.col1}-${c.row2}-${c.col2}`, c.type));

  function handleClick(r: number, c: number) {
    if (solved || statuses[r][c] === "given") return;
    const cur = playerGrid[r][c];
    const next: Cell = cur === null ? "S" : cur === "S" ? "M" : null;
    const key = `${r}-${c}`;
    setSquishing(key);
    setTimeout(() => setSquishing(null), 350);
    const newGrid = playerGrid.map((row, ri) => row.map((cell, ci) => ri===r&&ci===c ? next : cell));
    setPlayerGrid(newGrid);
    const ns = validateBoard(board.puzzle, newGrid, board.solution);
    setStatuses(ns);
    playClick();
    if (ns.every(row => row.every(s => s==="correct"||s==="given"))) {
      setSolved(true);
      playSuccess();
      setTimeout(() => triggerConfetti(), 100);
    }
  }

  return (
    /* Tablet frame */
    <div className="relative mx-auto" style={{ width: 360, perspective: 1000 }}>
      <motion.div
        initial={{ rotateY: -8, rotateX: 4 }}
        animate={{ rotateY: 0, rotateX: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Frame */}
        <div className="relative rounded-[32px] p-3 shadow-2xl"
          style={{ background:"linear-gradient(145deg,#E8E4DE,#D0CBC3)", boxShadow:"0 40px 80px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)" }}>
          {/* Screen */}
          <div className="rounded-[22px] overflow-hidden bg-[#FDFCFB]" style={{ boxShadow:"inset 0 2px 8px rgba(0,0,0,0.08)" }}>
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-white/80 border-b border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 font-mono">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-slate-300"/>
                <div className="w-1 h-1 rounded-full bg-slate-300"/>
                <div className="w-1 h-1 rounded-full bg-slate-300"/>
              </div>
            </div>
            {/* Game header */}
            <div className="px-5 py-4 bg-white/60">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Grand Stage · Free Play</p>
                  <p className="text-base font-bold text-slate-800" style={{ fontFamily:"var(--font-fraunces),serif" }}>Tango</p>
                </div>
                <AnimatePresence>
                  {solved && (
                    <motion.div initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
                      className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      ✓ Solved!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* XP bar */}
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                <motion.div className="h-full rounded-full"
                  style={{ background:"linear-gradient(90deg,#3B6FE8,#8B6FC0)" }}
                  animate={{ width: solved ? "100%" : "45%" }}
                  transition={{ duration: 0.8, ease:"easeOut" }}
                />
              </div>
            </div>
            {/* Board */}
            <div className="px-5 py-4 flex justify-center bg-slate-50/50">
              <div className="grid gap-2" style={{ gridTemplateColumns:`repeat(${board.size}, 58px)` }}>
                {board.puzzle.map((row, r) => row.map((_, c) => {
                  const status = statuses[r][c];
                  const value = playerGrid[r][c];
                  const isGiven = status === "given";
                  const isCorrect = status === "correct";
                  const isError = status === "incorrect";
                  const key = `${r}-${c}`;
                  const rightC = constraintMap.get(`${r}-${c}-${r}-${c+1}`);
                  const bottomC = constraintMap.get(`${r}-${c}-${r+1}-${c}`);
                  return (
                    <div key={key} className="relative" style={{ width:58, height:58 }}>
                      <motion.button
                        onClick={() => handleClick(r, c)}
                        whileTap={!isGiven ? { scale:0.85 } : {}}
                        animate={squishing===key ? { scaleX:[1,0.88,1.06,1], scaleY:[1,1.08,0.96,1] } : {}}
                        transition={{ duration:0.35 }}
                        className="w-full h-full rounded-2xl flex items-center justify-center border-2 select-none"
                        style={{
                          background: isCorrect ? "linear-gradient(135deg,#EBF8F0,#D1FAE5)"
                            : isError ? "linear-gradient(135deg,#FEF2F2,#FEE2E2)"
                            : isGiven ? "#F8F7F5" : "#FFFFFF",
                          borderColor: isCorrect ? "#86EFAC"
                            : isError ? "#FCA5A5"
                            : isGiven ? "#E8E4DE" : "#F0EDE8",
                          boxShadow: isGiven ? "none"
                            : value ? "0 4px 16px rgba(59,111,232,0.15)"
                            : "0 2px 8px rgba(0,0,0,0.06)",
                          cursor: isGiven ? "default" : "pointer",
                        }}
                      >
                        {value === "S" && <SunIcon size={26}/>}
                        {value === "M" && <MoonIcon size={26}/>}
                        {!value && <div className="w-2 h-2 rounded-full" style={{ background: isGiven ? "#D1CBC1" : "#E8E4DE" }}/>}
                      </motion.button>
                      {rightC && c < board.size-1 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ background:"white", border:`1.5px solid ${rightC==="same"?"#3B6FE8":"#E87070"}`, color:rightC==="same"?"#3B6FE8":"#E87070", boxShadow:"0 2px 6px rgba(0,0,0,0.12)" }}>
                          {rightC==="same"?"=":"×"}
                        </div>
                      )}
                      {bottomC && r < board.size-1 && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ background:"white", border:`1.5px solid ${bottomC==="same"?"#3B6FE8":"#E87070"}`, color:bottomC==="same"?"#3B6FE8":"#E87070", boxShadow:"0 2px 6px rgba(0,0,0,0.12)" }}>
                          {bottomC==="same"?"=":"×"}
                        </div>
                      )}
                    </div>
                  );
                }))}
              </div>
            </div>
            {/* Legend */}
            <div className="px-5 pb-5 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <SunIcon size={14}/> Sun
              </span>
              <span className="text-slate-200">·</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <MoonIcon size={14}/> Moon
              </span>
              <span className="text-slate-200">·</span>
              <button onClick={() => {
                setPlayerGrid(board.puzzle.map(r=>[...r]));
                setStatuses(board.puzzle.map(r=>r.map(c=>c!==null?"given":"empty")));
                setSolved(false);
              }} className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>
        {/* Tablet shadow */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-8 rounded-full blur-xl opacity-30"
          style={{ background:"linear-gradient(90deg,#3B6FE8,#8B6FC0)" }}/>
      </motion.div>
    </div>
  );
}

// ── Game Card ─────────────────────────────────────────────────────────────────
function GameCard({ game, index }: { game: typeof GAMES[0]; index: number }) {
  const freeGames = ["tango","memory","queens"];
  const isFree = freeGames.includes(game.slug);
  const href = isFree ? `/games/${game.slug}` : "/pricing";
  return (
    <motion.div
      initial={{ opacity:0, y:24 }}
      whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true }}
      transition={{ delay: index * 0.04, duration: 0.45 }}
    >
      <Link href={href} className="block h-full group">
        <div className="card-soft h-full overflow-hidden">
          {/* Gradient header */}
          <div className="h-24 relative flex items-center justify-center"
            style={{ background:`linear-gradient(135deg,${game.p.from}18,${game.p.to}30)` }}>
            <motion.div whileHover={{ scale:1.08, rotate:3 }} transition={{ type:"spring", stiffness:400 }}>
              <GameIcon slug={game.slug} size={44}/>
            </motion.div>
            {/* Badge */}
            <div className="absolute top-3 right-3">
              {isFree ? (
                <span className="text-[9px] font-bold px-2 py-1 rounded-full border"
                  style={{ background:`${game.p.from}20`, color:game.p.text, borderColor:`${game.p.from}40` }}>
                  Daily: Free
                </span>
              ) : (
                <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-white/80 text-slate-400 border border-slate-100 backdrop-blur">
                  Pro: 100 Stages
                </span>
              )}
            </div>
          </div>
          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-slate-800 mb-1 text-sm">{game.name}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">{game.desc}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="w-1 h-1 rounded-full transition-colors"
                    style={{ background: i <= 3 ? game.p.from : "#E8E4DE" }}/>
                ))}
              </div>
              <ArrowRight size={12} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"/>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Bento Stat Card ───────────────────────────────────────────────────────────
function BentoCard({ value, label, sub, from, to, icon: Icon }: {
  value: string; label: string; sub: string; from: string; to: string; icon: any;
}) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type:"spring", stiffness:400 }}
      className="bento p-5 relative overflow-hidden grain"
      style={{ background:`linear-gradient(135deg,${from}18,${to}28)` }}
    >
      <div className="squircle w-9 h-9 flex items-center justify-center mb-3"
        style={{ background:`linear-gradient(135deg,${from},${to})` }}>
        <Icon size={16} className="text-white"/>
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-0.5"
        style={{ fontFamily:"var(--font-fraunces),serif" }}>{value}</p>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isSilentMode, toggleSilentMode, theme, toggleTheme } = useSettingsStore();
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0,80], [0,1]);

  const PLANS = [
    { name:"Individual", price:"$2", period:"/mo",
      features:["All 20 games","100 stages/game","Daily challenges","Global leaderboard","Infinite mode"],
      highlight:false },
    { name:"Family · 3", price:"$5", period:"/mo",
      features:["3 members","Family leaderboard","All individual perks","Shared streaks","Priority support"],
      highlight:true },
    { name:"Family · 7", price:"$10", period:"/mo",
      features:["7 members","Family leaderboard","All individual perks","Shared streaks","Priority support"],
      highlight:false },
  ];

  return (
    <div className="min-h-screen relative" style={{ background:"#FDFCFB" }}>

      {/* Soft grainy gradient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex:0 }}>
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-25"
          style={{ background:"radial-gradient(circle,#EBF0FD 0%,transparent 70%)", filter:"blur(60px)" }}/>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background:"radial-gradient(circle,#EBF2ED 0%,transparent 70%)", filter:"blur(60px)" }}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-10"
          style={{ background:"radial-gradient(circle,#F0EBF8 0%,transparent 60%)", filter:"blur(80px)" }}/>
      </div>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4">
        <motion.div className="absolute inset-0 bg-white/85 backdrop-blur-xl border-b border-black/[0.06]"
          style={{ opacity: navOpacity }}/>
        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="squircle w-8 h-8 flex items-center justify-center shadow-md"
            style={{ background:"linear-gradient(135deg,#3B6FE8,#8B6FC0)" }}>
            <Brain size={15} className="text-white"/>
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-base"
            style={{ fontFamily:"var(--font-fraunces),serif" }}>MindState</span>
        </Link>
        <div className="relative flex items-center gap-1.5">
          <Link href="/games" className="text-sm text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-white/60 transition-all hidden sm:block">Games</Link>
          <button onClick={toggleSilentMode} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-all">
            {isSilentMode ? <VolumeX size={16}/> : <Volume2 size={16}/>}
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-all">
            {theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
          <Link href="/auth/signin" className="text-sm text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-white/60 transition-all">Sign in</Link>
          <Link href="/auth/signup"
            className="text-sm font-semibold px-5 py-2.5 rounded-2xl text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 ml-1"
            style={{ background:"linear-gradient(135deg,#3B6FE8,#8B6FC0)" }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-16 px-6 min-h-screen flex items-center" style={{ zIndex:1 }}>
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <motion.div initial={{ opacity:0, x:-40 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.7 }}>
              <motion.div
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 shadow-sm"
                style={{ background:"white", border:"1px solid rgba(0,0,0,0.06)" }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background:"linear-gradient(135deg,#7C9E87,#4A7C59)" }}/>
                <span className="text-xs font-semibold text-slate-500">20 Games · 2,000+ Stages · Free to Start</span>
              </motion.div>

              <h1 className="mb-6 leading-[1.08]" style={{ fontFamily:"var(--font-fraunces),serif", fontWeight:700 }}>
                <span className="block text-6xl sm:text-7xl text-slate-900">Sharper</span>
                <span className="block text-6xl sm:text-7xl italic gradient-text">Every Day.</span>
              </h1>

              <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
                Explore 20 logic disciplines and 2,000+ hand-crafted stages. An elegant training suite designed for the modern mind. Countless hours of fun, zero nonsense.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link href="/auth/signup"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-semibold text-sm shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                  style={{ background:"linear-gradient(135deg,#3B6FE8,#8B6FC0)" }}>
                  Begin Training <ChevronRight size={16}/>
                </Link>
                <Link href="/games"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-700 font-semibold text-sm shadow-md hover:shadow-lg border border-slate-100 transition-all hover:-translate-y-0.5">
                  Explore Games <ArrowRight size={15}/>
                </Link>
              </div>

              {/* Social proof avatars */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["#3B6FE8","#8B6FC0","#7C9E87","#C4785A","#4DB6AC"].map((c,i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background:c, zIndex:5-i }}>
                      {String.fromCharCode(65+i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="#F59E0B" stroke="none"/>)}
                  </div>
                  <p className="text-xs text-slate-400">Loved by 12,400+ daily players</p>
                </div>
              </div>
            </motion.div>

            {/* Right: Tablet */}
            <motion.div
              initial={{ opacity:0, x:40 }} animate={{ opacity:1, x:0 }}
              transition={{ duration:0.7, delay:0.15 }}
              className="flex justify-center"
            >
              <TabletDemo/>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Bento Stats ── */}
      <section className="relative px-6 py-12" style={{ zIndex:1 }}>
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          <BentoCard value="3,821"  label="Active Streaks"   sub="players on 7-day streak"  from="#3B6FE8" to="#2D55B4" icon={Zap}/>
          <BentoCard value="987"    label="Top XP Today"     sub="@zenmaster · Tango Lv.94"  from="#8B6FC0" to="#6B4FA0" icon={Trophy}/>
          <BentoCard value="14,302" label="Games Completed"  sub="in the last 24 hours"      from="#7C9E87" to="#4A7C59" icon={Users}/>
          <BentoCard value="99,820" label="Global #1 Score"  sub="@shira_t · All games"      from="#C4785A" to="#A0522D" icon={Star}/>
        </div>
      </section>

      {/* ── Collection ── */}
      <section className="relative px-6 py-16" style={{ zIndex:1 }}>
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mb-10">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em] mb-3">The Collection</p>
            <h2 className="text-5xl font-bold text-slate-900 mb-4" style={{ fontFamily:"var(--font-fraunces),serif" }}>
              Twenty Games.<br/><span className="italic gradient-text">One Subscription.</span>
            </h2>
            <p className="text-slate-500 max-w-lg leading-relaxed">
              Every game includes a free Daily Challenge. Subscribers unlock all 100 stages, Infinite Mode, and family leaderboards.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {GAMES.map((game,i) => <GameCard key={game.slug} game={game} index={i}/>)}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="relative px-6 py-20" style={{ zIndex:1 }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-14">
            <h2 className="text-4xl font-bold text-slate-900" style={{ fontFamily:"var(--font-fraunces),serif" }}>
              Built for the Modern Mind
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { from:P.cobalt.from,   to:P.cobalt.to,   num:"01", title:"Choose a discipline", body:"Twenty logic games, each with a unique rhythm. Start with the free Daily Challenge — no account needed." },
              { from:P.lavender.from, to:P.lavender.to, num:"02", title:"Train daily",          body:"XP decays in real time. The faster you solve, the more you earn. Streaks and hints shape your score." },
              { from:P.sage.from,     to:P.sage.to,     num:"03", title:"Master & compete",     body:"Family leaderboards, shareable challenge links, and real-time celebrations when records fall." },
            ].map((step, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.12 }}
                className="glass rounded-3xl p-7"
              >
                <div className="squircle w-12 h-12 flex items-center justify-center text-lg font-bold text-white mb-5 shadow-lg"
                  style={{ background:`linear-gradient(135deg,${step.from},${step.to})`, fontFamily:"var(--font-fraunces),serif" }}>
                  {step.num}
                </div>
                <h3 className="font-bold text-slate-800 mb-2 text-lg">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="relative px-6 py-20" style={{ zIndex:1 }}>
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily:"var(--font-fraunces),serif" }}>
              Simple, Honest Pricing
            </h2>
            <p className="text-slate-500">Less than a coffee. Sharper than ever.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.08 }}
                className={plan.highlight ? "rounded-3xl p-7 text-white shadow-2xl relative overflow-hidden" : "card-soft p-7"}
                style={plan.highlight ? { background:"linear-gradient(135deg,#3B6FE8,#8B6FC0)" } : {}}
              >
                {plan.highlight && (
                  <div className="absolute top-4 right-4 text-[10px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">Most Popular</div>
                )}
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${plan.highlight?"text-blue-200":"text-slate-400"}`}>{plan.name}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-5xl font-bold" style={{ fontFamily:"var(--font-fraunces),serif" }}>{plan.price}</span>
                  <span className={`text-sm pb-2 ${plan.highlight?"text-blue-200":"text-slate-400"}`}>{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-7">
                  {plan.features.map((f,j) => (
                    <li key={j} className={`flex items-center gap-2.5 text-sm ${plan.highlight?"text-blue-100":"text-slate-600"}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight?"bg-white/20":"bg-blue-50"}`}>
                        <Check size={10} className={plan.highlight?"text-white":"text-blue-600"}/>
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup"
                  className={`block text-center py-3.5 rounded-2xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                    plan.highlight ? "bg-white text-blue-700 shadow-lg hover:shadow-xl"
                    : "border-2 border-slate-100 text-slate-700 hover:border-blue-200 hover:text-blue-700"
                  }`}>
                  Start Free Trial
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative border-t border-slate-100 bg-white/60 backdrop-blur px-6 py-10" style={{ zIndex:1 }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="squircle w-7 h-7 flex items-center justify-center shadow-sm"
              style={{ background:"linear-gradient(135deg,#3B6FE8,#8B6FC0)" }}>
              <Brain size={13} className="text-white"/>
            </div>
            <span className="font-bold text-slate-700 text-sm" style={{ fontFamily:"var(--font-fraunces),serif" }}>MindState</span>
          </Link>
          <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} MindState. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {[["Games","/games"],["Pricing","/pricing"],["Privacy","/privacy"],["Terms","/terms"]].map(([l,h]) => (
              <Link key={l} href={h} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
