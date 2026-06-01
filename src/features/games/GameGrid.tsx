"use client";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import { ComingSoonTeaser } from "@/components/ui/ComingSoonTeaser";
import { useAuthStore } from "@/store/authStore";
import { GameCard } from "@/features/games/GameCard";

const WORK_M_IMG = "https://ixlcndaryfgkbcjooitu.supabase.co/storage/v1/object/public/asset%20library/man%20at%20work%20playing%20phone.jpg";

export const GAMES = [
  { slug: "tango",         name: "Tango",           desc: "Balance rows & columns",   free: true,  difficulty: "easy"   as const },
  { slug: "memory",        name: "Memory",           desc: "Flip cards, find pairs",   free: true,  difficulty: "easy"   as const },
  { slug: "queens",        name: "Queens",           desc: "One queen per region",     free: true,  difficulty: "easy"   as const },
  { slug: "sudoku",        name: "Mini Sudoku",      desc: "No repeats in grid",       free: false, difficulty: "medium" as const },
  { slug: "zip",           name: "Zip",              desc: "Trace through every cell", free: false, difficulty: "medium" as const },
  { slug: "flow",          name: "Flow",             desc: "Connect color dots",       free: false, difficulty: "medium" as const },
  { slug: "bridges",       name: "Bridges",          desc: "Right number of bridges",  free: false, difficulty: "medium" as const },
  { slug: "kakuro",        name: "Kakuro",           desc: "Digit sums guide you",     free: false, difficulty: "hard"   as const },
  { slug: "logic-path",    name: "Logic Path",       desc: "Rotate pipes to connect",  free: false, difficulty: "medium" as const },
  { slug: "lightup",       name: "Light Up",         desc: "Illuminate every cell",    free: false, difficulty: "medium" as const },
  { slug: "nonogram",      name: "Nonogram",         desc: "Pixel art from clues",     free: false, difficulty: "hard"   as const },
  { slug: "pattern-match", name: "Pattern Match",    desc: "Find the rule",            free: false, difficulty: "easy"   as const },
  { slug: "patches",       name: "Patches",          desc: "Tile with polyominoes",    free: false, difficulty: "medium" as const },
  { slug: "2048-pro",      name: "2048 Pro",         desc: "Merge to the target",      free: false, difficulty: "medium" as const },
  { slug: "gravity-sort",  name: "Gravity Sort",     desc: "Sort falling blocks",      free: false, difficulty: "medium" as const },
  { slug: "hex-merge",     name: "Hex Merge",        desc: "Chain hex merges",         free: false, difficulty: "hard"   as const },
  { slug: "word-sling",    name: "Word Sling",       desc: "Build scoring words",      free: false, difficulty: "easy"   as const },
  { slug: "hearts",        name: "Hearts",           desc: "Avoid penalty cards",      free: false, difficulty: "medium" as const },
  { slug: "solitaire",     name: "Solitaire",        desc: "Classic Klondike",         free: false, difficulty: "easy"   as const },
  { slug: "minesweeper",   name: "Minesweeper",      desc: "Deduce the mines",         free: false, difficulty: "hard"   as const },
  { slug: "word-climb",    name: "Word Climb",       desc: "Climb the word ladder",    free: false, difficulty: "easy"   as const },
  { slug: "pinpoint",      name: "Pinpoint",         desc: "Guess from clues",         free: false, difficulty: "easy"   as const },
  { slug: "name-country",  name: "Name the Country", desc: "Identify from the flag",   free: false, difficulty: "easy"   as const },
  { slug: "name-city",     name: "Name the City",    desc: "Identify the city",        free: false, difficulty: "medium" as const },
];

export function GameGrid() {
  const { user } = useAuthStore();

  return (
    <>
      <div id="games" style={{ scrollMarginTop: "70px" }}/>
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px 80px" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-secondary)", marginBottom: 10 }}>The Collection</p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <h2 style={{ fontSize: 40, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", lineHeight: 1.1 }}>
              An Evolving Vault.<br/>
              <em style={{ fontStyle: "italic", color: "var(--color-accent-primary)" }}>One Subscription.</em>
            </h2>
            <Link href="/games" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 20px", borderRadius: 14, border: "0.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text-secondary)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              View All Games <ArrowRight size={14}/>
            </Link>
          </div>
        </motion.div>
        <div className="games-grid-4">
          {GAMES.map((game, i) => <GameCard key={game.slug} game={game} i={i}/>)}
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
        <ComingSoonTeaser compact/>
      </div>

      <div id="how-it-works" style={{ scrollMarginTop: "70px" }}/>
      <section style={{ background: "var(--color-surface-2)", borderTop: "0.5px solid var(--color-border)", borderBottom: "0.5px solid var(--color-border)", padding: "72px 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 40, color: "var(--color-text-primary)", textAlign: "center", marginBottom: 52 }}>
            Built for the Modern Mind
          </h2>
          <div className="how-grid">
            {[
              { from: "var(--color-accent-primary)", to: "#7C4FD4", num: "01", title: "Choose a discipline", body: "24 logic games, each with its own rhythm. Start free with any game — no account needed." },
              { from: "var(--color-accent-primary)", to: "#C4785A", num: "02", title: "Train daily",         body: "XP decays in real time. The faster you solve, the more you earn. Build a streak for bonus plays." },
              { from: "#7C9E87",                     to: "#4A7C59", num: "03", title: "Master and compete",  body: "Family leaderboards, shareable challenge links, and real-time celebrations when records fall." },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="ms-card" style={{ padding: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: "22.5%", background: `linear-gradient(135deg,${s.from},${s.to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "white", fontFamily: "var(--font-sans)", marginBottom: 16 }}>
                  {s.num}
                </div>
                <p style={{ fontSize: 17, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 10 }}>{s.title}</p>
                <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.65 }}>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ position: "relative", height: 460, overflow: "hidden" }}>
        <img src={WORK_M_IMG} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}/>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }}/>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 48px" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 48, color: "white", marginBottom: 14, lineHeight: 1.08 }}>
              Your sharpest self<br/><em>starts here.</em>
            </h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", marginBottom: 32, maxWidth: 440 }}>
              Join a growing community of curious minds training daily. 5 free sessions every day. No credit card needed.
            </p>
            <Link href={user ? "/games" : "/auth/signup"}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 32px", borderRadius: 18, background: "white", color: "var(--color-accent-primary)", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 28px rgba(0,0,0,0.2)" }}>
              Start Training Free <ChevronRight size={16}/>
            </Link>
          </motion.div>
        </div>
      </section>

      <div id="coming-soon" style={{ scrollMarginTop: "70px" }}/>
      <ComingSoonTeaser/>
    </>
  );
}
