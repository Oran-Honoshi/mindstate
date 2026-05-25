// games-revisions-frames.jsx
// Three phone frames — each sets its own background, fonts, and scroll container.

const F_SANS = `"Outfit","Inter",system-ui,sans-serif`;
const F_DISPLAY = `"Fraunces","Georgia",serif`;
const F_MONO = `"JetBrains Mono",ui-monospace,monospace`;
const F_NEWS = `"Old Standard TT","Fraunces","Georgia",serif`;
const F_TYPER = `"Special Elite","JetBrains Mono",monospace`;

// ─── Cosmic background (lifted from prototype) ───────────────
function CosmicBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: "-20%", left: "-20%", width: "140%", height: "80%",
        background: "radial-gradient(ellipse at 20% 30%, rgba(168,85,247,0.32), transparent 55%)",
      }}/>
      <div style={{
        position: "absolute", bottom: "-30%", right: "-30%", width: "160%", height: "90%",
        background: "radial-gradient(ellipse at 70% 50%, rgba(34,211,238,0.22), transparent 60%)",
      }}/>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
      }}/>
      {Array.from({length: 60}).map((_, i) => {
        const x = (i * 67 + 11) % 100, y = (i * 41 + 7) % 100;
        const sz = (i % 7 === 0) ? 2.2 : (i % 4 === 0) ? 1.4 : 1;
        const opa = (i % 3 === 0) ? 0.85 : 0.35;
        const tw = i % 9 === 0;
        return <div key={i} style={{
          position: "absolute", left: `${x}%`, top: `${y}%`,
          width: sz, height: sz, background: "#fff",
          borderRadius: 99, opacity: opa,
          boxShadow: sz > 1.5 ? "0 0 4px rgba(255,255,255,0.7)" : "none",
          animation: tw ? `twinkle ${3 + (i%5)}s ease-in-out infinite ${i*0.13}s` : "none",
        }}/>;
      })}
    </div>
  );
}

function LightBg() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: "-20%", left: "-15%", width: "110%", height: "55%",
        background: "radial-gradient(ellipse at 30% 40%, rgba(156,107,232,0.16), transparent 60%)",
      }}/>
      <div style={{
        position: "absolute", top: "-10%", right: "-25%", width: "100%", height: "55%",
        background: "radial-gradient(ellipse at 70% 30%, rgba(79,110,247,0.14), transparent 60%)",
      }}/>
      <div style={{
        position: "absolute", bottom: "-30%", left: "-20%", width: "120%", height: "60%",
        background: "radial-gradient(ellipse at 30% 80%, rgba(196,120,90,0.16), transparent 60%)",
      }}/>
    </div>
  );
}

function PhoneShell({ children, frameBg, screenBg, statusInk, isPaper }) {
  return (
    <div style={{
      width: 400, height: 820,
      borderRadius: 44, padding: 9,
      background: frameBg,
      boxShadow: "0 30px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)",
      position: "relative",
      fontFamily: F_SANS,
    }}>
      {/* notch */}
      <div style={{
        position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
        width: 110, height: 26, background: "#000", borderRadius: 99, zIndex: 10,
      }}/>
      <div style={{
        width: "100%", height: "100%",
        borderRadius: 36, overflow: "hidden",
        background: screenBg, position: "relative",
      }}>
        {/* status bar */}
        <div style={{
          position: "absolute", top: 14, left: 24, fontSize: 12, fontWeight: 700,
          color: statusInk, fontFamily: F_MONO, zIndex: 6,
        }}>9:41</div>
        <div style={{
          position: "absolute", top: 14, right: 24, display: "flex", gap: 4, zIndex: 6,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: 99, background: statusInk }}/>
          <div style={{ width: 5, height: 5, borderRadius: 99, background: statusInk }}/>
          <div style={{ width: 5, height: 5, borderRadius: 99, background: statusInk, opacity: 0.4 }}/>
        </div>

        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", paddingTop: 40 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function PhoneLight({ children }) {
  return (
    <PhoneShell
      frameBg="linear-gradient(160deg,#1F1B16,#0E0D0B)"
      screenBg="#F8F4ED"
      statusInk="#1C1917"
    >
      <LightBg/>
      {children}
    </PhoneShell>
  );
}

function PhoneDark({ children }) {
  return (
    <PhoneShell
      frameBg="linear-gradient(160deg,#1B1B2E,#06060B)"
      screenBg="#07070E"
      statusInk="#F1EFE9"
    >
      <CosmicBg/>
      {children}
    </PhoneShell>
  );
}

function PhonePaper({ children }) {
  return (
    <div style={{
      width: 400, height: 820,
      borderRadius: 44, padding: 9,
      background: "linear-gradient(160deg,#3C2A1A,#1F1611)",
      boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
      position: "relative",
      fontFamily: F_NEWS,
    }}>
      <div style={{
        position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
        width: 110, height: 26, background: "#000", borderRadius: 99, zIndex: 10,
      }}/>
      <div className="newsprint" style={{
        width: "100%", height: "100%",
        borderRadius: 36, overflow: "hidden",
        position: "relative",
      }}>
        <div className="newsprint-stain"/>
        <div style={{
          position: "absolute", top: 14, left: 24, fontSize: 12, fontWeight: 700,
          color: "#1A1714", fontFamily: F_MONO, zIndex: 6,
        }}>9:41</div>
        <div style={{
          position: "absolute", top: 14, right: 24, display: "flex", gap: 4, zIndex: 6,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: 99, background: "#1A1714" }}/>
          <div style={{ width: 5, height: 5, borderRadius: 99, background: "#1A1714" }}/>
          <div style={{ width: 5, height: 5, borderRadius: 99, background: "#1A1714", opacity: 0.4 }}/>
        </div>
        <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", paddingTop: 40 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

window.GR_FRAMES = { PhoneLight, PhoneDark, PhonePaper };
window.GR_FONTS = { F_SANS, F_DISPLAY, F_MONO, F_NEWS, F_TYPER };
