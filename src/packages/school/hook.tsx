import { useEffect } from "react";
import { Route as RootRoute } from "#/routes/__root";
import { useContentStoreActions, useSchoolConfig as useSchoolConfigStore, useSchoolContent as useSchoolContentStore } from "#/stores/contentStore.ts";
import type { WebsitePageContent } from "#/lib/website-content-loader";
import type { SchoolContent } from "#/types/school";

export function useSyncContentStore() {
  const loaderData = RootRoute.useLoaderData();
  const { setSchoolConfig, setSchoolContent, setWebsitePage } = useContentStoreActions();

  useEffect(() => {
    if (loaderData?.config) {
      setSchoolConfig(loaderData.config);
    }
    if (loaderData?.content) {
      const { sidebar, ...pageContent } = loaderData.content;
      if (Object.keys(pageContent).length > 0) {
        setWebsitePage("homepage", pageContent as WebsitePageContent);
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