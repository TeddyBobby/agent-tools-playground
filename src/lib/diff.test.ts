import { describe, it, expect } from 'vitest';
import { computeDiff, MAX_DIFF_CELLS } from './diff';

function lines(result: ReturnType<typeof computeDiff>): string[] {
  if (result.kind !== 'diff') throw new Error('expected diff result');
  return result.lines.map((d) => `${d.type}:${d.line}`);
}

describe('computeDiff', () => {
  it('keeps unchanged lines grouped and marks a single insertion cleanly', () => {
    const result = computeDiff('a\nb\nc', 'a\nx\nb\nc');
    expect(lines(result)).toEqual([
      'unchanged:a',
      'added:x',
      'unchanged:b',
      'unchanged:c',
    ]);
  });

  it('marks a deletion without misaligning the following lines', () => {
    const result = computeDiff('a\nb\nc', 'a\nc');
    expect(lines(result)).toEqual([
      'unchanged:a',
      'removed:b',
      'unchanged:c',
    ]);
  });

  it('reports a replacement as one removal followed by one addition', () => {
    const result = computeDiff('a\nb\nc', 'a\nB\nc');
    expect(lines(result)).toEqual([
      'unchanged:a',
      'removed:b',
      'added:B',
      'unchanged:c',
    ]);
  });

  it('returns identical lines as all-unchanged for equal input', () => {
    const result = computeDiff('a\nb', 'a\nb');
    expect(lines(result)).toEqual(['unchanged:a', 'unchanged:b']);
  });

  it('declines to diff when the LCS table would exceed MAX_DIFF_CELLS', () => {
    const size = Math.ceil(Math.sqrt(MAX_DIFF_CELLS)) + 1;
    const bigOld = Array.from({ length: size }, () => 'x').join('\n');
    const bigNew = Array.from({ length: size }, () => 'y').join('\n');

    const result = computeDiff(bigOld, bigNew);
    expect(result.kind).toBe('tooLarge');
    if (result.kind === 'tooLarge') {
      expect(result.oldLines).toBe(size);
      expect(result.newLines).toBe(size);
    }
  });

  it('still diffs a small input against a large output (linear in the small side)', () => {
    const small = 'a';
    const large = Array.from({ length: 2000 }, () => 'line').join('\n');
    const result = computeDiff(small, large);
    // 1 × 2000 cells is well under the guard and must still produce a diff.
    expect(result.kind).toBe('diff');
  });
});
