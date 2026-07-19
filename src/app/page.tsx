'use client';

import { useState, useCallback } from 'react';
import { generateDemoSession, AgentSession, ToolTrace } from '@/lib/types';
import { Timeline } from '@/components/timeline';
import { DetailPanel } from '@/components/detail-panel';
import { StatsPanel } from '@/components/stats-panel';
import { ErrorBoundary } from '@/components/error-boundary';

export default function Home() {
  const [session, setSession] = useState<AgentSession>(() => generateDemoSession());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'stats'>('timeline');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const selectedTrace =
    session.traces.find((t) => t.id === selectedId) || null;

  const handleLoadDemo = () => {
    setSession(generateDemoSession());
    setSelectedId(null);
  };

  const handleOpenImport = () => {
    setShowImport(true);
    setImportText('');
    setImportError('');
  };

  const handleCloseImport = () => {
    setShowImport(false);
    setImportText('');
    setImportError('');
  };

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setImportText(text);
      setImportError('');
    } catch {
      setImportError('无法读取剪贴板，请手动粘贴。');
    }
  }, []);

  const handleImportSubmit = () => {
    const trimmed = importText.trim();
    if (!trimmed) {
      setImportError('请输入 JSON 数据。');
      return;
    }
    try {
      const traces: ToolTrace[] = JSON.parse(trimmed);
      if (!Array.isArray(traces)) throw new Error('Expected array');
      if (traces.length === 0) throw new Error('Empty array');
      setSession({
        id: crypto.randomUUID(),
        name: '导入的会话',
        model: 'unknown',
        startTime: traces[0]?.startTime || Date.now(),
        endTime: traces[traces.length - 1]?.endTime,
        traces,
      });
      setSelectedId(null);
      setShowImport(false);
      setImportText('');
      setImportError('');
    } catch {
      setImportError('无效的 JSON 格式，需要一个工具 trace 对象数组。');
    }
  };

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <span>🔧</span> Agent 工具调试器
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {session.name} · {session.traces.length} 次工具调用
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleLoadDemo}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              🎲 演示
            </button>
            <button
              onClick={handleOpenImport}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              📥 导入
            </button>
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  activeTab === 'timeline'
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                时间线
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-1.5 text-sm transition-colors ${
                  activeTab === 'stats'
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                统计
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel — timeline/stats */}
          <div className="flex-1 overflow-y-auto border-r border-gray-200 dark:border-gray-800 p-4">
            {activeTab === 'timeline' ? (
              <Timeline
                traces={session.traces}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            ) : (
              <StatsPanel session={session} />
            )}
          </div>

          {/* Right panel — detail */}
          <div className="w-96 overflow-hidden">
            <DetailPanel trace={selectedTrace} />
          </div>
        </div>

        {/* Import modal */}
        {showImport && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={handleCloseImport}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold">导入工具调用数据</h2>
                <button
                  onClick={handleCloseImport}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>
              <div className="px-6 py-4 flex gap-2">
                <button
                  onClick={handlePasteFromClipboard}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  📋 从剪贴板粘贴
                </button>
                <span className="text-xs text-gray-400 self-center">
                  或直接在下方粘贴 JSON
                </span>
              </div>
              <div className="px-6 flex-1 min-h-0">
                <textarea
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    setImportError('');
                  }}
                  placeholder='粘贴 JSON trace 数据，格式：[{"id": "tc-1", "name": "read_file", ...}]'
                  className="w-full h-64 p-3 font-mono text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  spellCheck={false}
                />
              </div>
              {importError && (
                <div className="px-6 py-2">
                  <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                    {importError}
                  </p>
                </div>
              )}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                <button
                  onClick={handleCloseImport}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleImportSubmit}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  导入
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
