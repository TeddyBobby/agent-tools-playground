import { describe, it, expect } from 'vitest';
import { prettyJson, truncateDisplay, RENDER_MAX_CHARS } from './pretty-json';

describe('prettyJson', () => {
  it('pretty-prints a small value without truncation', () => {
    const result = prettyJson({ path: 'src/app.tsx', offset: 1 });
    expect(result.truncated).toBe(false);
    expect(result.display).toBe(result.full);
    expect(result.display).toContain('"path": "src/app.tsx"');
  });

  it('bounds a huge payload to RENDER_MAX_CHARS but keeps the full string', () => {
    const big = 'x'.repeat(1_000_000);
    const result = prettyJson({ content: big });

    expect(result.truncated).toBe(true);
    expect(result.display.length).toBe(RENDER_MAX_CHARS);
    // The complete value must survive for the copy button, not be thrown away.
    expect(result.full.length).toBeGreaterThan(RENDER_MAX_CHARS);
    expect(result.full).toContain(big);
  });

  it('serializes undefined, null, and primitives', () => {
    expect(prettyJson(undefined).display).toBe('undefined');
    expect(prettyJson(null).display).toBe('null');
    expect(prettyJson(5).display).toBe('5');
    expect(prettyJson('hi').display).toBe('"hi"');
  });

  it('degrades gracefully on a circular reference instead of throwing', () => {
    const self: Record<string, unknown> = {};
    self.self = self;
    expect(() => prettyJson(self)).not.toThrow();
    expect(prettyJson(self).display).toContain('无法序列化');
  });

  it('degrades gracefully on a BigInt instead of throwing', () => {
    expect(() => prettyJson(BigInt(1))).not.toThrow();
    expect(prettyJson(BigInt(1)).display).toContain('无法序列化');
  });
});

describe('truncateDisplay', () => {
  it('returns the text unchanged when under the cap', () => {
    const result = truncateDisplay('hello');
    expect(result.truncated).toBe(false);
    expect(result.display).toBe('hello');
  });

  it('truncates an oversized string to the cap', () => {
    const result = truncateDisplay('x'.repeat(RENDER_MAX_CHARS + 100));
    expect(result.truncated).toBe(true);
    expect(result.display.length).toBe(RENDER_MAX_CHARS);
  });
});
