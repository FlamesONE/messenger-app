import { create } from "zustand";

interface PresenceState {
	/** userId -> true for online users */
	onlineUsers: Record<string, true>;
	lastSeen: Record<string, string>;
	setOnline: (userId: string) => void;
	setOffline: (userId: string, lastSeen?: string) => void;
	isOnline: (userId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>()((set, get) => ({
	onlineUsers: {},
	lastSeen: {},
	setOnline: (userId) =>
		set((state) => {
			if (state.onlineUsers[userId]) return state;
			return { onlineUsers: { ...state.onlineUsers, [userId]: true } };
		}),
	setOffline: (userId, lastSeenAt) =>
		set((state) => {
			if (!state.onlineUsers[userId]) return state;
			const { [userId]: _, ...rest } = state.onlineUsers;
			return {
				onlineUsers: rest,
				lastSeen: lastSeenAt ? { ...state.lastSeen, [userId]: lastSeenAt } : state.lastSeen,
			};
		}),
	isOnline: (userId) => !!get().onlineUsers[userId],
}));
