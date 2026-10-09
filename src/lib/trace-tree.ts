import type { ToolTrace } from './types';

// Resolves a flat list of tool traces into a depth-ordered sequence that
// reflects the `parentId` hierarchy, so the UI can render nested tool calls
// (e.g. a sub-agent or an inner `read_file` invoked inside a `search_files`)
// indented under their parent instead of as a flat, ungrouped list.
//
// `ToolTrace.parentId` has existed in the type since the start but was never
// read by any component — imported traces carrying it were silently flattened,
// which loses the structure that makes real agent traces readable.

export interface FlatTrace {
  trace: ToolTrace;
  depth: number;
}

export function flattenTraces(traces: ToolTrace[]): FlatTrace[] {
  const byId = new Map<string, ToolTrace>();
  for (const trace of traces) byId.set(trace.id, trace);

  // Group children by their *resolved* parent, preserving input order. A
  // parentId that doesn't resolve is treated as a root (see below), so orphaned
  // children never disappear.
  const childrenByParent = new Map<string, ToolTrace[]>();
  for (const trace of traces) {
    if (trace.parentId && byId.has(trace.parentId)) {
      const siblings = childrenByParent.get(trace.parentId);
      if (siblings) siblings.push(trace);
      else childrenByParent.set(trace.parentId, [trace]);
    }
  }

  const result: FlatTrace[] = [];
  const emitted = new Set<string>();

  // Depth-first walk. The `path` set guards against reference cycles (A → B →
  // A), which would otherwise recurse forever; any node already on the current
  // path is skipped here and recovered as a top-level root below.
  const visit = (trace: ToolTrace, depth: number, path: Set<string>): void => {
    if (emitted.has(trace.id) || path.has(trace.id)) return;
    emitted.add(trace.id);
    result.push({ trace, depth });
    const nextPath = new Set(path);
    nextPath.add(trace.id);
    for (const child of childrenByParent.get(trace.id) ?? []) {
      visit(child, depth + 1, nextPath);
    }
  };

  // Roots: traces with no parentId, or a parentId that doesn't resolve.
  for (const trace of traces) {
    if (trace.parentId && byId.has(trace.parentId)) continue;
    visit(trace, 0, new Set());
  }

  // Safety net: anything unreachable from a root (only possible via a cycle)
  // becomes a top-level entry so no data is dropped.
  for (const trace of traces) {
    if (!emitted.has(trace.id)) visit(trace, 0, new Set());
  }

  return result;
}
