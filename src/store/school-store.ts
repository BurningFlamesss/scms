import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { SchoolConfig, SchoolContent } from "#/types/school";

interface SchoolStore {
	config: SchoolConfig | null;
	content: SchoolContent | null;

	initialized: boolean;

	setSchool: (config: SchoolConfig, content: SchoolContent) => void;
}

export const useSchoolStore = create<SchoolStore>()(
	immer((set) => ({
		config: null,
		content: null,

		initialized: false,

		setSchool: (config, content) =>
			set((state) => {
				state.config = config;
				state.content = content;
				state.initialized = true;
			}),
	})),
);

export const useSchoolConfig = () => useSchoolStore((state) => state.config);

export const useSchoolContent = () => useSchoolStore((state) => state.content);
