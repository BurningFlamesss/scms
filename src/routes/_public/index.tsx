import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "#/templates/modern/LandingPage.tsx";

const PUBLIC_CACHE_HEADERS = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
  "CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400",
});

export const Route = createFileRoute("/_public/")({
  component: Home,
  headers: PUBLIC_CACHE_HEADERS,
});

function Home() {
  return <LandingPage />;
}
