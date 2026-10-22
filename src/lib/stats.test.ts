import { describe, it, expect } from 'vitest';
import { computeSessionStats } from './stats';
import type { AgentSession, ToolTrace } from './types';

function trace(id: string, overrides: Partial<ToolTrace> = {}): ToolTrace {
  return {
    id,
    name: `tool-${id}`,
    status: 'success',
    input: {},
    startTime: 0,
    ...overrides,
  };
}

function session(traces: ToolTrace[]): AgentSession {
  return {
    id: 's',
    name: 'test',
    model: 'test',
    startTime: 0,
    traces,
  };
}

describe('computeSessionStats', () => {
  it('sums durations, counts statuses, and computes the success rate', () => {
    const s = computeSessionStats(
      session([
        trace('a', { name: 'read_file', duration: 100 }),
        trace('b', { name: 'terminal', duration: 300, status: 'error' }),
        trace('c', { name: 'read_file', duration: 200 }),
        trace('d', { name: 'web_search', status: 'running' }),
      ]),
    );

    expect(s.totalDuration).toBe(600);
    expect(s.successCount).toBe(2);
    expect(s.errorCount).toBe(1);
    expect(s.runningCount).toBe(1);
    expect(s.avgDuration).toBe(150);
    expect(s.successRate).toBe(0.5);
    expect(s.toolCounts).toEqual({ read_file: 2, terminal: 1, web_search: 1 });
  });

  it('returns the slowest calls in descending order, capped at the limit', () => {
    const s = computeSessionStats(
      session([
        trace('a', { duration: 50 }),
        trace('b', { duration: 500 }),
        trace('c', { duration: 250 }),
        trace('d', { duration: 100 }),
      ]),
      3,
    );

    expect(s.slowest.map((c) => c.id)).toEqual(['b', 'c', 'd']);
    expect(s.slowest.map((c) => c.duration)).toEqual([500, 250, 100]);
  });

  it('excludes running and zero-duration calls from the slowest list', () => {
    const s = computeSessionStats(
      session([
        trace('a', { duration: 500 }),
        trace('b', { status: 'running' }), // no duration
        trace('c', { duration: 0 }),
        trace('d', { duration: 10 }),
      ]),
    );

    expect(s.slowest.map((c) => c.id)).toEqual(['a', 'd']);
    expect(s.runningCount).toBe(1);
  });

  it('returns an empty slowest list and a null rate for an empty session', () => {
    const s = computeSessionStats(session([]));

    expect(s.totalDuration).toBe(0);
    expect(s.avgDuration).toBe(0);
    expect(s.successRate).toBeNull();
    expect(s.slowest).toEqual([]);
    expect(s.toolCounts).toEqual({});
  });
});
