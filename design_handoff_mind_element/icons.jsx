/* icons.jsx — Mind Element line-icon set. Geometric stroke icons, no emoji.
   <Icon name="flame" size={18} color="#fff" stroke={2} />
   Exports to window: Icon, ICON_NAMES. */

const ICON_PATHS = {
  // navigation
  chevronRight: 'M9 6l6 6-6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  arrowLeft: 'M19 12H5M11 6l-6 6 6 6',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
  play: 'M7 5l12 7-12 7z',
  // rewards / gamification (stroke-friendly)
  flame: 'M12 3c1 3-2 4-2 7a2 2 0 104 0c0-1 0-2-1-3 2 1 4 3 4 6a5 5 0 11-10 0c0-4 4-5 5-10z',
  trophy: 'M7 4h10v3a5 5 0 01-10 0V4zM7 6H4v1a3 3 0 003 3M17 6h3v1a3 3 0 01-3 3M9 14h6M10 14v4M14 14v4M8 20h8',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  medal: 'M8 3l4 6 4-6M9 3h6M12 9a6 6 0 100 12 6 6 0 000-12zM12 13l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z',
  crown: 'M4 8l3 9h10l3-9-5 4-3-6-3 6z',
  bolt: 'M13 3L5 13h6l-1 8 8-10h-6z',
  target: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8zM12 11a1 1 0 100 2 1 1 0 000-2z',
  clock: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2',
  check: 'M5 13l4 4L19 7',
  checkCircle: 'M12 3a9 9 0 100 18 9 9 0 000-18zM8 12l3 3 5-5',
  share: 'M16 6l-4-3-4 3M12 3v12M5 12v6a1 1 0 001 1h12a1 1 0 001-1v-6',
  lock: 'M7 10V8a5 5 0 0110 0v2M5 10h14v9a1 1 0 01-1 1H6a1 1 0 01-1-1z',
  users: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM3 20c0-3.3 2.7-5 6-5s6 1.7 6 5M16 4a3.5 3.5 0 010 7M18 15c2 .5 3 2 3 5',
  lightbulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.6.6 1 1.3 1 2.5h6c0-1.2.4-1.9 1-2.5A6 6 0 0012 3z',
  undo: 'M9 7L4 12l5 5M4 12h11a5 5 0 010 10',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  calendar: 'M5 5h14v15H5zM5 9h14M9 3v4M15 3v4',
  gift: 'M4 11h16v9H4zM4 8h16v3H4zM12 8v12M12 8C9 8 7 4 12 4c5 0 3 4 0 4z',
  chart: 'M5 19V9M10 19V5M15 19v-7M20 19v-4',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18',
  settings: 'M12 9a3 3 0 100 6 3 3 0 000-6zM12 2v3M12 19v3M5 5l2 2M17 17l2 2M2 12h3M19 12h3M5 19l2-2M17 7l2-2',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM5 21c0-3.5 3-6 7-6s7 2.5 7 6',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z',
};
const ICON_NAMES = Object.keys(ICON_PATHS);

function Icon({ name, size = 20, color = 'currentColor', stroke = 2, fill = 'none', style }) {
  const d = ICON_PATHS[name] || ICON_PATHS.spark;
  // 'play' and 'star' read better filled
  const filled = fill === 'currentColor' || fill === true;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}
      stroke={filled ? 'none' : color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}>
      <path d={d} />
    </svg>
  );
}

Object.assign(window, { Icon, ICON_NAMES, ICON_PATHS });
