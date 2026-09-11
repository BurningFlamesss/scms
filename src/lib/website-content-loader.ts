import type { SchoolConfig } from "#/types/school.ts";
import { getPublishedPage } from "@/lib/website-content";

const configs = import.meta.glob("../../schools/*/config.json", {
	eager: true,
});

export function getSchoolConfig(identifier: string): SchoolConfig {
	const file = configs[`../../schools/${identifier}/config.json`] as {
		default: SchoolConfig;
	};

	return file.default;
}

// Website content types
export interface WebsitePageContent {
  id: string;
  key: string;
  title: string;
  path: string;
  status: string;
  hasUnpublishedChanges: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  blocks: ContentBlock[];
  updatedAt: string;
  publishedAt: string | null;
  updatedBy: string;
  createdAt: string;
}

export interface ContentBlock {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  order: number;
  fields: Record<string, unknown>;
  updatedAt: string;
  createdAt: string;
}

interface CachedContent {
  data: WebsitePageContent | null;
  timestamp: number;
  version: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_VERSION = 1;
const STORAGE_KEY = 'scms_website_content_cache';

function loadCacheFromStorage(): Map<string, CachedContent> {
  const cache = new Map<string, CachedContent>();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.version === CACHE_VERSION) {
        for (const [key, value] of Object.entries(parsed.data)) {
          cache.set(key, value as CachedContent);
        }
      }
    }
  } catch {
    // Ignore cache errors
  }
  return cache;
}

function saveCacheToStorage(cache: Map<string, CachedContent>): void {
  try {
    const data = Object.fromEntries(cache);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: CACHE_VERSION, data }));
  } catch {
    // Ignore storage errors (quota exceeded, etc.)
  }
}

const contentCache = loadCacheFromStorage();

export async function getWebsitePageContent(key: string): Promise<WebsitePageContent | null> {
  // Check memory cache first
  const cached = contentCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    let page: WebsitePageContent | null = null;
    
    if (typeof window === "undefined") {
      // Server-side: use direct database call
      const publishedPage = await getPublishedPage(key as "homepage" | "about" | "contact" | "other");
      page = publishedPage as WebsitePageContent | null;
    } else {
      // Client-side: use fetch
      const response = await fetch(`/api/website/page/${key}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch page: ${response.statusText}`);
      }

      const { page: fetchedPage } = await response.json();
      page = fetchedPage;
    }

    // Cache in memory and localStorage
    const cacheEntry = { data: page, timestamp: Date.now(), version: CACHE_VERSION };
    contentCache.set(key, cacheEntry);
    saveCacheToStorage(contentCache);
    
    return page;
  } catch (error) {
    console.error(`Failed to fetch website page ${key}:`, error);
    // Return stale cache if available
    if (cached) {
      return cached.data;
    }
    return null;
  }
}

export function clearContentCache(key?: string): void {
  if (key) {
    contentCache.delete(key);
  } else {
    contentCache.clear();
  }
  saveCacheToStorage(contentCache);
}

export function getCachedContent(key: string): WebsitePageContent | null {
  const cached = contentCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

export function hasValidCache(key: string): boolean {
  const cached = contentCache.get(key);
  return cached !== undefined && Date.now() - cached.timestamp < CACHE_DURATION;
}