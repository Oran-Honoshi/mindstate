"use client";
import{GameInstructions}from"@/components/ui/GameInstructions";
import{StageMap}from"@/components/ui/StageMap";
import{ComingSoonTeaser}from"@/components/ui/ComingSoonTeaser";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Zap, Star, Trophy } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/nav/Navbar";
import { GameIcon } from "@/components/icons/GameIcons";
import { GameSnapshot } from "@/components/ui/GameSnapshots";
import { useAuthStore } from "@/store/authStore";
import { getTokensRemaining, FREE_DAILY_TOKENS } from "@/lib/games/tokenEngine";

const GAMES = [
  { slug:"tango",         name:"Tango",          desc:"Balance rows & columns with equal Sun and Moon symbols",    free:true,  difficulty:"Easy–Hard", stages:1000, cat:"Logic"    },
  { slug:"memory",        name:"Memory",          desc:"Flip cards and find matching pairs before XP fades",       free:true,  difficulty:"Easy–Hard", stages:1000, cat:"Memory"   },
  { slug:"queens",        name:"Queens",          desc:"Place one queen per row, column and color region",         free:true,  difficulty:"Easy–Hard", stages:1000, cat:"Logic"    },
  { slug:"sudoku",        name:"Mini Sudoku",     desc:"Fill the grid — no repeats in any row, col or box",       free:false, difficulty:"Easy–Hard", stages:1000, cat:"Logic"    },
  { slug:"zip",           name:"Zip",             desc:"Trace a path through every cell, hit waypoints in order", free:false, difficulty:"Easy–Hard", stages:1000, cat:"Logic"    },
  { slug:"flow",          name:"Flow",            desc:"Connect color dots — fill every cell, no crossings",      free:false, difficulty:"Easy–Hard", stages:1000, cat:"Logic"    },
  { slug:"bridges",       name:"Bridges",         desc:"Connect every island with exactly the right bridges",     free:false, difficulty:"Easy–Hard", stages:1000, cat:"Logic"    },
  { slug:"kakuro",        name:"Kakuro",          desc:"Crossword meets Sudoku — digit sums guide every entry",   free:false, difficulty:"Easy–Hard", stages:1000, cat:"Logic"    },
  { slug:"logic-path",    name:"Logic Path",      desc:"Rotate pipe tiles so every connection is valid",          free:false, difficulty:"Easy–Hard", stages:1000, cat:"Logic"    },
  { slug:"lightup",       name:"Light Up",        desc:"Place bulbs to illuminate every white cell exactly once", free:false, difficulty:"Easy–Hard", stages:1000, cat:"Logic"    },
  { slug:"nonogram",      name:"Nonogram",        desc:"Solve pixel art puzzles from row and column clues",       free:false, difficulty:"Easy–Hard", stages:1000, cat:"Puzzle"   },
  { slug:"pattern-match", name:"Pattern Match",   desc:"Identify the hidden rule and complete the sequence",      free:false, difficulty:"Easy–Hard", stages:1000, cat:"Puzzle"   },
  { slug:"patches",       name:"Patches",         desc:"Tile the board perfectly with polyomino pieces",          free:false, difficulty:"Easy–Hard", stages:1000, cat:"Puzzle"   },
  { slug:"2048-pro",      name:"2048 Pro",        desc:"Merge tiles strategically to reach the target number",    free:false, difficulty:"Easy–Hard", stages:1000, cat:"Arcade"   },
  { slug:"gravity-sort",  name:"Gravity Sort",    desc:"Sort falling colored blocks into the correct columns",    free:false, difficulty:"Easy–Hard", stages:1000, cat:"Arcade"   },
  { slug:"hex-merge",     name:"Hex Merge",       desc:"Merge matching hexagonal tiles in chain reactions",       free:false, difficulty:"Easy–Hard", stages:1000, cat:"Arcade"   },
  { slug:"word-sling",    name:"Word Sling",      desc:"Build the highest-scoring words from your letter rack",   free:false, difficulty:"Easy–Hard", stages:1000, cat:"Word"     },
  { slug:"hearts",        name:"Hearts",          desc:"Avoid hearts and the Queen of Spades to win",             free:false, difficulty:"Easy–Hard", stages:1000, cat:"Card"     },
  { slug:"name-country",  name:"Name the Country",  desc:"Guess the country from letter-by-letter clues", free:false, difficulty:"Easy–Hard", stages:100, cat:"Word" },
  { slug:"name-city",     name:"Name the City",     desc:"Guess the world city from letter-by-letter clues", free:false, difficulty:"Easy–Hard", stages:100, cat:"Word" },
  { slug:"solitaire",     name:"Solitaire",       desc:"Classic Klondike — move all cards to the foundations",    free:false, difficulty:"Easy–Hard", stages:1000, cat:"Card"     },
  { slug:"minesweeper",   name:"Minesweeper",     desc:"Deduce every mine from number clues. No guessing.",       free:false, difficulty:"Easy–Hard", stages:1000, cat:"Logic"    },
];

const CATS = ["All","Logic","Memory","Puzzle","Arcade","Word","Card"];
const FILTERS = ["All","Free","Easy","Hard"];
const ACCENT = "linear-gradient(135deg,#4F6EF7,#9C6BE8)";

export default function GamesPage() {
  const { user, profile } = useAuthStore();
  const [search, setSearch] = useState("");

  const [instructionsGame, setInstructionsGame] = useState<string|null>(null);
  const [stageMapGame, setStageMapGame] = useState<string|null>(null);  const [cat, setCat] = useState("All");
  const [filter, setFilter] = useState("All");
  const [tokens, setTokens] = useState(FREE_DAILY_TOKENS);
  const isPro = profile?.subscription_status !== "free" && profile?.subscription_status != null;

  useEffect(() => {
    if (!user || isPro) return;
    setTokens(getTokensRemaining(user.id));
    const iv = setInterval(() => setTokens(getTokensRemaining(user.id)), 5000);
    return () => clearInterval(iv);
  }, [user, isPro]);

  const filtered = GAMES.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.desc.toLowerCase().includes(search.toLowerCase()) ||
      g.cat.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "All" || g.cat === cat;
    const matchFilter =
      filter === "All" ? true :
      filter === "Free" ? g.free :
      filter === "Easy" ? g.difficulty.includes("Easy") :
      filter === "Hard" ? g.difficulty.includes("Hard") : true;
    return matchSearch && matchCat && matchFilter;
  });

  return (
    <div style={{ minHeight:"100vh", background:"#FDFCFB", color:"#1C1917" }}>
      <Navbar/>
      <main style={{ maxWidth:1100, margin:"0 auto", padding:"76px 24px 60px" }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
          <p style={{ fontSize:11, fontWeight:600, letterSpacing:"0.18em", textTransform:"uppercase", color:"#94A3B8", marginBottom:8 }}>
            The Collection
          </p>
          <h1 style={{ fontSize:36, fontWeight:700, color:"#1C1917", fontFamily:"Georgia,serif", marginBottom:6 }}>
            Twenty Games.
          </h1>
          <p style={{ fontSize:14, color:"#64748B", lineHeight:1.6, maxWidth:500 }}>
            All 20 games are now live and playable. Free users get {FREE_DAILY_TOKENS} plays per day across all games. Subscribe for unlimited access.
          </p>
        </motion.div>

        {/* Token status */}
        {user && !isPro && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            style={{ background:"white", borderRadius:16, border:"0.5px solid rgba(0,0,0,0.07)", padding:"14px 18px", marginBottom:20, boxShadow:"0 2px 8px rgba(0,0,0,0.04)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:10, background:"rgba(79,110,247,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Zap size={15} color="#4F6EF7"/>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"#1C1917" }}>Daily plays remaining</p>
                <p style={{ fontSize:11, color:"#94A3B8" }}>Resets at midnight · Subscribe for unlimited</p>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:22, fontWeight:700, color: tokens > 0 ? "#4F6EF7" : "#EF4444", fontFamily:"Georgia,serif" }}>
                  {tokens}<span style={{ fontSize:13, color:"#94A3B8", fontWeight:400 }}>/{FREE_DAILY_TOKENS}</span>
                </p>
                <div style={{ height:4, width:80, background:"#F1EDE8", borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:2, background: tokens > 0 ? ACCENT : "#EF4444", width:`${(tokens/FREE_DAILY_TOKENS)*100}%`, transition:"width 0.4s" }}/>
                </div>
              </div>
              <Link href="/pricing" style={{ fontSize:12, fontWeight:700, color:"white", padding:"7px 14px", borderRadius:10, background:ACCENT, textDecoration:"none", whiteSpace:"nowrap" }}>
                Go Pro
              </Link>
            </div>
          </motion.div>
        )}

        {isPro && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ background:"linear-gradient(135deg,rgba(79,110,247,0.08),rgba(156,107,232,0.1))", borderRadius:16, border:"0.5px solid rgba(79,110,247,0.2)", padding:"12px 18px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            <Zap size={15} color="#4F6EF7" fill="#4F6EF7"/>
            <p style={{ fontSize:13, fontWeight:600, color:"#4F6EF7" }}>Pro — Unlimited plays on all 20 games</p>
          </motion.div>
        )}

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
          {[
            { icon:Star,   label:"Total Stages",   value:"20,000"       },
            { icon:Zap,    label:"Max XP / Stage",  value:"1,000"        },
            { icon:Trophy, label:"Games Live",      value:"20 / 20"      },
          ].map((s,i) => (
            <div key={i} style={{ background:"white", borderRadius:16, border:"0.5px solid rgba(0,0,0,0.07)", padding:"14px 16px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}>
              <div style={{ width:32, height:32, borderRadius:10, background:"rgba(79,110,247,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <s.icon size={15} color="#4F6EF7"/>
              </div>
              <div>
                <p style={{ fontSize:11, color:"#94A3B8", marginBottom:1 }}>{s.label}</p>
                <p style={{ fontSize:14, fontWeight:700, color:"#1C1917" }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
          <div style={{ position:"relative", flex:1, minWidth:200 }}>
            <Search size={14} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#94A3B8" }}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search games..."
              style={{ width:"100%", padding:"10px 14px 10px 36px", borderRadius:12, border:"0.5px solid #E2E8F0", fontSize:13, color:"#1C1917", background:"white", outline:"none", boxShadow:"0 2px 6px rgba(0,0,0,0.04)" }}/>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:12, overflowX:"auto", paddingBottom:4 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding:"7px 14px", borderRadius:20, border:"0.5px solid", cursor:"pointer", fontSize:12, fontWeight:600, whiteSpace:"nowrap", transition:"all 0.15s",
                background: cat===c ? "#4F6EF7" : "white",
                color: cat===c ? "white" : "#64748B",
                borderColor: cat===c ? "#4F6EF7" : "#E2E8F0",
                boxShadow: cat===c ? "0 4px 12px rgba(79,110,247,0.2)" : "none" }}>
              {c}
            </button>
          ))}
          <div style={{ width:1, height:30, background:"#E2E8F0", alignSelf:"center", margin:"0 4px" }}/>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:"7px 14px", borderRadius:20, border:"0.5px solid", cursor:"pointer", fontSize:12, fontWeight:500, whiteSpace:"nowrap", transition:"all 0.15s",
                background: filter===f ? "#F8F7F5" : "transparent",
                color: filter===f ? "#1C1917" : "#94A3B8",
                borderColor: filter===f ? "#E2E8F0" : "transparent" }}>
              {f}
            </button>
          ))}
        </div>

        {/* Game grid */}
        <div className="games-grid-4" style={{ marginBottom:32 }}>
          {filtered.map((game, i) => (
            <motion.div key={game.slug}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              transition={{ delay:i*0.03, duration:0.4 }}>
              <Link href={`/games/${game.slug}`} style={{ display:"block", textDecoration:"none" }}>
                <div
                  style={{ background:"white", borderRadius:18, border:"0.5px solid rgba(0,0,0,0.07)", overflow:"hidden", height:"100%", display:"flex", flexDirection:"column", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", transition:"all 0.2s", cursor:"pointer" }}
                  onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.transform="translateY(-3px)"; el.style.boxShadow="0 12px 32px rgba(0,0,0,0.1)"; el.style.borderColor="rgba(79,110,247,0.2)"; }}
                  onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.transform="translateY(0)"; el.style.boxShadow="0 2px 8px rgba(0,0,0,0.04)"; el.style.borderColor="rgba(0,0,0,0.07)"; }}>

                  {/* Icon area */}
                  <div style={{ height:100, background:"rgba(79,110,247,0.04)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                    <GameSnapshot slug={game.slug}/>
                    <div style={{ position:"absolute", top:8, right:8, display:"flex", gap:4 }}>
                      
                      <span style={{ fontSize:9, fontWeight:600, padding:"2px 7px", borderRadius:8, background:"rgba(34,197,94,0.1)", color:"#15803D" }}>
                        Live
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding:"12px 14px 14px", flex:1, display:"flex", flexDirection:"column" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:"#1C1917" }}>{game.name}</p>
                      <span style={{ fontSize:9, color:"#CBD5E1", background:"#F8F7F5", padding:"1px 6px", borderRadius:6 }}>{game.cat}</span>
                    </div>
                    <p style={{ fontSize:11, color:"#64748B", lineHeight:1.5, flex:1 }}>{game.desc}</p>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10, paddingTop:10, borderTop:"0.5px solid #F8F7F5" }}>
                      <span style={{ fontSize:10, color:"#CBD5E1" }}>{game.stages.toLocaleString()} stages</span>
                      <span style={{ fontSize:10, color:"#CBD5E1" }}>{game.difficulty}</span>
                    </div>
                  </div>
                </div>
              </Link>
              {/* Quick actions outside the link */}
              <div style={{display:"flex",gap:6,padding:"0 14px 14px",marginTop:-4}} onClick={e=>e.stopPropagation()}>
                <button
                  onClick={(e)=>{e.preventDefault();e.stopPropagation();setInstructionsGame(game.slug);}}
                  style={{flex:1,padding:"7px 0",borderRadius:10,border:"0.5px solid #E2E8F0",background:"#F8FAFC",fontSize:11,fontWeight:600,color:"#64748B",cursor:"pointer"}}>
                  ? How to play
                </button>
                <button
                  onClick={(e)=>{e.preventDefault();e.stopPropagation();setStageMapGame(game.slug);}}
                  style={{flex:1,padding:"7px 0",borderRadius:10,border:"0.5px solid #E0E7FF",background:"#EEF2FF",fontSize:11,fontWeight:600,color:"#4F6EF7",cursor:"pointer"}}>
                  ⊞ My Progress
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"48px 24px", color:"#94A3B8" }}>
            <p style={{ fontSize:16, fontWeight:600, marginBottom:4 }}>No games found</p>
            <p style={{ fontSize:13 }}>Try a different search or category</p>
          </div>
        )}

        {/* Coming soon */}
        <ComingSoonTeaser compact/>

        {/* Pro CTA */}
        {!isPro && (
          <div style={{ borderRadius:24, padding:"28px 32px", background:ACCENT, color:"white", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
            <div>
              <h2 style={{ fontSize:20, fontWeight:700, marginBottom:4, fontFamily:"Georgia,serif" }}>Unlock Everything</h2>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.75)" }}>
                Unlimited plays · All 20 games · 20,000 stages · Family leaderboards — from $2/mo
              </p>
            </div>
            <Link href="/pricing" style={{ padding:"11px 22px", borderRadius:14, background:"white", color:"#4F6EF7", fontWeight:700, fontSize:13, textDecoration:"none", flexShrink:0, boxShadow:"0 4px 12px rgba(0,0,0,0.15)" }}>
              View Plans
            </Link>
          </div>
        )}
      </main>
    
      {instructionsGame && (
        <GameInstructions
          game={instructionsGame}
          standalone={true}
          onClose={()=>setInstructionsGame(null)}
        />
      )}
      {stageMapGame && (
        <StageMap
          gameSlug={stageMapGame}
          totalStages={GAMES.find(g=>g.slug===stageMapGame)?.stages??1000}
          currentStage={1}
          onSelectStage={(s)=>{window.location.href=`/games/${stageMapGame}`;}}
          onClose={()=>setStageMapGame(null)}
        />
      )}
      </div>
  );
}
