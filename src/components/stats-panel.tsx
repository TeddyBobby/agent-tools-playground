'use client';

import { AgentSession } from '@/lib/types';

interface StatsPanelProps {
  session: AgentSession;
}

export function StatsPanel({ session }: StatsPanelProps) {
  const totalDuration = session.traces.reduce((s, t) => s + (t.duration || 0), 0);
  const successCount = session.traces.filter((t) => t.status === 'success').length;
  const errorCount = session.traces.filter((t) => t.status === 'error').length;
  const avgDuration = session.traces.length > 0 ? totalDuration / session.traces.length : 0;

  const stats = [
    { label: '模型', value: session.model },
    { label: '工具调用', value: session.traces.length.toString() },
    {
      label: '成功率',
      value: session.traces.length > 0
        ? `${Math.round((successCount / session.traces.length) * 100)}%`
        : 'N/A',
    },
    { label: '错误', value: errorCount.toString(), highlight: errorCount > 0 },
    { label: '总耗时', value: formatMs(totalDuration) },
    { label: '平均/次', value: formatMs(avgDuration) },
  ];

  const toolCounts = session.traces.reduce(
    (acc, t) => {
      acc[t.name] = (acc[t.name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`p-3 rounded-lg border ${
              stat.highlight
                ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
            }`}
          >
            <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
            <div className={`text-lg font-semibold ${stat.highlight ? 'text-red-600' : ''}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tool frequency */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">工具频率</h4>
        <div className="space-y-1.5">
          {Object.entries(toolCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => {
              const maxCount = Math.max(...Object.values(toolCounts));
              const pct = (count / maxCount) * 100;
              return (
                <div key={name} className="flex items-center gap-2 text-sm">
                  <span className="w-24 font-mono text-gray-700 dark:text-gray-300 truncate">
                    {name}
                  </span>
                  <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-gray-500 font-mono">{count}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}
