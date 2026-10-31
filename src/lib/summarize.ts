// Bounded, allocation-aware inline preview for a tool trace's `input`, shown
// under each timeline row (e.g. `read_file(path: "src/app.tsx", offset: 1)`).
//
// Extracted from the Timeline component so its one real failure mode — the cost
// of rendering a preview for a huge payload — can be unit-tested in isolation,
// matching how `diff`, `stats`, `trace-tree` and `import` live in `src/lib/`.
//
// The previous implementation called `JSON.stringify(value)` and *then* sliced
// the result to `PREVIEW_MAX`. That is O(bytes) work and a full string
// allocation even when the value is megabytes: a single `write_file` carrying a
// 5 MB body was completely serialized (and JSON-escaped, up to 2× for special
// characters) just to display 120 chars. With several such rows the timeline's
// re-render became noticeably janky — the exact "large traces" scenario the
// codebase already works to keep responsive.
//
// This version truncates *before* allocating: a replacer slices oversized
// strings before JSON.stringify ever escapes them, so the work is O(PREVIEW_MAX)
// regardless of payload size. It also degrades gracefully instead of throwing
// on values `JSON.stringify` can't serialize (BigInt, circular references),
// which would otherwise crash the whole timeline on render.

export const PREVIEW_MAX = 120;

// Serialize a value to JSON for display, capping every string at PREVIEW_MAX so
// a huge payload is never fully stringified. Returns a non-empty string for any
// input, falling back to '[Circular]' when JSON.stringify throws (a circular
// reference can't arise from JSON-parsed or literal demo data, but keeping the
// function total means a stray one never takes down the timeline).
function stringifyBounded(value: unknown): string {
  try {
    const out = JSON.stringify(value, (_key, v: unknown) => {
      if (typeof v === 'bigint') return `${v}n`;
      if (typeof v === 'string' && v.length > PREVIEW_MAX) {
        return `${v.slice(0, PREVIEW_MAX)}…`;
      }
      return v;
    });
    return out === undefined ? 'undefined' : out;
  } catch {
    return '[Circular]';
  }
}

export function summarize(input: unknown): string {
  const truncate = (s: string) =>
    s.length > PREVIEW_MAX ? `${s.slice(0, PREVIEW_MAX)}…` : s;

  if (typeof input === 'object' && input !== null) {
    const entries = Object.entries(input as Record<string, unknown>).slice(0, 2);
    return entries
      .map(([k, v]) => `${k}: ${truncate(stringifyBounded(v))}`)
      .join(', ');
  }
  return truncate(stringifyBounded(input));
}
