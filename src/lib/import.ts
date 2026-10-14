import type { ToolTrace } from './types';

// Robust parsing + validation for the JSON a user pastes into the import
// modal. The previous implementation called `JSON.parse` and only checked the
// result was a non-empty array — every other invariant (`name` is a string,
// `id` is a unique string, `status` is a known value) was silently assumed, so
// a single malformed entry could crash the Timeline (e.g. `undefined.toLowerCase()`
// in the name-search filter) or render garbage in the DetailPanel.
//
// `parseToolTraces` treats the paste as an untrusted boundary: it validates
// each entry, repairs trivial omissions (missing id/status/duration), and
// either returns a fully-typed `ToolTrace[]` or a specific, index-addressed
// error message. This mirrors the "parse, don't validate" principle — once it
// returns successfully, the rest of the app can trust the data instead of
// re-checking it everywhere.

export type ImportResult =
  | { ok: true; traces: ToolTrace[] }
  | { ok: false; error: string };

const VALID_STATUSES = new Set<ToolTrace['status']>(['success', 'error', 'running']);

function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// Return `base` if it isn't taken yet, otherwise append a numeric suffix
// (`base-2`, `base-3`, …) until a free id is found. Guarantees the returned
// traces carry unique ids so the tree-flatten step and React keys never
// collapse two distinct records into one.
function dedupeId(base: string, seen: Set<string>): string {
  if (!seen.has(base)) return base;
  let n = 2;
  let candidate = `${base}-${n}`;
  while (seen.has(candidate)) {
    n++;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

export function parseToolTraces(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: '无效的 JSON 格式，请粘贴合法的 JSON 数据。' };
  }

  if (!Array.isArray(parsed)) {
    return { ok: false, error: 'JSON 顶层必须是一个数组，每个元素是一次工具调用记录。' };
  }
  if (parsed.length === 0) {
    return { ok: false, error: '数组不能为空，请至少导入一条工具调用记录。' };
  }

  const traces: ToolTrace[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < parsed.length; i++) {
    const entry = parsed[i];
    const label = `第 ${i + 1} 条记录`;

    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      return { ok: false, error: `${label} 不是对象，无法解析为工具调用。` };
    }
    const rec = entry as Record<string, unknown>;

    const name = asNonEmptyString(rec.name);
    if (name === null) {
      return { ok: false, error: `${label} 缺少字符串类型的 name 字段。` };
    }

    // A missing id is repaired rather than rejected — it's not a data error,
    // just an omission we can safely fill in. Generated ids are index-based
    // (`trace-N`), but every id (explicit or generated) is deduplicated
    // against what we've seen so far. Without this, a hand-written id that
    // collides with an auto-generated one would make two records share a key;
    // the tree-flatten step indexes records by id, so one of them was silently
    // dropped from the timeline.
    const rawId = asNonEmptyString(rec.id);
    const id = rawId === null ? dedupeId(`trace-${i + 1}`, seenIds) : dedupeId(rawId, seenIds);
    seenIds.add(id);

    let status: ToolTrace['status'] = 'success';
    if (rec.status !== undefined && rec.status !== null) {
      const rawStatus = asNonEmptyString(rec.status);
      if (rawStatus === null) {
        return { ok: false, error: `${label} 的 status 字段不是字符串。` };
      }
      if (!VALID_STATUSES.has(rawStatus as ToolTrace['status'])) {
        return {
          ok: false,
          error: `${label} 的 status "${rawStatus}" 无效，可选值：success / error / running。`,
        };
      }
      status = rawStatus as ToolTrace['status'];
    }

    // Coerce timestamps to numbers (accepting numeric strings), then derive a
    // missing duration from endTime - startTime so the timeline bar and stats
    // stay accurate even for hand-edited data.
    const startTime = asFiniteNumber(rec.startTime) ?? 0;
    const endTime = asFiniteNumber(rec.endTime) ?? undefined;
    const duration =
      asFiniteNumber(rec.duration) ??
      (endTime !== undefined && endTime >= startTime ? endTime - startTime : undefined);

    traces.push({
      id,
      name,
      status,
      input: rec.input ?? null,
      output: rec.output,
      error: typeof rec.error === 'string' ? rec.error : undefined,
      startTime,
      endTime,
      duration,
      parentId: typeof rec.parentId === 'string' ? rec.parentId : undefined,
    });
  }

  return { ok: true, traces };
}
