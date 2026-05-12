"use client";

import { motion } from "framer-motion";
import { Sparkles, Lock, ChevronRight, Bell } from "lucide-react";
import Link from "next/link";

const UPCOMING_GAMES = [
  { name:"Chess Puzzles",    desc:"Tactical patterns from grandmaster games",        eta:"Q3 2025" },
  { name:"Cryptogram",       desc:"Decode substitution ciphers with logic alone",    eta:"Q3 2025" },
  { name:"Set Theory",       desc:"Find hidden sets in a field of symbol cards",     eta:"Q4 2025" },
  { name:"Calcudoku",        desc:"Arithmetic cage constraints on a Sudoku grid",    eta:"Q4 2025" },
  { name:"Hitori",           desc:"Shade cells so no row or column repeats",         eta:"Q1 2026" },
  { name:"Slitherlink",      desc:"Draw a loop using the number clues on the grid",  eta:"Q1 2026" },
];

const UPCOMING_STAGES = [
  { game:"All 20 games", detail:"Stages 1,001–2,000 · Extreme difficulty tier",    eta:"Q3 2025" },
  { game:"Tango",        detail:"6×6 tournament boards from real competitions",      eta:"Q3 2025" },
  { game:"Sudoku",       detail:"16×16 mega-grid mode",                            eta:"Q4 2025" },
  { game:"Flow",         detail:"10×10 and 12×12 boards with 12 color pairs",       eta:"Q4 2025" },
];

export function ComingSoonTeaser({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity:0, y:16 }}
        whileInView={{ opacity:1, y:0 }}
        viewport={{ once:true }}
        style={{
          background:"linear-gradient(135deg,rgba(79,110,247,0.06),rgba(156,107,232,0.08))",
          borderRadius:20, border:"0.5px solid rgba(79,110,247,0.2)",
          padding:"20px 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          gap:16, flexWrap:"wrap",
        }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10,
            background:"rgba(79,110,247,0.1)",
            display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Sparkles size={18} color="#4F6EF7"/>
          </div>
          <div>
            <p style={{ fontSize:14, fontWeight:700, color:"var(--text1)", marginBottom:2 }}>
              6 new games in development · More stages coming
            </p>
            <p style={{ fontSize:12, color:"var(--text3)" }}>
              Chess Puzzles, Cryptogram, Calcudoku and more — Pro subscribers get early access.
            </p>
          </div>
        </div>
        <Link href="/pricing"
          style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 16px",
            borderRadius:12, background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
            color:"white", fontSize:12, fontWeight:700, textDecoration:"none", flexShrink:0 }}>
          Get Early Access <ChevronRight size={12}/>
        </Link>
      </motion.div>
    );
  }

  return (
    <section style={{ maxWidth:1200, margin:"0 auto", padding:"80px 48px" }}>
      <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
        style={{ marginBottom:40 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <Sparkles size={16} color="#4F6EF7"/>
          <p style={{ fontSize:12, fontWeight:600, letterSpacing:"0.18em",
            textTransform:"uppercase", color:"var(--text4)" }}>
            What is coming next
          </p>
        </div>
        <h2 style={{ fontSize:36, fontWeight:700, color:"var(--text1)",
          fontFamily:"Georgia,serif", marginBottom:10, lineHeight:1.15 }}>
          The roadmap is full.<br/>
          <span style={{ background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            backgroundClip:"text" }}>
            Your mind will not run out.
          </span>
        </h2>
        <p style={{ fontSize:17, color:"var(--text3)", maxWidth:520, lineHeight:1.7 }}>
          Pro subscribers get early access to every new game and stage tier the moment it ships.
          Free users follow 30 days later.
        </p>
      </motion.div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        {/* New games */}
        <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          style={{ background:"var(--surface)", borderRadius:22,
            border:"0.5px solid var(--border)", padding:"24px",
            boxShadow:"var(--shadow-sm)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
            <Lock size={15} color="#4F6EF7"/>
            <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text1)" }}>
              Upcoming Games
            </h3>
            <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:8,
              background:"rgba(79,110,247,0.1)", color:"#4F6EF7", marginLeft:"auto" }}>
              6 in development
            </span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {UPCOMING_GAMES.map((g, i) => (
              <motion.div key={i}
                initial={{ opacity:0, x:-12 }} whileInView={{ opacity:1, x:0 }}
                viewport={{ once:true }} transition={{ delay:i*0.05 }}
                style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"10px 12px", borderRadius:12,
                  background:"var(--bg2)", gap:12 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:"var(--text1)", marginBottom:2 }}>
                    {g.name}
                  </p>
                  <p style={{ fontSize:11, color:"var(--text4)", lineHeight:1.4 }}>{g.desc}</p>
                </div>
                <span style={{ fontSize:10, fontWeight:600, color:"var(--text4)",
                  background:"var(--bg3)", padding:"3px 8px", borderRadius:8,
                  whiteSpace:"nowrap", flexShrink:0 }}>
                  {g.eta}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* More stages */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <motion.div initial={{ opacity:0, y:16 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ delay:0.08 }}
            style={{ background:"var(--surface)", borderRadius:22,
              border:"0.5px solid var(--border)", padding:"24px",
              boxShadow:"var(--shadow-sm)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
              <Sparkles size={15} color="#F59E0B"/>
              <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text1)" }}>
                More Stages Coming
              </h3>
              <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:8,
                background:"rgba(245,158,11,0.1)", color:"#B45309", marginLeft:"auto" }}>
                +10,000 stages
              </span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {UPCOMING_STAGES.map((s, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, x:12 }} whileInView={{ opacity:1, x:0 }}
                  viewport={{ once:true }} transition={{ delay:i*0.05 }}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"10px 12px", borderRadius:12, background:"var(--bg2)", gap:12 }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:"var(--text1)", marginBottom:2 }}>
                      {s.game}
                    </p>
                    <p style={{ fontSize:11, color:"var(--text4)", lineHeight:1.4 }}>{s.detail}</p>
                  </div>
                  <span style={{ fontSize:10, fontWeight:600, color:"var(--text4)",
                    background:"var(--bg3)", padding:"3px 8px", borderRadius:8,
                    whiteSpace:"nowrap", flexShrink:0 }}>
                    {s.eta}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Early access CTA */}
          <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ delay:0.15 }}
            style={{ borderRadius:22, padding:"22px 24px",
              background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
              boxShadow:"0 16px 40px rgba(79,110,247,0.25)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <Bell size={16} color="rgba(255,255,255,0.8)"/>
              <p style={{ fontSize:13, fontWeight:700, color:"white" }}>
                Pro — First to every new release
              </p>
            </div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.6, marginBottom:16 }}>
              Every new game and stage tier ships to Pro subscribers 30 days before free users.
              Lock in the $2/mo price before it changes.
            </p>
            <Link href="/auth/signup"
              style={{ display:"inline-flex", alignItems:"center", gap:6,
                padding:"10px 18px", borderRadius:12, background:"white",
                color:"#4F6EF7", fontSize:13, fontWeight:700, textDecoration:"none" }}>
              Get Early Access <ChevronRight size={13}/>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
