// Compute the maximum over an iterable without `Math.max(...spread)`.
//
// `Math.max(...arr)` expands every element into a separate function argument.
// A large imported trace (hundreds of thousands of tool calls) exceeds the
// engine's argument-count limit and throws `RangeError: Maximum call stack
// size exceeded`, which crashes the whole timeline render — the same
// "large traces" edge the rest of the codebase already guards against
// (`summarize` bounds preview serialization, `diff` caps its LCS table,
// `import` validates at the boundary).
//
// A single-pass fold is O(n), iterative (no recursion), and — unlike the
// `arr.map(...)` + spread it replaces — never materializes an intermediate
// array, so it stays cheap even when the timeline has tens of thousands of
// rows.

export function maxBy<T>(
  values: Iterable<T>,
  select: (value: T) => number,
  fallback = 0,
): number {
  let max = fallback;
  for (const value of values) {
    const n = select(value);
    if (n > max) max = n;
  }
  return max;
}
