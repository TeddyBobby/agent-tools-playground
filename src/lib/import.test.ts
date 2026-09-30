import { describe, it, expect } from 'vitest';
import { parseToolTraces } from './import';

describe('parseToolTraces', () => {
  it('parses a well-formed array and derives duration from timestamps', () => {
    const result = parseToolTraces(
      JSON.stringify([
        { id: 'tc-1', name: 'read_file', status: 'success', startTime: 1000, endTime: 1200 },
      ]),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.traces).toHaveLength(1);
      expect(result.traces[0]).toMatchObject({
        id: 'tc-1',
        name: 'read_file',
        status: 'success',
        duration: 200,
      });
    }
  });

  it('rejects malformed JSON', () => {
    const result = parseToolTraces('{ not json');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('JSON');
  });

  it('rejects a non-array top level', () => {
    const result = parseToolTraces('{"id":"x"}');
    expect(result.ok).toBe(false);
  });

  it('rejects an empty array', () => {
    const result = parseToolTraces('[]');
    expect(result.ok).toBe(false);
  });

  it('reports the offending index and field when name is missing', () => {
    const result = parseToolTraces(
      JSON.stringify([
        { id: 'a', name: 'ok', status: 'success' },
        { id: 'b', status: 'error' },
      ]),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('第 2 条记录');
  });

  it('repairs a missing id and defaults status to success', () => {
    const result = parseToolTraces(JSON.stringify([{ name: 'terminal' }]));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.traces[0].id).toBe('trace-1');
      expect(result.traces[0].status).toBe('success');
    }
  });

  it('rejects an unknown status value', () => {
    const result = parseToolTraces(JSON.stringify([{ name: 'x', status: 'failed' }]));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain('failed');
  });

  it('rejects a non-string name that would crash the search filter', () => {
    const result = parseToolTraces(JSON.stringify([{ name: 123 }]));
    expect(result.ok).toBe(false);
  });
});
