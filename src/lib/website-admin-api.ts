import type { Actor, BlockType, WebsitePage, WebsitePageKey } from "@/types";

/**
 * HTTP client for the Prisma-backed website CMS.
 *
 * The admin panel used to read/write a localStorage mock via `@/services/website`.
 * This module exposes the same function signatures but talks to the `/api/website/**`
 * routes, which persist to Postgres. Swap the import in a page and annotations, audit
 * and notifications now write to the real database (see `src/lib/website-content.ts`).
 */

async function api<T>(url: string, init?: RequestInit): Promise<T> {
	const headers = new Headers(init?.headers);
	if (init?.body) headers.set("Content-Type", "application/json");
	const response = await fetch(url, {
		...init,
		headers,
		credentials: "include",
	});
	if (!response.ok) {
		let message = `Request failed (${response.status})`;
		try {
			const data = (await response.json()) as { error?: string };
			if (data?.error) message = String(data.error);
		} catch {
			// keep the status-based message
		}
		throw new Error(message);
	}
	return (await response.json()) as T;
}

export async function listWebsitePages(): Promise<WebsitePage[]> {
	const { pages } = await api<{ pages: WebsitePage[] }>("/api/website/pages");
	return pages;
}

export async function getWebsitePage(
	key: WebsitePageKey,
): Promise<WebsitePage | null> {
	const response = await fetch(`/api/website/pages/${key}`, {
		credentials: "include",
	});
	if (response.status === 404) return null;
	if (!response.ok)
		throw new Error(`Failed to fetch page (${response.status})`);
	const { page } = (await response.json()) as { page: WebsitePage };
	return page;
}

export async function updateBlockFields(
	key: WebsitePageKey,
	blockId: string,
	fields: Record<string, unknown>,
	actor: Actor,
): Promise<WebsitePage> {
	const { page } = await api<{ page: WebsitePage }>(
		`/api/website/pages/${key}/blocks/${blockId}`,
		{
			method: "PATCH",
			body: JSON.stringify({ fields, actor }),
		},
	);
	return page;
}

export async function toggleBlockVisibility(
	key: WebsitePageKey,
	blockId: string,
	actor: Actor,
): Promise<WebsitePage> {
	const { page } = await api<{ page: WebsitePage }>(
		`/api/website/pages/${key}/blocks/${blockId}`,
		{
			method: "PATCH",
			body: JSON.stringify({ visibility: true, actor }),
		},
	);
	return page;
}

export async function moveBlock(
	key: WebsitePageKey,
	blockId: string,
	direction: "up" | "down",
	actor: Actor,
): Promise<WebsitePage> {
	const { page } = await api<{ page: WebsitePage }>(
		`/api/website/pages/${key}/blocks/${blockId}`,
		{
			method: "PATCH",
			body: JSON.stringify({ direction, actor }),
		},
	);
	return page;
}

export async function reorderBlocks(
	key: WebsitePageKey,
	orderedIds: string[],
	actor: Actor,
): Promise<WebsitePage> {
	const { page } = await api<{ page: WebsitePage }>(
		`/api/website/pages/${key}/blocks`,
		{
			method: "POST",
			body: JSON.stringify({ orderedIds, actor }),
		},
	);
	return page;
}

export async function addBlock(
	key: WebsitePageKey,
	type: BlockType,
	actor: Actor,
): Promise<WebsitePage> {
	const { page } = await api<{ page: WebsitePage }>(
		`/api/website/pages/${key}/blocks`,
		{
			method: "POST",
			body: JSON.stringify({ type, actor }),
		},
	);
	return page;
}

export async function duplicateBlock(
	key: WebsitePageKey,
	blockId: string,
	actor: Actor,
): Promise<WebsitePage> {
	const { page } = await api<{ page: WebsitePage }>(
		`/api/website/pages/${key}/blocks`,
		{
			method: "POST",
			body: JSON.stringify({ blockId, actor }),
		},
	);
	return page;
}

export async function deleteBlock(
	key: WebsitePageKey,
	blockId: string,
	actor: Actor,
): Promise<WebsitePage> {
	const { page } = await api<{ page: WebsitePage }>(
		`/api/website/pages/${key}/blocks/${blockId}`,
		{
			method: "DELETE",
			body: JSON.stringify({ actor }),
		},
	);
	return page;
}

export async function saveSectionFields(
	key: WebsitePageKey,
	sectionType: BlockType,
	fields: Record<string, unknown>,
	actor: Actor,
): Promise<WebsitePage> {
	const { page } = await api<{ page: WebsitePage }>(
		`/api/website/pages/${key}/sections/${sectionType}`,
		{
			method: "PATCH",
			body: JSON.stringify({ fields, actor }),
		},
	);
	return page;
}

export async function updatePageSeo(
	key: WebsitePageKey,
	seo: { title: string; description: string; keywords: string },
	actor: Actor,
): Promise<WebsitePage> {
	const { page } = await api<{ page: WebsitePage }>(
		`/api/website/pages/${key}`,
		{
			method: "PATCH",
			body: JSON.stringify({ seo, actor }),
		},
	);
	return page;
}

export async function publishPage(
	key: WebsitePageKey,
	actor: Actor,
): Promise<WebsitePage> {
	const { page } = await api<{ page: WebsitePage }>(
		`/api/website/pages/${key}/publish`,
		{
			method: "POST",
			body: JSON.stringify({ actor }),
		},
	);
	return page;
}

export async function unpublishPage(
	key: WebsitePageKey,
	actor: Actor,
): Promise<WebsitePage> {
	const { page } = await api<{ page: WebsitePage }>(
		`/api/website/pages/${key}/unpublish`,
		{
			method: "POST",
			body: JSON.stringify({ actor }),
		},
	);
	return page;
}
