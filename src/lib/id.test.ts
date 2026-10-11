import { afterEach, describe, expect, it, vi } from 'vitest';
import { genId } from './id';

// A v4 UUID: 8-4-4-4-12 hex groups, version nibble `4`, variant nibble 8-b.
const V4_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('genId', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns a non-empty string', () => {
    expect(genId()).toBeTypeOf('string');
    expect(genId().length).toBeGreaterThan(0);
  });

  it('returns a valid v4 UUID when crypto.randomUUID is available', () => {
    expect(genId()).toMatch(V4_UUID);
  });

  it('produces unique ids across calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => genId()));
    expect(ids.size).toBe(1000);
  });

  it('falls back to a getRandomValues-built v4 UUID when randomUUID is missing', () => {
    // Simulate an insecure (HTTP) context: randomUUID is absent but
    // getRandomValues — the only Crypto member usable outside secure contexts —
    // is still present. Fill the buffer deterministically so the output is
    // stable and assertable.
    const getRandomValues = vi.fn((arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = i;
      return arr;
    });
    vi.stubGlobal('crypto', { getRandomValues });

    const id = genId();

    expect(getRandomValues).toHaveBeenCalledOnce();
    expect(id).toMatch(V4_UUID);
    // bytes 0..15 → "00010203-0405-4607-8809-0a0b0c0d0e0f" after version/variant bits.
    expect(id).toBe('00010203-0405-4607-8809-0a0b0c0d0e0f');
  });

  it('falls back to a Math.random id when even getRandomValues is missing', () => {
    vi.stubGlobal('crypto', {});
    expect(genId()).toMatch(V4_UUID);
  });
});
