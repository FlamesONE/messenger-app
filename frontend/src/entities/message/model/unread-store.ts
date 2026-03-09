import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UnreadState {
	unreadCounts: Record<string, number>;
	increment: (chatId: string) => void;
	reset: (chatId: string) => void;
}

export const useUnreadStore = create<UnreadState>()(
	persist(
		(set) => ({
			unreadCounts: {},
			increment: (chatId) =>
				set((state) => ({
					unreadCounts: {
						...state.unreadCounts,
						[chatId]: (state.unreadCounts[chatId] || 0) + 1,
					},
				})),
			reset: (chatId) =>
				set((state) => {
					if (!state.unreadCounts[chatId]) return state;
					return { unreadCounts: { ...state.unreadCounts, [chatId]: 0 } };
				}),
		}),
		{ name: "unread-counts" },
	),
);

export function useUnreadCount(chatId: string): number {
	return useUnreadStore((s) => s.unreadCounts[chatId] || 0);
}
