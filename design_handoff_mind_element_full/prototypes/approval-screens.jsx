// approval-screens.jsx
// Theme-driven renderers for every key screen so they can be approved in
// Light / Dark Cosmic / Paper at a glance.
//
// Each screen is a single component that takes `{ theme }` and switches on
// shared theme tokens.

const AF = window.GR_FONTS;

// ════════════════════════════════════════════════════════════════════════════
// Shared theme tokens
// ════════════════════════════════════════════════════════════════════════════

const T_ = {
  light: {
    bg:"#F8F4ED", surface:"#fff", surfaceAlt:"rgba(28,25,23,0.04)", surfaceHi:"#fff",
    ink:"#1C1917", ink2:"#3C3633", ink3:"#78706A", ink4:"#A39C95",
    accent:"#9C6BE8", accent2:"#4F6EF7", success:"#10B981", warn:"#F59E0B", ruby:"#DC2626",
    border:"rgba(28,25,23,0.1)", hair:"rgba(28,25,23,0.06)",
    pillBg:"rgba(156,107,232,0.1)", pillInk:"#9C6BE8",
    btnBg:"#1C1917", btnInk:"#F8F4ED",
    btnAccent:"#9C6BE8", btnAccentInk:"#fff",
    chip:"#fff", chipBorder:"rgba(28,25,23,0.1)",
    serif:AF.F_DISPLAY, sans:AF.F_SANS, mono:AF.F_MONO, label:AF.F_SANS,
    radius:14, radiusSm:10,
    shadow:"0 8px 24px rgba(28,25,23,0.06)",
    boost:"0 4px 14px rgba(156,107,232,0.3)",
  },
  dark: {
    bg:"#07070E", surface:"rgba(255,255,255,0.04)", surfaceAlt:"rgba(255,255,255,0.02)", surfaceHi:"rgba(255,255,255,0.08)",
    ink:"#fff", ink2:"rgba(255,255,255,0.85)", ink3:"rgba(255,255,255,0.55)", ink4:"rgba(255,255,255,0.35)",
    accent:"#A855F7", accent2:"#38BDF8", success:"#34D399", warn:"#F5B342", ruby:"#F472B6",
    border:"rgba(255,255,255,0.12)", hair:"rgba(255,255,255,0.06)",
    pillBg:"rgba(168,85,247,0.18)", pillInk:"#E9D5FF",
    btnBg:"rgba(255,255,255,0.1)", btnInk:"#fff",
    btnAccent:"#A855F7", btnAccentInk:"#0E0C18",
    chip:"rgba(255,255,255,0.06)", chipBorder:"rgba(255,255,255,0.14)",
    serif:AF.F_DISPLAY, sans:AF.F_SANS, mono:AF.F_MONO, label:AF.F_SANS,
    radius:14, radiusSm:10,
    shadow:"0 12px 36px rgba(0,0,0,0.5)",
    boost:"0 0 24px rgba(168,85,247,0.5)",
  },
  paper: {
    bg:"transparent", surface:"#FFFCF1", surfaceAlt:"rgba(232,220,186,0.55)", surfaceHi:"#FFFCF1",
    ink:"#1A1714", ink2:"#3C3022", ink3:"#5C4F38", ink4:"#8C7E62",
    accent:"#1A1714", accent2:"#8C2A1F", success:"#1A1714", warn:"#8C2A1F", ruby:"#8C2A1F",
    border:"#1A1714", hair:"rgba(26,23,20,0.4)",
    pillBg:"#FFFCF1", pillInk:"#1A1714",
    btnBg:"#FFFCF1", btnInk:"#1A1714",
    btnAccent:"#1A1714", btnAccentInk:"#FFFCF1",
    chip:"#FFFCF1", chipBorder:"#1A1714",
    serif:AF.F_NEWS, sans:AF.F_NEWS, mono:AF.F_TYPER, label:AF.F_TYPER,
    radius:0, radiusSm:0,
    shadow:"2px 2px 0 #1A1714",
    boost:"3px 3px 0 #1A1714",
  },
};

// Small shared primitives
function Pill({ theme, children, accent }) {
  const t = T_[theme];
  return (
    <span style={{
      padding: "4px 10px",
      borderRadius: theme === "paper" ? 0 : 99,
      background: accent ? t.pillBg : t.chip,
      border: theme === "paper" ? `1px solid ${t.border}` : `1px solid ${accent ? t.pillBg : t.chipBorder}`,
      fontFamily: t.label, fontSize: 9.5, fontWeight: 700, letterSpacing: 1,
      color: accent ? t.pillInk : t.ink2,
      display: "inline-flex", alignItems: "center", gap: 5, textTransform: "uppercase",
    }}>{children}</span>
  );
}

function PrimaryBtn({ theme, children, full, sub }) {
  const t = T_[theme];
  return (
    <button style={{
      width: full ? "100%" : "auto",
      padding: "13px 18px",
      borderRadius: t.radius,
      background: t.btnAccent,
      color: t.btnAccentInk,
      border: theme === "paper" ? `1.5px solid #1A1714` : "none",
      fontFamily: theme === "paper" ? t.mono : t.sans,
      fontSize: 13, fontWeight: 700, letterSpacing: theme === "paper" ? 1.5 : 0,
      cursor: "pointer",
      boxShadow: theme === "paper" ? "3px 3px 0 #1A1714" : t.boost,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
    }}>{children}</button>
  );
}

function GhostBtn({ theme, children, full }) {
  const t = T_[theme];
  return (
    <button style={{
      width: full ? "100%" : "auto",
      padding: "12px 16px",
      borderRadius: t.radius,
      background: t.surface,
      color: t.ink2,
      border: `1px solid ${theme === "paper" ? t.border : t.border}`,
      fontFamily: theme === "paper" ? t.mono : t.sans,
      fontSize: 13, fontWeight: 600, letterSpacing: theme === "paper" ? 1.2 : 0,
      cursor: "pointer",
    }}>{children}</button>
  );
}

function Card({ theme, children, pad = 16, style = {} }) {
  const t = T_[theme];
  return (
    <div style={{
      background: t.surface,
      borderRadius: t.radius,
      border: `${theme === "paper" ? 1 : 1}px solid ${t.border}`,
      boxShadow: theme === "paper" ? t.shadow : "none",
      padding: pad, ...style,
    }}>{children}</div>
  );
}

function Section({ theme, kicker, title, sub, children }) {
  const t = T_[theme];
  return (
    <div style={{ padding: "0 24px" }}>
      {kicker && (
        <div style={{
          fontFamily: t.label, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5,
          color: t.accent, textTransform: "uppercase", marginBottom: 6,
        }}>{kicker}</div>
      )}
      {title && (
        <div style={{
          fontFamily: t.serif, fontSize: 24, fontWeight: 600,
          color: t.ink, letterSpacing: -0.4, lineHeight: 1.1, marginBottom: sub ? 8 : 16,
        }}>{title}</div>
      )}
      {sub && (
        <div style={{ fontSize: 13, color: t.ink3, lineHeight: 1.5, marginBottom: 16 }}>{sub}</div>
      )}
      {children}
    </div>
  );
}

// "Mind Element" mark — title rendered per theme
function Wordmark({ theme, size = 22 }) {
  const t = T_[theme];
  if (theme === "paper") {
    return (
      <span style={{ fontFamily: AF.F_NEWS, fontSize: size, fontWeight: 700, letterSpacing: -0.3, color: t.ink }}>
        Mind<span style={{ fontStyle: "italic", fontWeight: 700 }}>·</span>Element
      </span>
    );
  }
  return (
    <span style={{
      fontFamily: t.serif, fontSize: size, fontWeight: 600, letterSpacing: -0.6,
      color: t.ink, display: "inline-flex", alignItems: "center", gap: 4,
    }}>
      <span style={{
        width: 14, height: 14, borderRadius: 99,
        background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
        boxShadow: theme === "dark" ? `0 0 10px ${t.accent}` : "none",
      }}/>
      Mind&nbsp;Element
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LANDING
// ════════════════════════════════════════════════════════════════════════════

function LandingScreen({ theme }) {
  const t = T_[theme];
  const isPaper = theme === "paper";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", paddingTop: 16 }}>
      {/* nav */}
      <div style={{ padding: "0 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Wordmark theme={theme} size={18}/>
        <button style={{
          padding: "6px 12px", borderRadius: t.radiusSm,
          background: "transparent", border: `1px solid ${t.border}`,
          color: t.ink2, fontFamily: t.sans, fontSize: 11, fontWeight: 600, cursor: "pointer",
        }}>Sign in</button>
      </div>

      {/* hero */}
      <div style={{ padding: "32px 24px 24px", flex: 1 }}>
        {isPaper && (
          <div style={{ fontFamily: AF.F_TYPER, fontSize: 9, color: t.ink3, letterSpacing: 1.6, fontWeight: 700, marginBottom: 10 }}>
            EST. 2026 · DAILY EDITION
          </div>
        )}
        <div style={{
          fontFamily: t.serif, fontSize: 40, fontWeight: 600,
          color: t.ink, letterSpacing: -1.2, lineHeight: 1.02, marginBottom: 14,
        }}>
          {isPaper ? "A Daily Test" : "Sharpen daily."}<br/>
          <span style={{ fontStyle: theme==="paper"?"italic":"normal", color: theme==="paper"?t.accent2:t.accent }}>
            {isPaper ? "of the Mind." : "Five minutes."}
          </span>
        </div>
        <div style={{ fontSize: 14, color: t.ink2, lineHeight: 1.55, marginBottom: 26, maxWidth: 280 }}>
          {isPaper
            ? "Five puzzles published each morning. Sun & moon balance, matched pairs, and the placing of crowns."
            : "Tango, Memory, Crowns and more. Five new puzzles a day, 100 stages of each, calibrated to your level."}
        </div>

        {/* preview pictogram */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 24,
        }}>
          {[
            { label: "Tango",  ic: <SunMoonIcon t={t}/> },
            { label: "Memory", ic: <CardsIcon t={t}/> },
            { label: "Crowns", ic: <CrownIcon t={t}/> },
          ].map(g => (
            <div key={g.label} style={{
              padding: "16px 8px",
              background: t.surface, borderRadius: t.radiusSm,
              border: `1px solid ${t.border}`,
              boxShadow: isPaper ? "1.5px 1.5px 0 #1A1714" : "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              {g.ic}
              <div style={{
                fontFamily: isPaper ? AF.F_TYPER : t.sans, fontSize: 10,
                fontWeight: 700, letterSpacing: isPaper ? 1.2 : 0.3, color: t.ink2,
              }}>{g.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <PrimaryBtn theme={theme} full>
          {isPaper ? "BEGIN TODAY'S EDITION" : "Start playing — free"}
        </PrimaryBtn>
        <div style={{ textAlign: "center", fontSize: 11, color: t.ink4, marginTop: 12 }}>
          {isPaper ? "No subscription required to begin." : "No card. No subscription. Just puzzles."}
        </div>
      </div>

      {/* footer */}
      <div style={{ padding: "20px 24px", borderTop: `1px solid ${t.hair}`, display: "flex", justifyContent: "space-between", fontSize: 10, color: t.ink4 }}>
        <span>3.2M daily players</span>
        <span style={{ fontFamily: t.mono }}>v 1.0</span>
      </div>
    </div>
  );
}

function SunMoonIcon({ t }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24">
      <circle cx="9" cy="12" r="4.5" fill="#F59E0B"/>
      <path d="M18 6a6 6 0 0 0 0 12 6 6 0 0 1 0-12z" fill={t.accent}/>
    </svg>
  );
}
function CardsIcon({ t }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24">
      <rect x="4" y="5" width="7" height="14" rx="1.4" fill={t.accent2} opacity="0.85"/>
      <rect x="13" y="5" width="7" height="14" rx="1.4" fill={t.accent}/>
    </svg>
  );
}
function CrownIcon({ t }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24">
      <path d="M3.2 9.2l3 8.2h11.6l3-8.2-4.6 3.4-3.2-6.4-2 4-2-4-3.2 6.4z" fill={t.accent}/>
      <rect x="6" y="18" width="12" height="2.4" fill={t.accent}/>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ONBOARDING (representative step: "what's your aim?")
// ════════════════════════════════════════════════════════════════════════════

function OnboardingScreen({ theme, step = 2 }) {
  const t = T_[theme];
  const isPaper = theme === "paper";
  const options = [
    { id:"sharpen", label:"Sharpen daily",     sub:"5 min · core puzzles" },
    { id:"climb",   label:"Climb the ranks",   sub:"Long sessions · medaled solves" },
    { id:"calm",    label:"Wind down at night", sub:"Quiet game · no streak pressure" },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* progress */}
      <div style={{ padding: "0 24px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Pill theme={theme}>{`STEP ${step} / 4`}</Pill>
          <button style={{
            background: "transparent", border: "none", color: t.ink3,
            fontFamily: t.sans, fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>Skip</button>
        </div>
        <div style={{ height: 3, background: t.hair, borderRadius: 99, position: "relative", overflow: "hidden" }}>
          <div style={{
            width: `${step * 25}%`, height: "100%",
            background: theme === "paper" ? t.ink : `linear-gradient(90deg, ${t.accent}, ${t.accent2})`,
            borderRadius: 99,
          }}/>
        </div>
      </div>

      {/* prompt */}
      <div style={{ padding: "24px 24px 16px" }}>
        <div style={{
          fontFamily: t.serif, fontSize: 28, fontWeight: 600,
          color: t.ink, letterSpacing: -0.6, lineHeight: 1.1, marginBottom: 10,
        }}>What brings you here?</div>
        <div style={{ fontSize: 13, color: t.ink3, lineHeight: 1.5 }}>
          {isPaper ? "Pray, choose one. We shall calibrate." : "Pick one. We'll calibrate your daily set."}
        </div>
      </div>

      {/* options */}
      <div style={{ padding: "0 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((o, i) => {
          const isSel = i === 0;
          return (
            <button key={o.id} style={{
              textAlign: "left", padding: "16px 16px",
              background: isSel ? (isPaper?t.surface:theme==="dark"?"rgba(168,85,247,0.14)":"#fff") : t.surfaceAlt,
              border: `${isSel?2:1}px solid ${isSel?t.accent:t.border}`,
              borderRadius: t.radius,
              cursor: "pointer", fontFamily: t.sans,
              boxShadow: isSel ? (isPaper?"3px 3px 0 #1A1714":t.boost) : "none",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 99,
                background: isSel?t.accent:"transparent",
                border: `1.5px solid ${isSel?t.accent:t.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isSel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isPaper?"#FFFCF1":theme==="dark"?"#0E0C18":"#fff"} strokeWidth="4"><path d="M5 13l4 4L19 7"/></svg>}
              </div>
              <div>
                <div style={{ fontFamily: t.serif, fontSize: 16, fontWeight: 600, color: t.ink, letterSpacing: -0.2 }}>{o.label}</div>
                <div style={{ fontSize: 11.5, color: t.ink3, marginTop: 2 }}>{o.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }}/>

      <div style={{ padding: "0 24px 24px", display: "flex", gap: 10 }}>
        <GhostBtn theme={theme}>Back</GhostBtn>
        <div style={{ flex: 1 }}><PrimaryBtn theme={theme} full>Continue →</PrimaryBtn></div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// HOME / GAMES HUB
// ════════════════════════════════════════════════════════════════════════════

function HomeScreen({ theme }) {
  const t = T_[theme];
  const isPaper = theme === "paper";
  const games = [
    { name: "Tango",  desc: "Balance suns & moons",  cleared: 23, total: 100, free: true,  ic: <SunMoonIcon t={t}/> },
    { name: "Memory", desc: "Find the pairs",         cleared: 11, total: 100, free: true,  ic: <CardsIcon t={t}/> },
    { name: "Crowns", desc: "One crown per region",   cleared: 8,  total: 100, free: true,  ic: <CrownIcon t={t}/> },
    { name: "Sudoku", desc: "No repeats",             cleared: 0,  total: 100, free: false, ic: <SudokuIcon t={t}/> },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* nav */}
      <div style={{ padding: "0 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Wordmark theme={theme} size={18}/>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Pill theme={theme} accent>847 XP</Pill>
          <div style={{ width: 30, height: 30, borderRadius: isPaper?0:99, background: t.surface, border: `1px solid ${t.border}`,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: t.ink2 }}>YK</span>
          </div>
        </div>
      </div>

      {/* greeting */}
      <div style={{ padding: "8px 24px 18px" }}>
        <div style={{ fontFamily: t.label, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, color: t.ink3, textTransform: "uppercase", marginBottom: 4 }}>
          MONDAY · MAY 25
        </div>
        <div style={{ fontFamily: t.serif, fontSize: 26, fontWeight: 600, color: t.ink, letterSpacing: -0.5, lineHeight: 1.05 }}>
          {isPaper ? "Good morning, Yael." : "Welcome back, Yael."}
        </div>
        <div style={{ fontSize: 12, color: t.ink3, marginTop: 4 }}>
          Streak <strong style={{ color: t.ink }}>14 days</strong> · today's set, 5 stages.
        </div>
      </div>

      {/* daily challenge banner */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{
          background: isPaper ? "#1A1714" : `linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
          borderRadius: t.radius, padding: 16,
          color: isPaper ? "#FFFCF1" : "#fff",
          border: isPaper ? `1.5px solid #1A1714` : "none",
          boxShadow: isPaper ? "3px 3px 0 #1A1714" : (theme==="dark"?"0 12px 30px rgba(168,85,247,0.4)":"0 12px 30px rgba(156,107,232,0.3)"),
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: isPaper?0:12,
            background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 22 }}>{isPaper?"★":"⚡"}</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: isPaper ? AF.F_TYPER : t.sans, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, opacity: 0.85 }}>
              DAILY CHALLENGE · 2× XP
            </div>
            <div style={{ fontFamily: t.serif, fontSize: 17, fontWeight: 700, letterSpacing: -0.2, marginTop: 2 }}>
              Hard Tango · 6×6
            </div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 600 }}>→</span>
        </div>
      </div>

      {/* games list */}
      <div style={{ padding: "0 24px", flex: 1, overflow: "auto" }}>
        <div style={{ fontFamily: t.label, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, color: t.ink3, textTransform: "uppercase", marginBottom: 10 }}>
          ALL GAMES
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {games.map(g => {
            const pct = g.cleared / g.total;
            return (
              <div key={g.name} style={{
                background: t.surface, borderRadius: t.radius,
                border: `1px solid ${t.border}`, padding: 14,
                display: "flex", alignItems: "center", gap: 14,
                boxShadow: isPaper && g.free ? "1.5px 1.5px 0 #1A1714" : "none",
                opacity: g.free ? 1 : 0.7,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: isPaper?0:10,
                  background: t.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center",
                  border: isPaper?`1px solid ${t.border}`:"none",
                }}>
                  {g.ic}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontFamily: t.serif, fontSize: 17, fontWeight: 600, color: t.ink, letterSpacing: -0.2 }}>{g.name}</div>
                    {!g.free && <span style={{ fontFamily: t.label, fontSize: 8.5, fontWeight: 700, letterSpacing: 1, color: t.warn, border: `1px solid ${t.warn}`, padding: "1px 5px", borderRadius: isPaper?0:99 }}>PRO</span>}
                  </div>
                  <div style={{ fontSize: 11, color: t.ink3, marginTop: 2 }}>{g.desc}</div>
                  <div style={{ marginTop: 8, height: 3, background: t.hair, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: `${pct*100}%`, height: "100%", background: g.free ? t.accent : t.ink4, borderRadius: 99 }}/>
                  </div>
                </div>
                <div style={{ fontFamily: t.mono, fontSize: 11, color: t.ink2, fontWeight: 700, minWidth: 38, textAlign: "right" }}>
                  {g.cleared}/{g.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* bottom nav */}
      <BottomNav theme={theme} active="home"/>
    </div>
  );
}

function SudokuIcon({ t }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" fill="none" stroke={t.ink3} strokeWidth="1.4"/>
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" stroke={t.ink3} strokeWidth="1"/>
    </svg>
  );
}

function BottomNav({ theme, active }) {
  const t = T_[theme];
  const items = [
    { id:"home",   label:"Games",   ic:"⌂" },
    { id:"map",    label:"Map",     ic:"⌖" },
    { id:"board",  label:"League",  ic:"♚" },
    { id:"me",     label:"You",     ic:"●" },
  ];
  return (
    <div style={{
      borderTop: `1px solid ${t.hair}`,
      background: t.surface,
      display: "flex", padding: "10px 0 16px",
    }}>
      {items.map(it => {
        const isActive = it.id === active;
        return (
          <button key={it.id} style={{
            flex: 1, background: "transparent", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            color: isActive ? t.accent : t.ink4,
          }}>
            <span style={{ fontSize: 16 }}>{it.ic}</span>
            <span style={{ fontFamily: t.label, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COMPLETE — stage cleared
// ════════════════════════════════════════════════════════════════════════════

function CompleteScreen({ theme }) {
  const t = T_[theme];
  const isPaper = theme === "paper";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "20px 0" }}>
      <div style={{ padding: "0 24px 16px" }}>
        <Pill theme={theme} accent>STAGE 24 · TANGO</Pill>
      </div>

      <div style={{ padding: "12px 24px 8px" }}>
        <div style={{
          fontFamily: t.serif, fontSize: 32, fontWeight: 600,
          color: t.ink, letterSpacing: -0.8, lineHeight: 1.05,
        }}>
          {isPaper ? "Cleared." : "Stage cleared."}
        </div>
        <div style={{ fontSize: 13, color: t.ink3, marginTop: 6 }}>
          {isPaper ? "An admirable solve." : "Well played."}
        </div>
      </div>

      {/* stats */}
      <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[
          { label:"TIME",  v:"1:47", c:t.ink },
          { label:"XP",    v:"+120", c:t.accent },
          { label:"HINTS", v:"0",    c:t.success },
        ].map(s => (
          <div key={s.label} style={{
            background: t.surface, borderRadius: t.radius,
            border: `1px solid ${t.border}`, padding: "14px 10px", textAlign: "center",
            boxShadow: isPaper ? "1.5px 1.5px 0 #1A1714" : "none",
          }}>
            <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 700, color: s.c, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontFamily: t.label, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: t.ink3, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* medal */}
      <div style={{ padding: "0 24px 22px" }}>
        <Card theme={theme}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: isPaper?0:14,
              background: isPaper ? "#FFCFA8" : `linear-gradient(135deg, ${t.warn}, ${t.accent})`,
              border: isPaper ? `1.5px solid #1A1714` : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: isPaper ? "1.5px 1.5px 0 #1A1714" : `0 8px 20px ${t.warn}55`,
            }}>
              <span style={{ fontSize: 26, color: isPaper?"#1A1714":"#fff" }}>★</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.serif, fontSize: 16, fontWeight: 600, color: t.ink, letterSpacing: -0.2 }}>Gold medal earned</div>
              <div style={{ fontSize: 11.5, color: t.ink3, marginTop: 2, lineHeight: 1.4 }}>
                No hints, under 2 minutes. Your 7th gold this week.
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* next */}
      <div style={{ padding: "0 24px" }}>
        <div style={{ fontFamily: t.label, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, color: t.ink3, textTransform: "uppercase", marginBottom: 10 }}>
          UP NEXT
        </div>
        <Card theme={theme} pad={14}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: isPaper?0:99,
              background: t.surfaceAlt, border: `${isPaper?1:1.5}px solid ${isPaper?t.border:t.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: t.mono, fontSize: 13, fontWeight: 700, color: t.accent,
            }}>25</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.serif, fontSize: 14, fontWeight: 600, color: t.ink }}>Stage 25 · Tango</div>
              <div style={{ fontSize: 11, color: t.ink3, marginTop: 2 }}>Medium · +100 XP</div>
            </div>
            <span style={{ fontSize: 18, color: t.ink3 }}>→</span>
          </div>
        </Card>
      </div>

      <div style={{ flex: 1 }}/>

      <div style={{ padding: "20px 24px 0", display: "flex", gap: 10 }}>
        <GhostBtn theme={theme}>Map</GhostBtn>
        <div style={{ flex: 1 }}><PrimaryBtn theme={theme} full>Play stage 25 →</PrimaryBtn></div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAYWALL
// ════════════════════════════════════════════════════════════════════════════

function PaywallScreen({ theme }) {
  const t = T_[theme];
  const isPaper = theme === "paper";
  const benefits = [
    { ic: "★",  label: "All 24 games unlocked",       sub: "Sudoku, Kakuro, Bridges and more" },
    { ic: "∞",  label: "Unlimited daily solves",      sub: "Stop the 3-hard-stages-per-day cap" },
    { ic: "✦",  label: "Free hints, no ads",          sub: "Solve at your own pace" },
    { ic: "▲",  label: "Themed Memory decks",         sub: "Galaxies · Fruit · Almanac · more" },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "0 20px 6px", display: "flex", justifyContent: "flex-end" }}>
        <button style={{ background: "transparent", border: "none", color: t.ink3, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✕</button>
      </div>

      <div style={{ padding: "12px 24px 16px" }}>
        <Pill theme={theme} accent>{isPaper ? "PREMIUM SUBSCRIPTION" : "Mind Element +"}</Pill>
        <div style={{
          fontFamily: t.serif, fontSize: 30, fontWeight: 600,
          color: t.ink, letterSpacing: -0.7, lineHeight: 1.05, marginTop: 12, marginBottom: 8,
        }}>
          {isPaper ? "All 24 puzzles." : "Unlock the full collection."}
        </div>
        <div style={{ fontSize: 13, color: t.ink3, lineHeight: 1.5 }}>
          {isPaper ? "By subscription. Delivered daily." : "All games. No ads. Unlimited hints."}
        </div>
      </div>

      {/* benefits */}
      <div style={{ padding: "0 24px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {benefits.map((b, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{
              width: 30, height: 30, borderRadius: isPaper?0:99,
              background: isPaper?t.surface:t.pillBg,
              border: isPaper?`1px solid ${t.border}`:"none",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: isPaper?t.ink:t.pillInk, fontWeight: 700, fontSize: 14,
            }}>{b.ic}</div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>{b.label}</div>
              <div style={{ fontSize: 11, color: t.ink3, marginTop: 2 }}>{b.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* plans */}
      <div style={{ padding: "0 24px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        <PlanCard theme={theme} title="Yearly" price="$3.33/mo" sub="billed annually · $40" save="SAVE 60%" selected/>
        <PlanCard theme={theme} title="Monthly" price="$7.99/mo" sub="cancel anytime"/>
      </div>

      <div style={{ flex: 1 }}/>

      <div style={{ padding: "12px 24px 24px" }}>
        <PrimaryBtn theme={theme} full>
          {isPaper ? "SUBSCRIBE — 7 DAYS FREE" : "Start 7-day free trial"}
        </PrimaryBtn>
        <div style={{ textAlign: "center", fontSize: 10, color: t.ink4, marginTop: 10 }}>
          Restore purchase · Privacy · Terms
        </div>
      </div>
    </div>
  );
}

function PlanCard({ theme, title, price, sub, save, selected }) {
  const t = T_[theme];
  const isPaper = theme === "paper";
  return (
    <div style={{
      padding: 14, borderRadius: t.radius,
      background: selected ? (isPaper?t.surface:theme==="dark"?"rgba(168,85,247,0.12)":t.surface) : t.surfaceAlt,
      border: `${selected?2:1}px solid ${selected?t.accent:t.border}`,
      boxShadow: selected ? (isPaper?"3px 3px 0 #1A1714":t.boost) : "none",
      display: "flex", alignItems: "center", gap: 12, position: "relative",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 99,
        background: selected?t.accent:"transparent",
        border: `1.5px solid ${selected?t.accent:t.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isPaper?"#FFFCF1":theme==="dark"?"#0E0C18":"#fff"} strokeWidth="4"><path d="M5 13l4 4L19 7"/></svg>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontFamily: t.serif, fontSize: 15, fontWeight: 600, color: t.ink }}>{title}</div>
          {save && <span style={{
            fontFamily: t.label, fontSize: 8.5, fontWeight: 700, letterSpacing: 1,
            padding: "1.5px 6px", borderRadius: isPaper?0:99,
            background: isPaper?"#FFCFA8":t.warn+"20", color: isPaper?"#1A1714":t.warn,
            border: isPaper?"1px solid #1A1714":"none",
          }}>{save}</span>}
        </div>
        <div style={{ fontSize: 11, color: t.ink3, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ fontFamily: t.mono, fontSize: 13, fontWeight: 700, color: t.ink }}>{price}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LEADERBOARD
// ════════════════════════════════════════════════════════════════════════════

function LeaderboardScreen({ theme }) {
  const t = T_[theme];
  const isPaper = theme === "paper";
  const rows = [
    { rank: 1, name: "K. Yamamoto",   xp: 14201, you: false, medal: "★" },
    { rank: 2, name: "M. Ashbel",     xp: 12340, you: false, medal: "▲" },
    { rank: 3, name: "L. Cohen",      xp: 11890, you: false, medal: "●" },
    { rank: 4, name: "Yael (you)",    xp: 10470, you: true },
    { rank: 5, name: "T. Park",       xp:  9920, you: false },
    { rank: 6, name: "R. Singh",      xp:  9400, you: false },
    { rank: 7, name: "A. Salinas",    xp:  8810, you: false },
    { rank: 8, name: "P. Müller",     xp:  8205, you: false },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "0 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Wordmark theme={theme} size={17}/>
        <Pill theme={theme} accent>SEASON 4</Pill>
      </div>

      <div style={{ padding: "8px 24px 8px" }}>
        <div style={{ fontFamily: t.serif, fontSize: 26, fontWeight: 600, color: t.ink, letterSpacing: -0.5 }}>
          League
        </div>
        <div style={{ fontSize: 12, color: t.ink3, marginTop: 2 }}>
          {isPaper ? "Standings, as of Monday." : "Top 5 promote on Sunday."}
        </div>
      </div>

      {/* tabs */}
      <div style={{ padding: "10px 24px", display: "flex", gap: 6 }}>
        {["Weekly", "All time", "Friends"].map((tab, i) => (
          <div key={tab} style={{
            padding: "6px 12px", borderRadius: isPaper?0:99,
            background: i===0 ? (isPaper?t.ink:t.pillBg) : "transparent",
            color: i===0 ? (isPaper?"#FFFCF1":t.pillInk) : t.ink3,
            border: i===0 && isPaper ? "1px solid #1A1714" : "none",
            fontFamily: t.sans, fontSize: 11.5, fontWeight: 600, cursor: "pointer",
          }}>{tab}</div>
        ))}
      </div>

      {/* podium */}
      <div style={{ padding: "12px 24px 4px", display: "flex", justifyContent: "space-around", alignItems: "flex-end", gap: 6 }}>
        {[
          { rank: 2, name: "Ashbel", xp: "12.3k", h: 56 },
          { rank: 1, name: "Yamamoto", xp: "14.2k", h: 76 },
          { rank: 3, name: "Cohen", xp: "11.9k", h: 44 },
        ].map(p => (
          <div key={p.rank} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: 38, height: 38, borderRadius: 99,
              background: t.surface, border: `2px solid ${p.rank===1?t.warn:p.rank===2?t.ink3:t.ink4}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: t.label, fontSize: 12, fontWeight: 700, color: t.ink2,
              marginBottom: 6,
              boxShadow: p.rank === 1 ? (isPaper?"1.5px 1.5px 0 #1A1714":`0 0 12px ${t.warn}50`) : "none",
            }}>{p.name[0]}</div>
            <div style={{ fontFamily: t.serif, fontSize: 11.5, fontWeight: 600, color: t.ink, textAlign: "center", marginBottom: 2 }}>{p.name}</div>
            <div style={{ fontFamily: t.mono, fontSize: 10, color: t.ink3, marginBottom: 4 }}>{p.xp}</div>
            <div style={{
              width: "100%", height: p.h,
              background: p.rank===1
                ? (isPaper?"#FFCFA8":`linear-gradient(180deg, ${t.warn}, ${t.warn}80)`)
                : p.rank===2
                  ? (isPaper?"#E8DCBA":t.surfaceHi)
                  : (isPaper?"#D4B896":t.surfaceAlt),
              borderTop: `1.5px solid ${t.border}`,
              border: isPaper?`1px solid ${t.border}`:"none",
              borderRadius: isPaper?0:"8px 8px 0 0",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: t.label, fontSize: 16, fontWeight: 800,
              color: p.rank===1?(isPaper?"#1A1714":"#fff"):t.ink,
            }}>{p.rank}</div>
          </div>
        ))}
      </div>

      {/* list */}
      <div style={{ padding: "16px 24px 0", flex: 1, overflow: "auto" }}>
        {rows.slice(3).map(r => (
          <div key={r.rank} style={{
            padding: "10px 12px", display: "flex", alignItems: "center", gap: 12,
            background: r.you ? (isPaper?t.surface:t.pillBg) : "transparent",
            border: r.you ? `1.5px solid ${t.accent}` : `1px solid transparent`,
            borderRadius: t.radiusSm, marginBottom: 6,
            boxShadow: r.you && isPaper ? "1.5px 1.5px 0 #1A1714" : "none",
          }}>
            <div style={{ fontFamily: t.mono, fontSize: 11, fontWeight: 700, color: t.ink3, width: 20 }}>{r.rank}</div>
            <div style={{
              width: 28, height: 28, borderRadius: 99,
              background: t.surface, border: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: t.ink2,
            }}>{r.name[0]}</div>
            <div style={{ flex: 1, fontFamily: t.sans, fontSize: 13, fontWeight: r.you?700:500, color: t.ink }}>{r.name}</div>
            <div style={{ fontFamily: t.mono, fontSize: 11.5, fontWeight: 700, color: t.ink2 }}>{r.xp.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <BottomNav theme={theme} active="board"/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PROFILE
// ════════════════════════════════════════════════════════════════════════════

function ProfileScreen({ theme }) {
  const t = T_[theme];
  const isPaper = theme === "paper";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "0 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: t.serif, fontSize: 20, fontWeight: 600, color: t.ink, letterSpacing: -0.3 }}>You</div>
        <button style={{ background: "transparent", border: "none", cursor: "pointer", color: t.ink2, fontSize: 16 }}>⚙</button>
      </div>

      {/* identity */}
      <div style={{ padding: "8px 24px 18px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: isPaper?0:99,
          background: isPaper?"#FFCFA8":`linear-gradient(135deg, ${t.accent}, ${t.accent2})`,
          border: isPaper?"1.5px solid #1A1714":"none",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: t.serif, fontSize: 22, fontWeight: 700, color: isPaper?"#1A1714":"#fff",
          boxShadow: isPaper?"2px 2px 0 #1A1714":`0 6px 18px ${t.accent}40`,
        }}>YK</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: t.serif, fontSize: 20, fontWeight: 600, color: t.ink, letterSpacing: -0.3 }}>Yael K.</div>
          <div style={{ fontSize: 11, color: t.ink3, marginTop: 2 }}>Joined Jan 2026 · Tel Aviv</div>
        </div>
      </div>

      {/* big stats */}
      <div style={{ padding: "0 24px 18px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[
          { label:"STAGES", v:"42" },
          { label:"STREAK", v:"14d" },
          { label:"GOLDS",  v:"27" },
        ].map(s => (
          <div key={s.label} style={{
            background: t.surface, borderRadius: t.radius, padding: "14px 8px",
            border: `1px solid ${t.border}`, textAlign: "center",
            boxShadow: isPaper?"1.5px 1.5px 0 #1A1714":"none",
          }}>
            <div style={{ fontFamily: t.serif, fontSize: 22, fontWeight: 700, color: t.ink, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontFamily: t.label, fontSize: 9, fontWeight: 700, letterSpacing: 1, color: t.ink3, marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* xp ring */}
      <div style={{ padding: "0 24px 18px" }}>
        <Card theme={theme}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 64, height: 64, position: "relative",
            }}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke={t.hair} strokeWidth="5"/>
                <circle cx="32" cy="32" r="26" fill="none" stroke={t.accent} strokeWidth="5"
                  strokeDasharray={`${0.68 * 163} 163`} strokeLinecap="round"
                  transform="rotate(-90 32 32)"/>
              </svg>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: t.serif, fontSize: 14, fontWeight: 700, color: t.ink,
              }}>L8</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.label, fontSize: 9.5, fontWeight: 700, letterSpacing: 1, color: t.ink3 }}>LEVEL · XP</div>
              <div style={{ fontFamily: t.serif, fontSize: 18, fontWeight: 600, color: t.ink, letterSpacing: -0.2, marginTop: 2 }}>
                10,470 / 14,000
              </div>
              <div style={{ fontSize: 11, color: t.ink3, marginTop: 2 }}>3,530 XP to level 9</div>
            </div>
          </div>
        </Card>
      </div>

      {/* settings list */}
      <div style={{ padding: "0 24px", flex: 1, overflow: "auto" }}>
        <div style={{ fontFamily: t.label, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.4, color: t.ink3, textTransform: "uppercase", marginBottom: 10 }}>
          SETTINGS
        </div>
        <div style={{ background: t.surface, borderRadius: t.radius, border: `1px solid ${t.border}`, overflow: "hidden",
          boxShadow: isPaper?"1.5px 1.5px 0 #1A1714":"none" }}>
          {[
            { label: "Difficulty progression", value: "Mixed" },
            { label: "Screen view",            value: theme === "dark" ? "Dark cosmic" : theme === "paper" ? "Paper" : "Light" },
            { label: "Stage map style",         value: "The Ascent" },
            { label: "Notifications",           value: "Daily 8am" },
            { label: "Sign out",                value: null },
          ].map((s, i, all) => (
            <div key={s.label} style={{
              padding: "12px 14px",
              borderBottom: i < all.length - 1 ? `0.5px solid ${t.hair}` : "none",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div style={{ fontSize: 13, color: t.ink2 }}>{s.label}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {s.value && <div style={{ fontSize: 11.5, color: t.ink3, fontFamily: t.sans }}>{s.value}</div>}
                <span style={{ fontSize: 14, color: t.ink4 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav theme={theme} active="me"/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Export
// ════════════════════════════════════════════════════════════════════════════

window.ApvScreens = {
  Landing:      (p) => <LandingScreen theme={p.theme}/>,
  Onboarding:   (p) => <OnboardingScreen theme={p.theme} step={p.step}/>,
  Home:         (p) => <HomeScreen theme={p.theme}/>,
  Complete:     (p) => <CompleteScreen theme={p.theme}/>,
  Paywall:      (p) => <PaywallScreen theme={p.theme}/>,
  Leaderboard:  (p) => <LeaderboardScreen theme={p.theme}/>,
  Profile:      (p) => <ProfileScreen theme={p.theme}/>,
};
