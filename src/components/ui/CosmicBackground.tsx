"use client";
import { useEffect, useState } from "react";

export function CosmicBackground() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  if (!isDark) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url(/images/cosmic-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundRepeat: "no-repeat",
        opacity: 0.6,
      }}/>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(7,7,18,0.3) 0%, rgba(7,7,18,0.6) 100%)",
      }}/>
      <div style={{
        position: "absolute",
        top: "-15%", left: "-10%",
        width: "55vw", height: "55vh",
        background: "radial-gradient(ellipse, rgba(126,34,206,0.18) 0%, transparent 70%)",
        filter: "blur(60px)",
      }}/>
      <div style={{
        position: "absolute",
        bottom: "-10%", right: "-5%",
        width: "50vw", height: "50vh",
        background: "radial-gradient(ellipse, rgba(16,185,129,0.15) 0%, transparent 70%)",
        filter: "blur(70px)",
      }}/>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}/>
    </div>
  );
}