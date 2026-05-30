"use client";
import { motion } from "framer-motion";

const BASE = "https://ixlcndaryfgkbcjooitu.supabase.co/storage/v1/object/public/asset%20library/";
const PHOTOS = [
  { src: BASE + "2%20women%20at%20a%20cafe%20playing%20phones.jpg",                      label: "At the café"     },
  { src: BASE + "man%20at%20subway%20playing%20phone.jpg",                               label: "On the commute"  },
  { src: BASE + "woman%20at%20the%20park%20playing%20phone.jpg",                         label: "In the park"     },
  { src: BASE + "woman%20at%20work%20playing%20phone.jpg",                               label: "At work"         },
  { src: BASE + "woman%20lying%20in%20bed%20holding%20phone%20smiling.jpg",              label: "Before bed"      },
  { src: BASE + "man%20at%20work%20on%20sofa%20playing%20phone.jpg",                     label: "On the sofa"     },
  { src: BASE + "woman%20at%20dining%20table%20at%20home%20smiling%20holding%20phone.jpg", label: "At home"       },
  { src: BASE + "man%20at%20street%20holding%20phone%20playing.jpg",                     label: "On the go"       },
];

const PROFILES = [
  {
    tag: "THE PARENT",
    name: "Screen time worth defending.",
    body: "Structural logic and spatial reasoning, not scrolling. Mind Element grows with your child from first puzzles to advanced strategy.",
    stat: "Ages 8–80",
  },
  {
    tag: "THE PROFESSIONAL",
    name: "3-minute cognitive reset.",
    body: "One game between meetings. Spatial reasoning resets working memory faster than scrolling social. Clarity on demand.",
    stat: "~3 min/session",
  },
  {
    tag: "THE SENIOR",
    name: "Agility is a choice.",
    body: "Clinical logic layouts built for daily use at any age. Accessibility Mode scales everything: touch targets, timers, contrast.",
    stat: "Accessibility Mode",
  },
];

export function HeroAudience() {
  return (
    <>
      {/* WHO IT'S FOR */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 48px 0" }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 48 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-accent-primary)", fontFamily: "var(--font-mono)", marginBottom: 16 }}>
            WHO TRAINS HERE
          </p>
          <h2 style={{ fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1.1 }}>
            One platform. Every generation.
          </h2>
        </motion.div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 1, border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
          {PROFILES.map((p, i) => (
            <motion.div key={p.tag}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              style={{ padding: "32px 28px", background: "var(--color-surface)", borderRight: i < 2 ? "1px solid var(--color-border)" : "none" }}
            >
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "var(--color-accent-primary)", fontFamily: "var(--font-mono)", marginBottom: 14 }}>{p.tag}</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 12, lineHeight: 1.3 }}>{p.name}</h3>
              <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>{p.body}</p>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>{p.stat}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LIFESTYLE STRIP */}
      <section style={{ overflow: "hidden", padding: "64px 0" }}>
        <div style={{ display: "flex", gap: 16, padding: "0 48px", overflowX: "auto", scrollbarWidth: "none" }}>
          {PHOTOS.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              style={{ flexShrink: 0, position: "relative", borderRadius: 10, overflow: "hidden", width: 188, height: 252 }}
            >
              <img src={item.src} alt={item.label} loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 12px 12px", background: "linear-gradient(transparent,rgba(0,0,0,0.72))" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#fff", fontFamily: "var(--font-sans)" }}>{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
