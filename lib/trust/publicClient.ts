'use client';
import { useCallback, useEffect, useRef } from 'react';
import type { PublicAction } from './publicProtection';
// Server time is authoritative; no user-agent fingerprint or CAPTCHA required.
export function usePublicForm(action: PublicAction) {
  const token = useRef<Promise<string> | null>(null);
  const readyAt = useRef(0);
  const start = useCallback(() => {
    readyAt.current = 0;
    token.current = fetch(`/api/public/challenge?action=${encodeURIComponent(action)}`, { cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error('This form is unavailable right now. Please try again.');
      const body = await response.json(); readyAt.current = Date.now(); return body.formToken as string;
    });
    void token.current.catch(() => {});
  }, [action]);
  useEffect(() => { start(); }, [start]);
  return async (url: string, init: RequestInit) => {
    if (!token.current) start();
    try {
      const formToken = await token.current;
      // This wait only matters for immediately submitted/autofilled forms.
      const wait = Math.max(0, 1600 - (Date.now() - readyAt.current));
      if (wait) await new Promise(resolve => setTimeout(resolve, wait));
      return await fetch(url, { ...init, body: JSON.stringify({ ...JSON.parse(String(init.body)), formToken }) });
    } finally { start(); }
  };
}
