import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";
import type { Chat } from "../model/types";
import { chatKeys } from "./queries";

interface CreateChatPayload {
	name?: string;
	isGroup: boolean;
	memberIds: string[];
}

export function useCreateChat() {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateChatPayload) => {
			const { data: res, error } = await api.chats.post(data);
			if (error) throw error;
			return res as Chat;
		},
		onSuccess: (chat) => {
			qc.setQueryData<Chat[]>(chatKeys.all, (old) => (old ? [chat, ...old] : [chat]));
		},
	});
}
