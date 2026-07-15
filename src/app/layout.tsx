import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent Tools Playground — Visual Debugger for AI Agent Tool Calls',
  description:
    'Visualize, debug, and analyze AI agent tool calls. Timeline view, input/output diff, performance stats, and session replay.',
  keywords: ['AI', 'agent', 'debug', 'tool-calls', 'visualization', 'Next.js'],
  authors: [{ name: 'TeddyBobby' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
