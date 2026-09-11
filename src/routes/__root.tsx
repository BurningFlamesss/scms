import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getSessionFn } from "#/packages/auth/middleware/auth.middleware.ts";
import { getSchoolConfigServer } from "#/packages/content/server/content.ts";
import { getWebsitePageServer } from "#/packages/content/server/content.ts";
import { getSchoolContentServer } from "#/packages/content/server/content.ts";
import type { MyRouterContext } from "#/types/router-context.ts";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import globalCss from "../styles.css?url";
import appCss from "../app.css?url"
import indexCss from "../index.css?url"
import themeCss from "#/templates/modern/components/tokens/theme.css?url";
import NotFoundPage from "#/components/NotFoundPage.tsx";
import { AuthProvider } from "#/providers/AuthProvider";
import { Suspense } from "react";

const PUBLIC_CACHE_HEADERS = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
  "CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400",
});

function ErrorComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-4xl font-bold text-foreground mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  async beforeLoad() {
    const session = await getSessionFn();

    return { session };
  },
  async loader() {
    const [config, homepageContent, sidebarContent] = await Promise.all([
      getSchoolConfigServer({ data: { identifier: "everest" } }),
      getWebsitePageServer({ data: { key: "homepage" } }),
      getSchoolContentServer({ data: { identifier: "everest" } }),
    ]);

    const content: Record<string, unknown> = { sidebar: sidebarContent?.sidebar };
    if (homepageContent) {
      Object.assign(content, homepageContent);
    }

    return {
      config,
      content,
    };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: loaderData?.config?.seo?.title ?? "SCMS",
      },
      {
        "aria-description": loaderData?.config?.seo?.description ?? "",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: globalCss,
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "stylesheet",
        href: indexCss,
      },
      {
        rel: "stylesheet",
        href: themeCss,
      },
    ],
  }),
  headers: PUBLIC_CACHE_HEADERS,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorComponent,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            {children}
          </Suspense>
        </AuthProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}