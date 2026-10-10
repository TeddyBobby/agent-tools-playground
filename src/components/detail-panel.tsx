'use client';

import { ToolTrace } from '@/lib/types';
import { computeDiff } from '@/lib/diff';
import { useState } from 'react';

interface DetailPanelProps {
  trace: ToolTrace | null;
  parentName?: string;
}

export function DetailPanel({ trace, parentName }: DetailPanelProps) {
  const [view, setView] = useState<'input' | 'output' | 'diff'>('input');

  if (!trace) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        <div className="text-center">
          <div className="text-3xl mb-2">👈</div>
          <p>选择一个工具调用<br />查看详情</p>
        </div>
      </div>
    );
  }

  const inputStr = JSON.stringify(trace.input, null, 2);
  const outputStr = trace.output ? JSON.stringify(trace.output, null, 2) : '';
  const errorStr = trace.error || '';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${
              trace.status === 'success'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : trace.status === 'error'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            }`}
          >
            {trace.status === 'success' ? '成功' : trace.status === 'error' ? '失败' : '运行中'}
          </span>
          <span className="text-xs text-gray-400 font-mono">{trace.id}</span>
        </div>
        <h3 className="font-mono font-semibold text-lg">{trace.name}</h3>
        {trace.parentId && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            父调用: <span className="font-mono">{parentName ?? trace.parentId}</span>
          </div>
        )}
        {trace.duration !== undefined && (
          <div className="text-sm text-gray-500 mt-1">
            耗时: {trace.duration < 1000 ? `${trace.duration}ms` : `${(trace.duration / 1000).toFixed(1)}s`}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {(['input', 'output', 'diff'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              view === tab
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'diff' ? '对比' : tab === 'input' ? '输入' : '输出'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {view === 'input' && <CodeBlock code={inputStr} />}
        {view === 'output' && (
          <>
            {outputStr ? (
              <CodeBlock code={outputStr} />
            ) : errorStr ? (
              <div className="text-red-600 dark:text-red-400 font-mono text-sm whitespace-pre-wrap bg-red-50 dark:bg-red-950/20 rounded p-3 border border-red-200 dark:border-red-800">
                {errorStr}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">暂无输出</p>
            )}
          </>
        )}
        {view === 'diff' && (
          <div className="space-y-2 font-mono text-sm">
            <div className="text-xs text-gray-400 mb-2">输入 → 输出 变化对比：</div>
            {outputStr && inputStr !== outputStr ? (
              <DiffView oldStr={inputStr} newStr={outputStr} />
            ) : (
              <p className="text-gray-400 text-sm">无差异</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 overflow-auto text-sm font-mono whitespace-pre-wrap break-all max-h-[60vh]">
      <code>{code}</code>
    </pre>
  );
}

function DiffView({ oldStr, newStr }: { oldStr: string; newStr: string }) {
  const result = computeDiff(oldStr, newStr);

  if (result.kind === 'tooLarge') {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3">
        <p>
          输入 / 输出过大（{result.oldLines} 行 vs {result.newLines} 行），已跳过逐行对比以避免卡顿。
        </p>
        <p className="mt-1 text-xs">
          请切换到「输入」「输出」标签页分别查看内容。
        </p>
      </div>
    );
  }

  const diff = result.lines;
  const addedCount = diff.filter((d) => d.type === 'added').length;
  const removedCount = diff.filter((d) => d.type === 'removed').length;

  return (
    <div>
      <div className="text-xs text-gray-400 mb-2">
        {removedCount > 0 && (
          <span className="text-red-600 dark:text-red-400">−{removedCount}</span>
        )}
        {removedCount > 0 && addedCount > 0 && <span className="mx-1">/</span>}
        {addedCount > 0 && (
          <span className="text-green-600 dark:text-green-400">+{addedCount}</span>
        )}
        {' 行变化'}
      </div>
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        {diff.map((d, idx) => {
          if (d.type === 'unchanged') {
            return (
              <div
                key={idx}
                className="px-3 py-0.5 text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all"
              >
                {d.line}
              </div>
            );
          }
          if (d.type === 'removed') {
            return (
              <div
                key={idx}
                className="px-3 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 whitespace-pre-wrap break-all"
              >
                - {d.line}
              </div>
            );
          }
          return (
            <div
              key={idx}
              className="px-3 py-0.5 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 whitespace-pre-wrap break-all"
            >
              + {d.line}
            </div>
          );
        })}
      </div>
    </div>
  );
}
