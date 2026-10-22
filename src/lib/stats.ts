import type { AgentSession } from './types';

// Pure, testable aggregation over a session's tool traces. Extracted from the
// StatsPanel so the numbers the panel shows can be unit-tested independently of
// the component, and so the panel has a single source of truth for its derived
// metrics instead of recomputing them inline.
//
// The headline addition is `slowest` — the top-N completed calls by duration.
// The README lists "找出慢查询和瓶颈" (find the slow queries / bottlenecks) as
// a core use case, but the panel previously only showed *aggregate* durations
// (总耗时 / 平均/次). Those answer "how long did everything take" but never
// "which call was the bottleneck" — you'd have to eyeball the timeline's
// per-row bars. Surfacing the slowest calls closes that gap.

export interface SlowestCall {
  id: string;
  name: string;
  duration: number;
}

export interface SessionStats {
  totalDuration: number;
  successCount: number;
  errorCount: number;
  runningCount: number;
  avgDuration: number;
  /** Fraction 0–1 of traces that succeeded, or null when there are no traces. */
  successRate: number | null;
  toolCounts: Record<string, number>;
  /** Completed calls with a positive duration, sorted slowest-first, capped at `slowestLimit`. */
  slowest: SlowestCall[];
}

export function computeSessionStats(
  session: AgentSession,
  slowestLimit = 3,
): SessionStats {
  const { traces } = session;

  let totalDuration = 0;
  let successCount = 0;
  let errorCount = 0;
  let runningCount = 0;
  const toolCounts: Record<string, number> = {};
  const completed: SlowestCall[] = [];

  for (const t of traces) {
    if (t.duration !== undefined) totalDuration += t.duration;

    if (t.status === 'success') successCount++;
    else if (t.status === 'error') errorCount++;
    else runningCount++;

    toolCounts[t.name] = (toolCounts[t.name] ?? 0) + 1;

    // Only a completed call with a positive duration can be a bottleneck — a
    // still-running call has no `duration`, so it can't be ranked meaningfully.
    if (t.duration !== undefined && t.duration > 0) {
      completed.push({ id: t.id, name: t.name, duration: t.duration });
    }
  }

  completed.sort((a, b) => b.duration - a.duration);

  return {
    totalDuration,
    successCount,
    errorCount,
    runningCount,
    avgDuration: traces.length > 0 ? totalDuration / traces.length : 0,
    successRate: traces.length > 0 ? successCount / traces.length : null,
    toolCounts,
    slowest: completed.slice(0, slowestLimit),
  };
}
