import { describe, it, expect } from 'vitest';
import { flattenTraces } from './trace-tree';
import type { ToolTrace } from './types';

function trace(id: string, parentId?: string): ToolTrace {
  return {
    id,
    name: `tool-${id}`,
    status: 'success',
    input: {},
    startTime: 0,
    parentId,
  };
}

function ids(flat: { trace: ToolTrace }[]): string[] {
  return flat.map((f) => f.trace.id);
}

describe('flattenTraces', () => {
  it('keeps a flat list unchanged and at depth 0 when there are no parents', () => {
    const result = flattenTraces([trace('a'), trace('b'), trace('c')]);
    expect(ids(result)).toEqual(['a', 'b', 'c']);
    expect(result.map((f) => f.depth)).toEqual([0, 0, 0]);
  });

  it('emits a child after its parent with an incremented depth', () => {
    const result = flattenTraces([trace('a'), trace('b', 'a'), trace('c')]);
    expect(ids(result)).toEqual(['a', 'b', 'c']);
    expect(result.map((f) => f.depth)).toEqual([0, 1, 0]);
  });

  it('supports multiple nesting levels', () => {
    const result = flattenTraces([
      trace('a'),
      trace('b', 'a'),
      trace('c', 'b'),
      trace('d'),
    ]);
    expect(ids(result)).toEqual(['a', 'b', 'c', 'd']);
    expect(result.map((f) => f.depth)).toEqual([0, 1, 2, 0]);
  });

  it('sorts children under their parent even when they appear earlier in the array', () => {
    const result = flattenTraces([trace('b', 'a'), trace('a'), trace('c', 'a')]);
    expect(ids(result)).toEqual(['a', 'b', 'c']);
    expect(result.map((f) => f.depth)).toEqual([0, 1, 1]);
  });

  it('treats an unresolved parentId as a top-level root', () => {
    const result = flattenTraces([trace('a', 'missing'), trace('b')]);
    expect(ids(result)).toEqual(['a', 'b']);
    expect(result.map((f) => f.depth)).toEqual([0, 0]);
  });

  it('does not infinitely recurse on a reference cycle', () => {
    const result = flattenTraces([trace('a', 'b'), trace('b', 'a')]);
    // Both are emitted exactly once; one of them is promoted to the top level.
    expect(ids(result).sort()).toEqual(['a', 'b']);
    expect(result).toHaveLength(2);
  });

  it('handles a self-referential parentId without dropping the trace', () => {
    const result = flattenTraces([trace('a', 'a'), trace('b')]);
    expect(ids(result).sort()).toEqual(['a', 'b']);
    expect(result).toHaveLength(2);
  });

  it('returns an empty list for empty input', () => {
    expect(flattenTraces([])).toEqual([]);
  });
});
