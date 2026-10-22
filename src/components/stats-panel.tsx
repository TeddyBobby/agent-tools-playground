'use client';

import { AgentSession } from '@/lib/types';
import { computeSessionStats } from '@/lib/stats';

interface StatsPanelProps {
  session: AgentSession;
}

export function StatsPanel({ session }: StatsPanelProps) {
  const s = computeSessionStats(session);

  const stats = [
    { label: '模型', value: session.model },
    { label: '工具调用', value: session.traces.length.toString() },
    {
      label: '成功率',
      value: s.successRate === null ? 'N/A' : `${Math.round(s.successRate * 100)}%`,
    },
    { label: '错误', value: s.errorCount.toString(), highlight: s.errorCount > 0 },
    { label: '总耗时', value: formatMs(s.totalDuration) },
    { label: '平均/次', value: formatMs(s.avgDuration) },
  ];

  const maxToolCount = Math.max(...Object.values(s.toolCounts), 1);

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
          {Object.entries(s.toolCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([name, count]) => {
              const pct = (count / maxToolCount) * 100;
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

      {/* Slowest calls — surfaces the actual bottleneck instead of only the
          aggregate totals, answering the README's "找出慢查询和瓶颈" use case. */}
      {s.slowest.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            最慢的调用
            {s.runningCount > 0 && (
              <span className="ml-1 font-normal text-xs text-gray-400">
                （{s.runningCount} 个运行中未计入）
              </span>
            )}
          </h4>
          <div className="space-y-1.5">
            {s.slowest.map((call, i) => {
              const pct = (call.duration / s.slowest[0].duration) * 100;
              return (
                <div key={call.id} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-24 font-mono text-gray-700 dark:text-gray-300 truncate"
                    title={call.name}
                  >
                    {call.name}
                  </span>
                  <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${i === 0 ? 'bg-red-400' : 'bg-amber-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-gray-500 font-mono">
                    {formatMs(call.duration)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}
