import { create } from "zustand";
import type { Message } from "@/entities/message";

interface ReplyState {
	message: Message;
	senderName: string;
}

interface EditState {
	message: Message;
}

interface MessageActionStore {
	reply: ReplyState | null;
	edit: EditState | null;

	setReply: (message: Message, senderName: string) => void;
	clearReply: () => void;

	setEdit: (message: Message) => void;
	clearEdit: () => void;

	clearAll: () => void;
}

export const useMessageActionStore = create<MessageActionStore>((set) => ({
	reply: null,
	edit: null,

	setReply: (message, senderName) => set({ reply: { message, senderName }, edit: null }),
	clearReply: () => set({ reply: null }),

	setEdit: (message) => set({ edit: { message }, reply: null }),
	clearEdit: () => set({ edit: null }),

	clearAll: () => set({ reply: null, edit: null }),
}));
