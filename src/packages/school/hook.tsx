import { Route as RootRoute } from "#/routes/__root";

export function useSchoolConfig() {
	return RootRoute.useLoaderData({
		select: (data) => data.config,
	});
}

export function useSchoolContent() {
	return RootRoute.useLoaderData({
		select: (data) => data.content,
	});
}
