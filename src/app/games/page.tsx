"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, Trophy, Zap, Star } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { GameIcon } from "@/components/icons/GameIcons";

const GAMES = [
  { slug:"tango",         name:"Tango",          desc:"Balance rows & columns with equal Sun and Moon symbols",  free:true,  stages:100, daily:true,  difficulty:"Easy–Hard", bg:"rgba(79,110,247,0.08)"   },
  { slug:"memory",        name:"Memory",          desc:"Flip cards and find matching pairs before XP fades",      free:true,  stages:100, daily:true,  difficulty:"Easy–Hard", bg:"rgba(124,158,135,0.08)"  },
  { slug:"queens",        name:"Queens",          desc:"Place one queen per row, column, and color region",       free:true,  stages:100, daily:true,  difficulty:"Easy–Hard", bg:"rgba(156,107,232,0.08)"  },
  { slug:"sudoku",        name:"Mini Sudoku",     desc:"Fill the grid — no repeats in any row or box",           free:false, stages:100, daily:true,  difficulty:"Easy–Hard", bg:"rgba(196,120,90,0.08)"   },
  { slug:"zip",           name:"Zip",             desc:"Trace a path through every cell in order",                free:false, stages:100, daily:true,  difficulty:"Easy–Hard", bg:"rgba(77,182,172,0.08)"   },
  { slug:"minesweeper",   name:"Minesweeper",     desc:"Deduce every mine from number clues. No guessing",       free:false, stages:100, daily:true,  difficulty:"Easy–Hard", bg:"rgba(232,112,112,0.08)"  },
  { slug:"patches",       name:"Patches",         desc:"Tile the board with irregular polyomino shapes",          free:false, stages:100, daily:true,  difficulty:"Medium–Hard", bg:"rgba(232,168,48,0.08)" },
  { slug:"hearts",        name:"Hearts",          desc:"Classic trick-avoidance card game, solo mode",            free:false, stages:100, daily:false, difficulty:"Medium",    bg:"rgba(232,112,112,0.08)"  },
  { slug:"solitaire",     name:"Solitaire",       desc:"Classic Klondike with a polished twist",                 free:false, stages:100, daily:false, difficulty:"Easy–Med",  bg:"rgba(99,102,241,0.08)"   },
  { slug:"word-sling",    name:"Word Sling",      desc:"Build the highest-scoring words from letter tiles",      free:false, stages:100, daily:true,  difficulty:"Easy–Hard", bg:"rgba(124,158,135,0.08)"  },
  { slug:"2048-pro",      name:"2048 Pro",        desc:"Merge tiles strategically to reach 2048",                free:false, stages:100, daily:false, difficulty:"Easy–Hard", bg:"rgba(34,197,94,0.08)"    },
  { slug:"logic-path",    name:"Logic Path",      desc:"Connect matching pipe ends to fill every cell",           free:false, stages:100, daily:true,  difficulty:"Easy–Hard", bg:"rgba(79,110,247,0.08)"   },
  { slug:"pattern-match", name:"Pattern Match",   desc:"Identify the hidden rule and complete the sequence",     free:false, stages:100, daily:true,  difficulty:"Easy–Hard", bg:"rgba(156,107,232,0.08)"  },
  { slug:"hex-merge",     name:"Hex Merge",       desc:"Merge hexagonal tiles in chain reactions",               free:false, stages:100, daily:false, difficulty:"Med–Hard",  bg:"rgba(77,182,172,0.08)"   },
  { slug:"gravity-sort",  name:"Gravity Sort",    desc:"Sort falling blocks into correct columns",               free:false, stages:100, daily:false, difficulty:"Easy–Hard", bg:"rgba(196,120,90,0.08)"   },
  { slug:"bridges",       name:"Bridges",         desc:"Connect every island with the right number of bridges",  free:false, stages:100, daily:true,  difficulty:"Easy–Hard", bg:"rgba(232,168,48,0.08)"   },
  { slug:"kakuro",        name:"Kakuro",          desc:"Crossword meets Sudoku — digit sums guide every entry",  free:false, stages:100, daily:true,  difficulty:"Med–Hard",  bg:"rgba(99,102,241,0.08)"   },
  { slug:"nonogram",      name:"Nonogram",        desc:"Solve pixel puzzles from row and column clues",          free:false, stages:100, daily:true,  difficulty:"Easy–Hard", bg:"rgba(217,70,168,0.08)"   },
  { slug:"flow",          name:"Flow",            desc:"Connect color dots without crossing paths",              free:false, stages:100, daily:true,  difficulty:"Easy–Hard", bg:"rgba(34,197,94,0.08)"    },
  { slug:"lightup",       name:"Light Up",        desc:"Place bulbs to illuminate every cell exactly once",      free:false, stages:100, daily:true,  difficulty:"Med–Hard",  bg:"rgba(232,112,112,0.08)"  },
];

const FILTERS = ["All","Free","Daily","Easy","Hard"];
const ACCENT = "linear-gradient(135deg,#4F6EF7,#9C6BE8)";

export default function GamesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = GAMES.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.desc.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All"   ? true :
      filter === "Free"  ? g.free :
      filter === "Daily" ? g.daily :
      filter === "Easy"  ? g.difficulty.includes("Easy") :
      filter === "Hard"  ? g.difficulty.includes("Hard") : true;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB", color:"#1C1917" }}>
      <Navbar/>
      <main className="section-pad" style={{ maxWidth:1100, margin:"0 auto", padding:"76px 32px 60px" }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:32 }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#94A3B8", marginBottom:8 }}>
            The Collection
          </p>
          <h1 style={{ fontSize:40, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:8 }}>
            Twenty Games.
          </h1>
          <p style={{ fontSize:15, color:"#64748B", maxWidth:520, lineHeight:1.6 }}>
            Every game includes a free Daily Challenge. Subscribe to unlock all 100 stages, Infinite Mode, and leaderboards.
          </p>
        </motion.div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:28 }}>
          {[
            { icon:Star,   label:"Total Stages",   value:"2,000+" },
            { icon:Zap,    label:"Max XP / Stage",  value:"1,000"  },
            { icon:Trophy, label:"Leaderboards",    value:"Global + Family" },
          ].map((s,i) => (
            <div key={i} style={{ background:"white", borderRadius:16, border:"0.5px solid rgba(0,0,0,0.07)", padding:"14px 16px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ width:34, height:34, borderRadius:10, background:"rgba(79,110,247,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <s.icon size={16} color="#4F6EF7"/>
              </div>
              <div>
                <p style={{ fontSize:11, color:"#94A3B8", marginBottom:1 }}>{s.label}</p>
                <p style={{ fontSize:14, fontWeight:700, color:"#1C1917" }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:200 }}>
            <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search games..."
              style={{ width:"100%", padding:"10px 14px 10px 36px", borderRadius:12, border:"0.5px solid #E2E8F0", fontSize:13, color:"#1C1917", background:"white", outline:"none", boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}/>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding:"10px 14px", borderRadius:12, border:"0.5px solid", cursor:"pointer", fontSize:12, fontWeight:600, transition:"all 0.15s",
                  background: filter===f ? "#4F6EF7" : "white",
                  color: filter===f ? "white" : "#64748B",
                  borderColor: filter===f ? "#4F6EF7" : "#E2E8F0",
                  boxShadow: filter===f ? "0 4px 12px rgba(79,110,247,0.2)" : "0 2px 6px rgba(0,0,0,0.04)",
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Games grid */}
        <div className="games-grid-4" style={{ marginBottom:32 }}>
          {filtered.map((game, i) => (
            <motion.div key={game.slug}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:i*0.03 }}>
              <Link href={`/games/${game.slug}`} style={{ display:"block", height:"100%", textDecoration:"none" }}>
                <div
                  style={{ background:"white", borderRadius:18, border:"0.5px solid rgba(0,0,0,0.07)", overflow:"hidden", height:"100%", display:"flex", flexDirection:"column", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", transition:"box-shadow 0.2s,transform 0.2s", cursor:"pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform="translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow="0 10px 28px rgba(0,0,0,0.09)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform="translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow="0 2px 8px rgba(0,0,0,0.04)"; }}
                >
                  {/* Icon area — pastel bg, never dark */}
                  <div style={{ height:76, background:game.bg, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", flexShrink:0 }}>
                    <GameIcon slug={game.slug} size={36}/>
                    <div style={{ position:"absolute", top:8, right:8 }}>
                      {game.free ? (
                        <span style={{ fontSize:9, fontWeight:700, padding:"3px 8px", borderRadius:10, background:"rgba(79,110,247,0.12)", color:"#3B5CF6" }}>
                          Daily: Free
                        </span>
                      ) : (
                        <span style={{ fontSize:9, fontWeight:600, padding:"3px 8px", borderRadius:10, background:"rgba(0,0,0,0.06)", color:"#64748B" }}>
                          Pro
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Text */}
                  <div style={{ padding:"12px 14px 14px", flex:1, display:"flex", flexDirection:"column" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#1C1917", marginBottom:4 }}>{game.name}</p>
                    <p style={{ fontSize:11, color:"#64748B", lineHeight:1.5, flex:1 }}>{game.desc}</p>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10, paddingTop:10, borderTop:"0.5px solid #F8F7F5" }}>
                      <span style={{ fontSize:10, color:"#CBD5E1" }}>{game.stages} stages</span>
                      <ArrowRight size={12} color="#CBD5E1"/>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"48px 24px", color:"#94A3B8" }}>
            <p style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>No games found</p>
            <p style={{ fontSize:13 }}>Try a different search or filter</p>
          </div>
        )}

        {/* Pro banner */}
        <div style={{ borderRadius:24, padding:"28px 32px", background:ACCENT, color:"white", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, marginBottom:4, fontFamily:"Georgia,serif" }}>Unlock Everything</h2>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.75)" }}>All 20 games, 2,000+ stages, Infinite Mode — from $2/mo.</p>
          </div>
          <Link href="/pricing" style={{ padding:"11px 22px", borderRadius:14, background:"white", color:"#4F6EF7", fontWeight:700, fontSize:13, textDecoration:"none", flexShrink:0, boxShadow:"0 4px 12px rgba(0,0,0,0.15)" }}>
            View Plans
          </Link>
        </div>
      </main>
    </div>
  );
}
