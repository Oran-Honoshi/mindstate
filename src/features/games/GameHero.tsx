"use client";
import { motion } from "framer-motion";
import { ChevronRight, ArrowRight, Trophy, Star, Infinity, Shield, Zap, Flame, Users, Brain, Download } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { HeroCarousel } from "./GameHeroCarousel";

const BASE = "https://ixlcndaryfgkbcjooitu.supabase.co/storage/v1/object/public/asset%20library/";
const IMGS = {
  cafe:   BASE + "2%20women%20at%20a%20cafe%20playing%20phones.jpg",
  street: BASE + "man%20at%20street%20holding%20phone%20playing.jpg",
  subway: BASE + "man%20at%20subway%20playing%20phone.jpg",
  sofa:   BASE + "man%20at%20work%20on%20sofa%20playing%20phone.jpg",
  work_m: BASE + "man%20at%20work%20playing%20phone.jpg",
  dining: BASE + "woman%20at%20dining%20table%20at%20home%20smiling%20holding%20phone.jpg",
  park:   BASE + "woman%20at%20the%20park%20playing%20phone.jpg",
  work_w: BASE + "woman%20at%20work%20playing%20phone.jpg",
  bed:    BASE + "woman%20lying%20in%20bed%20holding%20phone%20smiling.jpg",
};

export function GameHero() {
  const { user } = useAuthStore();
  const { isInstallable, triggerInstall } = usePWAInstall();

  return (
    <>
      {/* ── HERO ── */}
      <section className="hero-grid" style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 48px 80px", minHeight: "100vh" }}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 16px", borderRadius: 20, background: "var(--color-surface)", border: "0.5px solid var(--color-border)", boxShadow: "var(--shadow-sm)", marginBottom: 28, fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", display: "block" }}/>
            An evolving suite of elite logic experiences · Free to start
          </div>
          <h1 className="hero-h1" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, lineHeight: 1.06, marginBottom: 24, fontSize: "clamp(52px,5.5vw,80px)" }}>
            <span style={{ display: "block", color: "var(--color-text-primary)" }}>One Playground</span>
            <span style={{ display: "block", fontStyle: "italic", background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary),#C4785A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>for Evolving Minds.</span>
          </h1>
          <p style={{ fontSize: 20, color: "var(--color-text-secondary)", lineHeight: 1.65, marginBottom: 36, maxWidth: 460 }}>
            Step into an elegant, ad-free world of structural logic and language play — crafted to spark foundational reasoning in kids, clear cognitive overload for busy professionals, and preserve sharp recall for active seniors.
          </p>
          <div style={{ display: "flex", gap: 14, marginBottom: 40, flexWrap: "wrap" }}>
            <Link href={user ? "/games" : "/auth/signup"}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 28px", borderRadius: 16, background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", color: "white", fontWeight: 700, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 24px rgba(79,110,247,0.35)" }}>
              Start Training Free <ChevronRight size={16}/>
            </Link>
            <Link href="/games"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 28px", borderRadius: 16, background: "var(--color-surface)", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: 16, textDecoration: "none", border: "0.5px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
              Explore Games <ArrowRight size={15}/>
            </Link>
            {isInstallable && (
              <motion.button
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                onClick={triggerInstall}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "15px 28px", borderRadius: 16, background: "var(--color-surface)", color: "var(--color-text-secondary)", fontWeight: 600, fontSize: 16, border: "0.5px solid var(--color-border)", boxShadow: "var(--shadow-sm)", cursor: "pointer" }}>
                <Download size={15}/> Install App
              </motion.button>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex" }}>
              {[IMGS.cafe, IMGS.park, IMGS.work_w, IMGS.subway, IMGS.dining].map((img, i) => (
                <div key={i} style={{ width: 34, height: 34, borderRadius: "50%", border: "2.5px solid var(--color-bg)", marginLeft: i > 0 ? -10 : 0, position: "relative", zIndex: 5 - i, overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: "flex", gap: 1, marginBottom: 3 }}>
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={13} fill="#F59E0B" color="#F59E0B"/>)}
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Loved by players everywhere</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="hero-device" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }} style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{ background: "linear-gradient(145deg,#E8E4DE,#CEC9C1)", borderRadius: 32, padding: 12, boxShadow: "0 40px 80px rgba(0,0,0,0.2),0 8px 24px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.5)" }}>
              <div style={{ background: "var(--color-surface)", borderRadius: 22, overflow: "hidden", minWidth: 340, boxShadow: "inset 0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", background: "var(--color-surface-2)", borderBottom: "0.5px solid var(--color-border)" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", fontFamily: "monospace" }}>9:41</span>
                  <div style={{ display: "flex", gap: 3 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--color-border)" }}/>)}</div>
                </div>
                <HeroCarousel/>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: -12, left: "15%", right: "15%", height: 20, background: "rgba(79,110,247,0.2)", filter: "blur(18px)", borderRadius: "50%" }}/>
          </div>
        </motion.div>
      </section>

      {/* ── VALUE BAR ── */}
      <section style={{ background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", padding: "22px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: 16 }}>
          {[
            { icon: Trophy,   text: "Dozens of Elite Disciplines" },
            { icon: Star,     text: "Thousands of Logic Maps" },
            { icon: Infinity, text: "Infinite Daily Challenges" },
            { icon: Shield,   text: "Zero Ads. Ever." },
            { icon: Zap,      text: "5 Free Plays Daily" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "white" }}>
              <item.icon size={18} color="rgba(255,255,255,0.8)"/>
              <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.95)", whiteSpace: "nowrap" }}>{item.text}</span>
              {i < 4 && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 20, marginLeft: 6 }}>·</span>}
            </div>
          ))}
        </div>
      </section>

      {/* ── TOKEN ECONOMY ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 48px 0" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-secondary)", marginBottom: 10 }}>How it works</p>
          <h2 style={{ fontSize: 40, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", marginBottom: 12 }}>Train your mind, every day.</h2>
          <p style={{ fontSize: 18, color: "var(--color-text-secondary)", maxWidth: 560 }}>Free players get 5 daily training sessions across the full vault. Pro subscribers train without limits.</p>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(1,1fr)", gap: 16, marginBottom: 72 }} className="token-grid">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}
            className="ms-card" style={{ padding: "28px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(79,110,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Zap size={22} color="var(--color-accent-primary)"/>
            </div>
            <p style={{ fontSize: 48, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", lineHeight: 1, marginBottom: 8 }}>5</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Free Daily Plays</p>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>Access the full vault. Sessions reset every 24 hours at midnight.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
            className="ms-card" style={{ padding: "28px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Flame size={22} color="#F59E0B" className="streak-fire"/>
            </div>
            <p style={{ fontSize: 48, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", lineHeight: 1, marginBottom: 8 }}>+10</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6 }}>Weekly Streak Bonus</p>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>Play 7 days in a row and earn 10 bonus plays automatically added to your account.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
            style={{ background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", borderRadius: 24, padding: "28px 28px", boxShadow: "0 16px 40px rgba(79,110,247,0.25)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Infinity size={22} color="white"/>
            </div>
            <p style={{ fontSize: 48, fontWeight: 700, color: "white", fontFamily: "var(--font-sans)", lineHeight: 1, marginBottom: 8 }}>∞</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.95)", marginBottom: 6 }}>Pro Unlimited</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>Unlimited training, thousands of stages across all games, and family leaderboards from $2/mo.</p>
            <Link href="/pricing" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, padding: "10px 18px", borderRadius: 12, background: "white", color: "var(--color-accent-primary)", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
              Upgrade <ChevronRight size={13}/>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 48px 0" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-text-secondary)", marginBottom: 10 }}>Built for Every Stage of Life</p>
          <h2 style={{ fontSize: 40, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", marginBottom: 12, lineHeight: 1.1 }}>
            One app. <em style={{ fontStyle: "italic", background: "linear-gradient(135deg,var(--color-accent-primary),var(--color-accent-primary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Every generation.</em>
          </h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, marginBottom: 72 }}>
          {[
            { icon: <Users size={22} color="var(--color-accent-primary)"/>, tag: "The Modern Parent", heading: "Screen time you can finally feel good about.", body: "Replace mindless feeds with structural logic games that foster spatial awareness and deep critical planning from an early age. Mind Element grows with your child." },
            { icon: <Zap size={22} color="#00B4D8"/>, tag: "The High-Performing Professional", heading: "The ultimate 3-minute cognitive reset.", body: "Step away from your dashboard to realign working memory and refresh focus with surgical geometric puzzles. Clarity on demand." },
            { icon: <Brain size={22} color="#F59E0B"/>, tag: "The Active Senior", heading: "Age is a number. Agility is a choice.", body: "Keep memory sharp with clinical logic layouts built for multi-generational enjoyment. Accessibility Mode adapts every experience to you." },
          ].map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="ms-card" style={{ padding: "32px 28px" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(79,110,247,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>{item.icon}</div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text-secondary)", marginBottom: 10 }}>{item.tag}</p>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "var(--font-sans)", marginBottom: 12, lineHeight: 1.3 }}>{item.heading}</h3>
              <p style={{ fontSize: 15, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── LIFESTYLE STRIP ── */}
      <section style={{ paddingBottom: 72, overflow: "hidden" }}>
        <div className="lifestyle-strip">
          {[
            { img: IMGS.cafe,   label: "At the café" },
            { img: IMGS.subway, label: "On the commute" },
            { img: IMGS.park,   label: "In the park" },
            { img: IMGS.work_w, label: "At work" },
            { img: IMGS.bed,    label: "Before bed" },
            { img: IMGS.sofa,   label: "On the sofa" },
            { img: IMGS.dining, label: "At home" },
            { img: IMGS.street, label: "On the go" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              style={{ flexShrink: 0, position: "relative", borderRadius: 20, overflow: "hidden", width: 200, height: 264, boxShadow: "var(--shadow-md)" }}>
              <img src={item.img} alt={item.label} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "32px 14px 14px", background: "linear-gradient(transparent,rgba(0,0,0,0.6))", color: "white", fontSize: 12, fontWeight: 600 }}>
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
