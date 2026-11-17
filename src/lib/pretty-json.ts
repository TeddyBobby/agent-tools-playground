// Bounded pretty-printing for the detail panel's code blocks.
//
// The detail panel previously rendered the *entire* `JSON.stringify(value, null, 2)`
// of a trace's `input` / `output` straight into a `<pre>`. That is the one
// remaining un-hardened path in the codebase's "large traces" effort —
// `summarize` caps the timeline preview, `diff` caps its LCS table, `max`
// avoids the spread-call limit, `import` validates at the boundary, and
// `trace-tree` guards against cycles, but a single `write_file` carrying a
// 5 MB body (or a `terminal` run with verbose stdout) was still fully
// serialized — with 2-space indentation inflating it ~2× — and injected into
// the DOM, where `whitespace-pre-wrap break-all` on a megabyte-scale line
// makes the browser choke on layout. `max-h-[60vh]` only caps the *visible*
// scroll area, not the size of the text the browser has to parse and lay out.
//
// `prettyJson` keeps the complete pretty-printed string (`full`, still needed
// for the copy button and the diff view) but hands the UI a bounded `display`
// prefix so rendering stays cheap no matter how large the payload is. It also
// degrades gracefully instead of throwing on values `JSON.stringify` cannot
// serialize (BigInt, circular references), matching `summarize`'s behaviour.

export const RENDER_MAX_CHARS = 200_000;

export interface PrettyJson {
  /** The complete pretty-printed JSON — used for copy and the diff view. */
  full: string;
  /** The string to render — a prefix of `full` when the payload is oversized. */
  display: string;
  /** True when `display` was truncated and `full` holds the complete value. */
  truncated: boolean;
}

export function prettyJson(value: unknown, maxChars = RENDER_MAX_CHARS): PrettyJson {
  let full: string;
  try {
    // `JSON.stringify(undefined)` returns the `undefined` *value*, not a
    // string, so coalesce it to a renderable literal.
    full = JSON.stringify(value, null, 2) ?? 'undefined';
  } catch {
    // A circular reference or BigInt can't be expressed as JSON. The detail
    // panel's values come from JSON.parse / literal demo data so neither
    // normally occurs, but keeping this total means a stray one renders a
    // message instead of crashing the whole panel.
    const fallback = '[无法序列化：循环引用或 BigInt]';
    return { full: fallback, display: fallback, truncated: false };
  }

  if (full.length <= maxChars) {
    return { full, display: full, truncated: false };
  }
  return { full, display: full.slice(0, maxChars), truncated: true };
}

// Same bounded-display treatment for a plain string (used by the error block),
// so oversized error messages don't pay the DOM cost either.
export function truncateDisplay(
  text: string,
  maxChars = RENDER_MAX_CHARS,
): { display: string; truncated: boolean } {
  if (text.length <= maxChars) return { display: text, truncated: false };
  return { display: text.slice(0, maxChars), truncated: true };
}

// Human-readable size for the "truncated" note, in UTF-16 code units (≈chars).
export function formatChars(n: number): string {
  if (n < 1024) return `${n} 字符`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
