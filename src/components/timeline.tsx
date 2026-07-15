'use client';

import React from 'react';
import { ToolTrace } from '@/lib/types';

interface TimelineProps {
  traces: ToolTrace[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

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

export function Timeline({ traces, selectedId, onSelect }: TimelineProps) {
  const maxDuration = Math.max(...traces.map((t) => t.duration || 1), 1);

  return (
    <div className="space-y-1">
      {traces.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">🔍</div>
          <p className="text-sm">No tool calls yet. Import a trace to get started.</p>
        </div>
      )}

      {traces.map((trace, idx) => {
        const widthPct = ((trace.duration || 0) / maxDuration) * 80 + 20; // min 20% width bar
        const timeStr = trace.duration
          ? trace.duration < 1000
            ? `${trace.duration}ms`
            : `${(trace.duration / 1000).toFixed(1)}s`
          : '...';

        return (
          <div
            key={trace.id}
            onClick={() => onSelect(trace.id)}
            className={`border-l-4 ${STATUS_BORDERS[trace.status]} ${
              selectedId === trace.id ? STATUS_BG[trace.status] + ' ring-1 ring-blue-200 dark:ring-blue-800' : ''
            } rounded-r-lg px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors`}
          >
            <div className="flex items-center gap-2">
              {/* Status dot */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[trace.status]}`} />

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
  );
}

function summarize(input: unknown): string {
  if (typeof input === 'object' && input !== null) {
    const entries = Object.entries(input as Record<string, unknown>).slice(0, 2);
    return entries.map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ');
  }
  return JSON.stringify(input);
}
