import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl font-bold text-gray-200 dark:text-gray-800 mb-4">
          404
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          页面未找到
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          你访问的页面不存在，可能已被移动或删除。
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
