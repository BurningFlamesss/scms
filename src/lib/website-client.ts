import type { WebsitePage } from "@/types";

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  data: WebsitePage;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

async function fetchPage(key: string): Promise<WebsitePage | null> {
  const response = await fetch(`/api/website/page/${key}`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch page: ${response.statusText}`);
  }
  
  const { page } = await response.json();
  return page;
}

export async function getWebsitePage(key: string): Promise<WebsitePage | null> {
  const cached = cache.get(key);
  
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }
  
  const page = await fetchPage(key);
  
  if (page) {
    cache.set(key, { data: page, timestamp: Date.now() });
  }
  
  return page;
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

export function getCachedPage(key: string): WebsitePage | null {
  const cached = cache.get(key);
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }
  return null;
}

export async function getAllPages(): Promise<WebsitePage[]> {
  const response = await fetch("/api/website/pages", {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch pages: ${response.statusText}`);
  }
  
  const { pages } = await response.json();
  return pages;
}