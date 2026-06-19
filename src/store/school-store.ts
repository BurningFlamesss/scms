import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface SchoolStore {}

export const useSchoolStore = create<SchoolStore>()(immer((set) => ({})));
