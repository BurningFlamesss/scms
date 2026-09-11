import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SchoolConfig, SchoolContent } from "#/types/school";
import type { WebsitePageContent } from "#/lib/website-content-loader";

interface ContentState {
  schoolConfig: SchoolConfig | null;
  schoolContent: SchoolContent | null;
  websitePages: Map<string, WebsitePageContent>;
  lastFetched: Map<string, number>;
  isLoading: boolean;
  error: string | null;

  setSchoolConfig: (config: SchoolConfig) => void;
  setSchoolContent: (content: SchoolContent) => void;
  setWebsitePage: (key: string, page: WebsitePageContent) => void;
  getWebsitePage: (key: string) => WebsitePageContent | undefined;
  hasValidCache: (key: string, maxAge?: number) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCache: () => void;
}

const CACHE_DURATION = 1000 * 60 * 10;

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      schoolConfig: null,
      schoolContent: null,
      websitePages: new Map(),
      lastFetched: new Map(),
      isLoading: false,
      error: null,

      setSchoolConfig: (config) => set({ schoolConfig: config }),
      setSchoolContent: (content) => set({ schoolContent: content }),
      setWebsitePage: (key, page) =>
        set((state) => {
          const newPages = new Map(state.websitePages);
          const newLastFetched = new Map(state.lastFetched);
          newPages.set(key, page);
          newLastFetched.set(key, Date.now());
          return { websitePages: newPages, lastFetched: newLastFetched };
        }),
      getWebsitePage: (key) => get().websitePages.get(key),
      hasValidCache: (key, maxAge = CACHE_DURATION) => {
        const lastFetched = get().lastFetched.get(key);
        return lastFetched !== undefined && Date.now() - lastFetched < maxAge;
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearCache: () =>
        set({
          websitePages: new Map(),
          lastFetched: new Map(),
          schoolConfig: null,
          schoolContent: null,
        }),
    }),
    {
      name: "scms-content-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        schoolConfig: state.schoolConfig,
        schoolContent: state.schoolContent,
        websitePages: Array.from(state.websitePages.entries()),
        lastFetched: Array.from(state.lastFetched.entries()),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.websitePages = new Map(state.websitePages as unknown as [string, WebsitePageContent][]);
          state.lastFetched = new Map(state.lastFetched as unknown as [string, number][]);
        }
      },
    }
  )
);

export const useSchoolConfig = () => useContentStore((state) => state.schoolConfig);
export const useSchoolContent = () => useContentStore((state) => state.schoolContent);
export const useWebsitePage = (key: string) => useContentStore((state) => state.websitePages.get(key));
export const useContentStoreActions = () =>
  useContentStore((state) => ({
    setSchoolConfig: state.setSchoolConfig,
    setSchoolContent: state.setSchoolContent,
    setWebsitePage: state.setWebsitePage,
    hasValidCache: state.hasValidCache,
    setLoading: state.setLoading,
    setError: state.setError,
    clearCache: state.clearCache,
  }));