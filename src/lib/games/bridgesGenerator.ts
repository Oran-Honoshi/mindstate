export type Island = { r: number; c: number; required: number; id: number };
export type Bridge = { from: number; to: number; count: 1|2 };
export type BridgesBoard = {
  size: number;
  islands: Island[];
  solution: Bridge[];
  seed: string;
  difficulty: "easy"|"medium"|"hard";
};

function mulberry32(seed: number) {
  return function() {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedToNum(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function canConnect(islands: Island[], a: Island, b: Island, existing: Bridge[]): boolean {
  // Must be same row or col
  if (a.r !== b.r && a.c !== b.c) return false;
  // No island in between
  const between = islands.filter(isl => {
    if (isl.id === a.id || isl.id === b.id) return false;
    if (a.r === b.r && isl.r === a.r) {
      const minC = Math.min(a.c, b.c), maxC = Math.max(a.c, b.c);
      return isl.c > minC && isl.c < maxC;
    }
    if (a.c === b.c && isl.c === a.c) {
      const minR = Math.min(a.r, b.r), maxR = Math.max(a.r, b.r);
      return isl.r > minR && isl.r < maxR;
    }
    return false;
  });
  if (between.length > 0) return false;
  // No existing bridge crosses this one
  for (const br of existing) {
    const ia = islands[br.from], ib = islands[br.to];
    if (!ia || !ib) continue;
    // Check if bridge ia-ib crosses a-b
    const aHoriz = a.r === b.r, brHoriz = ia.r === ib.r;
    if (aHoriz !== brHoriz) {
      // One horizontal, one vertical — check intersection
      const horizA = aHoriz ? a : ia, horizB = aHoriz ? b : ib;
      const vertA = aHoriz ? ia : a, vertB = aHoriz ? ib : b;
      const minC = Math.min(horizA.c, horizB.c), maxC = Math.max(horizA.c, horizB.c);
      const minR = Math.min(vertA.r, vertB.r), maxR = Math.max(vertA.r, vertB.r);
      if (vertA.c > minC && vertA.c < maxC && horizA.r > minR && horizA.r < maxR) return false;
    }
  }
  return true;
}

export function generateBridges(seed: string, difficulty: "easy"|"medium"|"hard"): BridgesBoard {
  const size = difficulty === "easy" ? 7 : difficulty === "medium" ? 9 : 11;
  const targetIslands = difficulty === "easy" ? 7 : difficulty === "medium" ? 12 : 18;
  const rng = mulberry32(seedToNum(seed));

  for (let attempt = 0; attempt < 100; attempt++) {
    const islands: Island[] = [];
    const grid = Array.from({length:size}, () => Array(size).fill(-1));

    // Place islands on a sparser grid to ensure connectivity is possible
    const step = Math.floor(size / Math.ceil(Math.sqrt(targetIslands)));
    const positions: [number,number][] = [];
    for (let r = 1; r < size-1; r += Math.max(2, step))
      for (let c = 1; c < size-1; c += Math.max(2, step))
        positions.push([r + Math.floor(rng()*2)-1, c + Math.floor(rng()*2)-1]);

    const shuffled = shuffle(positions, rng);
    for (const [r,c] of shuffled) {
      if (r < 0 || r >= size || c < 0 || c >= size) continue;
      if (grid[r][c] !== -1) continue;
      const id = islands.length;
      grid[r][c] = id;
      islands.push({r, c, required:0, id});
      if (islands.length >= targetIslands) break;
    }

    if (islands.length < 4) continue;

    // Build solution: connect all islands into a spanning tree first (guarantees solvability)
    const solution: Bridge[] = [];
    const connected = new Set<number>([0]);
    const unconnected = new Set<number>(islands.slice(1).map(i => i.id));

    // Prim's algorithm to build spanning tree
    let safetyCount = 0;
    while (unconnected.size > 0 && safetyCount < 1000) {
      safetyCount++;
      let bestA = -1, bestB = -1, bestDist = Infinity;

      for (const aId of connected) {
        for (const bId of unconnected) {
          const a = islands[aId], b = islands[bId];
          if (!canConnect(islands, a, b, solution)) continue;
          const dist = Math.abs(a.r-b.r) + Math.abs(a.c-b.c);
          if (dist < bestDist) { bestDist = dist; bestA = aId; bestB = bId; }
        }
      }

      if (bestA === -1) {
        // Can't connect — try adding extra bridge from any connected to any unconnected
        // by checking all pairs
        let found = false;
        for (const aId of connected) {
          for (const bId of unconnected) {
            const a = islands[aId], b = islands[bId];
            if (canConnect(islands, a, b, solution)) {
              solution.push({from:aId, to:bId, count:1});
              connected.add(bId);
              unconnected.delete(bId);
              found = true;
              break;
            }
          }
          if (found) break;
        }
        if (!found) break; // This layout is unsolvable, try next attempt
      } else {
        solution.push({from:bestA, to:bestB, count:1});
        connected.add(bestB);
        unconnected.delete(bestB);
      }
    }

    if (unconnected.size > 0) continue; // Not all islands connected

    // Add some double bridges for variety
    const extraBridges = shuffle([...solution], rng).slice(0, Math.floor(solution.length * 0.3));
    for (const br of extraBridges) {
      if (rng() < 0.4) {
        const idx = solution.findIndex(b => b.from === br.from && b.to === br.to);
        if (idx !== -1) solution[idx] = {...solution[idx], count: 2};
      }
    }

    // Set required counts from solution
    islands.forEach(island => {
      island.required = solution
        .filter(b => b.from === island.id || b.to === island.id)
        .reduce((s,b) => s + b.count, 0);
    });

    // Verify all islands have at least 1 bridge
    if (islands.some(i => i.required === 0)) continue;

    return { size, islands, solution, seed, difficulty };
  }

  // Fallback: simple 4-island grid
  const islands: Island[] = [
    {r:1,c:1,required:2,id:0}, {r:1,c:5,required:2,id:1},
    {r:5,c:1,required:2,id:2}, {r:5,c:5,required:2,id:3},
  ];
  const solution: Bridge[] = [
    {from:0,to:1,count:1},{from:0,to:2,count:1},
    {from:1,to:3,count:1},{from:2,to:3,count:1},
  ];
  return { size, islands, solution, seed, difficulty };
}

export function checkBridges(board: BridgesBoard, placed: Bridge[]): boolean {
  // All islands must have correct bridge count
  const allMatch = board.islands.every(island => {
    const total = placed
      .filter(b => b.from === island.id || b.to === island.id)
      .reduce((s,b) => s+b.count, 0);
    return total === island.required;
  });
  if (!allMatch) return false;

  // All islands must be connected (flood fill)
  if (placed.length === 0) return false;
  const adj = new Map<number, number[]>();
  board.islands.forEach(i => adj.set(i.id, []));
  placed.forEach(b => {
    adj.get(b.from)?.push(b.to);
    adj.get(b.to)?.push(b.from);
  });
  const visited = new Set<number>([board.islands[0].id]);
  const queue = [board.islands[0].id];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nb of (adj.get(cur) ?? [])) {
      if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
    }
  }
  return visited.size === board.islands.length;
}
