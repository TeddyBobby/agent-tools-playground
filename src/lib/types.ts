// Types for the Agent Tools Playground

export interface ToolTrace {
  id: string;
  name: string;
  status: 'success' | 'error' | 'running';
  input: unknown;
  output?: unknown;
  error?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  parentId?: string; // for nested tool calls
}

export interface AgentSession {
  id: string;
  name: string;
  model: string;
  startTime: number;
  endTime?: number;
  traces: ToolTrace[];
}

// Generate a session with mock data for demo purposes
export function generateDemoSession(): AgentSession {
  const now = Date.now();
  const traces: ToolTrace[] = [
    {
      id: 'tc-1',
      name: 'read_file',
      status: 'success',
      input: { path: 'src/app/page.tsx', offset: 1, limit: 50 },
      output: {
        content: 'export default function Page() { ... }',
        total_lines: 200,
      },
      startTime: now - 5000,
      endTime: now - 4800,
      duration: 200,
    },
    {
      id: 'tc-2',
      name: 'web_search',
      status: 'success',
      input: { query: 'Next.js streaming chat implementation' },
      output: {
        results: [
          { title: 'Next.js Streaming Docs', url: 'https://nextjs.org/docs' },
          { title: 'Building a Chat App', url: 'https://example.com' },
        ],
      },
      startTime: now - 4500,
      endTime: now - 3500,
      duration: 1000,
    },
    {
      id: 'tc-3',
      name: 'search_files',
      status: 'success',
      input: { pattern: 'ChatInput', target: 'content', path: 'src/' },
      output: { matches: [{ file: 'src/components/chat-input.tsx', line: 5 }] },
      startTime: now - 3000,
      endTime: now - 2800,
      duration: 200,
    },
    {
      id: 'tc-4',
      name: 'terminal',
      status: 'error',
      input: {
        command: 'npm run build',
        timeout: 60,
      },
      error: 'Module not found: Can\'t resolve \'@/lib/stream\'',
      startTime: now - 2500,
      endTime: now - 500,
      duration: 2000,
    },
    {
      id: 'tc-5',
      name: 'write_file',
      status: 'success',
      input: {
        path: 'src/lib/stream.ts',
        content: 'export class SSEParser { ... }',
      },
      output: { bytes_written: 1024 },
      startTime: now - 400,
      endTime: now - 200,
      duration: 200,
    },
    {
      id: 'tc-6',
      name: 'terminal',
      status: 'success',
      input: { command: 'npm run build', timeout: 120 },
      output: { exit_code: 0, output: '✓ Compiled successfully' },
      startTime: now - 100,
      endTime: now,
      duration: 100,
    },
  ];

  const totalDuration = traces.reduce((sum, t) => sum + (t.duration || 0), 0);
  const successCount = traces.filter((t) => t.status === 'success').length;

  return {
    id: 'demo-session',
    name: '调试会话 — 构建修复',
    model: 'claude-sonnet-4',
    startTime: traces[0].startTime,
    endTime: traces[traces.length - 1].endTime,
    traces,
  };
}
