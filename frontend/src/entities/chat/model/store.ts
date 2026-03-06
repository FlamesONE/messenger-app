import { create } from "zustand";

interface ChatUIState {
	activeChatId: string | null;
	setActiveChat: (chatId: string | null) => void;
}

export const useChatStore = create<ChatUIState>()((set) => ({
	activeChatId: null,
	setActiveChat: (chatId) => set({ activeChatId: chatId }),
}));
