// Line-level diffing for the detail panel's "input → output" comparison view.
//
// Extracted from the component so it can be unit-tested and so its only
// real failure mode — the O(n·m) longest-common-subsequence table — is guarded
// in one place rather than buried inside a `'use client'` component.

export type DiffLine =
  | { type: 'unchanged'; line: string }
  | { type: 'removed'; line: string }
  | { type: 'added'; line: string };

export type DiffResult =
  | { kind: 'diff'; lines: DiffLine[] }
  | { kind: 'tooLarge'; oldLines: number; newLines: number };

// The LCS dynamic-programming table is O(n·m) in both time and memory. Real
// agent tool outputs are often large (a `read_file` on a big file, a `terminal`
// run with verbose output), so an unbounded table would allocate hundreds of MB
// and freeze the tab. Past this many cells we decline to diff and let the UI
// show a "too large" note instead — the input/output tabs already render the
// raw JSON fine either way.
export const MAX_DIFF_CELLS = 2_000_000;

/**
 * Compute a minimal, aligned line-level diff using the longest-common-
 * subsequence (LCS) dynamic-programming algorithm.
 *
 * A positional comparison (`oldLines[i]` vs `newLines[i]`) misaligns every
 * following line after a single insertion/deletion, producing a misleading
 * diff. LCS aligns lines by content, so insertions/deletions shift cleanly and
 * unchanged blocks stay grouped.
 */
export function computeDiff(oldStr: string, newStr: string): DiffResult {
  const a = oldStr.split('\n');
  const b = newStr.split('\n');
  const n = a.length;
  const m = b.length;

  if (n * m > MAX_DIFF_CELLS) {
    return { kind: 'tooLarge', oldLines: n, newLines: m };
  }

  // dp[i][j] = length of the LCS of a[i..] and b[j..].
  const dp: number[][] = Array.from(
    { length: n + 1 },
    () => new Array<number>(m + 1).fill(0),
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        a[i] === b[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  // Backtrack from dp[0][0] to emit the aligned diff.
  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      lines.push({ type: 'unchanged', line: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      lines.push({ type: 'removed', line: a[i] });
      i++;
    } else {
      lines.push({ type: 'added', line: b[j] });
      j++;
    }
  }
  while (i < n) {
    lines.push({ type: 'removed', line: a[i] });
    i++;
  }
  while (j < m) {
    lines.push({ type: 'added', line: b[j] });
    j++;
  }
  return { kind: 'diff', lines };
}
