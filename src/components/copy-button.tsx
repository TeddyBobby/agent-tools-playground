'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

// Copy arbitrary text to the clipboard. The async Clipboard API
// (`navigator.clipboard.writeText`) only exists in secure contexts (HTTPS or
// localhost); the app is often served over plain HTTP during development (a
// LAN IP, a bare staging box), where it's `undefined`. This component mirrors
// the `readText` fallback in the import flow: it degrades to a hidden
// `<textarea>` + `document.execCommand('copy')`, which still works in insecure
// contexts, and surfaces a brief "copied" confirmation on success.
export function CopyButton({ text, label = '复制' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending reset timer on unmount so we don't call setState on an
  // unmounted component.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (await copyText(text)) {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className="px-2 py-0.5 text-xs rounded-md border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
    >
      {copied ? '✓ 已复制' : `⧉ ${label}`}
    </button>
  );
}

async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy path (e.g. permission denied).
    }
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  // Position off-screen instead of `display: none` so `select()` works.
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}
