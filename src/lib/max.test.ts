import { describe, it, expect } from 'vitest';
import { maxBy } from './max';

describe('maxBy', () => {
  it('returns the largest selected value', () => {
    expect(maxBy([{ d: 3 }, { d: 9 }, { d: 5 }], (x) => x.d)).toBe(9);
  });

  it('returns the fallback for an empty iterable', () => {
    expect(maxBy<number>([], (x) => x, 1)).toBe(1);
  });

  it('returns the fallback when every value is below it', () => {
    expect(maxBy([0, -1, -2], (x) => x, 1)).toBe(1);
  });

  it('does not throw on a very large iterable (no Math.max spread)', () => {
    // `Math.max(...new Array(200000).fill(1))` throws
    // `RangeError: Maximum call stack size exceeded`; the fold must not.
    const big = new Array<number>(200_000).fill(1);
    expect(() => maxBy(big, (x) => x, 0)).not.toThrow();
    expect(maxBy(big, (x) => x, 0)).toBe(1);
  });
});
