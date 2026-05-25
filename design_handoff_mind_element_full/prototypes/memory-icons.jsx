// memory-icons.jsx
// A shared library of icons for the Memory game. Each icon renders a unique
// SHAPE and a unique COLOR — easy for players to distinguish at a glance,
// even with reduced color sensitivity.
//
// Themed renderers:
//   - Light  : flat fill with subtle gradient + soft shadow
//   - Dark   : luminous glyph with glow halo
//   - Paper  : single ink color, woodcut-style hatching where helpful
//
// Each icon exports as { id, name, light(size), dark(size), paper(size) }
// All icons are sized via a single `size` argument and rendered into a
// 24×24 viewBox so they scale cleanly.

const MEM_ICON_SET = (() => {
  // --- shared color tokens for the colorful variants ---
  const C = {
    amber:   { fill: "#F59E0B", deep: "#B45309", light: "#FCD34D" },
    rose:    { fill: "#F43F5E", deep: "#9F1239", light: "#FDA4AF" },
    cyan:    { fill: "#06B6D4", deep: "#0E7490", light: "#67E8F9" },
    violet:  { fill: "#A855F7", deep: "#6B21A8", light: "#D8B4FE" },
    pink:    { fill: "#EC4899", deep: "#9D174D", light: "#F9A8D4" },
    gold:    { fill: "#EAB308", deep: "#854D0E", light: "#FDE047" },
    emerald: { fill: "#10B981", deep: "#065F46", light: "#6EE7B7" },
    sky:     { fill: "#3B82F6", deep: "#1E40AF", light: "#93C5FD" },
  };

  // --- shape primitives — return an inner <g> using the given fill ---
  const shapes = {
    star: (col) => (
      <g>
        <path d="M12 2.5l2.4 6.1 6.6.5-5 4.4 1.5 6.5L12 16.6 6.5 20l1.5-6.5-5-4.4 6.6-.5z"
          fill={col.fill} stroke={col.deep} strokeWidth="0.6" strokeLinejoin="round"/>
      </g>
    ),
    heart: (col) => (
      <g>
        <path d="M12 21s-7-4.6-9-9.2C1.5 8 4 4.5 7.5 4.5c2 0 3.4 1.2 4.5 2.6 1.1-1.4 2.5-2.6 4.5-2.6 3.5 0 6 3.5 4.5 7.3-2 4.6-9 9.2-9 9.2z"
          fill={col.fill} stroke={col.deep} strokeWidth="0.6" strokeLinejoin="round"/>
      </g>
    ),
    diamond: (col) => (
      <g>
        <path d="M12 2.5l9 9.5-9 9.5-9-9.5z"
          fill={col.fill} stroke={col.deep} strokeWidth="0.6" strokeLinejoin="round"/>
        <path d="M12 2.5l3 9.5-3 9.5-3-9.5z" fill={col.light} opacity="0.55"/>
      </g>
    ),
    crescent: (col) => (
      <g>
        <path d="M16.5 4.2A9 9 0 1 0 20 16a7 7 0 0 1-3.5-11.8z"
          fill={col.fill} stroke={col.deep} strokeWidth="0.6" strokeLinejoin="round"/>
      </g>
    ),
    flower: (col) => (
      <g>
        <circle cx="12" cy="6"  r="3.5" fill={col.fill} stroke={col.deep} strokeWidth="0.5"/>
        <circle cx="18" cy="12" r="3.5" fill={col.fill} stroke={col.deep} strokeWidth="0.5"/>
        <circle cx="12" cy="18" r="3.5" fill={col.fill} stroke={col.deep} strokeWidth="0.5"/>
        <circle cx="6"  cy="12" r="3.5" fill={col.fill} stroke={col.deep} strokeWidth="0.5"/>
        <circle cx="12" cy="12" r="2.4" fill={col.light}/>
      </g>
    ),
    sun: (col) => (
      <g>
        {[0,45,90,135,180,225,270,315].map(a => {
          const rad = a * Math.PI / 180;
          const x1 = 12 + Math.cos(rad) * 7.2;
          const y1 = 12 + Math.sin(rad) * 7.2;
          const x2 = 12 + Math.cos(rad) * 10.5;
          const y2 = 12 + Math.sin(rad) * 10.5;
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={col.deep} strokeWidth="1.6" strokeLinecap="round"/>;
        })}
        <circle cx="12" cy="12" r="5.5" fill={col.fill} stroke={col.deep} strokeWidth="0.7"/>
      </g>
    ),
    bolt: (col) => (
      <g>
        <path d="M14 2L4 14h6l-2 8L18 9h-6z"
          fill={col.fill} stroke={col.deep} strokeWidth="0.6" strokeLinejoin="round"/>
      </g>
    ),
    drop: (col) => (
      <g>
        <path d="M12 2.5c4 5.5 6.5 9.2 6.5 12.5a6.5 6.5 0 0 1-13 0c0-3.3 2.5-7 6.5-12.5z"
          fill={col.fill} stroke={col.deep} strokeWidth="0.6" strokeLinejoin="round"/>
        <ellipse cx="9.5" cy="11" rx="1.3" ry="2.2" fill={col.light} opacity="0.7"/>
      </g>
    ),
  };

  // --- paper / woodcut primitives — single black ink ---
  const INK = "#1A1714";
  const paperShapes = {
    star: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M12 2.5l2.4 6.1 6.6.5-5 4.4 1.5 6.5L12 16.6 6.5 20l1.5-6.5-5-4.4 6.6-.5z"
          fill={INK}/>
      </svg>
    ),
    heart: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M12 21s-7-4.6-9-9.2C1.5 8 4 4.5 7.5 4.5c2 0 3.4 1.2 4.5 2.6 1.1-1.4 2.5-2.6 4.5-2.6 3.5 0 6 3.5 4.5 7.3-2 4.6-9 9.2-9 9.2z"
          fill={INK}/>
      </svg>
    ),
    diamond: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M12 2.5l9 9.5-9 9.5-9-9.5z" fill="#FFFCF1" stroke={INK} strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M12 2.5l3 9.5-3 9.5M9 12h6" stroke={INK} strokeWidth="0.7" fill="none"/>
      </svg>
    ),
    crescent: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M16.5 4.2A9 9 0 1 0 20 16a7 7 0 0 1-3.5-11.8z" fill={INK}/>
      </svg>
    ),
    flower: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <circle cx="12" cy="6"  r="3.5" fill="none" stroke={INK} strokeWidth="1.4"/>
        <circle cx="18" cy="12" r="3.5" fill="none" stroke={INK} strokeWidth="1.4"/>
        <circle cx="12" cy="18" r="3.5" fill="none" stroke={INK} strokeWidth="1.4"/>
        <circle cx="6"  cy="12" r="3.5" fill="none" stroke={INK} strokeWidth="1.4"/>
        <circle cx="12" cy="12" r="2.4" fill={INK}/>
      </svg>
    ),
    sun: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        {[0,45,90,135,180,225,270,315].map(a => {
          const rad = a * Math.PI / 180;
          const x1 = 12 + Math.cos(rad) * 7.5;
          const y1 = 12 + Math.sin(rad) * 7.5;
          const x2 = 12 + Math.cos(rad) * 11;
          const y2 = 12 + Math.sin(rad) * 11;
          return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth="1.6" strokeLinecap="round"/>;
        })}
        <circle cx="12" cy="12" r="5.5" fill="none" stroke={INK} strokeWidth="1.6"/>
      </svg>
    ),
    bolt: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M14 2L4 14h6l-2 8L18 9h-6z" fill={INK}/>
      </svg>
    ),
    drop: (s) => (
      <svg width={s} height={s} viewBox="0 0 24 24">
        <path d="M12 2.5c4 5.5 6.5 9.2 6.5 12.5a6.5 6.5 0 0 1-13 0c0-3.3 2.5-7 6.5-12.5z"
          fill="#FFFCF1" stroke={INK} strokeWidth="1.4" strokeLinejoin="round"/>
        <path d="M9 9c-1 2-1 4 0 6M11 7c-1.5 2.5-1.5 5.5 0 8" stroke={INK} strokeWidth="0.6" fill="none"/>
      </svg>
    ),
  };

  // --- icon definitions ---
  const defs = [
    { id:"star",     name:"Star",     col: C.amber   },
    { id:"heart",    name:"Heart",    col: C.rose    },
    { id:"diamond",  name:"Diamond",  col: C.cyan    },
    { id:"crescent", name:"Crescent", col: C.violet  },
    { id:"flower",   name:"Flower",   col: C.pink    },
    { id:"sun",      name:"Sun",      col: C.gold    },
    { id:"bolt",     name:"Bolt",     col: C.sky     },
    { id:"drop",     name:"Drop",     col: C.emerald },
  ];

  return defs.map(d => ({
    id: d.id,
    name: d.name,
    color: d.col.fill,
    deep: d.col.deep,
    light: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{
        filter: `drop-shadow(0 1px 0 rgba(0,0,0,0.06))`,
      }}>
        {shapes[d.id](d.col)}
      </svg>
    ),
    dark: (size = 28) => (
      <svg width={size} height={size} viewBox="0 0 24 24" style={{
        filter: `drop-shadow(0 0 6px ${d.col.fill}) drop-shadow(0 0 12px ${d.col.fill}66)`,
      }}>
        {shapes[d.id]({ fill: d.col.light, deep: d.col.fill, light: "#fff" })}
      </svg>
    ),
    paper: (size = 28) => paperShapes[d.id](size),
  }));
})();

window.MEM_ICONS = MEM_ICON_SET;
