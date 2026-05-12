"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X, Moon, Sun } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";

const NAV_LINKS = [
  { label:"Games",        href:"#games" },
  { label:"How it works", href:"#how-it-works" },
  { label:"What's coming",href:"#coming-soon" },
  { label:"Pricing",      href:"#pricing" },
  { label:"FAQ",          href:"#faq" },
];

export function LandingNav() {
  const { theme, toggleTheme } = useSettingsStore();
  const { user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  function handleScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    const el = document.getElementById(href.replace("#",""));
    if (el) el.scrollIntoView({ behavior:"smooth", block:"start" });
    setMobileOpen(false);
  }

  return (
    <motion.nav initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
      style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background: scrolled ? "rgba(253,252,251,0.94)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "0.5px solid var(--border)" : "none",
        transition:"all 0.3s",
      }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 32px", height:64,
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>

        <Link href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <img src="/icons/icon-192.png" alt="MindState"
            style={{ width:34, height:34, borderRadius:"22.5%", objectFit:"cover",
              boxShadow:"0 2px 8px rgba(79,110,247,0.2)" }}/>
          <span style={{ fontWeight:700, fontSize:18, color:"var(--text1)", fontFamily:"Georgia,serif" }}>
            MindState
          </span>
        </Link>

        <div style={{ display:"flex", alignItems:"center", gap:24 }}>
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href}
              onClick={e => handleScroll(e, link.href)}
              style={{ fontSize:13, fontWeight:500, color:"var(--text3)",
                textDecoration:"none", cursor:"pointer", whiteSpace:"nowrap" }}
              onMouseEnter={e=>(e.currentTarget.style.color="var(--text1)")}
              onMouseLeave={e=>(e.currentTarget.style.color="var(--text3)")}>
              {link.label}
            </a>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <button onClick={toggleTheme}
            style={{ padding:7, borderRadius:9, border:"0.5px solid var(--border)",
              background:"transparent", cursor:"pointer", display:"flex", color:"var(--text4)" }}>
            {theme==="dark" ? <Sun size={14}/> : <Moon size={14}/>}
          </button>
          {user ? (
            <Link href="/games"
              style={{ fontSize:13, fontWeight:700, color:"white", textDecoration:"none",
                padding:"8px 18px", borderRadius:10,
                background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)" }}>
              Open App
            </Link>
          ) : (<>
            <Link href="/auth/signin"
              style={{ fontSize:13, fontWeight:600, color:"var(--text2)", textDecoration:"none",
                padding:"8px 14px", borderRadius:10, border:"0.5px solid var(--border)",
                background:"var(--surface)" }}>
              Sign in
            </Link>
            <Link href="/auth/signup"
              style={{ fontSize:13, fontWeight:700, color:"white", textDecoration:"none",
                padding:"8px 18px", borderRadius:10,
                background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)" }}>
              Start Free
            </Link>
          </>)}
          <button onClick={()=>setMobileOpen(o=>!o)}
            style={{ padding:7, borderRadius:9, border:"0.5px solid var(--border)",
              background:"transparent", cursor:"pointer", display:"flex" }}>
            {mobileOpen ? <X size={15}/> : <Menu size={15}/>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
            style={{ background:"var(--surface)", borderBottom:"0.5px solid var(--border)",
              padding:"12px 24px 20px" }}>
            {NAV_LINKS.map(link=>(
              <a key={link.href} href={link.href} onClick={e=>handleScroll(e,link.href)}
                style={{ display:"block", fontSize:15, fontWeight:500, color:"var(--text2)",
                  textDecoration:"none", padding:"10px 0", borderBottom:"0.5px solid var(--border)" }}>
                {link.label}
              </a>
            ))}
            <div style={{ display:"flex", gap:8, marginTop:12 }}>
              <Link href="/auth/signin" onClick={()=>setMobileOpen(false)}
                style={{ flex:1, textAlign:"center", padding:"11px", borderRadius:12,
                  border:"0.5px solid var(--border)", fontSize:13, fontWeight:600,
                  color:"var(--text2)", textDecoration:"none", background:"var(--bg2)" }}>
                Sign in
              </Link>
              <Link href="/auth/signup" onClick={()=>setMobileOpen(false)}
                style={{ flex:1, textAlign:"center", padding:"11px", borderRadius:12,
                  background:"linear-gradient(135deg,#4F6EF7,#9C6BE8)",
                  fontSize:13, fontWeight:700, color:"white", textDecoration:"none" }}>
                Start Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
