import { useEffect } from "react";
import { Route as RootRoute } from "#/routes/__root";
import { useContentStoreActions, useSchoolConfig as useSchoolConfigStore, useSchoolContent as useSchoolContentStore } from "#/stores/contentStore.ts";
import type { WebsitePageContent } from "#/lib/website-content-loader";
import type { SchoolContent } from "#/types/school";
import type { Notice, Person, Scholarship } from "#/types";

export function useSyncContentStore() {
  const loaderData = RootRoute.useLoaderData();
  const { setSchoolConfig, setSchoolContent, setWebsitePage } = useContentStoreActions();

  useEffect(() => {
    if (loaderData?.config) {
      setSchoolConfig(loaderData.config);
    }
    if (loaderData?.content) {
      const { sidebar, ...pageContent } = loaderData.content;
      for (const [key, page] of Object.entries(pageContent)) {
        // Only managed WebsitePage payloads belong in the websitePages map;
        // collection arrays (facultyMembers/notices/scholarships) are read
        // straight from the loader via their dedicated hooks.
        if (page && (key === "faculty" || key === "login")) {
          setWebsitePage(key, page as WebsitePageContent);
        }
      }
      if (sidebar) {
        setSchoolContent(sidebar as SchoolContent["sidebar"]);
      }
    }
  }, [loaderData, setSchoolConfig, setSchoolContent, setWebsitePage]);
}

export function useSchoolConfig() {
  const storeConfig = useSchoolConfigStore();
  const loaderConfig = RootRoute.useLoaderData({ select: (data) => data.config });
  return storeConfig ?? loaderConfig;
}

export function useSchoolContent() {
  const storeContent = useSchoolContentStore();
  const loaderContent = RootRoute.useLoaderData({
    select: (data) => data.content as WebsitePageContent & { sidebar?: SchoolContent["sidebar"] },
  });
  return {
    sidebar: storeContent?.sidebar ?? loaderContent?.sidebar,
  };
}

export type ManagedPageKey = "faculty" | "login";

/**
 * Returns the published WebsitePage for a managed page key (with its rendered
 * blocks) when one exists, so public routes can be driven from the admin CMS.
 * Falls back to null so pages keep their static design until content is
 * published.
 */
export function useWebsitePageContent(key: ManagedPageKey): WebsitePageContent | null {
  const loaderContent = RootRoute.useLoaderData({
    select: (data) => data.content[key] as WebsitePageContent | undefined,
  });

  if (
    loaderContent &&
    loaderContent.status === "published" &&
    Array.isArray(loaderContent.blocks) &&
    loaderContent.blocks.length > 0
  ) {
    return loaderContent;
  }
  return null;
}

/**
 * Public faculty directory loaded from the database by the root loader.
 * Null when the collection has not been seeded, so pages fall back to their
 * static data.
 */
export function useFacultyDirectory(): Person[] | null {
  return (
    RootRoute.useLoaderData({
      select: (data) => data.content.facultyMembers as Person[] | undefined,
    }) ?? null
  );
}

/** Public notice board loaded from the database. */
export function useNotices(): Notice[] | null {
  return (
    RootRoute.useLoaderData({
      select: (data) => data.content.notices as Notice[] | undefined,
    }) ?? null
  );
}

/** Public scholarship schemes loaded from the database. */
export function useScholarships(): Scholarship[] | null {
  return (
    RootRoute.useLoaderData({
      select: (data) => data.content.scholarships as Scholarship[] | undefined,
    }) ?? null
  );
}