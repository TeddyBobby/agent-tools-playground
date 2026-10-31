import { describe, it, expect } from 'vitest';
import { summarize, PREVIEW_MAX } from './summarize';

describe('summarize', () => {
  it('formats a small object as key: value pairs (unchanged from before)', () => {
    expect(summarize({ path: 'src/app.tsx', offset: 1 })).toBe(
      'path: "src/app.tsx", offset: 1',
    );
  });

  it('JSON-quotes string primitives', () => {
    expect(summarize('hello')).toBe('"hello"');
    expect(summarize(5)).toBe('5');
    expect(summarize(true)).toBe('true');
    expect(summarize(null)).toBe('null');
  });

  it('bounds a huge string value instead of fully serializing it', () => {
    const big = 'x'.repeat(10_000_000);
    const result = summarize({ content: big });

    // The preview must stay a fixed size regardless of payload — the whole
    // point of the fix — rather than emitting megabytes for a 120-char cap.
    expect(result.length).toBeLessThan(PREVIEW_MAX + 20);
    expect(result).toContain('…');
    expect(result).not.toContain(big);
  });

  it('truncates nested strings inside a JSON object value', () => {
    const result = summarize({
      file: { name: 'readme.md', content: 'y'.repeat(100_000) },
    });
    expect(result.length).toBeLessThan(PREVIEW_MAX + 30);
    expect(result).toContain('…');
  });

  it('serializes a BigInt without throwing', () => {
    const big = BigInt(123);
    expect(() => summarize(big)).not.toThrow();
    expect(summarize(big)).toContain('123');
  });

  it('degrades to [Circular] instead of crashing on a circular reference', () => {
    const self: Record<string, unknown> = {};
    self.self = self;
    expect(() => summarize(self)).not.toThrow();
    expect(summarize(self)).toContain('[Circular]');
  });

  it('handles undefined input as a string instead of throwing', () => {
    expect(() => summarize(undefined)).not.toThrow();
    expect(summarize(undefined)).toBe('undefined');
  });
});
