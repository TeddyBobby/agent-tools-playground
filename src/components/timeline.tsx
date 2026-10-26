'use client';

import React, { useState, useMemo, useDeferredValue, useRef } from 'react';
import { ToolTrace } from '@/lib/types';
import { flattenTraces } from '@/lib/trace-tree';

interface TimelineProps {
  traces: ToolTrace[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

type StatusFilter = 'all' | 'success' | 'error' | 'running';

const STATUS_COLORS: Record<string, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  running: 'bg-yellow-500 animate-pulse',
};

const STATUS_BORDERS: Record<string, string> = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  running: 'border-l-yellow-500',
};

const STATUS_BG: Record<string, string> = {
  success: 'bg-green-50 dark:bg-green-950/20',
  error: 'bg-red-50 dark:bg-red-950/20',
  running: 'bg-yellow-50 dark:bg-yellow-950/20',
};

const FILTER_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'success', label: '成功' },
  { value: 'error', label: '失败' },
  { value: 'running', label: '运行中' },
];

export function Timeline({ traces, selectedId, onSelect }: TimelineProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [nameSearch, setNameSearch] = useState('');

  // Defer the search filter so typing stays responsive on large traces: the
  // input updates on every keystroke, while the (potentially expensive) filter
  // and tree-flatten run against a slightly stale value. React prioritizes the
  // urgent input update and lets the list catch up — the standard pattern for
  // "expensive computation on every keystroke".
  const deferredNameSearch = useDeferredValue(nameSearch);

  const filteredTraces = useMemo(() => {
    return traces.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (deferredNameSearch && !t.name.toLowerCase().includes(deferredNameSearch.toLowerCase())) return false;
      return true;
    });
  }, [traces, statusFilter, deferredNameSearch]);

  // Resolve `parentId` links into a depth-ordered sequence so nested tool calls
  // render indented under their parent instead of as a flat list.
  const flatTraces = useMemo(() => flattenTraces(filteredTraces), [filteredTraces]);

  // Ordered id → index lookup so arrow-key navigation can resolve the current
  // row's position in O(1) instead of scanning `flatTraces` on every keystroke.
  const indexById = useMemo(
    () => new Map(flatTraces.map((f, i) => [f.trace.id, i] as const)),
    [flatTraces],
  );

  // Roving tabindex (WAI-ARIA keyboard-interaction pattern): exactly one row is
  // in the Tab order at a time — the selected row, or the first when nothing is
  // selected. Tab enters/leaves the list in a single stop instead of walking
  // every row; Arrow keys then move both selection and focus, so a keyboard
  // user can step through the whole session to replay it.
  const activeIndex = useMemo(() => {
    if (selectedId !== null) {
      const idx = indexById.get(selectedId);
      if (idx !== undefined) return idx;
    }
    return flatTraces.length > 0 ? 0 : -1;
  }, [selectedId, indexById, flatTraces.length]);

  const listRef = useRef<HTMLDivElement>(null);

  // Move selection to the trace at `index` and give it focus so the user can
  // keep pressing Arrow keys. Focus (via `.focus()`) also scrolls the row into
  // view when stepping past the visible area. Out-of-range is a no-op so
  // ArrowUp on the first row / ArrowDown on the last stay put.
  const stepTo = (index: number) => {
    const target = flatTraces[index];
    if (!target) return;
    onSelect(target.trace.id);
    listRef.current
      ?.querySelectorAll<HTMLElement>('[role="button"]')[index]
      ?.focus();
  };

  const maxDuration = Math.max(...flatTraces.map((f) => f.trace.duration || 1), 1);
  const hasActiveFilter = statusFilter !== 'all' || nameSearch.length > 0;

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[120px] max-w-[200px]">
          <input
            type="text"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            placeholder="搜索工具名…"
            className="w-full pl-7 pr-2 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            aria-label="按工具名搜索"
          />
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            🔍
          </span>
        </div>
      </div>

      {/* Filtered count indicator */}
      {hasActiveFilter && (
        <p className="text-xs text-gray-400">
          显示 {filteredTraces.length} / {traces.length} 条记录
        </p>
      )}

      {filteredTraces.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">{traces.length > 0 ? '🔍' : '📭'}</div>
          <p className="text-sm">
            {traces.length > 0 ? '没有匹配的记录，试试调整筛选条件。' : '暂无工具调用记录，导入 trace 数据开始。'}
          </p>
        </div>
      )}

      <div ref={listRef} className="space-y-1">
      {flatTraces.map(({ trace, depth }, idx) => {
        const widthPct = ((trace.duration || 0) / maxDuration) * 80 + 20; // min 20% width bar
        const timeStr = trace.duration
          ? trace.duration < 1000
            ? `${trace.duration}ms`
            : `${(trace.duration / 1000).toFixed(1)}s`
          : '...';
        const isSelected = selectedId === trace.id;

        const handleKeyDown = (e: React.KeyboardEvent) => {
          const index = indexById.get(trace.id) ?? 0;
          switch (e.key) {
            case 'Enter':
            case ' ':
              e.preventDefault();
              onSelect(trace.id);
              break;
            case 'ArrowDown':
              e.preventDefault();
              stepTo(index + 1);
              break;
            case 'ArrowUp':
              e.preventDefault();
              stepTo(index - 1);
              break;
            case 'Home':
              e.preventDefault();
              stepTo(0);
              break;
            case 'End':
              e.preventDefault();
              stepTo(flatTraces.length - 1);
              break;
          }
        };

        return (
          <div
            key={trace.id}
            role="button"
            tabIndex={idx === activeIndex ? 0 : -1}
            aria-pressed={isSelected}
            aria-label={`${trace.name} — ${trace.status === 'success' ? '成功' : trace.status === 'error' ? '失败' : '运行中'} — ${timeStr}${depth > 0 ? '（嵌套调用）' : ''}`}
            onClick={() => onSelect(trace.id)}
            onKeyDown={handleKeyDown}
            style={{ marginLeft: depth * 18 }}
            className={`border-l-4 ${STATUS_BORDERS[trace.status]} ${
              isSelected ? STATUS_BG[trace.status] + ' ring-1 ring-blue-200 dark:ring-blue-800' : ''
            } rounded-r-lg px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500`}
          >
            <div className="flex items-center gap-2">
              {/* Status dot */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[trace.status]}`} />

              {/* Nested marker */}
              {depth > 0 && (
                <span
                  className="text-gray-300 dark:text-gray-600 font-mono text-sm flex-shrink-0"
                  aria-hidden="true"
                >
                  ↳
                </span>
              )}

              {/* Tool name */}
              <span className="font-mono text-sm font-medium text-gray-800 dark:text-gray-200 flex-shrink-0">
                {trace.name}
              </span>

              {/* Duration bar */}
              <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-2 min-w-[40px]">
                <div
                  className={`h-full rounded-full transition-all ${STATUS_COLORS[trace.status]} opacity-40`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>

              {/* Time */}
              <span className="text-xs text-gray-400 flex-shrink-0 font-mono w-12 text-right">
                {timeStr}
              </span>
            </div>

            {/* Inline input preview */}
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate font-mono ml-10">
              {trace.name}({summarize(trace.input)})
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}

// Cap inline previews so a single tool call with a huge payload (e.g. a
// `write_file` body) doesn't dump megabytes of JSON into the DOM on render.
const PREVIEW_MAX = 120;

function summarize(input: unknown): string {
  const truncate = (s: string) => (s.length > PREVIEW_MAX ? `${s.slice(0, PREVIEW_MAX)}…` : s);
  if (typeof input === 'object' && input !== null) {
    const entries = Object.entries(input as Record<string, unknown>).slice(0, 2);
    return entries.map(([k, v]) => `${k}: ${truncate(JSON.stringify(v))}`).join(', ');
  }
  return truncate(JSON.stringify(input));
}
