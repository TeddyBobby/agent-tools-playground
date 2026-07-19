import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agent Tools Playground — Visual Debugger for AI Agent Tool Calls',
  description:
    'Visualize, debug, and analyze AI agent tool calls. Timeline view, input/output diff, performance stats, and session replay.',
  keywords: ['AI', 'agent', 'debug', 'tool-calls', 'visualization', 'Next.js'],
  authors: [{ name: 'TeddyBobby' }],
  openGraph: {
    title: 'Agent Tools Playground — AI Agent 工具调试器',
    description:
      '可视化、调试、分析 AI Agent 的工具调用。时间线视图、输入输出对比、性能统计，一目了然。',
    type: 'website',
    locale: 'zh_CN',
    siteName: 'Agent Tools Playground',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Tools Playground — AI Agent 工具调试器',
    description:
      '可视化、调试、分析 AI Agent 的工具调用。时间线视图、输入输出对比、性能统计，一目了然。',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="antialiased">
      <body className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
