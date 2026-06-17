import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type Config = null
type Content = null

interface SchoolStore {
	config: Config;
	content: Content;
	setConfig: (config: Config) => void;
	setContent: (content: Content) => void;
}

export const useSchoolStore = create<SchoolStore>()(
	immer((set) => ({
		config: null,
		content: null,

		setConfig: (config) =>
			set((state) => {
				state.config = config;
			}),
		setContent: (content) =>
			set((state) => {
				state.content = content;
			}),
	})),
);
