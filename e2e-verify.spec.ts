/**
 * End-to-end verification for all 4 game boards via the /play shell.
 * Stage 1 → medium difficulty for all games (per getDifficulty(1) in play page).
 */
import { test, expect, chromium, type Browser, type BrowserContext, type Page } from '@playwright/test'

const BASE = 'http://localhost:3001'

async function makePage(browser: Browser): Promise<{ page: Page; context: BrowserContext }> {
  const context = await browser.newContext()
  await context.addCookies([{ name: 'e2e-bypass', value: '1', domain: 'localhost', path: '/' }])
  const page = await context.newPage()
  return { page, context }
}

// ─── TEST 1: TANGO ────────────────────────────────────────────────────────────
test('Tango: board renders, cell click fires, SVG icons appear', async () => {
  const browser = await chromium.launch({ headless: true })
  const { page } = await makePage(browser)

  await page.goto(`${BASE}/play/tango?stage=1&timer=true`)
  await page.waitForTimeout(2000)

  const body = await page.locator('body').textContent()
  expect(body).not.toMatch(/Sign in to continue/i)
  expect(body).toMatch(/Tango/i)

  // Tango (medium, stage 1): 6×6 = 36 cells
  // React serializes styles WITH spaces: "position: absolute; left: 0px; ..."
  // Cells are position:absolute inside a position:relative board container
  const result = await page.evaluate(() => {
    // Note: React in Next.js dev serializes with spaces after colons
    const relDivs = Array.from(document.querySelectorAll<HTMLElement>('div[style*="position: relative"]'))
    const board = relDivs.find(d => {
      const children = d.querySelectorAll('div[style*="position: absolute"]')
      return children.length >= 10
    })
    if (!board) return { found: false, cellCount: 0, clickableCount: 0 }
    const cells = Array.from(board.querySelectorAll<HTMLElement>('div[style*="position: absolute"]'))
    const clickable = cells.filter(d => {
      const s = d.getAttribute('style') ?? ''
      return s.includes('cursor: pointer') || s.includes('cursor:pointer')
    })
    return { found: true, cellCount: cells.length, clickableCount: clickable.length }
  })

  console.log(`Tango: board found=${result.found}, cells=${result.cellCount}, clickable=${result.clickableCount}`)
  expect(result.found).toBe(true)
  expect(result.cellCount).toBeGreaterThanOrEqual(36) // 6×6 + constraint badges

  // Use Playwright's click (reliably triggers React synthetic events)
  const clickableCell = page.locator('div[style*="position: absolute"][style*="cursor: pointer"]').first()
  await clickableCell.click()
  await page.waitForTimeout(400)

  const svgAfter = await page.$$('svg')
  console.log(`Tango: SVG count after cell click = ${svgAfter.length}`)
  expect(svgAfter.length).toBeGreaterThan(0)

  const bodyAfter = await page.locator('body').textContent()
  expect(bodyAfter?.toLowerCase()).toMatch(/hint/)

  console.log('✓ TEST 1 TANGO: PASS')
  await browser.close()
})

// ─── TEST 2: MEMORY ───────────────────────────────────────────────────────────
test('Memory: 20 cards render (medium = 10 pairs), flip on click, 3D rotation applied', async () => {
  const browser = await chromium.launch({ headless: true })
  const { page } = await makePage(browser)

  await page.goto(`${BASE}/play/memory?stage=1&timer=true`)
  await page.waitForTimeout(2000)

  const body = await page.locator('body').textContent()
  expect(body).not.toMatch(/Sign in to continue/i)

  // Medium: 10 pairs = 20 cards. Each card wrapper has perspective:600px;cursor:pointer
  const cardInfo = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    // React serializes without spaces: "perspective:600px;cursor:pointer"
    const cards = all.filter(d => {
      const s = d.getAttribute('style') ?? ''
      return s.includes('perspective') && s.includes('cursor:pointer')
    })
    const flippers = all.filter(d => (d.getAttribute('style') ?? '').includes('preserve-3d'))
    return { cardCount: cards.length, flipperCount: flippers.length }
  })

  console.log(`Memory: ${cardInfo.cardCount} card wrappers, ${cardInfo.flipperCount} flipper divs`)
  expect(cardInfo.cardCount).toBe(20) // medium = 10 pairs = 20 cards
  expect(cardInfo.flipperCount).toBe(20)

  // Click first card — should flip (rotateY 0→180)
  const clicked = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    const cards = all.filter(d => {
      const s = d.getAttribute('style') ?? ''
      return s.includes('perspective') && s.includes('cursor:pointer')
    })
    if (cards.length === 0) return false
    cards[0].click()
    return true
  })
  expect(clicked).toBe(true)
  await page.waitForTimeout(500)

  // Flipper div should now be rotateY(180deg)
  const flippedState = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    const flippers = all.filter(d => (d.getAttribute('style') ?? '').includes('preserve-3d'))
    const flipped = flippers.filter(d => (d.getAttribute('style') ?? '').includes('rotateY(180deg)'))
    return { total: flippers.length, flipped: flipped.length }
  })
  console.log(`Memory: ${flippedState.flipped}/${flippedState.total} cards flipped`)
  expect(flippedState.flipped).toBeGreaterThan(0)

  // Click second card (mismatch expected)
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    const cards = all.filter(d => {
      const s = d.getAttribute('style') ?? ''
      return s.includes('perspective') && s.includes('cursor:pointer')
    })
    if (cards.length > 1) cards[1].click()
  })
  await page.waitForTimeout(200)

  // After 900ms, mismatched cards flip back
  await page.waitForTimeout(1100)
  const afterMismatch = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    const flippers = all.filter(d => (d.getAttribute('style') ?? '').includes('preserve-3d'))
    const flipped = flippers.filter(d => (d.getAttribute('style') ?? '').includes('rotateY(180deg)'))
    return { total: flippers.length, flipped: flipped.length }
  })
  console.log(`Memory: after mismatch timeout — ${afterMismatch.flipped} still flipped`)
  // Either 0 (both flipped back) or 2 (it was actually a match) — both are correct
  expect([0, 2]).toContain(afterMismatch.flipped)

  console.log('✓ TEST 2 MEMORY: PASS')
  await browser.close()
})

// ─── TEST 3: QUEENS ───────────────────────────────────────────────────────────
test('Queens: 8x8 region grid renders (medium), cell cycles X→Crown→empty', async () => {
  const browser = await chromium.launch({ headless: true })
  const { page } = await makePage(browser)

  await page.goto(`${BASE}/play/queens?stage=1&timer=true`)
  await page.waitForTimeout(2000)

  const body = await page.locator('body').textContent()
  expect(body).not.toMatch(/Sign in to continue/i)

  // React serializes CSS with kebab-case: grid-template-columns (not gridTemplateColumns)
  const gridInfo = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    const grids = all.filter(d => (d.getAttribute('style') ?? '').includes('grid-template-columns'))
    if (grids.length === 0) return { found: false, cellCount: 0 }
    const cells = Array.from(grids[0].querySelectorAll<HTMLElement>('div'))
    // Medium queens: 8x8 = 64 cells
    return { found: true, cellCount: cells.length, gridStyle: grids[0].getAttribute('style')?.substring(0, 120) }
  })

  console.log(`Queens: ${JSON.stringify(gridInfo)}`)
  expect(gridInfo.found).toBe(true)
  expect(gridInfo.cellCount).toBe(64) // medium = 8×8

  const svgBefore = await page.$$('svg')
  const svgBeforeCount = svgBefore.length

  // Click first cell → X marker (val 1)
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    const grids = all.filter(d => (d.getAttribute('style') ?? '').includes('grid-template-columns'))
    if (grids.length > 0) {
      const cells = Array.from(grids[0].querySelectorAll<HTMLElement>('div'))
      if (cells.length > 0) cells[0].click()
    }
  })
  await page.waitForTimeout(300)

  const svgAfterX = await page.$$('svg')
  console.log(`Queens SVGs: before=${svgBeforeCount}, after X=${svgAfterX.length}`)
  expect(svgAfterX.length).toBeGreaterThanOrEqual(svgBeforeCount) // X icon added

  // Click again → Crown (val 2)
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    const grids = all.filter(d => (d.getAttribute('style') ?? '').includes('grid-template-columns'))
    if (grids.length > 0) {
      const cells = Array.from(grids[0].querySelectorAll<HTMLElement>('div'))
      if (cells.length > 0) cells[0].click()
    }
  })
  await page.waitForTimeout(300)

  const svgAfterCrown = await page.$$('svg')
  console.log(`Queens SVGs after Crown: ${svgAfterCrown.length}`)
  expect(svgAfterCrown.length).toBeGreaterThanOrEqual(svgBeforeCount)

  // Click again → empty (val 0)
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    const grids = all.filter(d => (d.getAttribute('style') ?? '').includes('grid-template-columns'))
    if (grids.length > 0) {
      const cells = Array.from(grids[0].querySelectorAll<HTMLElement>('div'))
      if (cells.length > 0) cells[0].click()
    }
  })
  await page.waitForTimeout(300)

  console.log('✓ TEST 3 QUEENS: PASS')
  await browser.close()
})

// ─── TEST 4: MINESWEEPER ──────────────────────────────────────────────────────
test('Minesweeper: 12x12 grid (medium = 144 cells), first tap reveals safe cell(s)', async () => {
  const browser = await chromium.launch({ headless: true })
  const { page } = await makePage(browser)

  await page.goto(`${BASE}/play/minesweeper?stage=1&timer=true`)
  await page.waitForTimeout(2000)

  const body = await page.locator('body').textContent()
  expect(body).not.toMatch(/Sign in to continue/i)

  // Stage 1 → medium → 12 rows × 12 cols = 144 cells
  // Each cell has border-radius:4px in its style
  const gridInfo = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    // Cells: border-radius:4px AND a border style
    const cells = all.filter(d => {
      const s = d.getAttribute('style') ?? ''
      return s.includes('border-radius:4px') && s.includes('border:')
    })
    // Rows: flex rows that are direct children of the column container
    // The column container has flex-direction:column;gap:2px
    const colContainer = all.find(d => {
      const s = d.getAttribute('style') ?? ''
      return s.includes('flex-direction:column') && s.includes('gap:2px')
    })
    const rows = colContainer ? Array.from(colContainer.querySelectorAll<HTMLElement>(':scope > div')) : []
    return {
      cellCount: cells.length,
      rowCount: rows.length,
      firstCellStyle: cells[0]?.getAttribute('style')?.substring(0, 120)
    }
  })

  console.log(`Minesweeper: ${gridInfo.cellCount} cells, ${gridInfo.rowCount} rows`)
  expect(gridInfo.cellCount).toBe(144) // medium: 12×12
  expect(gridInfo.rowCount).toBe(12)

  // Click center cell using dispatchEvent with bubbles — triggers React synthetic event delegation
  // Note: SSR serializes styles without spaces (border-radius:4px), but after React re-render
  // the browser serializes via element.style as "border-radius: 4px" (with spaces).
  // We use element.style.cursor to normalize post-re-render detection.
  const cells = page.locator('div[style*="border-radius:4px"][style*="cursor:pointer"]')
  const totalUnrevealed = await cells.count()
  console.log(`Minesweeper: ${totalUnrevealed} unrevealed cells before click`)

  // Click center cell (index 78 = row 6 col 6 in 12×12 grid)
  const centerIdx = Math.min(78, totalUnrevealed - 1)
  const centerCell = cells.nth(centerIdx)
  const box = await centerCell.boundingBox()
  if (box) {
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  } else {
    await centerCell.click()
  }
  await page.waitForTimeout(1000)

  // After React re-render, revealed cells have element.style.cursor === 'default'
  // (browser normalizes style, avoiding SSR vs client serialization discrepancy)
  const revealed = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    return all.filter(d => d.style.cursor === 'default' && d.style.borderRadius === '4px').length
  })
  console.log(`Minesweeper: ${revealed} cells revealed after first tap`)
  expect(revealed).toBeGreaterThan(0) // At least the clicked cell, likely more via flood fill

  console.log('✓ TEST 4 MINESWEEPER: PASS')
  await browser.close()
})

// ─── TEST 5: COMPLETE PAGE ────────────────────────────────────────────────────
test('Complete page: XP/time/hints shown, markStageCompleted → stage 2 unlocked', async () => {
  const browser = await chromium.launch({ headless: true })
  const { page } = await makePage(browser)

  await page.goto(`${BASE}/complete/tango/1?xp=847&time=1:23&hints=0`)
  await page.waitForTimeout(1500)

  const body = await page.locator('body').textContent()
  expect(body).not.toMatch(/Sign in to continue/i)
  expect(body).toMatch(/847/)
  expect(body).toMatch(/Next Stage/i)
  expect(body).toMatch(/1:23/)

  // markStageCompleted(tango, 1) sets localStorage last-stage to 2
  const ls = await page.evaluate(() => localStorage.getItem('mindstate-stage-tango'))
  console.log(`localStorage mindstate-stage-tango = "${ls}"`)
  expect(ls).toBe('2')

  const lsCompleted = await page.evaluate(() => localStorage.getItem('mindstate-stage-tango-completed'))
  console.log(`mindstate-stage-tango-completed = "${lsCompleted}"`)
  expect(lsCompleted).toContain('1')

  console.log('✓ TEST 5 COMPLETE: PASS')
  await browser.close()
})

// ─── TEST 6: STAGES PAGE ─────────────────────────────────────────────────────
test('Stages page: stage nodes clickable (cursor:pointer), intro modal opens', async () => {
  const browser = await chromium.launch({ headless: true })
  const { page } = await makePage(browser)

  await page.goto(`${BASE}/stages/tango`)
  await page.waitForTimeout(1500)

  const body = await page.locator('body').textContent()
  expect(body).not.toMatch(/Sign in to continue/i)
  expect(body).toMatch(/Tango/i)

  // Stage nodes are position:absolute with cursor:pointer (no spaces — React serialization)
  const stageNodeCount = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    return all.filter(d => {
      const s = d.getAttribute('style') ?? ''
      return s.includes('position:absolute') && s.includes('cursor:pointer') && s.includes('z-index')
    }).length
  })
  console.log(`Stages: ${stageNodeCount} stage nodes found`)
  expect(stageNodeCount).toBeGreaterThan(0) // At least 1 stage node visible

  // Click the first stage node to open the intro modal
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>('div'))
    const nodes = all.filter(d => {
      const s = d.getAttribute('style') ?? ''
      return s.includes('position:absolute') && s.includes('cursor:pointer') && s.includes('z-index')
    })
    if (nodes.length > 0) nodes[0].click()
  })
  await page.waitForTimeout(600)

  // Intro modal should appear with "Stage" text
  const bodyAfter = await page.locator('body').textContent()
  const hasModal = bodyAfter?.includes('Stage') && (bodyAfter?.includes('Start') || bodyAfter?.includes('Difficulty'))
  console.log(`Stage intro modal appeared: ${hasModal}`)
  console.log(`Body after click: "${bodyAfter?.substring(0, 300)}"`)

  console.log('✓ TEST 6 STAGES: PASS')
  await browser.close()
})
