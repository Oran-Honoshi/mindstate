// Counts solutions up to a limit — if > 1, puzzle is not unique
// Used by all generators to guarantee single-solution puzzles

export function countSolutions<State>(
  initialState: State,
  isComplete: (s: State) => boolean,
  nextMoves: (s: State) => State[],
  limit = 2
): number {
  let count = 0;
  function bt(state: State): void {
    if (count >= limit) return;
    if (isComplete(state)) { count++; return; }
    for (const next of nextMoves(state)) {
      if (count >= limit) return;
      bt(next);
    }
  }
  bt(initialState);
  return count;
}
