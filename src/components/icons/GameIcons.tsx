type IconProps = { size?: number; className?: string };

export function SunIcon({ size = 32, className = "" }: IconProps) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.26;
  const inner = size * 0.35, outer = size * 0.47;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" className={className}>
      <defs>
        <radialGradient id={`sun-${size}`} cx="40%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FDE68A"/>
          <stop offset="100%" stopColor="#F59E0B"/>
        </radialGradient>
      </defs>
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <line key={i}
            x1={cx + Math.cos(rad)*inner} y1={cy + Math.sin(rad)*inner}
            x2={cx + Math.cos(rad)*outer} y2={cy + Math.sin(rad)*outer}
            stroke="#F59E0B" strokeWidth={size*0.065} strokeLinecap="round"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r} fill={`url(#sun-${size})`}/>
      <circle cx={cx - r*0.28} cy={cy - r*0.28} r={r*0.27} fill="rgba(255,255,255,0.3)"/>
    </svg>
  );
}

// Solid filled crescent — bold, premium, no stars
export function MoonIcon({ size = 32, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <radialGradient id={`moon-${size}`} cx="28%" cy="22%" r="78%">
          <stop offset="0%" stopColor="#A78BFA"/>
          <stop offset="100%" stopColor="#6D28D9"/>
        </radialGradient>
      </defs>
      <path
        d="M16 4C9.373 4 4 9.373 4 16C4 22.627 9.373 28 16 28C19.4 28 22.47 26.6 24.65 24.33C23.23 24.77 21.7 25 20.1 25C13.815 25 8.7 19.885 8.7 13.6C8.7 10.32 10.12 7.37 12.38 5.33C13.5 4.48 14.7 4 16 4Z"
        fill={`url(#moon-${size})`}
      />
    </svg>
  );
}

export function TangoGameIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <radialGradient id="tg-sun" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FDE68A"/><stop offset="100%" stopColor="#F59E0B"/>
        </radialGradient>
        <radialGradient id="tg-moon" cx="28%" cy="22%" r="78%">
          <stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#6D28D9"/>
        </radialGradient>
        <clipPath id="tg-l"><rect x="0" y="0" width="20" height="40"/></clipPath>
        <clipPath id="tg-r"><rect x="20" y="0" width="20" height="40"/></clipPath>
      </defs>
      {[0,60,120,180,240,300].map((angle,i) => (
        <line key={i}
          x1={13+Math.cos((angle*Math.PI)/180)*8} y1={20+Math.sin((angle*Math.PI)/180)*8}
          x2={13+Math.cos((angle*Math.PI)/180)*11} y2={20+Math.sin((angle*Math.PI)/180)*11}
          stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" clipPath="url(#tg-l)"
        />
      ))}
      <circle cx="13" cy="20" r="6" fill="url(#tg-sun)" clipPath="url(#tg-l)"/>
      <path d="M26 11C21.58 11 18 14.58 18 19C18 23.42 21.58 27 26 27C27.6 27 29.08 26.52 30.3 25.7C29.28 26.14 28.16 26.38 27 26.38C22.58 26.38 19 22.8 19 18.38C19 14.82 21.26 11.82 24.44 10.7C24.96 10.52 25.48 10.42 26 10.42V11Z"
        fill="url(#tg-moon)" clipPath="url(#tg-r)"/>
      <line x1="20" y1="7" x2="20" y2="33" stroke="white" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5"/>
    </svg>
  );
}

export function MemoryGameIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="mg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7"/><stop offset="100%" stopColor="#059669"/>
        </linearGradient>
        <linearGradient id="mg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD"/><stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
      </defs>
      <rect x="5" y="10" width="20" height="26" rx="4" fill="url(#mg1)" opacity="0.9"/>
      <rect x="15" y="6" width="20" height="26" rx="4" fill="url(#mg2)"/>
      <circle cx="25" cy="19" r="4" fill="rgba(255,255,255,0.25)"/>
      <circle cx="25" cy="19" r="2" fill="rgba(255,255,255,0.55)"/>
    </svg>
  );
}

export function QueensGameIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="qg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A"/><stop offset="100%" stopColor="#D97706"/>
        </linearGradient>
      </defs>
      <path d="M8 28H32V32H8V28Z" fill="url(#qg)"/>
      <path d="M8 28L10 16L16 22L20 10L24 22L30 16L32 28H8Z" fill="url(#qg)"/>
      <circle cx="20" cy="12" r="2.5" fill="#F472B6"/>
      <circle cx="10.5" cy="17" r="1.8" fill="#60A5FA"/>
      <circle cx="29.5" cy="17" r="1.8" fill="#34D399"/>
      <path d="M12 27C16 25 24 25 28 27" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function SudokuGameIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="5" y="5" width="30" height="30" rx="6" fill="#FEE2E2" opacity="0.8"/>
      <rect x="5" y="5" width="30" height="30" rx="6" stroke="#DC2626" strokeWidth="1.5" fill="none"/>
      <line x1="15" y1="6" x2="15" y2="34" stroke="#DC2626" strokeWidth="2.5" opacity="0.7"/>
      <line x1="25" y1="6" x2="25" y2="34" stroke="#DC2626" strokeWidth="2.5" opacity="0.7"/>
      <line x1="6" y1="15" x2="34" y2="15" stroke="#DC2626" strokeWidth="2.5" opacity="0.7"/>
      <line x1="6" y1="25" x2="34" y2="25" stroke="#DC2626" strokeWidth="2.5" opacity="0.7"/>
      <text x="9.5" y="13.5" fontSize="7" fontWeight="700" fill="#DC2626" fontFamily="monospace">4</text>
      <text x="19.5" y="23" fontSize="7" fontWeight="700" fill="#DC2626" fontFamily="monospace">2</text>
      <text x="29" y="32" fontSize="7" fontWeight="700" fill="#DC2626" fontFamily="monospace">7</text>
    </svg>
  );
}

export function ZipGameIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="zg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5EEAD4"/><stop offset="100%" stopColor="#0D9488"/>
        </linearGradient>
      </defs>
      <circle cx="10" cy="10" r="4" fill="url(#zg)"/>
      <circle cx="30" cy="10" r="3" fill="url(#zg)" opacity="0.5"/>
      <circle cx="10" cy="30" r="3" fill="url(#zg)" opacity="0.5"/>
      <circle cx="30" cy="30" r="4" fill="url(#zg)"/>
      <path d="M10 14V20H30V26" stroke="url(#zg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M26 22L30 26L34 22" stroke="url(#zg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function MinesweeperGameIcon({ size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <radialGradient id="mine-g" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FCA5A5"/><stop offset="100%" stopColor="#991B1B"/>
        </radialGradient>
      </defs>
      {[0,45,90,135,180,225,270,315].map((angle,i) => (
        <line key={i}
          x1={20+Math.cos((angle*Math.PI)/180)*9} y1={20+Math.sin((angle*Math.PI)/180)*9}
          x2={20+Math.cos((angle*Math.PI)/180)*14} y2={20+Math.sin((angle*Math.PI)/180)*14}
          stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round"
        />
      ))}
      <circle cx="20" cy="20" r="8" fill="url(#mine-g)"/>
      <circle cx="17" cy="17" r="2.5" fill="rgba(255,255,255,0.35)"/>
    </svg>
  );
}

export function GenericGameIcon({ size=40, emoji, gradFrom, gradTo }: IconProps & { emoji:string; gradFrom:string; gradTo:string }) {
  const id = `gg-${gradFrom.replace("#","")}`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradFrom}/><stop offset="100%" stopColor={gradTo}/>
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill={`url(#${id})`} opacity="0.12"/>
      <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="20">{emoji}</text>
    </svg>
  );
}

export function GameIcon({ slug, size=40 }: { slug:string; size?:number }) {
  switch(slug) {
    case "tango":         return <TangoGameIcon size={size}/>;
    case "memory":        return <MemoryGameIcon size={size}/>;
    case "queens":        return <QueensGameIcon size={size}/>;
    case "sudoku":        return <SudokuGameIcon size={size}/>;
    case "zip":           return <ZipGameIcon size={size}/>;
    case "minesweeper":   return <MinesweeperGameIcon size={size}/>;
    case "patches":       return <GenericGameIcon size={size} emoji="🧩" gradFrom="#FDE68A" gradTo="#F59E0B"/>;
    case "hearts":        return <GenericGameIcon size={size} emoji="♥" gradFrom="#FCA5A5" gradTo="#DC2626"/>;
    case "solitaire":     return <GenericGameIcon size={size} emoji="♠" gradFrom="#94A3B8" gradTo="#1E293B"/>;
    case "word-sling":    return <GenericGameIcon size={size} emoji="📝" gradFrom="#86EFAC" gradTo="#16A34A"/>;
    case "2048-pro":      return <GenericGameIcon size={size} emoji="∑" gradFrom="#6EE7B7" gradTo="#059669"/>;
    case "logic-path":    return <GenericGameIcon size={size} emoji="⌀" gradFrom="#93C5FD" gradTo="#2563EB"/>;
    case "pattern-match": return <GenericGameIcon size={size} emoji="◧" gradFrom="#C4B5FD" gradTo="#7C3AED"/>;
    case "hex-merge":     return <GenericGameIcon size={size} emoji="⬡" gradFrom="#5EEAD4" gradTo="#0D9488"/>;
    case "gravity-sort":  return <GenericGameIcon size={size} emoji="↓" gradFrom="#FCA5A5" gradTo="#C4785A"/>;
    case "bridges":       return <GenericGameIcon size={size} emoji="〓" gradFrom="#FDE68A" gradTo="#D97706"/>;
    case "kakuro":        return <GenericGameIcon size={size} emoji="✛" gradFrom="#A5B4FC" gradTo="#4338CA"/>;
    case "nonogram":      return <GenericGameIcon size={size} emoji="▪" gradFrom="#F9A8D4" gradTo="#DB2777"/>;
    case "flow":          return <GenericGameIcon size={size} emoji="∞" gradFrom="#6EE7B7" gradTo="#059669"/>;
    case "lightup":       return <GenericGameIcon size={size} emoji="◎" gradFrom="#FDE68A" gradTo="#F59E0B"/>;
    default:              return <GenericGameIcon size={size} emoji="🎮" gradFrom="#CBD5E1" gradTo="#64748B"/>;
  }
}
