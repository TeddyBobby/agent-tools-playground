'use client';

import { ToolTrace } from '@/lib/types';
import { useState } from 'react';

interface DetailPanelProps {
  trace: ToolTrace | null;
}

export function DetailPanel({ trace }: DetailPanelProps) {
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
  const oldLines = oldStr.split('\n');
  const newLines = newStr.split('\n');
  const maxLen = Math.max(oldLines.length, newLines.length);

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      {Array.from({ length: maxLen }).map((_, i) => {
        const oldLine = oldLines[i];
        const newLine = newLines[i];
        if (oldLine === newLine) {
          return (
            <div key={i} className="px-3 py-0.5 text-gray-600 dark:text-gray-400">
              {oldLine}
            </div>
          );
        }
        return (
          <div key={i}>
            {oldLine !== undefined && (
              <div className="px-3 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400">
                - {oldLine}
              </div>
            )}
            {newLine !== undefined && (
              <div className="px-3 py-0.5 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                + {newLine}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
