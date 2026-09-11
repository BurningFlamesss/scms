import { useCallback, useEffect, useState } from "react";

/**
 * Tiny localStorage-backed id set. Used for "save notice for later"
 * so students can build their own reading list without an account.
 */
export function useBookmarks(storageKey: string) {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(ids));
    } catch {
      /* storage unavailable — bookmarks stay in-memory for this session */
    }
  }, [ids, storageKey]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    let added = false;
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      added = true;
      return [...prev, id];
    });
    return added;
  }, []);

  const clear = useCallback(() => setIds([]), []);

  return { ids, has, toggle, clear, count: ids.length };
}
