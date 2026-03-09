import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarSettingsState {
	invertedPanel: boolean;
	setInvertedPanel: (value: boolean) => void;
}

export const useSidebarSettings = create<SidebarSettingsState>()(
	persist(
		(set) => ({
			invertedPanel: true,
			setInvertedPanel: (value) => set({ invertedPanel: value }),
		}),
		{ name: "sidebar-settings" },
	),
);
