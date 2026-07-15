'use client';

import { useState } from 'react';
import { generateDemoSession, AgentSession, ToolTrace } from '@/lib/types';
import { Timeline } from '@/components/timeline';
import { DetailPanel } from '@/components/detail-panel';
import { StatsPanel } from '@/components/stats-panel';

export default function Home() {
  const [session, setSession] = useState<AgentSession>(() => generateDemoSession());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'stats'>('timeline');

  const selectedTrace =
    session.traces.find((t) => t.id === selectedId) || null;

  const handleLoadDemo = () => {
    setSession(generateDemoSession());
    setSelectedId(null);
  };

  const handleImport = () => {
    const input = prompt('Paste JSON trace data (array of tool calls):');
    if (!input) return;
    try {
      const traces: ToolTrace[] = JSON.parse(input);
      if (!Array.isArray(traces)) throw new Error('Expected array');
      setSession({
        id: crypto.randomUUID(),
        name: 'Imported Session',
        model: 'unknown',
        startTime: traces[0]?.startTime || Date.now(),
        endTime: traces[traces.length - 1]?.endTime,
        traces,
      });
      setSelectedId(null);
    } catch {
      alert('Invalid JSON. Expected an array of tool trace objects.');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <span>🔧</span> Agent Tools Playground
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {session.name} · {session.traces.length} tool calls
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleLoadDemo}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            🎲 Demo
          </button>
          <button
            onClick={handleImport}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            📥 Import
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
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 text-sm transition-colors ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Stats
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
    </div>
  );
}
