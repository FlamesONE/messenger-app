import { create } from "zustand";
import type { User } from "@/entities/user";

interface ChatUIState {
	activeChatId: string | null;
	pendingDmUser: User | null;
	setActiveChat: (chatId: string | null) => void;
	setPendingDmUser: (user: User | null) => void;
}

export const useChatStore = create<ChatUIState>()((set) => ({
	activeChatId: null,
	pendingDmUser: null,
	setActiveChat: (chatId) => set({ activeChatId: chatId, pendingDmUser: null }),
	setPendingDmUser: (user) => set({ pendingDmUser: user, activeChatId: null }),
}));
