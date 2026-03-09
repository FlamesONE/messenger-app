import { create } from "zustand";

const TYPING_TTL = 5000;

interface TypingState {
	typing: Record<string, string[]>;
	setTyping: (chatId: string, userId: string, isTyping: boolean) => void;
}

const timers = new Map<string, ReturnType<typeof setTimeout>>();

function timerKey(chatId: string, userId: string) {
	return `${chatId}:${userId}`;
}

const EMPTY: string[] = [];

export const useTypingStore = create<TypingState>()((set) => ({
	typing: {},
	setTyping: (chatId, userId, isTyping) => {
		const key = timerKey(chatId, userId);

		const existing = timers.get(key);
		if (existing) {
			clearTimeout(existing);
			timers.delete(key);
		}

		if (isTyping) {
			timers.set(
				key,
				setTimeout(() => {
					timers.delete(key);
					set((state) => {
						const current = state.typing[chatId] ?? EMPTY;
						if (!current.includes(userId)) return state;
						const next = current.filter((id) => id !== userId);
						return { typing: { ...state.typing, [chatId]: next.length ? next : EMPTY } };
					});
				}, TYPING_TTL),
			);
		}

		set((state) => {
			const current = state.typing[chatId] ?? EMPTY;
			const has = current.includes(userId);

			if (isTyping && has) return state;
			if (!isTyping && !has) return state;

			const next = isTyping
				? [...current, userId].sort()
				: current.filter((id) => id !== userId);

			if (next.length === 0 && current.length === 0) return state;

			return { typing: { ...state.typing, [chatId]: next.length ? next : EMPTY } };
		});
	},
}));

export function useTypingUsers(chatId: string | undefined): string[] {
	return useTypingStore((s) => {
		if (!chatId) return EMPTY;
		return s.typing[chatId] ?? EMPTY;
	});
}
