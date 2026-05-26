#!/usr/bin/env bash
# fix-tokens.sh — Phase A: MindElement token migration
# Run from the root of the mindstate repository.
# Usage: bash fix-tokens.sh
set -euo pipefail

REPO="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO"

echo "======================================"
echo "  Phase A: MindElement Token Migration"
echo "  Repo: $REPO"
echo "======================================"
echo ""

# ──────────────────────────────────────────
# STEP 1  Replace hardcoded colors
# ──────────────────────────────────────────
echo "→ Step 1: Replacing hardcoded hex colors..."

find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) \
  -exec sed -i.bak \
    -e 's|#4F6EF7|var(--color-accent-primary)|g' \
    -e 's|#9C6BE8|var(--color-accent-primary)|g' \
    -e 's|#22D3EE|var(--color-accent-primary)|g' \
    -e 's|#10F4A0|var(--color-accent-secondary)|g' \
    -e 's|#07070E|var(--color-bg)|g' \
    -e 's|#EF4444|var(--color-error)|g' \
  {} +

echo "  ✓ Hex colors replaced (#121212 left untouched)"

# ──────────────────────────────────────────
# STEP 1b  Replace font references
# ──────────────────────────────────────────
echo "→ Step 1b: Replacing font references..."

find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) \
  -exec sed -i.bak \
    -e 's|"Georgia, serif"|"var(--font-sans)"|g' \
    -e 's|"Georgia,serif"|"var(--font-sans)"|g' \
    -e 's|Georgia, serif|var(--font-sans)|g' \
    -e 's|Georgia,serif|var(--font-sans)|g' \
    -e 's|var(--font-outfit)|var(--font-sans)|g' \
    -e 's|var(--font-fraunces)|var(--font-sans)|g' \
    -e 's|var(--font-mono-var)|var(--font-mono)|g' \
  {} +

echo "  ✓ Font references replaced"
echo "  ⚠  layout.tsx Fraunces/Outfit imports need manual update (see end of script)"

# ──────────────────────────────────────────
# STEP 2  Rename CSS variable references
# ──────────────────────────────────────────
echo "→ Step 2: Renaming CSS variable references..."

# bg2/bg3 must come before --bg to avoid partial matches
find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) \
  -exec sed -i.bak \
    -e 's|var(--bg2)|var(--color-surface-2)|g' \
    -e 's|var(--bg3)|var(--color-surface-2)|g' \
    -e 's|var(--bg)|var(--color-bg)|g' \
    -e 's|var(--surface)|var(--color-surface)|g' \
    -e 's|var(--text1)|var(--color-text-primary)|g' \
    -e 's|var(--text2)|var(--color-text-secondary)|g' \
    -e 's|var(--text3)|var(--color-text-secondary)|g' \
    -e 's|var(--text4)|var(--color-text-secondary)|g' \
    -e 's|var(--neon-cyan)|var(--color-accent-primary)|g' \
    -e 's|var(--neon-green)|var(--color-accent-secondary)|g' \
    -e 's|var(--accent2)|var(--color-accent-primary)|g' \
    -e 's|var(--accent)|var(--color-accent-primary)|g' \
    -e 's|var(--border2)|var(--color-border)|g' \
    -e 's|var(--border)|var(--color-border)|g' \
  {} +

echo "  ✓ CSS variable references renamed"

# ──────────────────────────────────────────
# STEP 3  Remove glass variable lines
# ──────────────────────────────────────────
echo "→ Step 3: Removing glass variable lines..."

find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) \
  -exec sed -i.bak \
    -e '/--glass-bg/d' \
    -e '/--glass-border/d' \
    -e '/--glass-blur/d' \
  {} +

echo "  ✓ Glass variable lines removed"

# ──────────────────────────────────────────
# STEP 4  Rewrite :root block in globals.css
# ──────────────────────────────────────────
echo "→ Step 4: Rewriting :root block in globals.css..."

python3 - << 'PYEOF'
import re, shutil

target = 'src/app/globals.css'
shutil.copy(target, target + '.step4.bak')

with open(target, 'r') as f:
    content = f.read()

new_root = """:root {
  --color-bg:               #121212;
  --color-surface:          #1E1E1E;
  --color-surface-2:        #2A2A2A;
  --color-accent-primary:   #00FFFF;
  --color-accent-secondary: #39FF14;
  --color-text-primary:     #F5F5F5;
  --color-text-secondary:   #A0A0A0;
  --color-error:            #FF4444;
  --color-success:          #39FF14;
  --color-border:           rgba(255,255,255,0.12);
  --radius:                 8px;
  --font-sans:              'Inter', sans-serif;
  --font-mono:              'JetBrains Mono', monospace;
  --shadow-sm:              0 2px 8px rgba(0,0,0,0.4);
  --shadow-md:              0 8px 24px rgba(0,0,0,0.5);
  --shadow-lg:              0 24px 64px rgba(0,0,0,0.6);
}"""

# Replace the first :root { ... } block (handles multi-line)
result = re.sub(r':root\s*\{[^{]*?\}', new_root, content, count=1, flags=re.DOTALL)

with open(target, 'w') as f:
    f.write(result)

print("  :root block rewritten")
PYEOF

echo "  ✓ globals.css :root block updated"

# ──────────────────────────────────────────
# STEP 5  Add Google Fonts import
# ──────────────────────────────────────────
echo "→ Step 5: Adding Google Fonts import..."

FONTS_LINE='@import url('\''https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap'\'');'

if grep -q "fonts.googleapis.com" src/app/globals.css; then
  echo "  ✓ Google Fonts import already present — skipping"
else
  cp src/app/globals.css src/app/globals.css.step5.bak
  printf '%s\n' "$FONTS_LINE" | cat - src/app/globals.css > /tmp/_fix_tokens_globals.css
  mv /tmp/_fix_tokens_globals.css src/app/globals.css
  echo "  ✓ Google Fonts import added at top of globals.css"
fi

# ──────────────────────────────────────────
# STEP 6  Add [data-theme="light"] block
# ──────────────────────────────────────────
echo "→ Step 6: Adding [data-theme=\"light\"] block..."

python3 - << 'PYEOF'
import re

target = 'src/app/globals.css'

with open(target, 'r') as f:
    content = f.read()

if '[data-theme="light"]' in content:
    print('  [data-theme="light"] already present — skipping')
else:
    light_block = """
[data-theme="light"] {
  --color-bg:               #FFFFFF;
  --color-surface:          #F5F5F5;
  --color-surface-2:        #E8E8E8;
  --color-text-primary:     #121212;
  --color-text-secondary:   #555555;
  --color-border:           rgba(0,0,0,0.12);
  --shadow-sm:              0 2px 8px rgba(0,0,0,0.06);
  --shadow-md:              0 8px 24px rgba(0,0,0,0.08);
  --shadow-lg:              0 24px 64px rgba(0,0,0,0.10);
}
"""
    result = re.sub(
        r'(:root\s*\{[^{]*?\})',
        r'\1' + light_block,
        content,
        count=1,
        flags=re.DOTALL
    )
    with open(target, 'w') as f:
        f.write(result)
    print('  [data-theme="light"] block added')
PYEOF

echo "  ✓ Light theme block done"

# ──────────────────────────────────────────
# CLEANUP  Remove all .bak files
# ──────────────────────────────────────────
echo ""
echo "→ Cleaning up .bak files..."
find src -name "*.bak" -delete
echo "  ✓ Done"

# ──────────────────────────────────────────
# SUMMARY
# ──────────────────────────────────────────
echo ""
echo "======================================"
echo "  Phase A complete"
echo "======================================"
echo ""
echo "Manual steps still required:"
echo ""
echo "  src/app/layout.tsx — update font imports:"
echo "    Replace:"
echo "      import { Fraunces, Outfit, JetBrains_Mono } from 'next/font/google'"
echo "    With:"
echo "      import { Inter, JetBrains_Mono } from 'next/font/google'"
echo ""
echo "    Replace the fraunces + outfit const blocks with:"
echo "      const inter = Inter({"
echo "        subsets: ['latin'], variable: '--font-inter',"
echo "        weight: ['400','500','600','700','800'],"
echo "      })"
echo ""
echo "    Update <body className> — remove fraunces.variable and outfit.variable,"
echo "    add inter.variable."
echo ""
echo "  Run: npx tsc --noEmit   to verify zero TypeScript errors"
echo "  Run: npm run dev        to confirm the app loads"